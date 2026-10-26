import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  Plus,
  Send,
  Wallet,
  Landmark,
  MoveUpRight,
  ChevronRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { AnimatedMoney, Button, TransactionList } from "./ui";
import { money } from "../lib/bank";

const shortcuts = [
  {
    label: "Chuyển tiền",
    hint: "Đến người bạn thương",
    icon: Send,
    page: "transfer",
    color: "blue",
  },
  {
    label: "Nạp tiền",
    hint: "Thêm cho điều sắp tới",
    icon: Plus,
    page: "deposit",
    color: "mint",
  },
  {
    label: "Tiền gửi",
    hint: "Ươm mầm tương lai",
    icon: Landmark,
    page: "savings",
    color: "purple",
  },
  {
    label: "Vay nhanh",
    hint: "Sẵn sàng mọi dự định",
    icon: Wallet,
    page: "loans",
    color: "orange",
  },
];
export default function Dashboard({ balance, transactions, navigate }) {
  const [hidden, setHidden] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const reduce = useReducedMotion();
  const income = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum - t.amount, 0);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">KHỞI ĐẦU MỘT NGÀY THẬT TỐT</span>
          <h1>
            Xin chào, Nhựt Tường <span className="wave">✦</span>
          </h1>
          <p>Mọi điều bạn cần, trong một chạm.</p>
        </div>
        <span className="date-label">Dữ liệu mẫu · Tháng 10/2026</span>
      </div>
      <div className="overview-grid">
        <motion.section
          aria-label="Thẻ số dư"
          className="balance-card"
          onPointerMove={(e) => {
            if (reduce || e.pointerType === "touch") return;
            const r = e.currentTarget.getBoundingClientRect();
            setTilt({
              x: -((e.clientY - r.top) / r.height - 0.5) * 9,
              y: ((e.clientX - r.left) / r.width - 0.5) * 9,
            });
          }}
          onPointerLeave={() => setTilt({ x: 0, y: 0 })}
          animate={{ rotateX: tilt.x, rotateY: tilt.y }}
          transition={{ type: "spring", stiffness: 160, damping: 22 }}
          style={{ transformPerspective: 1200 }}
        >
          <div className="balance-shine" />
          <div className="card-orbit" />
          <div className="balance-card-top">
            <span>
              Tài khoản thanh toán <span className="account-pill">CÁ NHÂN</span>
            </span>
            <span className="card-wordmark">
              NhT<span>Bank</span> <Sparkles size={17} />
            </span>
          </div>
          <div className="balance-label">
            Số dư khả dụng
            <Button
              className="icon-button light"
              aria-label={hidden ? "Hiện số dư" : "Ẩn số dư"}
              onClick={() => setHidden(!hidden)}
            >
              {hidden ? <EyeOff size={17} /> : <Eye size={17} />}
            </Button>
          </div>
          <div className="balance-number">
            <AnimatedMoney value={balance} hidden={hidden} />
            <span>VNĐ</span>
          </div>
          <div className="balance-bottom">
            <div>
              <span>NGUYỄN NHỰT TƯỜNG</span>
              <small>0788 818 374 · Tài khoản mẫu</small>
            </div>
            <Button
              className="card-deposit"
              onClick={() => navigate("deposit")}
            >
              <Plus size={17} /> Nạp tiền
            </Button>
          </div>
        </motion.section>
        <section className="cashflow panel">
          <div className="section-title">
            <h2>Dòng tiền tháng này</h2>
            <span className="tag">Tháng 10</span>
          </div>
          <div className="cashflow-row">
            <span className="flow-icon green">
              <ArrowDownLeft size={21} />
            </span>
            <div>
              <span>Tiền vào</span>
              <strong>
                {hidden ? "••••••" : `+${money(income)}`} <small>₫</small>
              </strong>
            </div>
            <div className="mini-bars green-bars">
              {[12, 21, 17, 28, 23, 35, 31, 42].map((h, i) => (
                <i key={i} style={{ height: h }} />
              ))}
            </div>
          </div>
          <div className="cashflow-row">
            <span className="flow-icon pink">
              <ArrowUpRight size={21} />
            </span>
            <div>
              <span>Tiền ra</span>
              <strong>
                {hidden ? "••••••" : `−${money(expense)}`} <small>₫</small>
              </strong>
            </div>
            <div className="mini-bars pink-bars">
              {[30, 22, 34, 20, 26, 17, 23, 13].map((h, i) => (
                <i key={i} style={{ height: h }} />
              ))}
            </div>
          </div>
          <p className="cashflow-caption">
            <TrendingUp size={14} /> Số liệu từ giao dịch mẫu trong Sandbox
          </p>
        </section>
      </div>
      <section className="shortcuts" aria-label="Tiện ích nhanh">
        {shortcuts.map(({ label, hint, icon: Icon, page, color }) => (
          <Button
            className="shortcut"
            key={page}
            onClick={() => navigate(page)}
          >
            <span className={`shortcut-icon ${color}`}>
              <Icon size={24} strokeWidth={1.8} />
            </span>
            <span>
              <strong>{label}</strong>
              <small>{hint}</small>
            </span>
            <ChevronRight size={16} className="shortcut-chevron" />
          </Button>
        ))}
      </section>
      <div className="dashboard-bottom">
        <section className="panel recent">
          <div className="section-title">
            <div>
              <h2>Giao dịch gần đây</h2>
              <p>Mỗi giao dịch, một câu chuyện.</p>
            </div>
            <Button className="text-button" onClick={() => navigate("history")}>
              Xem tất cả <ArrowUpRight size={16} />
            </Button>
          </div>
          <TransactionList transactions={transactions.slice(0, 4)} compact />
        </section>
        <section className="dream-card">
          <span className="dream-tag">
            <Sparkles size={13} /> NHỮNG ĐIỀU ĐANG CHỜ BẠN
          </span>
          <h2>
            Gửi hôm nay.
            <br />
            An tâm ngày mai.
          </h2>
          <p>
            Từng khoản nhỏ, góp nên
            <br />
            những ước mơ lớn.
          </p>
          <div className="savings-art">
            <div className="coin coin-back">✦</div>
            <div className="coin coin-front">₫</div>
            <div className="coin-base" />
          </div>
          <Button className="dream-button" onClick={() => navigate("savings")}>
            Khám phá tiền gửi <MoveUpRight size={17} />
          </Button>
          <span className="dream-footnote">
            Sản phẩm minh họa · Không nhận tiền gửi
          </span>
        </section>
      </div>
    </>
  );
}
