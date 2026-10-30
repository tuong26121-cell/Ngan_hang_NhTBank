import { ExternalLink, ShieldCheck } from "lucide-react";
import { useState } from "react";

// Verified public landing pages, NOT private payment deep links. The sending
// bank can differ from the recipient bank in a scanned/created QR.
export const BANK_ENTRY_POINTS = [
  { id: "mb", name: "MB Bank", url: "https://www.mbbank.com.vn/ca-nhan/khach-hang-ca-nhan/thanh-toan/thanh-toan-trong-nuoc?tab=app-mbbank" },
  { id: "vcb", name: "Vietcombank", url: "https://www.vietcombank.com.vn/vi-VN/KHCN/Truy-cap-nhanh/Tin-noi-bat/Articles/vietcombank-ra-mat-dich-vu-chuyen-tien-nhanh-247-bang-ma-qr" },
  { id: "tcb", name: "Techcombank", url: "https://techcombank.com/khach-hang-ca-nhan/ngan-hang-truc-tuyen/ngan-hang-so/techcombank-mobile" },
  { id: "klb", name: "KienlongBank", url: "https://kienlongbank.com/app-kienlongbank-plus" },
  { id: "vba", name: "Agribank", url: "https://agribankplus.vn/" },
];

export default function BankHandoff({ title = "Tiếp tục ở ứng dụng ngân hàng" }) {
  const [bankId, setBankId] = useState("mb");
  const bank = BANK_ENTRY_POINTS.find((item) => item.id === bankId);
  return (
    <section className="bank-handoff" aria-label="Điều hướng sang ngân hàng">
      <div className="bank-handoff-head"><ShieldCheck size={18} /><strong>{title}</strong></div>
      <label htmlFor="bank-handoff-select">Chọn ngân hàng dùng để chuyển tiền</label>
      <div className="bank-handoff-controls">
        <select id="bank-handoff-select" value={bankId} onChange={(event) => setBankId(event.target.value)}>
          {BANK_ENTRY_POINTS.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
        </select>
        <a className="button primary bank-handoff-button" href={bank.url}
           target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">
          Mở ngân hàng <ExternalLink size={16} />
        </a>
      </div>
      <p>Chuyển tới <strong>trang chính thức</strong> của ngân hàng đã chọn, không tự mở màn chuyển tiền. Trên điện thoại, mở ứng dụng ngân hàng đã cài, vào Quét QR hoặc Chuyển tiền; có thể lưu ảnh QR trước. Xác nhận tên người nhận, số tiền và giao dịch ở ngân hàng. NhTBank không chuyển tiền thay bạn.</p>
    </section>
  );
}
