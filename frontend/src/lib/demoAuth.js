const KEY="nhtbank-demo-users-v1";
export function loadUsers(){try{const data=JSON.parse(localStorage.getItem(KEY)||"{}");return data&&typeof data==="object"?data:{}}catch{return {}}}
function bytesToHex(a){return Array.from(a,x=>x.toString(16).padStart(2,"0")).join("")}
async function hash(password,salt){const input=new TextEncoder().encode(salt+":"+password);const digest=await crypto.subtle.digest("SHA-256",input);return bytesToHex(new Uint8Array(digest))}
export async function registerDemo(username,password){
  const name=username.trim().toLowerCase();
  if(!/^[a-z0-9_.]{3,24}$/.test(name))throw Error("Tên đăng nhập cần 3–24 ký tự: a-z, 0-9, dấu chấm hoặc gạch dưới.");
  if(password.length<10||password.length>128)throw Error("Mật khẩu phải có từ 10 đến 128 ký tự.");
  const users=loadUsers();if(users[name])throw Error("Tên đăng nhập đã tồn tại trên thiết bị này.");
  const salt=bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
  users[name]={salt,digest:await hash(password,salt)};
  localStorage.setItem(KEY,JSON.stringify(users));return name;
}
export async function verifyDemo(username,password){
  const name=username.trim().toLowerCase();const user=loadUsers()[name];
  if(!user)return false;return (await hash(password,user.salt))===user.digest;
}
export async function changeDemoPassword(username,oldPassword,newPassword){
  if(!await verifyDemo(username,oldPassword))throw Error("Mật khẩu hiện tại chưa đúng.");
  if(newPassword.length<10||newPassword.length>128)throw Error("Mật khẩu mới cần 10–128 ký tự.");
  const users=loadUsers(),name=username.toLowerCase();
  const salt=bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
  users[name]={salt,digest:await hash(newPassword,salt)};
  localStorage.setItem(KEY,JSON.stringify(users));
}
