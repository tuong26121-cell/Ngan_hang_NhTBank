import { useEffect, useState } from "react";
import { Brand } from "./ui";
import { DisplaySwitcher } from "./ReferenceArt";
import { registerDemo, verifyDemo, recoverDemo, isDemoStoragePersistent } from "../lib/demoAuth";
import "./auth-shell.css";

const REMEMBER_KEY = "nhtbank-demo-remember-user";
const STORAGE_WARNING = "Trình duyệt đang chặn hoặc không đủ dung lượng lưu trữ. Tài khoản demo chỉ tồn tại trong tab hiện tại; hãy lưu mã khôi phục riêng và không tải lại trang.";

function readRememberedUsername() {
  try {
    return localStorage.getItem(REMEMBER_KEY) || "";
  } catch {
    return "";
  }
}

function writeRememberedUsername(username) {
  try {
    if (username) localStorage.setItem(REMEMBER_KEY, username);
    else localStorage.removeItem(REMEMBER_KEY);
    return true;
  } catch {
    return false;
  }
}

export default function AuthGate({ onLogin }) {
  const [splash, setSplash] = useState(true);
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState(readRememberedUsername);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [recoveryInput, setRecoveryInput] = useState("");
  const [recoveryOutput, setRecoveryOutput] = useState("");
  const [remember, setRemember] = useState(Boolean(readRememberedUsername()));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setSplash(false), 500);
    return () => clearTimeout(id);
  }, []);

  function setFormMode(next) {
    setMode(next);
    setError("");
    setNotice("");
    setPassword("");
    setConfirm("");
    setRecoveryInput("");
    if (next !== "login") setRecoveryOutput("");
  }

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (mode === "register") {
        if (password !== confirm) throw new Error("Mật khẩu xác nhận chưa trùng khớp.");
        const registered = await registerDemo(username, password);
        setRecoveryOutput(registered.recoveryCode);
        setNotice(
          isDemoStoragePersistent()
            ? "Đã đăng ký tài khoản demo. Lưu mã khôi phục trước khi đăng nhập."
            : `Đã tạo tài khoản demo tạm thời. ${STORAGE_WARNING}`,
        );
        setMode("login");
        setPassword("");
        setConfirm("");
      } else if (mode === "forgot") {
        if (password !== confirm) throw new Error("Mật khẩu xác nhận chưa trùng khớp.");
        const recovered = await recoverDemo(username, recoveryInput, password);
        setRecoveryOutput(recovered.recoveryCode);
        setNotice(
          isDemoStoragePersistent()
            ? "Đã đặt lại mật khẩu demo. Hãy lưu mã khôi phục mới rồi đăng nhập."
            : `Đã đặt lại mật khẩu trong phiên tạm thời. ${STORAGE_WARNING}`,
        );
        setMode("login");
        setPassword("");
        setConfirm("");
        setRecoveryInput("");
      } else {
        if (!(await verifyDemo(username, password))) {
          throw new Error("Tên đăng nhập hoặc mật khẩu không đúng.");
        }
        writeRememberedUsername(remember ? username.trim().toLowerCase() : "");
        setPassword("");
        onLogin(username.trim().toLowerCase());
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Có lỗi xảy ra.");
    } finally {
      setBusy(false);
    }
  }

  if (splash) {
    return (
      <div className="auth-screen">
        <div className="auth-splash" role="status" aria-label="Đang mở NhTBank">
          <div className="auth-logo">
            <img src={import.meta.env.BASE_URL + "branding/nt-logo.webp"} alt="Logo NhTBank NT" width="180" height="180" />
            <strong>NhTBank</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <header className="auth-heading">
          <Brand />
          <span>TRẢI NGHIỆM MÔ PHỎNG</span>
          <h1>{mode === "register" ? "Đăng ký tài khoản" : mode === "forgot" ? "Khôi phục mật khẩu" : "Đăng nhập NhTBank"}</h1>
          <p>Tài khoản thử nghiệm lưu tại thiết bị. Không nhập mật khẩu ngân hàng thật.</p>
        </header>
        <form onSubmit={submit} className="auth-fields">
          <label htmlFor="auth-username">Tên đăng nhập</label>
          <input id="auth-username" autoComplete="username" value={username}
            onChange={(event) => setUsername(event.target.value)} required maxLength={24}
            placeholder="3–24 ký tự: a-z, 0-9, . hoặc _" />
          {mode === "forgot" && (
            <>
              <label htmlFor="auth-recovery">Mã khôi phục đã lưu khi đăng ký</label>
              <input id="auth-recovery" value={recoveryInput} autoComplete="off"
                onChange={(event) => setRecoveryInput(event.target.value)} required
                placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX" />
            </>
          )}
          <label htmlFor="auth-password">{mode === "login" ? "Mật khẩu" : "Mật khẩu mới"}</label>
          <input id="auth-password" type="password" value={password} required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            onChange={(event) => setPassword(event.target.value)}
            minLength={mode === "login" ? 1 : 10} maxLength={128}
            placeholder={mode === "login" ? "Nhập mật khẩu" : "Từ 10 ký tự trở lên"} />
          {mode !== "login" && (
            <>
              <label htmlFor="auth-confirm">Nhập lại mật khẩu</label>
              <input id="auth-confirm" type="password" autoComplete="new-password"
                value={confirm} onChange={(event) => setConfirm(event.target.value)}
                required minLength={10} maxLength={128} />
            </>
          )}
          {mode === "login" && (
            <label className="auth-check">
              <input type="checkbox" checked={remember}
                onChange={(event) => setRemember(event.target.checked)} />
              Ghi nhớ tên đăng nhập (không lưu mật khẩu)
            </label>
          )}
          {error && <p role="alert" className="auth-error">{error}</p>}
          {notice && <p role="status" className="auth-notice">{notice}</p>}
          {recoveryOutput && mode === "login" && (
            <div className="auth-recovery-output">
              <strong>Mã khôi phục của ông — chỉ hiển thị lần này</strong>
              <code>{recoveryOutput}</code>
              <small>Hãy lưu riêng ở nơi an toàn. Không chia sẻ với người khác.</small>
              <button type="button" onClick={() => setRecoveryOutput("")}>Tôi đã lưu mã</button>
            </div>
          )}
          <button type="submit" disabled={busy} className="auth-primary">
            {busy ? "Đang xử lý…" : mode === "register" ? "Tạo tài khoản demo" : mode === "forgot" ? "Đặt lại mật khẩu" : "Đăng nhập"}
          </button>
        </form>
        <div className="auth-links">
          {mode === "login" ? (
            <>
              <button type="button" onClick={() => setFormMode("forgot")}>Quên mật khẩu?</button>
              <button type="button" onClick={() => setFormMode("register")}>Đăng ký tài khoản</button>
            </>
          ) : <button type="button" onClick={() => setFormMode("login")}>Quay lại đăng nhập</button>}
        </div>
        <DisplaySwitcher />
        <p className="auth-footer">NhTBank Sandbox · Không kết nối ngân hàng thật · Không chuyển tiền thật</p>
      </div>
    </div>
  );
}
