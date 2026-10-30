import {useEffect,useState} from "react";
import {Brand} from "./ui";
import {DisplaySwitcher} from "./ReferenceArt";
import {registerDemo,verifyDemo} from "../lib/demoAuth";
import "./auth-shell.css";
const SESSION_KEY="nhtbank-demo-remember-user";
export default function AuthGate({onLogin}){
 const [splash,setSplash]=useState(true),[mode,setMode]=useState("login");
 const [username,setUsername]=useState(()=>localStorage.getItem(SESSION_KEY)||"");
 const [password,setPassword]=useState(""),[confirm,setConfirm]=useState("");
 const [remember,setRemember]=useState(Boolean(localStorage.getItem(SESSION_KEY)));
 const [error,setError]=useState(""),[notice,setNotice]=useState(""),[busy,setBusy]=useState(false);
 useEffect(()=>{const id=setTimeout(()=>setSplash(false),500);return()=>clearTimeout(id)},[]);
 async function submit(e){
 e.preventDefault();setError("");setNotice("");setBusy(true);
 try{
  if(mode==="register"){if(password!==confirm)throw Error("Mật khẩu xác nhận chưa trùng khớp.");await registerDemo(username,password);setNotice("Đã tạo tài khoản mô phỏng trên thiết bị. Hãy đăng nhập.");setMode("login");setPassword("");setConfirm("");}
  else if(mode==="forgot"){setNotice("Không thể tự khôi phục mật khẩu trong bản demo offline. Không có email/OTP xác minh; hãy tạo tài khoản demo mới với tên khác.");}
  else {
   if(!(await verifyDemo(username,password)))throw Error("Tên đăng nhập hoặc mật khẩu không đúng.");
   if(remember)localStorage.setItem(SESSION_KEY,username.trim().toLowerCase());else localStorage.removeItem(SESSION_KEY);
   onLogin(username.trim().toLowerCase());
  }
 }catch(e){setError(e.message||"Có lỗi xảy ra.");}finally{setBusy(false);}
 }
 return <div className="auth-screen">
 {splash?<div className="auth-splash" role="status" aria-label="Đang mở NhTBank"><div className="auth-logo"><img src={`${import.meta.env.BASE_URL}branding/nt-logo.webp`} alt="Biểu tượng NhTBank NT" width="180" height="180"/><strong>NhTBank</strong></div></div>:
 <div className="auth-card">
  <div className="auth-heading"><Brand/><span>TRẢI NGHIỆM MÔ PHỎNG</span><h1>{mode==="register"?"Đăng ký tài khoản":mode==="forgot"?"Quên mật khẩu":"Đăng nhập NhTBank"}</h1><p>Bảo mật tài khoản thử nghiệm trên thiết bị. Không dùng thông tin ngân hàng thật.</p></div>
  <form onSubmit={submit} className="auth-fields">
   {mode!=="forgot"&&<><label htmlFor="auth-username">Tên đăng nhập</label><input id="auth-username" autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} required maxLength={24} placeholder="Nhập tên đăng nhập"/>
   <label htmlFor="auth-password">Mật khẩu</label><input id="auth-password" type="password" autoComplete={mode==="register"?"new-password":"current-password"} value={password} onChange={e=>setPassword(e.target.value)} required minLength={mode==="register"?10:1} placeholder="Nhập mật khẩu"/></>}
   {mode==="register"&&<><label htmlFor="auth-confirm">Nhập lại mật khẩu</label><input id="auth-confirm" type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} required minLength={10}/></>}
   {mode==="login"&&<label className="auth-check"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/> Ghi nhớ tên đăng nhập trên thiết bị này (không lưu mật khẩu)</label>}
   {error&&<p role="alert" className="auth-error">{error}</p>}{notice&&<p role="status" className="auth-notice">{notice}</p>}
   {mode!=="forgot"&&<button type="submit" disabled={busy} className="auth-primary">{busy?"Đang xử lý…":mode==="register"?"Tạo tài khoản demo":"Đăng nhập"}</button>}
  </form>
  <div className="auth-links">
   {mode==="login"?<><button onClick={()=>{setMode("forgot");setError("");setNotice("")}}>Quên mật khẩu?</button><button onClick={()=>{setMode("register");setError("");setNotice("")}}>Đăng ký tài khoản</button></>:<button onClick={()=>{setMode("login");setError("");setNotice("");setPassword("")}}>Quay lại đăng nhập</button>}
  </div>
  <DisplaySwitcher/><p className="auth-footer">NhTBank Sandbox · Không kết nối ngân hàng thật · Không chuyển tiền thật</p>
 </div>}
 </div>
}
