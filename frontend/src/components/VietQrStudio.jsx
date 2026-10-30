import { useState } from "react";
import { Check, Copy, Download, ExternalLink, Info, QrCode } from "lucide-react";
import { Button } from "./ui";
import BankHandoff from "./BankHandoff";
import { money } from "../lib/bank";
import {
  buildVietQrUrl,
  validateVietQr,
  VIETQR_BANKS,
} from "../lib/vietqr";
import "./vietqr.css";

const initialForm = {
  bank: "MB",
  account: "",
  amount: "",
  description: "",
  template: "compact",
  showinfo: true,
  fullacc: false,
  holder: "",
  store: "",
};

export default function VietQrStudio() {
  const [form, setForm] = useState(initialForm);
  const [consent, setConsent] = useState(false);
  const [issued, setIssued] = useState(null);
  const [error, setError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const signature = JSON.stringify(form);
  // Editing any field immediately hides an old, now inaccurate payment QR.
  const preview = issued?.signature === signature ? issued : null;

  function change(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
    setCopied(false);
  }

  function generate(event) {
    event.preventDefault();
    const problem = validateVietQr(form);
    if (problem) {
      setError(problem);
      return;
    }
    if (!consent) {
      setError("Bạn cần đồng ý gửi thông tin QR tới vietqr.app trước khi tạo.");
      return;
    }
    setError("");
    setImageFailed(false);
    setCopied(false);
    // This is the sole path that triggers a request to the external service.
    setIssued({ signature, url: buildVietQrUrl(form) });
  }

  async function copyLink() {
    if (!preview) return;
    try {
      await navigator.clipboard.writeText(preview.url);
      setCopied(true);
    } catch {
      setError("Trình duyệt không cho sao chép. Hãy mở liên kết và sao chép thủ công.");
    }
  }

  return (
    <section className="vietqr-studio" aria-labelledby="vietqr-title">
      <div className="vietqr-heading">
        <div>
          <span className="eyebrow">CÔNG CỤ TÙY CHỌN · DỊCH VỤ BÊN NGOÀI</span>
          <h2 id="vietqr-title">NhTBank QR Studio</h2>
          <p>Tạo mã VietQR nhận chuyển khoản vào tài khoản ngân hàng do bạn chọn.</p>
        </div>
        <span className="vietqr-provider">Ảnh QR: vietqr.app</span>
      </div>
      <div className="demo-notice vietqr-warning">
        <Info size={20} aria-hidden="true" />
        <span>
          Khác với QR Sandbox phía trên, ảnh VietQR này có thể dùng để chuyển tiền
          ngân hàng thật. NhTBank không nhận, chuyển hay xác nhận tiền; không cập
          nhật số dư demo. Kiểm tra người thụ hưởng trong ứng dụng ngân hàng trước
          khi xác nhận. Không nhập PIN, OTP hoặc mật khẩu.
        </span>
      </div>
      <div className="vietqr-layout">
        <form className="panel vietqr-form" noValidate onSubmit={generate}>
          <h3>Thông tin nhận tiền</h3>
          <div className="vietqr-two-col">
            <label>
              Ngân hàng nhận
              <select
                value={form.bank}
                onChange={(event) => change("bank", event.target.value)}
              >
                {VIETQR_BANKS.map((bank) => (
                  <option key={bank.code} value={bank.code}>{bank.label}</option>
                ))}
              </select>
            </label>
            <label>
              Số tài khoản nhận
              <input
                required
                autoComplete="off"
                inputMode="numeric"
                placeholder="Nhập 5–19 chữ số"
                value={form.account}
                onChange={(event) => change("account", event.target.value)}
              />
            </label>
          </div>
          <div className="vietqr-two-col">
            <label>
              Số tiền (VNĐ, có thể để trống)
              <input
                inputMode="numeric"
                placeholder="Ví dụ: 500000"
                value={form.amount}
                onChange={(event) => change("amount", event.target.value)}
              />
            </label>
            <label>
              Nội dung chuyển khoản
              <input
                maxLength={60}
                placeholder="Ví dụ: THANH TOAN"
                value={form.description}
                onChange={(event) => change("description", event.target.value)}
              />
            </label>
          </div>
          <div className="vietqr-two-col">
            <label>
              Tên chủ tài khoản (tùy chọn)
              <input
                maxLength={80}
                autoComplete="off"
                value={form.holder}
                onChange={(event) => change("holder", event.target.value)}
              />
            </label>
            <label>
              Tên cửa hàng (tùy chọn)
              <input
                maxLength={80}
                value={form.store}
                onChange={(event) => change("store", event.target.value)}
              />
            </label>
          </div>
          <label>
            Giao diện ảnh
            <select
              value={form.template}
              onChange={(event) => change("template", event.target.value)}
            >
              <option value="compact">Compact · Có thông tin</option>
              <option value="qronly">QR only · Chỉ mã</option>
              <option value="standee">Standee · Trưng bày</option>
            </select>
          </label>
          <div className="vietqr-options">
            <label className="vietqr-check">
              <input
                type="checkbox"
                checked={form.showinfo}
                onChange={(event) => change("showinfo", event.target.checked)}
              />
              Hiển thị thông tin trên ảnh
            </label>
            <label className="vietqr-check">
              <input
                type="checkbox"
                checked={form.fullacc}
                onChange={(event) => change("fullacc", event.target.checked)}
              />
              Hiển thị đủ số tài khoản
            </label>
          </div>
          <label className="vietqr-consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            Tôi hiểu rằng khi nhấn tạo, số tài khoản, ngân hàng, số tiền và các
            thông tin đã điền sẽ được gửi đến vietqr.app để tạo ảnh QR.
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <Button type="submit" className="primary full">
            <QrCode size={18} /> Tạo ảnh VietQR theo thông tin của tôi
          </Button>
        </form>
        <div className="vietqr-result vietqr-receipt" aria-live="polite">
          <div className="vietqr-receipt-top">
            <div className="vietqr-receipt-brand"><span className="vietqr-brand-icon"><img src={import.meta.env.BASE_URL + "branding/nt-logo.webp"} alt="" width="38" height="38" /></span><div><strong>NhTBank</strong><small>QR STUDIO · NHẬN CHUYỂN KHOẢN</small></div></div>
            <span className="vietqr-receipt-number">VietQR</span>
          </div>
          {preview ? (
            <>
              <div className="vietqr-ticket" aria-label="Thẻ QR nhận tiền NhTBank">
                <span className="vietqr-ticket-eyebrow">QUÉT ĐỂ CHUYỂN KHOẢN</span>
                <h3>{VIETQR_BANKS.find((bank) => bank.code === form.bank)?.label}</h3>
                <div className="vietqr-image-stage">
                  {imageFailed ? (
                    <div className="qr-fallback">
                      <QrCode size={60} />
                      <p>Không tải được ảnh từ vietqr.app.</p>
                      <small>Kiểm tra mạng hoặc mở ảnh trực tiếp.</small>
                    </div>
                  ) : (
                    <img className="vietqr-image" src={preview.url}
                      alt="Ảnh VietQR nhận chuyển khoản từ dịch vụ vietqr.app"
                      referrerPolicy="no-referrer"
                      onError={() => setImageFailed(true)} />
                  )}
                </div>
                <p className="vietqr-ticket-hint">Dùng tính năng Quét QR trong ứng dụng ngân hàng để thanh toán.</p>
                <div className="vietqr-ticket-perforation" aria-hidden="true"><span/><i/><span/></div>
                <p className="vietqr-summary">
                  <span><small>TÀI KHOẢN NHẬN</small><strong>{form.account}</strong></span>
                  <span><small>SỐ TIỀN</small><strong>{form.amount ? money(Number(form.amount)) + " VNĐ" : "Người gửi tự nhập"}</strong></span>
                  {form.description && <span><small>NỘI DUNG</small><strong>{form.description}</strong></span>}
                </p>
              </div>
              <div className="vietqr-actions">
                <Button type="button" className="secondary" onClick={copyLink}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Đã sao chép" : "Sao chép liên kết"}
                </Button>
                <a className="button secondary" href={buildVietQrUrl(form, { download: true })}
                  target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">
                  <Download size={16} /> Tải ảnh QR
                </a>
                <a className="vietqr-source-link" href={preview.url}
                  target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">
                  Mở ảnh gốc <ExternalLink size={14} />
                </a>
              </div>
              <BankHandoff title="Đi đến ngân hàng để chuyển tiền" />
              <p className="vietqr-footnote">
                Ảnh mã QR do vietqr.app cung cấp. NhTBank chỉ trình bày
                giao diện; mã QR gốc không bị thay đổi nên vẫn quét được.
                Không xác nhận chủ tài khoản hoặc trạng thái nhận tiền.
              </p>
            </>
          ) : (
            <div className="qr-placeholder vietqr-empty">
              <QrCode size={70} strokeWidth={1} />
              <h3>Mã QR mang dấu ấn NhTBank</h3>
              <p>Điền thông tin để tạo thẻ nhận tiền theo bố cục mới.</p>
              <small>Chỉ gửi dữ liệu tới vietqr.app khi bạn đồng ý và nhấn tạo.</small>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
