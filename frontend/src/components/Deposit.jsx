import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  QrCode,
  Info,
  RefreshCw,
} from "lucide-react";
import { Button, SecurityNote } from "./ui";
import { money, vietQrUrl } from "../lib/bank";
export default function Deposit({ navigate }) {
  const [amount, setAmount] = useState("100000");
  const [note, setNote] = useState("NAP TIEN DEMO");
  const [qr, setQr] = useState(null);
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  function generate(e) {
    e.preventDefault();
    if (
      !/^\d+$/.test(amount) ||
      !Number.isSafeInteger(Number(amount)) ||
      Number(amount) < 1000 ||
      Number(amount) > 500000000
    ) {
      setError("Nhập số tiền nguyên từ 1.000 đến 500.000.000 VNĐ.");
      return;
    }
    setError("");
    setFailed(false);
    setQr({ amount: Number(amount), note, url: vietQrUrl(amount, note) });
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        `MÔ PHỎNG — KHÔNG CHUYỂN TIỀN\nSố tiền: ${money(qr.amount)} VNĐ\nNội dung: ${qr.note}`,
      );
      setCopied(true);
    } catch {
      setError(
        "Không thể sao chép. Bạn có thể chọn nội dung và sao chép thủ công.",
      );
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
          <span className="eyebrow">THÊM CHO ĐIỀU SẮP TỚI</span>
          <h1>Nạp tiền</h1>
          <p>Một mã QR, thêm nhiều khả năng.</p>
        </div>
      </div>
      <div className="deposit-grid">
        <section className="panel form-panel">
          <h2>Tạo VietQR mô phỏng</h2>
          <div className="demo-notice">
            <Info size={18} />
            <span>
              Không quét để thanh toán. Tài khoản 0000000000 chỉ là dữ liệu mẫu;
              không có tiền được nạp vào ứng dụng.
            </span>
          </div>
          <form onSubmit={generate} noValidate>
            <label>
              Số tiền (VNĐ)
              <input
                inputMode="numeric"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setCopied(false);
                }}
                placeholder="100000"
              />
            </label>
            <div className="amount-presets">
              {[100000, 500000, 1000000].map((n) => (
                <Button
                  type="button"
                  className="chip"
                  key={n}
                  onClick={() => setAmount(String(n))}
                >
                  {money(n)} ₫
                </Button>
              ))}
            </div>
            <label>
              Nội dung
              <input
                value={note}
                maxLength={60}
                onChange={(e) => {
                  setNote(e.target.value);
                  setCopied(false);
                }}
              />
            </label>
            <p className="muted text-xs mb-5">
              Khi tạo mã, số tiền và nội dung mẫu được gửi đến img.vietqr.io.
              Không nhập thông tin nhạy cảm.
            </p>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <Button className="primary full" type="submit">
              <QrCode size={18} /> Tạo mã QR mẫu <ArrowRight size={17} />
            </Button>
          </form>
        </section>
        <section className="panel qr-panel" aria-live="polite">
          <span className="eyebrow">VIETQR · SANDBOX</span>
          {qr ? (
            <>
              <div className="qr-image">
                {failed ? (
                  <div className="qr-fallback">
                    <QrCode size={64} />
                    <p>Chưa tải được VietQR.</p>
                    <small>
                      Kiểm tra kết nối đến img.vietqr.io rồi tạo lại mã.
                    </small>
                  </div>
                ) : (
                  <img
                    key={qr.url}
                    src={qr.url}
                    alt={`VietQR mô phỏng ${money(qr.amount)} VNĐ — không dùng thanh toán`}
                    onError={() => setFailed(true)}
                  />
                )}
                <span className="qr-watermark">DEMO · KHÔNG THANH TOÁN</span>
              </div>
              <strong className="qr-amount">
                {money(qr.amount)} <small>VNĐ</small>
              </strong>
              <p className="muted">{qr.note || "NAP TIEN DEMO"}</p>
              <span className="tag mt-3">
                MB Bank · 0000000000 · Tài khoản mẫu
              </span>
              <Button className="secondary mt-5" onClick={copy}>
                <Copy size={16} />
                {copied ? "Đã sao chép" : "Sao chép nội dung mẫu"}
              </Button>
              {failed && (
                <Button
                  className="text-button mt-3"
                  onClick={() => {
                    setFailed(false);
                    setQr({
                      ...qr,
                      url: `${vietQrUrl(qr.amount, qr.note)}&retry=${Date.now()}`,
                    });
                  }}
                >
                  <RefreshCw size={15} /> Tải lại mã
                </Button>
              )}
            </>
          ) : (
            <div className="qr-placeholder">
              <QrCode size={72} strokeWidth={1} />
              <h3>Mã QR của bạn ở đây</h3>
              <p>Chọn số tiền và tạo mã để xem trước.</p>
            </div>
          )}
        </section>
      </div>
      <SecurityNote />
    </div>
  );
}
