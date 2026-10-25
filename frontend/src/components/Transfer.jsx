import { useRef, useState } from "react";
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

export default function Transfer({ balance, onTransfer, navigate }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    bank: "",
    account: "",
    recipient: "",
    amount: "",
    note: "",
  });
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);
  const sent = useRef(false);
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
  function confirm(e) {
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
    const result = onTransfer(form);
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
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
            <Button className="primary full" type="submit">
              Tiếp tục <ArrowRight size={18} />
            </Button>
          </form>
        )}
        {step === 2 && (
          <>
            <h2>Kiểm tra một lần, an tâm hơn.</h2>
            <p className="muted mt-2">
              Thông tin dưới đây chỉ dùng trong mô phỏng.
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
                onClick={() => {
                  setStep(2);
                  setError("");
                }}
              >
                Quay lại
              </Button>
              <Button className="primary" type="submit">
                Chuyển tiền mô phỏng
              </Button>
            </div>
          </form>
        )}
        {step === 4 && (
          <div className="success-panel" role="status">
            <span className="success-icon">
              <CircleCheck size={44} />
            </span>
            <span className="eyebrow">MỘT CHÚT YÊU THƯƠNG ĐÃ ĐƯỢC GỬI</span>
            <h2>Chuyển tiền thành công!</h2>
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
            <p className="demo-notice">Không có tiền thật được chuyển.</p>
            <Button
              className="primary full"
              onClick={() => navigate("history")}
            >
              Xem lịch sử giao dịch <ArrowRight size={17} />
            </Button>
            <Button
              className="text-button mx-auto mt-4"
              onClick={() => navigate("dashboard")}
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
