import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

test("Gan logo va dong bo phien ban Android tu package va so lan build", () => {
  const dir = mkdtempSync(join(tmpdir(), "nht-apk-"));
  try {
    mkdirSync(join(dir, "app"), { recursive: true });
    writeFileSync(
      join(dir, "app/build.gradle"),
      'android { defaultConfig { versionCode 1\nversionName "1.0"\n} }',
    );
    const result = spawnSync(
      process.execPath,
      ["scripts/cau-hinh-apk.mjs", dir],
      { env: { ...process.env, NHT_BUILD_NUMBER: "42" }, encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr);
    const gradle = readFileSync(join(dir, "app/build.gradle"), "utf8");
    assert.match(gradle, /versionCode 1042/);
    assert.match(gradle, /versionName "1\.0\.1"/);
    assert.ok(
      existsSync(join(dir, "app/src/main/res/mipmap-xxxhdpi/ic_launcher.png")),
    );
    const adaptive = readFileSync(
      join(dir, "app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml"),
      "utf8",
    );
    assert.match(adaptive, /@mipmap\/ic_launcher_foreground/);
    assert.match(adaptive, /@color\/nen_bieu_tuong/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
