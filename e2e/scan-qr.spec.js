import { test, expect } from "@playwright/test";
import QRCode from "qrcode";

const tlv = (tag,value) => tag + String(value.length).padStart(2,"0") + value;
function crc(input) {
  let n = 0xffff;
  for (const char of input) {
    n ^= char.charCodeAt(0) << 8;
    for(let i=0;i<8;i++) n = (n&0x8000)?((n<<1)^0x1021)&0xffff:(n<<1)&0xffff;
  }
  return n.toString(16).toUpperCase().padStart(4,"0");
}
function createFixture() {
  const bankFields = tlv("00","970422") + tlv("01","0788818374");
  const napas = tlv("00","A000000727") + tlv("01",bankFields) + tlv("02","QRIBFTTA");
  const raw = tlv("00","01") + tlv("01","12") + tlv("38",napas)
    + tlv("53","704") + tlv("54","500000") + tlv("58","VN") + tlv("62",tlv("08","NAP TIEN"));
  return raw + "6304" + crc(raw+"6304");
}

test("middle QR navigation opens camera screen, decodes local upload and offers safe bank handoff", async ({ page }) => {
  const outside = [];
  page.on("request", (request) => {
    if (!request.url().startsWith(new URL(page.url()).origin)) outside.push(request.url());
  });
  await page.goto("./");
  for (const number of "123456") await page.getByRole("button",{name:`Số ${number}`,exact:true}).click();
  await expect(page.getByRole("heading",{name:/Xin chào/})).toBeVisible();
  const qrNav = page.getByRole("button",{name:"Quét QR",exact:true});
  await expect(qrNav).toBeVisible();
  await qrNav.click();
  await expect(page.getByRole("heading",{name:"Quét mã QR"})).toBeVisible();
  await expect(page.getByLabel("Camera quét QR")).toBeVisible();
  const bytes = await QRCode.toBuffer(createFixture(), {errorCorrectionLevel:"M",type:"png",width:520,margin:4});
  await page.getByLabel("Chọn ảnh QR từ thiết bị").setInputFiles({
    name:"napas-vietqr.png",mimeType:"image/png",buffer:bytes,
  });
  await expect(page.getByText("0788818374", {exact:true})).toBeVisible();
  await expect(page.getByText("500.000 VNĐ", {exact:true})).toBeVisible();
  await expect(page.getByText("NAP TIEN", {exact:true})).toBeVisible();
  const bank = page.getByLabel("Chọn ngân hàng dùng để chuyển tiền");
  await bank.selectOption("tcb");
  await expect(page.getByRole("link",{name:/Mở ngân hàng/})).toHaveAttribute("href", /^https:\/\/techcombank\.com\//);
  await expect(page.getByText(/không xác minh người thụ hưởng/i)).toBeVisible();
  expect(outside).toEqual([]);
  await page.getByRole("button",{name:"Quét lại"}).click();
  await expect(page.getByText("Chờ mã VietQR")).toBeVisible();
  await page.getByRole("button",{name:"Tạo QR nhận tiền"}).click();
  await expect(page.getByRole("heading",{name:"NhTBank QR Studio"})).toBeVisible();
});
