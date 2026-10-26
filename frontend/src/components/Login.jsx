import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Delete,
  Fingerprint,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { Brand, Button, SecurityNote } from "./ui";
import { DEMO_PIN, OWNER } from "../lib/bank";

export default function Login({ onLogin }) {
  const reduce = useReducedMotion();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (pin.length !== 6) return;
    if (pin !== DEMO_PIN) {
      setError("PIN chưa đúng. Thử lại với 123456 nhé.");
      setPin("");
      return;
    }
    setLoading(true);
    const timer = setTimeout(onLogin, 1100);
    return () => clearTimeout(timer);
  }, [pin, onLogin]);
  useEffect(() => {
    const keydown = (e) => {
      if (loading || e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^\d$/.test(e.key)) {
        setError("");
        setPin((p) => (p + e.key).slice(0, 6));
      }
      if (e.key === "Backspace") setPin((p) => p.slice(0, -1));
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [loading]);
  return (
    <div className="login-page">
      <section className="login-art">
        <Brand light />
        <div className="login-art-copy">
          <span className="eyebrow">A LITTLE MORE POSSIBILITY.</span>
          <h1>
            Điều tốt đẹp,
            <br />
            bắt đầu từ bạn<span>.</span>
          </h1>
          <p>
            Mỗi chạm nhỏ hôm nay.
            <br />
            Một tương lai rộng mở hơn.
          </p>
        </div>
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="floating-card">
          <span>NhTBank</span>
          <ShieldCheck size={26} />
          <strong>
            Chạm đến
            <br />
            điều tốt đẹp.
          </strong>
          <small>
            NGUYỄN NHỰT TƯỜNG <span>✦</span>
          </small>
        </div>
        <div className="art-footer">
          <span>THIẾT KẾ CHO CUỘC SỐNG CỦA BẠN</span>
          <span>© NhTBank 2026</span>
        </div>
      </section>
      <section className="login-form">
        <span className="sandbox-pill">
          <span /> SANDBOX EXPERIENCE
        </span>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              className="login-loading"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="loading-cube">
                <span>N</span>
              </div>
              <h2>Đang mở thế giới của bạn</h2>
              <p>Một chút phép màu đang đến…</p>
            </motion.div>
          ) : (
            <motion.div
              key="pin"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pin-panel"
            >
              <div className="avatar large">
                NT
                <span />
              </div>
              <p className="welcome-back">Rất vui được gặp lại,</p>
              <h2>{OWNER}</h2>
              <p className="muted">Nhập mã PIN để bắt đầu ngày mới.</p>
              <div
                className="pin-dots"
                aria-label={`Đã nhập ${pin.length} trên 6 số`}
                aria-live="polite"
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <span key={i} className={i < pin.length ? "filled" : ""} />
                ))}
              </div>
              <p role="alert" className="pin-error">
                {error}
              </p>
              <div className="keypad">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <Button
                    key={n}
                    aria-label={`Số ${n}`}
                    onClick={() => {
                      setError("");
                      setPin((p) => (p + n).slice(0, 6));
                    }}
                  >
                    {n}
                  </Button>
                ))}
                <span className="keypad-lock">
                  <LockKeyhole size={22} />
                </span>
                <Button
                  aria-label="Số 0"
                  onClick={() => setPin((p) => (p + "0").slice(0, 6))}
                >
                  0
                </Button>
                <Button
                  aria-label="Xóa một số"
                  onClick={() => setPin((p) => p.slice(0, -1))}
                >
                  <Delete size={22} />
                </Button>
              </div>
              <div className="demo-hint">
                <Fingerprint size={18} />
                <span>
                  Trải nghiệm thử với mã PIN <strong>123456</strong>
                </span>
                <ArrowRight size={15} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <SecurityNote />
      </section>
    </div>
  );
}
