import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  QrCode,
  Info,
  RefreshCw,
} from "lucide-react";
import { Button, SecurityNote } from "./ui";
import { money, demoQrUrl } from "../lib/bank";
export default function Deposit({ navigate }) {
  const [amount, setAmount] = useState("100000");
  const [note, setNote] = useState("NAP TIEN DEMO");
  const [qr, setQr] = useState(null);
  const [failedUrl, setFailedUrl] = useState(null);
  const [error, setError] = useState("");
  const [copiedUrl, setCopiedUrl] = useState(null);
  const timer = useRef(null);
  const validAmount =
    /^\d+$/.test(amount) &&
    Number.isSafeInteger(Number(amount)) &&
    Number(amount) >= 1000 &&
    Number(amount) <= 500000000;
  const qrNote = note.trim() || "NAP TIEN DEMO";

  // Hide a previous QR immediately when editing; only the latest valid input
  // may produce a preview after a short pause, avoiding unnecessary local QR generation.
  const preview =
    validAmount && qr?.amount === Number(amount) && qr.note === qrNote
      ? qr
      : null;
  const failed = preview && failedUrl === preview.url;
  const copied = preview && copiedUrl === preview.url;
  useEffect(() => {
    setError("");
    if (!validAmount) return;
    timer.current = setTimeout(() => {
      setQr({
        amount: Number(amount),
        note: qrNote,
        url: demoQrUrl(amount, qrNote),
      });
    }, 400);
    return () => clearTimeout(timer.current);
  }, [amount, qrNote, validAmount]);

  function generate(e) {
    e.preventDefault();
    if (!validAmount) {
      setError("Nhập số tiền nguyên từ 1.000 đến 500.000.000 VNĐ.");
      return;
    }
    clearTimeout(timer.current);
    setError("");
    setFailedUrl(null);
    setCopiedUrl(null);
    setQr({
      amount: Number(amount),
      note: qrNote,
      url: demoQrUrl(amount, qrNote),
    });
  }
  async function copy() {
    if (!preview) return;
    const current = preview;
    try {
      await navigator.clipboard.writeText(
        `MÔ PHỎNG — KHÔNG CHUYỂN TIỀN\nSố tiền: ${money(current.amount)} VNĐ\nNội dung: ${current.note}`,
      );
      // A delayed clipboard result must not mark a newer QR as copied.
      setCopiedUrl(current.url);
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
          <h2>Tạo QR mô phỏng</h2>
          <div className="demo-notice">
            <Info size={18} />
            <span>
              Mã chỉ chứa dữ liệu demo, không phải VietQR thanh toán; không có
              tiền được nạp vào ứng dụng.
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
                }}
              />
            </label>
            <p className="muted text-xs mb-5">
              Mã tự cập nhật trên thiết bị, không gửi nội dung ra dịch vụ ngoài.
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
          <span className="eyebrow">QR · SANDBOX</span>
          {preview ? (
            <>
              <div className="qr-image">
                {failed ? (
                  <div className="qr-fallback">
                    <QrCode size={64} />
                    <p>Chưa hiển thị được QR mô phỏng.</p>
                    <small>Thử tạo lại mã mô phỏng trên thiết bị.</small>
                  </div>
                ) : (
                  <img
                    key={preview.url}
                    src={preview.url}
                    referrerPolicy="no-referrer"
                    alt={`QR mô phỏng ${money(preview.amount)} VNĐ — không dùng thanh toán`}
                    onError={() => setFailedUrl(preview.url)}
                  />
                )}
              </div>
              <strong className="qr-amount">
                {money(preview.amount)} <small>VNĐ</small>
              </strong>
              <p className="muted">{preview.note}</p>
              <span className="tag mt-3">DEMO · KHÔNG THANH TOÁN</span>
              <Button className="secondary mt-5" onClick={copy}>
                <Copy size={16} />
                {copied ? "Đã sao chép" : "Sao chép nội dung mẫu"}
              </Button>
              {failed && (
                <Button
                  className="text-button mt-3"
                  onClick={() => {
                    setFailedUrl(null);
                    setQr({
                      ...preview,
                      url: demoQrUrl(preview.amount, preview.note),
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
              <h3>
                {validAmount
                  ? "Đang tạo mã QR mẫu…"
                  : "Nhập số tiền để xem mã QR"}
              </h3>
              <p>
                {validAmount
                  ? "Mã sẽ tự cập nhật khi bạn ngừng nhập."
                  : "Số tiền nguyên từ 1.000 đến 500.000.000 VNĐ."}
              </p>
            </div>
          )}
        </section>
      </div>
      <SecurityNote />
    </div>
  );
}
