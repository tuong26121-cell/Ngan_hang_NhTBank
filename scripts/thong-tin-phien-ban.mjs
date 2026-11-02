import { readFileSync } from "node:fs";
export function thongTinPhienBan() {
  const { version } = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  );
  const raw = process.env.NHT_BUILD_NUMBER;
  if (
    raw !== undefined &&
    (!/^\d+$/.test(raw) || Number(raw) < 1 || Number(raw) > 2100000000 - 1000)
  ) {
    throw new Error("NHT_BUILD_NUMBER phai la so nguyen duong hop le.");
  }
  return {
    version,
    versionCode: 1000 + Number(raw || 0),
    local: raw === undefined,
  };
}
