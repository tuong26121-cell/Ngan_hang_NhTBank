import { useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  LogOut,
  Bell,
  ChevronDown,
  ArrowUpRight,
  ShieldCheck,
  Landmark,
  Wallet,
  X,
  CircleHelp,
  Sparkles,
} from "lucide-react";
import { ReferenceIcon, DisplaySwitcher } from "./components/ReferenceArt";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Transfer from "./components/Transfer";
import Deposit from "./components/Deposit";
import {
  Brand,
  HelpDialog,
  Button,
  Page,
  SecurityNote,
  TransactionList,
} from "./components/ui";
import { INITIAL_BALANCE, OWNER, initialTransactions, money } from "./lib/bank";
const navigation = [
  ["dashboard", "Trang chủ", "home"],
  ["transfer", "Giao dịch", "transfer"],
  ["deposit", "QR", "qr"],
  ["history", "Lịch sử", "history"],
  ["profile", "Cá nhân", "profile"],
];
export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [notifications, setNotifications] = useState(false);
  const [help, setHelp] = useState(false);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const login = useCallback(() => setAuthenticated(true), []);
  function navigate(next) {
    setPage(next);
    setNotifications(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function transfer(form) {
    const entry = {
      id: `NHT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      name: form.recipient.trim(),
      detail: form.note || "Chuyển tiền mô phỏng",
      category: "Chuyển tiền",
      amount: -Number(form.amount),
      date: new Date().toISOString(),
      icon: "transfer",
    };
    setBalance((b) => b + entry.amount);
    setTransactions((t) => [entry, ...t]);
    return entry;
  }
  function logout() {
    setAuthenticated(false);
    setBalance(INITIAL_BALANCE);
    setTransactions(initialTransactions);
    setFilter("all");
    setQuery("");
    setPage("dashboard");
    setNotifications(false);
    setHelp(false);
  }
  if (!authenticated) return <Login onLogin={login} />;
  const title = {
    dashboard: "Tổng quan",
    transfer: "Chuyển tiền",
    deposit: "Nạp tiền",
    history: "Lịch sử giao dịch",
    profile: "Cá nhân",
    savings: "Tiền gửi",
    loans: "Vay nhanh",
  }[page];
  return (
    <div
      className={`app-shell ${page === "dashboard" ? "home-shell" : "detail-shell"}`}
    >
      <aside className="sidebar">
        <Brand />
        <span className="sidebar-label">KHÔNG GIAN CỦA BẠN</span>
        <nav aria-label="Điều hướng chính">
          {navigation.map(([id, label, icon]) => (
            <Button
              key={id}
              aria-label={label}
              className={`nav-item ${id === "deposit" ? "nav-qr" : ""} ${page === id ? "selected" : ""}`}
              aria-current={page === id ? "page" : undefined}
              onClick={() => navigate(id)}
            >
              <span className="nav-icon-wrap">
                <ReferenceIcon name={icon} size={23} />
              </span>
              <span>{label}</span>
              {page === id && <span className="nav-dot" />}
            </Button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="support-card">
            <span className="support-icon">
              <CircleHelp size={23} />
            </span>
            <h3>Luôn ở đây, vì bạn.</h3>
            <p>
              Một chút hỗ trợ cho
              <br />
              trải nghiệm trọn vẹn hơn.
            </p>
            <Button className="text-button" onClick={() => setHelp(true)}>
              Trung tâm hỗ trợ <ArrowUpRight size={15} />
            </Button>
          </div>
          <div className="sidebar-sandbox">
            <ShieldCheck size={17} />
            <div>
              <strong>Môi trường Sandbox</strong>
              <span>Trải nghiệm, không giới hạn.</span>
            </div>
            <span className="status-dot" />
          </div>
          <Button className="logout" onClick={logout}>
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </Button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="header-identity">
            <Brand />
            <div className="breadcrumb">
              <span>/</span>
              <strong>{title}</strong>
            </div>
          </div>
          <div className="topbar-right">
            <span className="sandbox-pill">
              <span /> CHẾ ĐỘ MÔ PHỎNG
            </span>
            <div className="notification-wrap">
              <Button
                className="icon-button notification-button"
                aria-label="Thông báo"
                aria-expanded={notifications}
                onClick={() => setNotifications(!notifications)}
              >
                <Bell size={20} />
                <i />
              </Button>
              {notifications && (
                <div className="notification-panel">
                  <strong>Một khởi đầu tốt đẹp ✦</strong>
                  <p>
                    Chào mừng bạn đến với NhTBank Sandbox. Mọi giao dịch đều là
                    mô phỏng.
                  </p>
                  <Button
                    className="text-button"
                    onClick={() => setNotifications(false)}
                  >
                    Đã hiểu <X size={14} />
                  </Button>
                </div>
              )}
            </div>
            <Button
              className="profile-button"
              onClick={() => navigate("profile")}
            >
              <span
                className="avatar"
                role="img"
                aria-label="Ảnh đại diện Nhựt Tường"
              >
                NT
              </span>
              <span>
                Nhựt Tường<small>Tài khoản cá nhân</small>
              </span>
              <ChevronDown size={15} />
            </Button>
          </div>
        </header>
        <div className="simulation-banner">
          <ShieldCheck size={16} />
          <span>Ngân hàng mô phỏng · Không giao dịch tiền thật</span>
        </div>
        <main id="main-content">
          <AnimatePresence mode="wait">
            <Page key={page}>
              {page === "dashboard" && (
                <Dashboard
                  balance={balance}
                  transactions={transactions}
                  navigate={navigate}
                />
              )}{" "}
              {page === "transfer" && (
                <Transfer
                  balance={balance}
                  onTransfer={transfer}
                  navigate={navigate}
                />
              )}{" "}
              {page === "deposit" && <Deposit navigate={navigate} />}{" "}
              {page === "history" && (
                <>
                  <div className="page-heading">
                    <div>
                      <span className="eyebrow">DẤU ẤN MỖI NGÀY</span>
                      <h1>Lịch sử giao dịch</h1>
                      <p>Theo dõi từng khoản thu chi, thật rõ ràng.</p>
                    </div>
                  </div>
                  <section className="panel history-panel">
                    <div className="history-toolbar">
                      <div className="filter-tabs" aria-label="Lọc giao dịch">
                        {[
                          ["all", "Tất cả"],
                          ["income", "Tiền vào"],
                          ["expense", "Tiền ra"],
                        ].map(([id, label]) => (
                          <Button
                            key={id}
                            className={filter === id ? "active" : ""}
                            aria-pressed={filter === id}
                            onClick={() => setFilter(id)}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                      <input
                        aria-label="Tìm giao dịch"
                        placeholder="Tìm tên hoặc nội dung…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                    <TransactionList
                      transactions={transactions.filter(
                        (t) =>
                          (filter === "all" ||
                            (filter === "income"
                              ? t.amount > 0
                              : t.amount < 0)) &&
                          `${t.name} ${t.detail}`
                            .toLocaleLowerCase("vi")
                            .includes(query.toLocaleLowerCase("vi")),
                      )}
                    />
                    <p className="muted text-xs mt-5">
                      Dữ liệu mẫu và giao dịch của phiên hiện tại. Đăng xuất
                      hoặc tải lại trang sẽ đặt lại dữ liệu.
                    </p>
                  </section>
                </>
              )}{" "}
              {page === "profile" && (
                <>
                  <div className="page-heading">
                    <div>
                      <span className="eyebrow">DÀNH RIÊNG CHO BẠN</span>
                      <h1>Cá nhân</h1>
                      <p>Chút riêng của bạn, trong từng trải nghiệm.</p>
                    </div>
                  </div>
                  <section className="panel profile-panel">
                    <div className="profile-cover">
                      <Sparkles size={36} />
                    </div>
                    <div className="profile-body">
                      <span className="avatar large">NT</span>
                      <h2>{OWNER}</h2>
                      <p className="muted">Thành viên NhTBank · Sandbox</p>
                      <dl className="review-list">
                        <div>
                          <dt>Chủ tài khoản</dt>
                          <dd>{OWNER}</dd>
                        </div>
                        <div>
                          <dt>Số tài khoản mẫu</dt>
                          <dd>0788818374</dd>
                        </div>
                        <div>
                          <dt>Số dư mô phỏng</dt>
                          <dd>{money(balance)} VNĐ</dd>
                        </div>
                        <div>
                          <dt>Bảo mật đăng nhập</dt>
                          <dd>PIN mô phỏng 6 chữ số</dd>
                        </div>
                        <div>
                          <dt>Lưu trữ dữ liệu</dt>
                          <dd>Trong bộ nhớ phiên</dd>
                        </div>
                      </dl>
                      <SecurityNote />
                      <Button
                        className="text-button mt-4"
                        onClick={() => setHelp(true)}
                      >
                        Trung tâm hỗ trợ <CircleHelp size={16} />
                      </Button>
                      <Button className="secondary mt-6" onClick={logout}>
                        <LogOut size={17} /> Đăng xuất và xóa dữ liệu phiên
                      </Button>
                    </div>
                  </section>
                </>
              )}{" "}
              {(page === "savings" || page === "loans") && (
                <ProductPage type={page} navigate={navigate} />
              )}
            </Page>
          </AnimatePresence>
        </main>
        <footer className="app-footer">
          <span>© 2026 NhTBank. Chạm đến điều tốt đẹp.</span>
          <SecurityNote />
          <DisplaySwitcher />
        </footer>
      </div>
      {help && (
        <HelpDialog onClose={() => setHelp(false)}>
          <Button
            className="icon-button modal-close"
            aria-label="Đóng hỗ trợ"
            onClick={() => setHelp(false)}
          >
            <X size={20} />
          </Button>
          <CircleHelp size={32} className="text-royal" />
          <h2 id="help-title">Chào bạn, chúng tôi ở đây.</h2>
          <p>
            Đăng nhập và xác nhận giao dịch với PIN <strong>123456</strong>.
            Chuyển tiền chỉ cập nhật số dư mô phỏng trong phiên này.
          </p>
          <p>
            Đăng xuất hoặc tải lại trang để khôi phục dữ liệu mẫu. QR được tạo
            ngay trên thiết bị, chỉ chứa dữ liệu mô phỏng và không dùng thanh
            toán.
          </p>
          <Button className="primary full" onClick={() => setHelp(false)}>
            Mình hiểu rồi
          </Button>
        </HelpDialog>
      )}
    </div>
  );
}
function ProductPage({ type, navigate }) {
  const savings = type === "savings";
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MỖI ƯỚC MƠ ĐỀU XỨNG ĐÁNG</span>
          <h1>{savings ? "Tiền gửi" : "Vay nhanh"}</h1>
          <p>
            {savings
              ? "Gieo một khoản nhỏ. Đón một tương lai lớn."
              : "Thêm động lực cho những dự định của bạn."}
          </p>
        </div>
      </div>
      <section className="panel product-panel">
        <span className={`shortcut-icon ${savings ? "purple" : "orange"}`}>
          {savings ? <Landmark size={32} /> : <Wallet size={32} />}
        </span>
        <span className="tag mt-6">BẢN XEM TRƯỚC</span>
        <h2>
          {savings
            ? "Ươm mầm những điều tốt đẹp."
            : "Sẵn sàng cho chương tiếp theo."}
        </h2>
        <p>
          {savings
            ? "Không gian dành cho mục tiêu tiết kiệm của bạn đang được chuẩn bị."
            : "Trải nghiệm vay mô phỏng sẽ có trong phiên bản tiếp theo."}
          <br />
          Hiện chưa mở tài khoản tiền gửi, nhận hồ sơ vay hay tính lãi.
        </p>
        <SecurityNote />
        <Button className="primary mt-6" onClick={() => navigate("dashboard")}>
          Trở về tổng quan <ArrowUpRight size={17} />
        </Button>
      </section>
    </>
  );
}
