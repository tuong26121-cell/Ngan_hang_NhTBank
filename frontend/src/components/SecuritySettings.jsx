import {useState} from "react";
import {changeDemoPassword} from "../lib/demoAuth";
export default function SecuritySettings({username}){
 const [oldPass,setOld]=useState(""),[next,setNext]=useState(""),[confirm,setConfirm]=useState(""),[message,setMessage]=useState(""),[error,setError]=useState("");
 async function submit(e){e.preventDefault();setMessage("");setError("");try{if(next!==confirm)throw Error("Xác nhận mật khẩu mới không khớp.");await changeDemoPassword(username,oldPass,next);setOld("");setNext("");setConfirm("");setMessage("Đã đổi mật khẩu tài khoản demo trên thiết bị.");}catch(e){setError(e.message)}}
 return <section className="panel" aria-label="Cài đặt bảo mật" style={{marginTop:20,padding:20}}>
 <h3>Cài đặt bảo mật</h3><p className="muted">Đổi mật khẩu tài khoản mô phỏng: {username}. Không liên quan tài khoản ngân hàng thật.</p>
 <form onSubmit={submit} style={{display:"grid",gap:12,maxWidth:420,marginTop:16}}>
 <label>Mật khẩu hiện tại<input aria-label="Mật khẩu hiện tại" type="password" autoComplete="current-password" required value={oldPass} onChange={e=>setOld(e.target.value)}/></label>
 <label>Mật khẩu mới<input aria-label="Mật khẩu mới" type="password" autoComplete="new-password" minLength={10} required value={next} onChange={e=>setNext(e.target.value)}/></label>
 <label>Xác nhận mật khẩu mới<input aria-label="Xác nhận mật khẩu mới" type="password" autoComplete="new-password" minLength={10} required value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>
 {error&&<p role="alert" style={{color:"#b42332"}}>{error}</p>}{message&&<p role="status">{message}</p>}
 <button type="submit" className="button primary">Đổi mật khẩu</button></form>
 <p className="muted" style={{marginTop:12,fontSize:11}}>Mật khẩu chỉ dùng cho bản demo offline. Dữ liệu demo lưu cục bộ không phải hệ thống xác thực ngân hàng đạt chuẩn production.</p>
 </section>;
}
