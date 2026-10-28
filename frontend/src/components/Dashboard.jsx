import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  ChevronRight,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatedMoney, Button, HelpDialog, TransactionList } from "./ui";
import { ReferenceIcon, ReferenceMotif } from "./ReferenceArt";
import { money } from "../lib/bank";

const shortcuts = [
  { label: "Chuyển tiền", icon: "send", page: "transfer" },
  { label: "Nạp tiền", icon: "receive", page: "deposit" },
  { label: "Tiền gửi", icon: "savings", page: "savings" },
  { label: "Vay nhanh", icon: "wallet", page: "loans" },
];
const services = [
  {
    label: "Cửa hàng",
    icon: "store",
    tone: "sky",
    description:
      "Không gian khám phá cửa hàng và dịch vụ. Mẫu hiện tại chưa kết nối cửa hàng hoặc xử lý đơn mua hàng.",
  },
  { label: "Ví của tôi", icon: "wallet", tone: "blue", page: "profile" },
  {
    label: "Thẻ điện tử",
    icon: "card",
    tone: "mint",
    description:
      "Giao diện quản lý thẻ trong mẫu NhTBank 1.1. Chưa có chức năng phát hành hoặc liên kết thẻ ngân hàng.",
  },
  {
    label: "Bảo vệ thẻ",
    icon: "shield",
    tone: "violet",
    description:
      "Bản xem trước giao diện bảo vệ thẻ. Không thu thập số thẻ, mã CVV hoặc thông tin xác thực.",
    badge: true,
  },
  {
    label: "Ưu đãi",
    icon: "star",
    tone: "sky",
    description:
      "Không gian ưu đãi của mẫu NhTBank. Chưa có chương trình ưu đãi hoặc mã giảm giá thực tế.",
    badge: true,
  },
  {
    label: "Vé dịch vụ",
    icon: "ticket",
    tone: "blue",
    description:
      "Bản xem trước tiện ích vé dịch vụ. Chưa kết nối đặt vé hoặc thanh toán.",
  },
  {
    label: "Quà tặng",
    icon: "gift",
    tone: "mint",
    description:
      "Giao diện quà tặng trong mẫu NhTBank. Chưa có chức năng mua, gửi hoặc quy đổi quà.",
  },
  { label: "Mục tiêu", icon: "goal", tone: "violet", page: "savings" },
];

