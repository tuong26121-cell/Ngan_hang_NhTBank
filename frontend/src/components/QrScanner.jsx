import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { ArrowLeft, Camera, CameraOff, Copy, ImageUp, QrCode, ShieldAlert } from "lucide-react";
import { Button } from "./ui";
import { money } from "../lib/bank";
import { parseVietQr } from "../lib/scanVietQr";
import BankHandoff from "./BankHandoff";
import "./scanner.css";

function scanPixels(source, width, height) {
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 420 / Math.max(width, height));
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Trình duyệt không hỗ trợ xử lý ảnh QR.");
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  return jsQR(pixels.data, pixels.width, pixels.height, { inversionAttempts: "attemptBoth" })?.data;
}

export default function QrScanner({ navigate }) {
  const video = useRef(null);
  const stream = useRef(null);
  const stopTimer = useRef(null);
  const found = useRef(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [cameraState, setCameraState] = useState("starting");
  const [manual, setManual] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [copied, setCopied] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  function accept(raw) {
    try {
      const parsed = parseVietQr(raw);
      found.current = true;
      stream.current?.getTracks().forEach((track) => track.stop());
      stream.current = null;
      setCameraState("stopped");
      setResult(parsed);
      setError("");
      setCopied(false);
    } catch (cause) {
      setError(cause.message);
    }
  }

  // Camera requests occur only on entry to this page after login.
  // Unmount, navigation, and successful scan always stop all media tracks.
  useEffect(() => {
    let active = true;
    found.current = false;
    async function start() {
      setCameraState("starting");
      if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
        setCameraState("unavailable");
        setError("Camera cần HTTPS và trình duyệt có hỗ trợ. Hãy chọn ảnh QR hoặc dán dữ liệu mã.");
        return;
      }
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" } },
        });
        if (!active) {
          media.getTracks().forEach((track) => track.stop());
          return;
        }
        stream.current = media;
        if (video.current) {
          video.current.srcObject = media;
          await video.current.play();
        }
        if (!active) {
          media.getTracks().forEach((track) => track.stop());
          return;
        }
        setCameraState("ready");
        setError("");
        stopTimer.current = window.setInterval(() => {
          const element = video.current;
          if (found.current || !element || element.readyState < 2) return;
          try {
            const raw = scanPixels(element, element.videoWidth, element.videoHeight);
            if (raw) {
              try {
                const qr = parseVietQr(raw);
                found.current = true;
                media.getTracks().forEach((track) => track.stop());
                setCameraState("stopped");
                setResult(qr);
                setError("");
              } catch {
                // Ignore unrelated QR codes; keep looking for a valid VietQR.
              }
            }
          } catch {
            // A single unready frame must not shut down the scanner.
          }
        }, 280);
      } catch {
        if (active) {
          setCameraState("unavailable");
          setError("Không thể mở camera. Kiểm tra quyền camera hoặc tải ảnh QR từ thư viện.");
        }
      }
    }
    start();
    return () => {
      active = false;
      window.clearInterval(stopTimer.current);
      stream.current?.getTracks().forEach((track) => track.stop());
      stream.current = null;
    };
  }, [restartKey]);

  async function fromFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) {
      setError("Chỉ chọn ảnh tối đa 8 MB.");
      return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      const raw = scanPixels(bitmap, bitmap.width, bitmap.height);
      bitmap.close?.();
      if (!raw) {
        setError("Không nhận diện được QR trong ảnh. Thử ảnh rõ hơn.");
        return;
      }
      accept(raw);
    } catch {
      setError("Không thể đọc ảnh QR này. Hãy thử ảnh PNG hoặc JPG.");
    }
  }

  async function copyInformation() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText([
        `Ngân hàng BIN: ${result.bankBin}`,
        `Số tài khoản: ${result.account}`,
        result.amount && `Số tiền: ${result.amount} VNĐ`,
        result.note && `Nội dung: ${result.note}`,
      ].filter(Boolean).join("\n"));
      setCopied(true);
    } catch {
      setError("Chưa sao chép được. Bạn có thể chọn và chép các thông tin hiển thị.");
    }
  }

  return (
    <div className="scan-page">
      <div className="scan-title-row">
        <Button className="text-button" onClick={() => navigate("dashboard")}>
          <ArrowLeft size={17} /> Trang chủ
        </Button>
        <span className="scan-chip">QUÉT TRÊN THIẾT BỊ · KHÔNG TẢI LÊN</span>
      </div>
      <div className="scan-hero">
        <Camera size={32} />
        <h1>Quét mã QR</h1>
        <p>Đưa camera vào mã VietQR hoặc chọn ảnh từ máy.</p>
      </div>
      <div className="scan-layout">
        <section className="scan-camera-card" aria-label="Camera quét QR">
          <div className="scan-viewport">
            {cameraState === "ready" || cameraState === "starting" ? (
              <video ref={video} playsInline muted autoPlay aria-label="Hình ảnh camera" />
            ) : null}
            {cameraState === "unavailable" && <div className="scan-no-camera"><CameraOff size={46}/><span>Không truy cập được camera</span></div>}
            {cameraState === "stopped" && <div className="scan-no-camera"><QrCode size={46}/><span>Đã nhận diện mã QR</span></div>}
            {cameraState === "starting" && <span className="scan-loading">Đang xin quyền truy cập camera…</span>}
            <div className="scan-corners" aria-hidden="true"><i/><i/><i/><i/></div>
          </div>
          <div className="scan-camera-actions">
            <label className="scan-upload button secondary">
              <ImageUp size={18} /> Chọn ảnh QR
              <input aria-label="Chọn ảnh QR từ thiết bị" type="file" accept="image/*" onChange={fromFile}/>
            </label>
            <Button className="secondary" onClick={() => { setResult(null); setError(""); setRestartKey((n) => n + 1); }}>
              <Camera size={17} /> Quét lại
            </Button>
          </div>
          <p>Camera chỉ hoạt động trên HTTPS và khi bạn cho phép. Ảnh được đọc tại thiết bị, không gửi tới máy chủ NhTBank.</p>
        </section>
        <section className="scan-detail panel" aria-live="polite">
          {result ? (
            <>
              <span className="eyebrow">ĐÃ ĐỌC ĐỊNH DẠNG VIETQR</span>
              <h2>Kiểm tra trước khi chuyển tiền</h2>
              <div className="scan-detail-fields">
                <div><span>Ngân hàng nhận · BIN</span><strong>{result.bankBin}</strong></div>
                <div><span>Số tài khoản thụ hưởng</span><strong>{result.account}</strong></div>
                <div><span>Số tiền</span><strong>{result.amount ? money(Number(result.amount)) + " VNĐ" : "Không ghi sẵn"}</strong></div>
                <div><span>Nội dung</span><strong>{result.note || "Không ghi sẵn"}</strong></div>
              </div>
              <div className="scan-warning"><ShieldAlert size={19}/><p>Nhận diện định dạng và CRC không xác minh người thụ hưởng. Kiểm tra lại tên tài khoản do ứng dụng ngân hàng thật hiển thị.</p></div>
              <Button className="secondary" onClick={copyInformation}><Copy size={16}/>{copied ? "Đã sao chép thông tin" : "Sao chép thông tin"}</Button>
              <BankHandoff title="Sang ngân hàng để thanh toán"/>
            </>
          ) : (
            <div className="scan-empty-result">
              <QrCode size={57} strokeWidth={1.3}/>
              <h2>Chờ mã VietQR</h2>
              <p>Khi quét thành công, thông tin ngân hàng, tài khoản nhận và số tiền sẽ xuất hiện tại đây. Không có giao dịch tự động.</p>
              <Button className="secondary" onClick={() => navigate("deposit")}>Tạo QR nhận tiền</Button>
            </div>
          )}
          <Button className="text-button scan-manual-toggle" onClick={() => setShowManual(!showManual)} aria-expanded={showManual}>
            {showManual ? "Ẩn nhập mã thủ công" : "Dán nội dung QR thủ công"}
          </Button>
          {showManual && (
            <form className="scan-manual" onSubmit={(e) => { e.preventDefault(); accept(manual.trim()); }}>
              <label htmlFor="scan-manual-value">Nội dung VietQR đã sao chép</label>
              <textarea id="scan-manual-value" value={manual} onChange={(e) => setManual(e.target.value)} rows={3} maxLength={1024}/>
              <Button type="submit" className="secondary">Phân tích mã đã dán</Button>
            </form>
          )}
          {error && <p role="alert" className="form-error scan-error">{error}</p>}
        </section>
      </div>
    </div>
  );
}
