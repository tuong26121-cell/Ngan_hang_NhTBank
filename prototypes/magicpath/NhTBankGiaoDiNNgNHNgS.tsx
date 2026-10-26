import React, { useState } from "react";
import { Home, ArrowLeftRight, QrCode, Clock3, UserRound, Bell, Eye, EyeOff, Send, ArrowDownLeft, PiggyBank, Receipt, ShieldCheck, Wallet, CreditCard, Gift, Sparkles, ArrowUpRight, ChevronRight, LogOut, Check, X } from "lucide-react";
import "./NhTBankGiaoDiNNgNHNgS.css";
type Page = "home" | "transfer" | "qr" | "history" | "profile";
type Tx = {
  id: string;
  name: string;
  amount: number;
  detail: string;
};
const initial: Tx[] = [{
  id: "1",
  name: "Lương tháng 10",
  amount: 4200000,
  detail: "Tiền vào mô phỏng"
}, {
  id: "2",
  name: "Siêu thị",
  amount: -264000,
  detail: "Mua sắm demo"
}, {
  id: "3",
  name: "Bạn bè",
  amount: -150000,
  detail: "Chuyển tiền mô phỏng"
}];
const fmt = (x: number) => new Intl.NumberFormat("vi-VN").format(x);
const nav: [Page, string, React.ElementType][] = [["home", "Trang chủ", Home], ["transfer", "Giao dịch", ArrowLeftRight], ["qr", "QR", QrCode], ["history", "Lịch sử", Clock3], ["profile", "Cá nhân", UserRound]];
export const NhTBankGiaoDiNNgNHNgS = () => {
  const [logged, setLogged] = useState(false),
    [pin, setPin] = useState(""),
    [error, setError] = useState(""),
    [page, setPage] = useState<Page>("home");
  const [balance, setBalance] = useState(4056000),
    [visible, setVisible] = useState(false),
    [tx, setTx] = useState<Tx[]>(initial),
    [notice, setNotice] = useState(false),
    [toast, setToast] = useState("");
  const [recipient, setRecipient] = useState(""),
    [account, setAccount] = useState(""),
    [amount, setAmount] = useState(""),
    [step, setStep] = useState(0),
    [filter, setFilter] = useState("all");
  const goto = (p: Page) => {
    setPage(p);
    setStep(0);
    setToast("");
  };
  const reset = () => {
    setLogged(false);
    setBalance(4056000);
    setTx(initial);
    setPage("home");
    setPin("");
    setStep(0);
  };
  const confirm = () => {
    const n = Number(amount);
    if (n < 1000 || n > balance || !Number.isSafeInteger(n)) return setToast("Số tiền mô phỏng không hợp lệ.");
    setBalance(b => b - n);
    setTx(t => [{
      id: String(Date.now()),
      name: recipient,
      amount: -n,
      detail: "Chuyển tiền mô phỏng"
    }, ...t]);
    setStep(2);
  };
  const art = <div className="mp-art"><div className="mp-ring r1" /><div className="mp-ring r2" /><div className="mp-orb" /><div className="mp-ball b1" /><div className="mp-ball b2" /><div className="mp-light" /></div>;
  if (!logged) return <div className="mp-bank mp-login"><div className="mp-splash"><div className="mp-intro-brand"><div className="mp-mark">N✦</div><strong>NhTBank</strong><small>TÀI CHÍNH TRONG TẦM TAY</small></div>{art}</div><div className="mp-login-card"><p className="mp-demo">✦ ỨNG DỤNG MÔ PHỎNG · SANDBOX</p><h1>Chào mừng trở lại</h1><p>Khám phá một không gian tài chính đầy cảm hứng.</p><label>Mã PIN dùng thử</label><input aria-label="PIN" autoComplete="off" type="password" inputMode="numeric" maxLength={6} placeholder="Nhập 6 chữ số" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ""))} onKeyDown={e => e.key === "Enter" && (pin === "123456" ? setLogged(true) : setError("PIN demo là 123456"))} /><small>Nhập mã 123456 để trải nghiệm</small>{error && <p role="alert" className="mp-error">{error}</p>}<button className="mp-primary" onClick={() => pin === "123456" ? setLogged(true) : setError("PIN demo là 123456")}>Vào NhTBank <ArrowUpRight size={18} /></button><p className="mp-legal">Không dùng tài khoản thật · Không chuyển tiền thật</p></div></div>;
  return <div className="mp-bank mp-layout"><aside className="mp-sidebar"><div className="mp-logo"><div className="mp-mark">N✦</div><b>NhTBank</b></div><small>KHÔNG GIAN CỦA BẠN</small>{nav.map(([id, title, Icon]) => <button key={id} className={page === id ? "selected" : ""} onClick={() => goto(id)}><Icon size={20} />{title}</button>)}<p><ShieldCheck size={16} /> Chế độ mô phỏng</p></aside><div className="mp-main"><div className="mp-head"><header><button className="mp-logo" onClick={() => goto("home")}><div className="mp-mark">N✦</div><b>NhTBank</b></button><div><span className="mp-sandbox">SANDBOX</span><button className="mp-bell" aria-label="Thông báo" onClick={() => setNotice(!notice)}><Bell size={20} /></button><button className="mp-avatar" onClick={() => goto("profile")}>NT</button></div></header>{notice && <div className="mp-notice"><button onClick={() => setNotice(false)} aria-label="Đóng"><X size={16} /></button><strong>Chào mừng bạn!</strong><p>Tất cả thông tin và giao dịch ở đây chỉ là mô phỏng.</p></div>}{page === "home" ? <div className="mp-greeting"><small>XIN CHÀO, NHỰT TƯỜNG ✨</small><h1>Tài chính trong tầm tay</h1><p>Mọi điều bạn cần, trong một chạm.</p></div> : <div className="mp-heading"><h1>{nav.find(a => a[0] === page)?.[1]}</h1><p>Trải nghiệm ngân hàng số mô phỏng</p></div>}{page === "home" && art}</div><main className="mp-content">{page === "home" && <><section className="mp-balance"><div className="mp-balance-top">TÀI KHOẢN THANH TOÁN <ChevronRight size={19} /></div><p>NhTBank •••• 8374</p><div className="mp-amount"><b>{visible ? fmt(balance) : "••••••••"}</b><span>VNĐ</span><button onClick={() => setVisible(!visible)} aria-label={visible ? "Ẩn số dư" : "Hiện số dư"}>{visible ? <EyeOff size={20} /> : <Eye size={20} />}</button></div><div className="mp-divider" /><div className="mp-quick">{[["Chuyển tiền", Send, "transfer"], ["Nhận tiền", ArrowDownLeft, "qr"], ["Tiết kiệm", PiggyBank, "soon"], ["Hóa đơn", Receipt, "soon"]].map(([name, Icon, to]: any) => <button key={name} onClick={() => to === "soon" ? setToast("Tính năng đang giới thiệu, chưa xử lý giao dịch.") : goto(to)}><span><Icon size={22} /></span><small>{name}</small></button>)}</div></section><section className="mp-white"><div className="mp-section-title"><div><small>TIỆN ÍCH CỦA BẠN</small><h2>Mọi điều bạn cần</h2></div><button onClick={() => setToast("Các tiện ích chưa có nghiệp vụ.")}>Tất cả <ChevronRight size={15} /></button></div><div className="mp-grid">{[["Cửa hàng", Wallet], ["Ví của tôi", CreditCard], ["Thẻ điện tử", CreditCard], ["Bảo vệ thẻ", ShieldCheck], ["Ưu đãi", Gift], ["Vé dịch vụ", Receipt], ["Quà tặng", Gift], ["Mục tiêu", Sparkles]].map(([name, Icon]: any, i) => <button key={name} onClick={() => setToast(name + " · Tính năng đang giới thiệu")}><span><Icon size={23} /></span><b>{name}</b>{[3, 4].includes(i) && <i>MỚI</i>}</button>)}</div><div className="mp-dots"><i /><i /></div></section><section className="mp-white"><div className="mp-section-title"><div><small>HOẠT ĐỘNG GẦN ĐÂY</small><h2>Giao dịch</h2></div><button onClick={() => goto("history")}>Xem thêm <ChevronRight size={15} /></button></div>{tx.slice(0, 3).map(t => <div className="mp-tx" key={t.id}><span>{t.amount > 0 ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}</span><div><b>{t.name}</b><small>{t.detail}</small></div><strong className={t.amount > 0 ? "plus" : ""}>{t.amount > 0 ? "+" : "−"}{fmt(Math.abs(t.amount))} đ</strong></div>)}</section></>}
{page === "transfer" && <section className="mp-white mp-form"><h2>Chuyển tiền mô phỏng</h2><p>Không có giao dịch tiền thật.</p>{step === 2 ? <div className="mp-success"><Check size={48} /><h2>Đã hoàn thành mô phỏng</h2><p>−{fmt(Number(amount))} đ</p><button className="mp-primary" onClick={() => {
              setStep(0);
              setRecipient("");
              setAccount("");
              setAmount("");
            }}>Tạo giao dịch khác</button></div> : step === 1 ? <><div className="mp-review"><p>Người nhận: <b>{recipient}</b></p><p>Tài khoản demo: <b>{account}</b></p><p>Số tiền: <b>{fmt(Number(amount))} đ</b></p></div><button className="mp-primary" onClick={confirm}>Xác nhận mô phỏng</button><button className="mp-secondary" onClick={() => setStep(0)}>Chỉnh sửa</button></> : <><label>Họ tên người nhận</label><input placeholder="Tên người nhận mẫu" value={recipient} onChange={e => setRecipient(e.target.value)} /><label>Số tài khoản demo</label><input inputMode="numeric" placeholder="0001234567" value={account} onChange={e => setAccount(e.target.value.replace(/\D/g, ""))} /><label>Số tiền (VNĐ)</label><input inputMode="numeric" placeholder="Tối thiểu 1.000 đ" value={amount} onChange={e => setAmount(e.target.value.replace(/\D/g, ""))} /><p>Số dư mô phỏng: {fmt(balance)} đ</p><button className="mp-primary" onClick={() => recipient.trim() && /^\d{6,20}$/.test(account) && Number.isSafeInteger(Number(amount)) && Number(amount) >= 1000 && Number(amount) <= balance ? setStep(1) : setToast("Kiểm tra tên, tài khoản demo 6–20 số và số tiền.")}>Kiểm tra giao dịch</button></>}</section>}
{page === "qr" && <section className="mp-white mp-qr"><h2>Nhận tiền bằng QR</h2><p>Mã hình minh họa, không có giá trị thanh toán.</p><div className="mp-qrcode"><QrCode size={150} strokeWidth={1.2} /><span>DEMO • KHÔNG QUÉT THANH TOÁN</span></div><h3>Nguyễn Nhựt Tường</h3><p>Tài khoản mô phỏng: 0788818374</p><div className="mp-warning"><ShieldCheck size={19} /> Đây không phải VietQR thật, không nhận tiền thật.</div></section>}
{page === "history" && <section className="mp-white"><h2>Lịch sử mô phỏng</h2><div className="mp-filters">{[["all", "Tất cả"], ["in", "Tiền vào"], ["out", "Tiền ra"]].map(([id, title]) => <button className={filter === id ? "on" : ""} key={id} onClick={() => setFilter(id)}>{title}</button>)}</div>{tx.filter(t => filter === "all" || (filter === "in" ? t.amount > 0 : t.amount < 0)).map(t => <div className="mp-tx" key={t.id}><span><ArrowLeftRight size={19} /></span><div><b>{t.name}</b><small>{t.detail}</small></div><strong className={t.amount > 0 ? "plus" : ""}>{t.amount > 0 ? "+" : "−"}{fmt(Math.abs(t.amount))} đ</strong></div>)}</section>}
{page === "profile" && <section className="mp-white mp-profile"><div className="mp-profile-cover" /><div className="mp-profile-avatar">NT</div><h2>Nguyễn Nhựt Tường</h2><p>NhTBank Sandbox</p><dl><div><dt>Số tài khoản mẫu</dt><dd>0788818374</dd></div><div><dt>Số dư mô phỏng</dt><dd>{fmt(balance)} đ</dd></div><div><dt>Dữ liệu</dt><dd>Trong bộ nhớ phiên</dd></div></dl><button className="mp-primary" onClick={reset}><LogOut size={19} /> Đăng xuất và đặt lại dữ liệu</button></section>}
<p className="mp-disclaimer"><ShieldCheck size={14} /> NhTBank Sandbox — không phải dịch vụ ngân hàng thật.</p></main></div><nav className="mp-bottom" aria-label="Điều hướng chính">{nav.map(([id, title, Icon]) => <button key={id} className={page === id ? "active" : ""} aria-current={page === id ? "page" : undefined} onClick={() => goto(id)}><span className={id === "qr" ? "center" : ""}><Icon size={id === "qr" ? 27 : 21} /></span><small>{title}</small></button>)}</nav>{toast && <div className="mp-toast" role="status">{toast}<button onClick={() => setToast("")}><X size={16} /></button></div>}</div>;
};