export default function Dashboard({ balance, transactions, navigate }) {
  const [hidden, setHidden] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [service, setService] = useState(null);
  const reduce = useReducedMotion();
  const income = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum - t.amount, 0);
  return (
    <div className="reference-dashboard">
      <section className="dashboard-hero">
        <div className="hero-copy">
          <span className="hero-eyebrow">
            NHTBANK · TÀI CHÍNH TRONG TẦM TAY <span aria-hidden="true">✦</span>
          </span>
          <h1>Xin chào, Nhựt Tường</h1>
          <p>Một thế giới tiện ích trong một chạm.</p>
        </div>
        <ReferenceMotif className="hero-motif" />
      </section>
      <div className="reference-content">
        <div className="account-overview">
          <motion.section
            aria-label="Thẻ số dư"
            className="balance-card reference-balance"
            onPointerMove={(e) => {
              if (reduce || e.pointerType === "touch") return;
              const r = e.currentTarget.getBoundingClientRect();
              setTilt({
                x: -((e.clientY - r.top) / r.height - 0.5) * 5,
                y: ((e.clientX - r.left) / r.width - 0.5) * 5,
              });
            }}
            onPointerLeave={() => setTilt({ x: 0, y: 0 })}
            animate={{
              rotateX: reduce ? 0 : tilt.x,
              rotateY: reduce ? 0 : tilt.y,
            }}
            transition={{ type: "spring", stiffness: 160, damping: 22 }}
            style={{ transformPerspective: 1200 }}
          >
            <div className="reference-account-head">
              <span>TÀI KHOẢN THANH TOÁN</span>
              <span className="account-sandbox">SANDBOX</span>
            </div>
            <div className="reference-account-number">
              NhTBank · 0788 818 374 <i />
            </div>
            <div className="reference-balance-line">
              <div className="balance-number">
                <AnimatedMoney value={balance} hidden={hidden} />
                <span>VNĐ</span>
              </div>
              <Button
                className="icon-button light"
                aria-label={hidden ? "Hiện số dư" : "Ẩn số dư"}
                aria-pressed={hidden}
                onClick={() => setHidden(!hidden)}
              >
                {hidden ? <EyeOff size={20} /> : <Eye size={20} />}
              </Button>
            </div>
            <div className="reference-owner">
              NGUYỄN NHỰT TƯỜNG <span>· Tài khoản mẫu</span>
            </div>
            <div
              className="reference-quick-actions"
              aria-label="Tiện ích nhanh"
            >
              {shortcuts.map(({ label, icon, page }) => (
                <Button
                  key={page}
                  onClick={() => navigate(page)}
                  className="reference-quick-action"
                >
                  <span className="quick-icon-orb">
                    <ReferenceIcon name={icon} size={25} />
                  </span>
                  <span>{label}</span>
                </Button>
              ))}
            </div>
          </motion.section>
          <section className="panel reference-cashflow">
            <div className="section-title">
              <div>
                <span className="eyebrow">DỮ LIỆU MẪU · THÁNG 10/2026</span>
                <h2>Dòng tiền tháng này</h2>
              </div>
              <TrendingUp size={22} />
            </div>
            {[
              { label: "Tiền vào", amount: income, incoming: true },
              { label: "Tiền ra", amount: expense, incoming: false },
            ].map(({ label, amount, incoming }) => (
              <div className="reference-flow-row" key={label}>
                <span className={`flow-icon ${incoming ? "green" : "pink"}`}>
                  {incoming ? (
                    <ArrowDownLeft size={23} />
                  ) : (
                    <ArrowUpRight size={23} />
                  )}
                </span>
                <div>
                  <span>{label}</span>
                  <strong>
                    {hidden
                      ? "••••••"
                      : `${incoming ? "+" : "−"}${money(amount)}`}{" "}
                    <small>₫</small>
                  </strong>
                </div>
              </div>
            ))}
            <p className="cashflow-caption">
              Chỉ tính giao dịch trong Sandbox.
            </p>
          </section>
        </div>
        <section
          className="panel reference-services"
          aria-label="Tiện ích cho bạn"
        >
          <div className="section-title">
            <div>
              <span className="eyebrow">KHÁM PHÁ NHTBANK</span>
              <h2>Tiện ích cho bạn</h2>
            </div>
            <span className="service-preview-label">Bản xem trước</span>
          </div>
          <div className="reference-service-grid">
            {services.map((item) => (
              <Button
                key={item.label}
                className="reference-service"
                onClick={() =>
                  item.page ? navigate(item.page) : setService(item)
                }
              >
                <span className={`service-icon-tile ${item.tone}`}>
                  <ReferenceIcon name={item.icon} size={28} />
                  {item.badge && <span className="service-badge">MỚI</span>}
                </span>
                <span>{item.label}</span>
              </Button>
            ))}
          </div>
        </section>
        <section className="panel reference-recent">
          <div className="section-title">
            <div>
              <span className="eyebrow">DÒNG TIỀN CỦA BẠN</span>
              <h2>Giao dịch gần đây</h2>
            </div>
            <Button className="text-button" onClick={() => navigate("history")}>
              Xem tất cả <ChevronRight size={16} />
            </Button>
          </div>
          <TransactionList transactions={transactions.slice(0, 4)} compact />
        </section>
        <div className="reference-savings-banner">
          <span className="service-icon-tile mint">
            <ReferenceIcon name="savings" size={28} />
          </span>
          <div>
            <h2>Gửi hôm nay. An tâm ngày mai.</h2>
            <p>Sản phẩm minh họa · Không nhận tiền gửi</p>
          </div>
          <Button
            className="icon-button"
            aria-label="Khám phá tiền gửi"
            onClick={() => navigate("savings")}
          >
            <ArrowUpRight size={22} />
          </Button>
        </div>
      </div>
      {service && (
        <HelpDialog onClose={() => setService(null)}>
          <Button
            className="icon-button modal-close"
            aria-label="Đóng tiện ích"
            onClick={() => setService(null)}
          >
            <X size={20} />
          </Button>
          <span className={`service-icon-tile ${service.tone}`}>
            <ReferenceIcon name={service.icon} size={30} />
          </span>
          <span className="tag mt-6">BẢN XEM TRƯỚC · SANDBOX</span>
          <h2 id="help-title">{service.label}</h2>
          <p>{service.description}</p>
          <p>
            Không thực hiện giao dịch hoặc gửi thông tin ra dịch vụ bên ngoài.
          </p>
          <Button className="primary full" onClick={() => setService(null)}>
            Đã hiểu
          </Button>
        </HelpDialog>
      )}
    </div>
  );
}
