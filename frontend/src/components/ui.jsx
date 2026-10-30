import { useEffect, useRef, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownLeft,
  BriefcaseBusiness,
  Coffee,
  Music2,
  Repeat2,
  ShieldCheck,
} from "lucide-react";
import { money } from "../lib/bank";

export function Brand({ light = false }) {
  return (
    <div className={`brand ${light ? "brand-light" : ""}`}>
      <span className="brand-mark">
        <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
          <path
            d="M10 29V11h5l10 14V11h5v18h-5L15 15v14z"
            fill="currentColor"
          />
          <path d="M24 5h11v11l-4-4-5 5-3-3 5-5z" fill="currentColor" />
        </svg>
      </span>
      <span>
        NhT<span className="font-normal">Bank</span>
        <small>TÀI CHÍNH TRONG TẦM TAY</small>
      </span>
    </div>
  );
}
export function Button({ children, className = "", onClick, ...props }) {
  const [ripple, setRipple] = useState(null);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <button
      {...props}
      className={`button ${className}`}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setRipple({
          x: e.clientX ? e.clientX - rect.left : rect.width / 2,
          y: e.clientY ? e.clientY - rect.top : rect.height / 2,
          id: Date.now(),
        });
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setRipple(null), 650);
        onClick?.(e);
      }}
    >
      {ripple && (
        <span
          key={ripple.id}
          className="ripple"
          style={{ left: ripple.x, top: ripple.y }}
        />
      )}
      {children}
    </button>
  );
}
export function AnimatedMoney({ value, hidden = false }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (hidden) return;
    if (reduce) {
      ref.current.textContent = money(value);
      return;
    }
    const animation = animate(0, value, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (n) => {
        if (ref.current) ref.current.textContent = money(Math.round(n));
      },
    });
    return () => animation.stop();
  }, [value, hidden, reduce]);
  return (
    <span ref={ref} aria-label={hidden ? "Số dư đã ẩn" : `${money(value)} VNĐ`}>
      {hidden ? "••••••••" : money(value)}
    </span>
  );
}
export function SecurityNote() {
  return (
    <div className="security-note">
      <ShieldCheck size={15} />
      <span>Ứng dụng mô phỏng · Không nhập PIN, OTP hoặc mật khẩu ngân hàng thật</span>
    </div>
  );
}
export function TransactionList({ transactions, compact = false }) {
  return (
    <div className="transaction-list">
      {transactions.length === 0 ? (
        <div className="empty-state">Chưa có giao dịch trong bộ lọc này.</div>
      ) : (
        transactions.map((t) => {
          const Icon =
            {
              salary: BriefcaseBusiness,
              coffee: Coffee,
              transfer: Repeat2,
              music: Music2,
            }[t.icon] || ArrowDownLeft;
          const incoming = t.amount > 0;
          return (
            <div className="transaction" key={t.id}>
              <span className={`transaction-icon ${t.icon}`}>
                <Icon size={21} />
              </span>
              <div className="transaction-info">
                <strong>{t.name}</strong>
                <span>{compact ? t.detail : t.category}</span>
              </div>
              <div className="transaction-value">
                <strong className={incoming ? "positive" : ""}>
                  {incoming ? "+" : "−"}
                  {money(Math.abs(t.amount))}
                  <small> ₫</small>
                </strong>
                <span>
                  {new Intl.DateTimeFormat("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    timeZone: "Asia/Ho_Chi_Minh",
                  }).format(new Date(t.date))}{" "}
                  · {incoming ? "Thu" : "Chi"}
                </span>
              </div>
              <span className={`direction ${incoming ? "positive" : ""}`}>
                {incoming ? (
                  <ArrowDownLeft size={16} />
                ) : (
                  <ArrowUpRight size={16} />
                )}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}
export function Page({ children, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 1 } : { opacity: 0, y: -8 }}
      transition={{ duration: reduce ? 0 : 0.22 }}
    >
      {children}
    </motion.div>
  );
}

// Native dialog keeps keyboard focus inside and restores focus when closed.
export function HelpDialog({ children, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog.showModal();
    dialog.querySelector("button")?.focus();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="panel help-modal"
      aria-labelledby="help-title"
      onCancel={onClose}
      onKeyDown={(e) => {
        if (e.key !== "Tab") return;
        const buttons = ref.current.querySelectorAll("button");
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }}
      onClick={(e) => {
        const bounds = e.currentTarget.getBoundingClientRect();
        if (
          e.clientX < bounds.left ||
          e.clientX > bounds.right ||
          e.clientY < bounds.top ||
          e.clientY > bounds.bottom
        )
          onClose();
      }}
    >
      {children}
    </dialog>
  );
}
