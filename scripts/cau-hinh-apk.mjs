import { cpSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { thongTinPhienBan } from "./thong-tin-phien-ban.mjs";
const android = resolve(process.argv[2] || "android");
const info = thongTinPhienBan();
const gradlePath = join(android, "app/build.gradle");
let gradle = readFileSync(gradlePath, "utf8");
for (const [pattern, replacement] of [
  [/\bversionCode\s+\d+/g, `versionCode ${info.versionCode}`],
  [/\bversionName\s+"[^"]+"/g, `versionName "${info.version}"`],
]) {
  if ([...gradle.matchAll(pattern)].length !== 1)
    throw new Error("Khong xac dinh duoc truong phien ban Gradle duy nhat.");
  gradle = gradle.replace(pattern, replacement);
}
cpSync(
  new URL("../tai-nguyen/android/res/", import.meta.url),
  join(android, "app/src/main/res"),
  { recursive: true },
);
writeFileSync(gradlePath, gradle);
writeFileSync(
  join(android, "thong-tin-phien-ban.json"),
  JSON.stringify(info, null, 2) + "\n",
);
console.log(
  `NhTBank ${info.version} (${info.versionCode}): da gan logo Android.`,
);
