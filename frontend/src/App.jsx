import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Clock3,
  UserRound,
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
  QrCode,
} from "lucide-react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Transfer from "./components/Transfer";
import Deposit from "./components/Deposit";
import PlatformWorkspace from "./components/PlatformWorkspace";
import { createPlatformClient, PRIMARY_ACCOUNT } from "./lib/platform-client";
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
  ["dashboard", "Trang chủ", LayoutDashboard],
  ["transfer", "Giao dịch", ArrowLeftRight],
  ["deposit", "QR", QrCode],
  ["history", "Lịch sử", Clock3],
  ["profile", "Cá nhân", UserRound],
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
  const [runtime] = useState(createPlatformClient);
  const [platformSnapshot, setPlatformSnapshot] = useState(null);
  const [sessionError, setSessionError] = useState("");
  const applySnapshot = useCallback((next) => {
    setPlatformSnapshot(next);
    setBalance(
      next.accounts.find((a) => a.id === PRIMARY_ACCOUNT)?.balance ?? 0,
    );
    setTransactions([
      ...next.transfers
        .filter((t) => t.kind === "transfer")
        .reverse()
        .map((t) => ({ ...t, amount: -t.amount })),
      ...initialTransactions,
    ]);
    return next;
  }, []);
  const login = useCallback(() => {
    const finish = (next) => {
      applySnapshot(next);
      setAuthenticated(true);
      setSessionError("");
      if (
        new URLSearchParams(window.location.search).get("workspace") ===
        "operations"
      )
        setPage("operations");
    };
    const next = runtime.login();
    return next?.then ? next.then(finish) : finish(next);
  }, [runtime, applySnapshot]);
  useEffect(() => {
    if (runtime.mode !== "server") return;
    let active = true;
    runtime
      .resume()
      .then((next) => {
        if (active) {
          applySnapshot(next);
          setAuthenticated(true);
          if (
            new URLSearchParams(window.location.search).get("workspace") ===
            "operations"
          )
            setPage("operations");
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [runtime, applySnapshot]);
  function refreshPlatform() {
    const next = runtime.snapshot();
    return next?.then ? next.then(applySnapshot) : applySnapshot(next);
  }
  async function platformAction(name, args) {
    const result = await runtime.action(name, args);
    await refreshPlatform();
    return result;
  }
  async function switchIdentity(identity, pin) {
    const next = await runtime.login(identity, pin);
    applySnapshot(next);
  }

  function navigate(next) {
    setPage(next);
    setNotifications(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function transfer(form, pin, key) {
    const result = runtime.transfer(form, key, pin);
    if (result?.then)
      return result.then(async (entry) => {
        await refreshPlatform();
        return entry;
      });
    refreshPlatform();
    return result;
  }
  function logout() {
    const finish = () => {
      setAuthenticated(false);
      setBalance(INITIAL_BALANCE);
      setTransactions(initialTransactions);
      setPlatformSnapshot(null);
      setFilter("all");
      setQuery("");
      setPage("dashboard");
      setNotifications(false);
      setHelp(false);
      setSessionError("");
    };
    try {
      const result = runtime.logout();
      if (result?.then)
        result.then(finish).catch((e) => setSessionError(e.message));
      else finish();
    } catch (e) {
      setSessionError(e.message);
    }
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
    operations: "Vận hành mô phỏng",
  }[page];
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <span className="sidebar-label">KHÔNG GIAN CỦA BẠN</span>
        <nav aria-label="Điều hướng chính">
          {navigation.map(([id, label, Icon]) => (
            <Button
              key={id}
              aria-label={label}
              className={`nav-item ${page === id || (page === "operations" && id === "profile") ? "selected" : ""}`}
              aria-current={
                page === id
                  ? "page"
                  : page === "operations" && id === "profile"
                    ? "location"
                    : undefined
              }
              onClick={() => navigate(id)}
            >
              <Icon size={21} />
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
                onClick={() => {
                  setNotifications(!notifications);
                  if (!notifications) {
                    try {
                      const result = refreshPlatform();
                      if (result?.catch)
                        result.catch((e) => setSessionError(e.message));
                    } catch (e) {
                      setSessionError(e.message);
                    }
                  }
                }}
              >
                <Bell size={20} />
                <i />
              </Button>
              {notifications && (
                <div className="notification-panel">
                  <strong>Một khởi đầu tốt đẹp ✦</strong>
                  {(platformSnapshot?.notifications || [])
                    .slice(-3)
                    .reverse()
                    .map((item) => (
                      <article className="platform-notification" key={item.id}>
                        <strong>{item.title}</strong>
                        <p>
                          {money(item.amount)} VNĐ · {item.recipient}
                        </p>
                        <small>Ghi sổ mô phỏng · {item.transactionId}</small>
                        <Button
                          className="text-button"
                          onClick={() => navigate("history")}
                        >
                          Mở lịch sử
                        </Button>
                      </article>
                    ))}
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
          {sessionError && (
            <p className="form-error" role="alert">
              {sessionError}
            </p>
          )}
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
              {page === "operations" && platformSnapshot && (
                <PlatformWorkspace
                  snapshot={platformSnapshot}
                  runtime={runtime}
                  onRefresh={refreshPlatform}
                  onAction={platformAction}
                  onIdentity={switchIdentity}
                  navigate={navigate}
                />
              )}
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
                      {runtime.mode === "server"
                        ? "Sổ mới được lưu SQLite; bốn giao dịch lịch sử cũ là dữ liệu minh họa ngoài số dư đầu kỳ, không được ghi sổ lại."
                        : "Bốn mục cũ là lịch sử minh họa ngoài số dư đầu kỳ; giao dịch mới đi qua sổ của phiên. Đăng xuất hoặc tải lại đặt lại bộ nhớ."}
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
                          <dd>
                            {runtime.mode === "server"
                              ? "SQLite trên máy chủ cục bộ"
                              : "Trong bộ nhớ phiên"}
                          </dd>
                        </div>
                      </dl>
                      <SecurityNote />
                      <Button
                        className="secondary platform-link"
                        onClick={() => navigate("operations")}
                      >
                        Không gian vận hành
                      </Button>
                      <p className="platform-caption">
                        Vai trò: {platformSnapshot?.actor.name}.{" "}
                        {runtime.mode === "server"
                          ? "Đăng xuất kết thúc phiên, không xóa sổ cái."
                          : "Đăng xuất sẽ đặt lại dữ liệu bộ nhớ."}
                      </p>
                      <Button
                        className="text-button mt-4"
                        onClick={() => setHelp(true)}
                      >
                        Trung tâm hỗ trợ <CircleHelp size={16} />
                      </Button>
                      <Button className="secondary mt-6" onClick={logout}>
                        <LogOut size={17} />{" "}
                        {runtime.mode === "server"
                          ? "Đăng xuất khỏi máy chủ"
                          : "Đăng xuất và xóa dữ liệu phiên"}
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
            {runtime.mode === "server"
              ? "Sổ mô phỏng được lưu SQLite trên máy chủ cục bộ."
              : "Chuyển tiền chỉ cập nhật số dư mô phỏng trong phiên này."}
          </p>
          <p>
            {runtime.mode === "server"
              ? "Đăng xuất hoặc tải lại không xóa sổ cái. "
              : "Đăng xuất hoặc tải lại trang để khôi phục dữ liệu mẫu. "}
            QR được tạo ngay trên thiết bị, chỉ chứa dữ liệu mô phỏng và không
            dùng thanh toán.
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
