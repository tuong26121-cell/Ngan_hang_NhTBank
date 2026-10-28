import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ShieldCheck,
  Database,
  ListChecks,
  Bell,
  Archive,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { Button } from "./ui";
import { money } from "../lib/bank";
import { DEMO_IDENTITIES } from "../lib/platform-client";
const date = (value) =>
  new Date(value).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
  });
const steps = [
  "A · Điện thoại / máy tính",
  "B · Phiên và quyền",
  "C · Mã chống gửi lặp",
  "D · Người nhận, số dư, hạn mức",
  "E · Ghi sổ nguyên tử",
  "F · Sổ kép, kết quả, nhật ký, sự kiện",
  "G · Thông báo sau ghi sổ",
  "H · Đối soát độc lập",
  "I · Sao lưu và diễn tập",
  "J–M · Cô lập, điều tra và phê duyệt",
];
function WorkspaceDialog({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const prior = document.activeElement,
      node = ref.current;
    node.showModal();
    node.querySelector("h2").focus({ preventScroll: true });
    return () => {
      node.close();
      if (prior?.isConnected) prior.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="platform-dialog panel"
      aria-labelledby="platform-dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="platform-dialog-heading">
        <h2 id="platform-dialog-title" tabIndex={-1}>
          {title}
        </h2>
        <Button
          className="icon-button"
          aria-label="Đóng hộp thoại vận hành"
          onClick={onClose}
        >
          ×
        </Button>
      </div>
      <div className="platform-dialog-body" tabIndex={0}>
        {children}
      </div>
    </dialog>
  );
}
export default function PlatformWorkspace({
  snapshot,
  runtime,
  onRefresh,
  onAction,
  onIdentity,
  navigate,
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [modal, setModal] = useState(null),
    [identity, setIdentity] = useState("operator"),
    [pin, setPin] = useState(""),
    [reason, setReason] = useState("");
  const actor = snapshot.actor,
    operator = actor.role === "operator",
    approver = actor.role === "approver",
    privileged = operator || approver;
  const incidents = snapshot.incidents || [],
    proposals = snapshot.proposals || [],
    outbox = snapshot.outbox || [],
    last = snapshot.reconciliations?.at(-1);
  async function perform(
    action,
    args = {},
    message = "Đã cập nhật dữ liệu thử nghiệm.",
  ) {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await onAction(action, args);
      setNotice(message);
      setModal(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function refresh() {
    setBusy(true);
    setError("");
    try {
      await onRefresh();
      setNotice("Đã đọc lại dữ liệu.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function request(action, id) {
    setReason("");
    setError("");
    setModal({ action, id });
  }
  return (
    <div className="platform-workspace">
      <Button className="text-button" onClick={() => navigate("profile")}>
        <ArrowLeft size={18} /> Về Cá nhân
      </Button>
      <div className="page-heading">
        <div>
          <span className="eyebrow">KHÔNG GIAN MÃ VÀ VẬN HÀNH</span>
          <h1>Vận hành mô phỏng</h1>
          <p>Ghi sổ có kiểm soát, quan sát được từng bước.</p>
        </div>
        <Button className="secondary" disabled={busy} onClick={refresh}>
          <RefreshCw size={18} /> Đọc lại
        </Button>
      </div>
      <div className="platform-mode">
        <ShieldCheck size={22} />
        <div>
          <strong>
            {runtime.mode === "server"
              ? "SQLite trên máy chủ cục bộ"
              : "Mô phỏng trong bộ nhớ trình duyệt"}
          </strong>
          <p>
            {runtime.mode === "server"
              ? "Sổ cái được giữ khi tải lại hoặc đăng xuất. PIN 123456 và mọi vai trò đều là thử nghiệm."
              : "Dữ liệu đặt lại khi tải lại hoặc đăng xuất. Chọn vai trò ở đây chỉ để diễn tập; không phải bảo mật tài khoản thật."}
          </p>
        </div>
      </div>
      <section className="panel platform-session">
        <div>
          <h2>Phiên và quyền hiện tại</h2>
          <p>{actor.name}</p>
          <p className="platform-caption">
            Hết hạn {date(actor.expiresAt)} · Dữ liệu phiên bản{" "}
            {snapshot.version}
          </p>
        </div>
        <Button
          className="secondary"
          disabled={busy}
          onClick={() => {
            setPin("");
            setError("");
            setIdentity(operator ? "approver" : "operator");
            setModal({ action: "identity" });
          }}
        >
          Đổi vai trò thử nghiệm
        </Button>
      </section>
      {error && !modal && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="platform-notice" role="status">
          {notice}
        </p>
      )}
      <div className="platform-metrics">
        {[
          [
            "Giao dịch đã ghi sổ",
            (snapshot.transfers || []).filter((t) => t.kind === "transfer")
              .length,
            Database,
          ],
          [
            "Thông báo chờ",
            privileged
              ? outbox.filter(
                  (e) => e.status === "pending" || e.status === "processing",
                ).length
              : "—",
            Bell,
          ],
          [
            "Sự cố đang mở",
            privileged
              ? incidents.filter((i) => i.status === "open").length
              : "—",
            Activity,
          ],
          [
            "Đề xuất chờ duyệt",
            privileged
              ? proposals.filter((p) => p.status === "pending").length
              : "—",
            ListChecks,
          ],
        ].map(([label, value, Icon]) => (
          <section className="panel" key={label}>
            <Icon size={21} />
            <span>{label}</span>
            <strong>{value}</strong>
          </section>
        ))}
      </div>
      {!privileged && (
        <section className="panel">
          <h2>Quyền khách hàng</h2>
          <p className="platform-caption">
            Dấu — nghĩa là vai trò này chưa được cấp quyền xem chỉ số.
          </p>
          <p>
            Bạn có thể xem tài khoản của mình và tạo chuyển tiền mô phỏng. Đổi
            sang vai trò vận hành để kiểm tra hàng đợi, sổ cái, đối soát và sao
            lưu.
          </p>
          <p className="platform-caption">
            Hạn mức mẫu: 2.000.000 VNĐ/lần, 3.000.000 VNĐ/ngày theo UTC+7. Tên
            người nhận chưa được ngân hàng xác minh.
          </p>
        </section>
      )}
      {privileged && (
        <>
          <section className="panel">
            <div className="section-title">
              <h2>Đối soát và thông báo</h2>
              <span className="tag">
                {last
                  ? last.balanced
                    ? "Lần gần nhất: khớp"
                    : "Phát hiện sai lệch"
                  : "Chưa chạy đối soát"}
              </span>
            </div>
            <p className="platform-caption">
              Đối soát tính lại số dư từ bút toán gốc, không dùng bộ đệm số dư
              làm bằng chứng. Thông báo chỉ đi sau giao dịch đã chốt.
            </p>
            <div className="platform-actions">
              <Button
                className="primary"
                disabled={busy || !operator}
                onClick={() =>
                  perform(
                    "reconcile",
                    {},
                    "Đã đối soát. Xem kết quả và phạm vi cô lập bên dưới.",
                  )
                }
              >
                Chạy đối soát
              </Button>
              <Button
                className="secondary"
                disabled={busy || !operator}
                onClick={() =>
                  perform(
                    "dispatch",
                    {},
                    "Đã kiểm tra hàng đợi; trạng thái thực tế nằm trong danh sách sự kiện.",
                  )
                }
              >
                Xử lý thông báo chờ
              </Button>
            </div>
            {last && (
              <div className="platform-check">
                <p>
                  {date(last.date)} · {last.issues.length} sai lệch ·{" "}
                  {last.ledgerCount} bút toán
                </p>
                {last.issues.map((issue, i) => (
                  <p key={i}>
                    {issue.code} · {issue.accountId || issue.transactionId}
                    {issue.expected !== undefined
                      ? ` · Thực tế ${money(issue.actual)} / Theo sổ ${money(issue.expected)} VNĐ`
                      : ""}
                  </p>
                ))}
              </div>
            )}
          </section>
          <section className="panel">
            <h2>Sự cố và phê duyệt</h2>
            {incidents.length === 0 ? (
              <p className="platform-empty">Chưa có sự cố được phát hiện.</p>
            ) : (
              incidents.map((incident) => (
                <article className="platform-record" key={incident.id}>
                  <strong>
                    {incident.status === "open" ? "Đang cô lập" : "Đã xử lý"}
                  </strong>
                  <p>{incident.accounts.join(", ")}</p>
                  <p className="platform-caption">Mã sự cố {incident.id}</p>
                  {incident.status === "open" && operator && (
                    <Button
                      className="secondary"
                      disabled={busy}
                      onClick={() => request("propose", incident.id)}
                    >
                      Đề xuất xây lại số dư
                    </Button>
                  )}
                </article>
              ))
            )}
            {proposals.map((p) => (
              <article className="platform-record" key={p.id}>
                <strong>
                  {p.type === "reverse-transfer" ? "Đảo giao dịch" : "Đề xuất"}{" "}
                  ·{" "}
                  {p.status === "pending"
                    ? "Chờ duyệt"
                    : p.status === "applied"
                      ? "Đã áp dụng"
                      : "Đã từ chối"}
                </strong>
                <p>{p.reason}</p>
                {p.transactionId && (
                  <p className="platform-caption">
                    Gốc: {p.transactionId} · Bút toán bù:{" "}
                    {p.reversalId || "Chưa ghi sổ"}
                  </p>
                )}
                <p className="platform-caption">
                  Người lập: {p.requestedBy}
                  {p.decidedBy ? ` · Người quyết định: ${p.decidedBy}` : ""}
                </p>
                {p.status === "pending" && approver && (
                  <div className="platform-actions">
                    <Button
                      className="primary"
                      disabled={busy}
                      onClick={() => request("approve", p.id)}
                    >
                      Phê duyệt xử lý
                    </Button>
                    <Button
                      className="secondary"
                      disabled={busy}
                      onClick={() => request("reject", p.id)}
                    >
                      Từ chối đề xuất
                    </Button>
                  </div>
                )}
              </article>
            ))}
          </section>
          <section className="panel">
            <h2>Đảo giao dịch có phê duyệt</h2>
            <p className="platform-caption">
              Tạo bút toán bù toàn phần, giữ nguyên giao dịch gốc. Người khác
              phải duyệt; bên nhận phải đủ số dư để bù.
            </p>
            {(snapshot.transfers || [])
              .filter((t) => t.kind === "transfer")
              .map((t) => {
                const reversed = snapshot.transfers.find(
                  (r) => r.reversesId === t.id,
                );
                return (
                  <article className="platform-record" key={t.id}>
                    <strong>
                      {t.name} · {money(t.amount)} VNĐ
                    </strong>
                    <p className="platform-caption">
                      {t.id} ·{" "}
                      {t.internal ? "Nội bộ Sandbox" : "Đối ứng mô phỏng"}
                    </p>
                    {reversed ? (
                      <p>Đã bù bằng {reversed.id}</p>
                    ) : (
                      operator && (
                        <Button
                          className="secondary"
                          disabled={busy}
                          onClick={() => request("reversal", t.id)}
                        >
                          Đề xuất đảo giao dịch
                        </Button>
                      )
                    )}
                  </article>
                );
              })}
            {!(snapshot.transfers || []).some((t) => t.kind === "transfer") && (
              <p>Chưa có giao dịch để đề xuất.</p>
            )}
          </section>
          <section className="panel">
            <div className="section-title">
              <h2>Sao lưu và diễn tập</h2>
              <Archive size={22} />
            </div>
            <p className="platform-caption">
              {runtime.mode === "server"
                ? "Tạo tệp SQLite và checksum trên máy chủ. Diễn tập mở bản sao cách ly, kiểm tra tính toàn vẹn và đối soát; không ghi đè dữ liệu đang dùng."
                : "Bản chụp JSON chỉ nằm trong phiên này. Diễn tập đọc lại bản cách ly và đối soát; đây không phải sao lưu bền vững."}
            </p>
            <Button
              className="secondary"
              disabled={busy || !operator}
              onClick={() =>
                perform(
                  "backup",
                  {},
                  runtime.mode === "server"
                    ? "Đã tạo bản sao SQLite trên máy chủ."
                    : "Đã chụp dữ liệu vào bộ nhớ phiên.",
                )
              }
            >
              Tạo bản sao thử nghiệm
            </Button>
            {(snapshot.backups || []).map((b) => (
              <article className="platform-record" key={b.id}>
                <strong>
                  {b.status === "verified"
                    ? "Đã diễn tập đạt"
                    : b.status === "investigation-required"
                      ? "Cần điều tra mốc khôi phục"
                      : "Đã tạo bản sao"}
                </strong>
                <p className="platform-caption">
                  {date(b.date)} · {b.id}
                </p>
                {b.recovery && (
                  <div className="platform-check">
                    <p>
                      {b.recovery.readyToOpen
                        ? "Dữ liệu và mốc yêu cầu khớp trong lần diễn tập này."
                        : "Chưa được mở lại giao dịch từ bản sao: còn dữ liệu hoặc yêu cầu cần đối chiếu."}
                    </p>
                    <p>
                      {b.recovery.aroundCut.length} yêu cầu quanh mốc ·{" "}
                      {b.recovery.missingPostings.length} bút toán ngoài bản sao
                    </p>
                    {b.recovery.eventsToReview?.length > 0 && (
                      <p>
                        {b.recovery.eventsToReview.length} sự kiện/thông báo cần
                        đối chiếu trước phục hồi.
                      </p>
                    )}
                    {b.recovery.aroundCut.map((r) => (
                      <p className="platform-caption" key={r.id}>
                        {r.key} · {r.atCut} → {r.current}
                      </p>
                    ))}
                  </div>
                )}
                <Button
                  className="secondary"
                  disabled={busy || !operator}
                  onClick={() =>
                    perform(
                      "drill",
                      { id: b.id },
                      "Đã diễn tập cách ly. Xem kết quả kiểm tra dữ liệu và mốc yêu cầu; dữ liệu đang dùng không đổi.",
                    )
                  }
                >
                  Diễn tập khôi phục
                </Button>
              </article>
            ))}
          </section>
          <details className="panel platform-detail">
            <summary>Sổ cái và hàng đợi sự kiện</summary>
            <div
              className="platform-table"
              tabIndex={0}
              role="region"
              aria-label="Bảng bút toán, cuộn ngang khi cần"
            >
              <table>
                <caption>Bút toán ghi sổ kép · VNĐ</caption>
                <thead>
                  <tr>
                    <th>Giao dịch</th>
                    <th>Tài khoản</th>
                    <th>Số tiền có dấu</th>
                  </tr>
                </thead>
                <tbody>
                  {(snapshot.ledger || []).map((row) => (
                    <tr key={row.id}>
                      <td>{row.transactionId}</td>
                      <td>{row.accountId}</td>
                      <td>{money(row.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3>Hàng đợi</h3>
            {outbox.length === 0 ? (
              <p>Chưa có sự kiện sau ghi sổ.</p>
            ) : (
              outbox.map((e) => (
                <p className="platform-caption" key={e.id}>
                  {e.transactionId} ·{" "}
                  {
                    {
                      pending: "Chờ gửi",
                      processing: "Đang xử lý",
                      delivered: "Đã nhận",
                      ["dead-letter"]: "Cần điều tra lỗi",
                    }[e.status]
                  }{" "}
                  · {e.attempts} lần thử
                </p>
              ))
            )}
          </details>
          <details className="panel platform-detail">
            <summary>Nhật ký kiểm toán · 50 mục gần nhất</summary>
            {(snapshot.audit || [])
              .slice(-50)
              .reverse()
              .map((row) => (
                <article className="platform-record" key={row.id}>
                  <strong>{row.action}</strong>
                  <p>{row.detail}</p>
                  <p className="platform-caption">
                    {date(row.date)} · {row.actorId} ·{" "}
                    {row.subjectId || "Khởi tạo"}
                  </p>
                </article>
              ))}
          </details>
          {snapshot.labEnabled && operator && (
            <details className="panel platform-detail platform-lab">
              <summary>Phòng thử lỗi có kiểm soát</summary>
              <p>
                Chỉ dành cho bộ dữ liệu Sandbox. Thao tác sau cố ý cộng lệch bộ
                đệm 1.000 VNĐ, giữ nguyên sổ gốc để thử phát hiện, cô lập và phê
                duyệt xử lý.
              </p>
              <Button
                className="secondary"
                disabled={busy}
                onClick={() =>
                  perform(
                    "inject",
                    {},
                    "Đã tạo sai lệch thử nghiệm. Chạy đối soát để phát hiện và cô lập.",
                  )
                }
              >
                Tạo sai lệch thử nghiệm
              </Button>
            </details>
          )}
        </>
      )}
      <details className="panel platform-detail">
        <summary>Sơ đồ thành phần của NhTBank</summary>
        <ol className="platform-flow">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="platform-caption">
          QR vẫn là mã minh họa cục bộ; không có API ngân hàng, webhook hoặc
          chuyển tiền thật.
        </p>
      </details>
      {modal && (
        <WorkspaceDialog
          title={
            modal.action === "identity"
              ? "Đổi vai trò thử nghiệm"
              : modal.action === "propose"
                ? "Đề xuất xử lý có dấu vết"
                : modal.action === "approve"
                  ? "Phê duyệt bởi người khác"
                  : modal.action === "reversal"
                    ? "Đề xuất đảo giao dịch"
                    : "Từ chối đề xuất"
          }
          onClose={() => {
            if (!busy) setModal(null);
          }}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (modal.action === "identity") {
                setBusy(true);
                setError("");
                try {
                  await onIdentity(identity, pin);
                  setModal(null);
                  setNotice(
                    "Đã đổi tài khoản thử nghiệm; dữ liệu sổ cái được giữ.",
                  );
                } catch (e) {
                  setError(e.message);
                } finally {
                  setBusy(false);
                }
              } else
                await perform(
                  modal.action,
                  { id: modal.id, reason },
                  "Đã ghi nhận quyết định và nhật ký xử lý.",
                );
            }}
          >
            {modal.action === "identity" ? (
              <>
                <label>
                  Vai trò thử nghiệm
                  <select
                    aria-label="Vai trò thử nghiệm"
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                  >
                    {Object.entries(DEMO_IDENTITIES).map(([id, a]) => (
                      <option value={id} key={id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  PIN mô phỏng
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                  />
                </label>
                <p className="platform-caption">
                  PIN thử nghiệm cho cả ba tài khoản: 123456. Không dùng mô hình
                  đăng nhập này để bảo vệ tiền thật.
                </p>
              </>
            ) : (
              <>
                <p>
                  {modal.action === "reversal"
                    ? "Đề xuất bút toán bù toàn phần cho giao dịch đã chọn. Giao dịch gốc được giữ nguyên; người khác phải kiểm tra và duyệt."
                    : "Ghi lại lý do và kiểm tra đúng loại đề xuất. Chỉ đề xuất đảo được duyệt mới tạo bút toán bù; sửa bộ đệm giữ nguyên sổ gốc."}
                </p>
                <label>
                  Lý do và bằng chứng
                  <textarea
                    value={reason}
                    minLength={10}
                    maxLength={500}
                    required
                    onChange={(e) => setReason(e.target.value)}
                  />
                </label>
              </>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <Button className="primary full" type="submit" disabled={busy}>
              {busy
                ? "Đang xử lý…"
                : modal.action === "identity"
                  ? "Xác nhận đổi vai trò"
                  : "Xác nhận thao tác"}
            </Button>
          </form>
        </WorkspaceDialog>
      )}
    </div>
  );
}
