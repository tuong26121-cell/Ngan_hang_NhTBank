import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  ShieldCheck,
  Send,
} from "lucide-react";
import { Button, SecurityNote } from "./ui";
import { DEMO_PIN, money, validateTransfer } from "../lib/bank";

export default function Transfer({
  balance,
  onTransfer,
  navigate,
  runtime,
  onRefresh,
}) {
  const recovery = runtime?.getRecovery();
  const [saved, setSaved] = useState(() => {
    try {
      return recovery?.read() || null;
    } catch {
      return null;
    }
  });
  const [recoveryError, setRecoveryError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [step, setStep] = useState(saved ? 5 : 1);
  const [form, setForm] = useState({
    ...(saved?.command || {}),
    bank: saved?.command.bank || "",
    account: saved?.command.account || "",
    recipient: saved?.command.recipient || "",
    amount: saved?.command.amount || "",
    note: saved?.command.note || "",
  });
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);
  const sent = useRef(false);
  const requestKey = useRef({ fingerprint: null, key: null });
  const resultTitle = useRef(null);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    if (step === 4) {
      resultTitle.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [step]);
  async function applyRecovery(row) {
    if (!row) return;
    setSaved(row);
    setForm(row.command);
    setRecoveryError("");
    if (row.status === "posted") {
      setReceipt(row.result);
      setStep(4);
      setError("");
      // A failed account refresh never invalidates the confirmed posting.
      try {
        await onRefresh?.();
      } catch {
        setRecoveryError(
          "Đã ghi sổ. Chưa tải lại được số dư; có thể kiểm tra sau.",
        );
      }
    } else setStep(5);
  }
  async function checkResult() {
    if (sent.current || !recovery) return;
    sent.current = true;
    setPending(true);
    setRecoveryError("");
    try {
      await applyRecovery(await recovery.check());
    } catch (e) {
      setRecoveryError(e.message);
      setNeedsLogin(e.code === "SESSION_EXPIRED");
    } finally {
      sent.current = false;
      setPending(false);
    }
  }
  async function reauthenticate(e) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setRecoveryError("");
    try {
      await runtime.login("customer", pin);
      setNeedsLogin(false);
      await applyRecovery(await recovery.check());
    } catch (e) {
      setRecoveryError(e.message);
    } finally {
      setPending(false);
      setPin("");
    }
  }
  useEffect(() => {
    if (!recovery) return;
    let existing;
    try {
      existing = recovery.read();
    } catch (e) {
      setRecoveryError(e.message);
      setStep(5);
      return;
    }
    if (existing) {
      setSaved(existing);
      setForm(existing.command);
      setStep(5);
      void checkResult();
    }
    return runtime.subscribeRecovery(() => {
      try {
        const row = recovery.read();
        if (row) {
          setSaved(row);
          setForm(row.command);
        }
      } catch (e) {
        setRecoveryError(e.message);
      }
    });
  }, [recovery]);
  const checks = useRef(0);
  useEffect(() => {
    if (
      step !== 5 ||
      saved?.status !== "accepted" ||
      pending ||
      checks.current >= 3
    )
      return;
    const timer = setTimeout(() => {
      checks.current++;
      void checkResult();
    }, [1000, 2000, 4000][checks.current]);
    return () => clearTimeout(timer);
  }, [step, saved, pending]);
  useEffect(() => {
    if (step === 5) {
      resultTitle.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [step]);
  async function finish(next) {
    if (recovery) {
      try {
        await recovery.clear();
      } catch (e) {
        setRecoveryError(e.message);
        return;
      }
    }
    navigate(next);
  }
  async function retrySaved(e) {
    e.preventDefault();
    if (sent.current || !saved) return;
    if (pin !== DEMO_PIN) {
      setRecoveryError("Nhập PIN mô phỏng 123456 để gửi lại đúng yêu cầu.");
      return;
    }
    sent.current = true;
    setPending(true);
    setRecoveryError("");
    try {
      await applyRecovery(await recovery.submit(saved.command, pin, saved.key));
    } catch (e) {
      setRecoveryError(e.message);
    } finally {
      sent.current = false;
      setPending(false);
      setPin("");
    }
  }
  const reduce = useReducedMotion();
  const change = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  function next(e) {
    e.preventDefault();
    const message = validateTransfer(form, balance);
    setError(message);
    if (!message) setStep(2);
  }
  async function confirm(e) {
    e.preventDefault();
    if (sent.current) return;
    if (pin !== DEMO_PIN) {
      setError("Mã PIN chưa đúng. Mã PIN mô phỏng là 123456.");
      return;
    }
    const message = validateTransfer(form, balance);
    if (message) {
      setError(message);
      return;
    }
    // Lock synchronously before React renders the receipt: double clicks cannot debit twice.
    sent.current = true;
    const fingerprint = JSON.stringify(form);
    if (requestKey.current.fingerprint !== fingerprint)
      requestKey.current = { fingerprint, key: crypto.randomUUID() };
    try {
      if (recovery) {
        setPending(true);
        const row = await recovery.submit(form, pin);
        await applyRecovery(row);
        return;
      }
      const pendingResult = onTransfer(form, pin, requestKey.current.key);
      let result;
      if (pendingResult?.then) {
        setPending(true);
        result = await pendingResult;
      } else result = pendingResult;
      setReceipt(result);
      setStep(4);
      setError("");
      if (!reduce)
        confetti({
          particleCount: 140,
          spread: 85,
          origin: { y: 0.55 },
          colors: ["#0C3699", "#4cb8ed", "#b9a4ff", "#f4cb60"],
          disableForReducedMotion: true,
        });
    } catch (error) {
      sent.current = false;
      if (recovery) {
        setNeedsLogin(error.code === "SESSION_EXPIRED");
        try {
          const row = recovery.read();
          if (row) {
            setSaved(row);
            setForm(row.command);
            setStep(5);
          }
        } catch (e) {
          setRecoveryError(e.message);
          setStep(5);
        }
        setRecoveryError(error.message);
      }
      setError(
        error.message ||
          "Chưa xác định được kết quả. Hãy giữ nguyên nội dung và thử lại cùng mã.",
      );
    } finally {
      sent.current = false;
      setPending(false);
      if (recovery) setPin("");
    }
  }
  return (
    <div className="focused-page">
      <Button
        className="text-button back-button"
        onClick={() => navigate("dashboard")}
      >
        <ArrowLeft size={17} /> Về tổng quan
      </Button>
      <div className="page-heading">
        <div>
          <span className="eyebrow">KẾT NỐI NHỮNG ĐIỀU QUAN TRỌNG</span>
          <h1>Chuyển tiền</h1>
          <p>Trao gửi một chút, gắn kết nhiều hơn.</p>
        </div>
        <span className="sandbox-pill">
          <span /> GIAO DỊCH MÔ PHỎNG
        </span>
      </div>
      {step < 4 && (
        <div className="steps">
          {["Thông tin", "Kiểm tra", "Xác nhận PIN"].map((s, i) => (
            <div key={s} className={step >= i + 1 ? "active" : ""}>
              <span>{step > i + 1 ? <Check size={15} /> : i + 1}</span>
              <strong>{s}</strong>
            </div>
          ))}
        </div>
      )}
      <motion.section
        key={step}
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : undefined}
        className="panel form-panel"
      >
        {step === 1 && (
          <form onSubmit={next} noValidate>
            <div className="form-title">
              <span className="shortcut-icon blue">
                <Send size={23} />
              </span>
              <div>
                <h2>Bạn muốn gửi đến ai?</h2>
                <p>
                  Số dư mô phỏng: <strong>{money(balance)} VNĐ</strong>
                </p>
              </div>
            </div>
            <label>
              Ngân hàng nhận
              <select name="bank" value={form.bank} onChange={change}>
                <option value="">Chọn ngân hàng</option>
                <option>MB Bank</option>
                <option>Vietcombank</option>
                <option>Techcombank</option>
                <option>ACB</option>
                <option>NhTBank Sandbox</option>
              </select>
            </label>
            {form.bank === "NhTBank Sandbox" && (
              <Button
                type="button"
                className="secondary"
                onClick={() =>
                  setForm({
                    ...form,
                    account: "0900000002",
                    recipient: "Trần Minh Anh",
                  })
                }
              >
                Dùng tài khoản nội bộ mẫu
              </Button>
            )}
            <div className="form-grid">
              <label>
                Số tài khoản
                <input
                  name="account"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={19}
                  placeholder="Nhập số tài khoản mẫu"
                  value={form.account}
                  onChange={change}
                />
              </label>
              <label>
                Tên người nhận
                <input
                  name="recipient"
                  maxLength={80}
                  placeholder="Ví dụ: Trần Minh Anh"
                  value={form.recipient}
                  onChange={change}
                />
              </label>
            </div>
            <label>
              Số tiền (VNĐ)
              <input
                name="amount"
                inputMode="numeric"
                placeholder="Tối thiểu 1.000"
                value={form.amount}
                onChange={change}
              />
            </label>
            <div className="amount-presets">
              {[50000, 100000, 500000].map((n) => (
                <Button
                  type="button"
                  key={n}
                  className="chip"
                  onClick={() => {
                    setError("");
                    setForm({ ...form, amount: String(n) });
                  }}
                >
                  {money(n)} ₫
                </Button>
              ))}
            </div>
            <label>
              Nội dung chuyển khoản{" "}
              <span className="optional">(không bắt buộc)</span>
              <input
                name="note"
                maxLength={120}
                placeholder="Gửi một lời nhắn dễ thương…"
                value={form.note}
                onChange={change}
              />
            </label>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <Button className="primary full" type="submit" disabled={pending}>
              Tiếp tục <ArrowRight size={18} />
            </Button>
          </form>
        )}
        {step === 2 && (
          <>
            <h2>Kiểm tra một lần, an tâm hơn.</h2>
            <p className="muted mt-2">
              Thông tin dưới đây chỉ dùng trong mô phỏng. Tên người nhận chưa
              được xác minh bởi ngân hàng.
            </p>
            <div className="review-amount">
              {money(Number(form.amount))}
              <small> VNĐ</small>
            </div>
            <dl className="review-list">
              <div>
                <dt>Người nhận</dt>
                <dd>{form.recipient}</dd>
              </div>
              <div>
                <dt>Ngân hàng</dt>
                <dd>{form.bank}</dd>
              </div>
              <div>
                <dt>Số tài khoản</dt>
                <dd>{form.account}</dd>
              </div>
              <div>
                <dt>Nội dung</dt>
                <dd>{form.note || "Chuyển tiền mô phỏng"}</dd>
              </div>
              <div>
                <dt>Phí giao dịch</dt>
                <dd className="positive">Miễn phí</dd>
              </div>
            </dl>
            <div className="form-actions">
              <Button className="secondary" onClick={() => setStep(1)}>
                Chỉnh sửa
              </Button>
              <Button className="primary" onClick={() => setStep(3)}>
                Xác nhận thông tin <ArrowRight size={17} />
              </Button>
            </div>
          </>
        )}
        {step === 3 && (
          <form onSubmit={confirm}>
            <span className="confirm-shield">
              <ShieldCheck size={32} />
            </span>
            <h2>Xác nhận bằng mã PIN</h2>
            <p className="muted mt-2">
              Chuyển mô phỏng {money(Number(form.amount))} VNĐ đến{" "}
              {form.recipient}.
            </p>
            <label className="mt-6">
              Mã PIN (6 chữ số)
              <input
                aria-label="Mã PIN xác nhận"
                autoComplete="off"
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError("");
                }}
                placeholder="Nhập 123456"
              />
            </label>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <div className="form-actions">
              <Button
                type="button"
                className="secondary"
                disabled={pending}
                onClick={() => {
                  setStep(2);
                  setError("");
                }}
              >
                Quay lại
              </Button>
              <Button className="primary" type="submit" disabled={pending}>
                {pending ? "Đang ghi sổ…" : "Chuyển tiền mô phỏng"}
              </Button>
            </div>
          </form>
        )}
        {step === 5 && (
          <div className="transfer-recovery" aria-busy={pending}>
            <h2 ref={resultTitle} tabIndex={-1}>
              {saved?.status === "rejected"
                ? "Máy chủ đã từ chối"
                : saved?.status === "accepted"
                  ? "Máy chủ đã tiếp nhận"
                  : saved?.status === "not_found"
                    ? "Chưa tìm thấy yêu cầu"
                    : "Chưa rõ kết quả"}
            </h2>
            <p className="demo-notice">
              Bản minh họa · Không giao dịch tiền thật
            </p>
            {saved && (
              <>
                <div className="review-amount">
                  {money(Number(saved.command.amount))}
                  <small> VNĐ</small>
                </div>
                <p>
                  Đến <strong>{saved.command.recipient}</strong> ·{" "}
                  {saved.command.bank}
                </p>
                <p className="recovery-key">
                  Mã yêu cầu: <strong>{saved.key}</strong>
                </p>
              </>
            )}
            <p>
              {saved?.status === "rejected"
                ? saved.error?.message
                : saved?.status === "accepted"
                  ? "Yêu cầu đã lưu trên máy chủ. Kiểm tra tự động tối đa 3 lần; sau đó bạn có thể kiểm tra thủ công. Chưa xác nhận ghi sổ."
                  : "Mất phản hồi chưa có nghĩa chuyển tiền thất bại. Mã và nội dung đã lưu trên thiết bị; không tạo lệnh khác khi chưa rõ kết quả."}
            </p>
            {recoveryError && (
              <p role="alert" className="form-error">
                {recoveryError}
              </p>
            )}
            {needsLogin && (
              <form onSubmit={reauthenticate}>
                <p>
                  Phiên hết hạn. Đăng nhập lại để tra cứu; mã yêu cầu được giữ
                  nguyên.
                </p>
                <label>
                  PIN đăng nhập lại
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                  />
                </label>
                <Button
                  className="secondary full"
                  type="submit"
                  disabled={pending}
                >
                  Đăng nhập lại và kiểm tra
                </Button>
              </form>
            )}
            {saved?.status === "rejected" ? (
              <Button
                className="primary full"
                onClick={() => finish("dashboard")}
              >
                Đóng kết quả đã từ chối
              </Button>
            ) : (
              <>
                <Button
                  className="primary full"
                  disabled={pending || !saved}
                  onClick={checkResult}
                >
                  {pending ? "Đang kiểm tra…" : "Kiểm tra kết quả"}
                </Button>
                {saved?.status === "not_found" && (
                  <form onSubmit={retrySaved}>
                    <p>
                      Chỉ gửi lại sau tra cứu, bằng đúng mã và nội dung đã lưu.
                      Máy chủ tiếp tục chống ghi nợ lặp.
                    </p>
                    <label>
                      PIN để gửi lại
                      <input
                        aria-label="PIN để gửi lại"
                        type="password"
                        inputMode="numeric"
                        maxLength={6}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                      />
                    </label>
                    <Button
                      className="secondary full"
                      type="submit"
                      disabled={pending}
                    >
                      Gửi lại cùng mã yêu cầu
                    </Button>
                  </form>
                )}
              </>
            )}
          </div>
        )}
        {step === 4 && (
          <div className="success-panel" role="status">
            <span className="success-icon">
              <CircleCheck size={44} />
            </span>
            <span className="eyebrow">MỘT CHÚT YÊU THƯƠNG ĐÃ ĐƯỢC GỬI</span>
            <h2 ref={resultTitle} tabIndex={-1}>
              Chuyển tiền thành công!
            </h2>
            <div className="review-amount">
              {money(Number(form.amount))}
              <small> VNĐ</small>
            </div>
            <p>
              Đã ghi nhận giao dịch mô phỏng đến
              <br />
              <strong>{form.recipient}</strong>
            </p>
            <p className="receipt-id">Mã giao dịch: {receipt?.id}</p>
            {saved && <p className="recovery-key">Mã yêu cầu: {saved.key}</p>}
            {recoveryError && <p role="alert">{recoveryError}</p>}
            <p className="receipt-id">
              Đã ghi sổ mô phỏng · Thông báo xử lý riêng sau ghi sổ.
            </p>
            <p className="demo-notice">Không có tiền thật được chuyển.</p>
            <Button className="primary full" onClick={() => finish("history")}>
              Xem lịch sử giao dịch <ArrowRight size={17} />
            </Button>
            <Button
              className="text-button mx-auto mt-4"
              onClick={() => finish("dashboard")}
            >
              Về trang chủ
            </Button>
          </div>
        )}
      </motion.section>
      <SecurityNote />
    </div>
  );
}
