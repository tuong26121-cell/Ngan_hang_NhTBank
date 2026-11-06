import test from "node:test";
import assert from "node:assert/strict";

test("hợp đồng OpenAPI và bộ fixture có thể được kiểm chứng cục bộ", async () => {
  let module;
  await assert.doesNotReject(async () => {
    module = await import("../kiem-tra-hop-dong-api.mjs");
  }, "thiếu bộ kiểm chứng hợp đồng API");
  const result = await module.kiemTraHopDong();
  assert.equal(result.failed, 0);
  assert.ok(result.passed > 0);
});

import { readFile } from "node:fs/promises";
import { kiemTraHopDong } from "../kiem-tra-hop-dong-api.mjs";
const base = new URL("../../docs/dieu-phoi/dot-2a/", import.meta.url);
const document = JSON.parse(
  await readFile(new URL("hop-dong-api-v1.json", base), "utf8"),
);
const fixtureSet = JSON.parse(
  await readFile(new URL("mau-kiem-tra-api-v1.json", base), "utf8"),
);
test("reference bị gãy phải khiến hợp đồng không đạt", async () => {
  const changed = structuredClone(document);
  changed.components.schemas.TransferResponse.properties.data.$ref =
    "#/components/schemas/DoesNotExist";
  await assert.rejects(() => kiemTraHopDong({ document: changed, fixtureSet }));
});
test("cấm resolve URL/file bên ngoài trong validator offline", async () => {
  const changed = structuredClone(document);
  changed.components.schemas.TransferResponse.properties.data.$ref =
    "https://example.invalid/schema.json";
  await assert.rejects(
    () => kiemTraHopDong({ document: changed, fixtureSet }),
    /reference cục bộ/,
  );
});
test("fixture bị đảo kỳ vọng được phát hiện", async () => {
  const changed = structuredClone(fixtureSet);
  changed.fixtures[0].value.amount = "9007199254740992";
  const result = await kiemTraHopDong({ document, fixtureSet: changed });
  assert.ok(result.failed > 0);
});
test("thiếu fixture hoặc phiên bản lệch không được nhận đạt", async () => {
  await assert.rejects(
    () =>
      kiemTraHopDong({ document, fixtureSet: { ...fixtureSet, fixtures: [] } }),
    /fixture/,
  );
  await assert.rejects(
    () =>
      kiemTraHopDong({
        document,
        fixtureSet: { ...fixtureSet, contract_version: "wrong" },
      }),
    /phiên bản/,
  );
});
