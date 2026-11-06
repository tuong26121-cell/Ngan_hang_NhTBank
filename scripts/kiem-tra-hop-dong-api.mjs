import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import SwaggerParser from "@apidevtools/swagger-parser";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { canonicalizeTransferRequest } from "../backend/lib/hop-dong-chuyen-tien.mjs";
const base = new URL("../docs/dieu-phoi/dot-2a/", import.meta.url);

function schemaForAjv(value) {
  if (Array.isArray(value)) return value.map(schemaForAjv);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => {
        if (key === "$ref") {
          if (
            typeof item !== "string" ||
            !item.startsWith("#/components/schemas/")
          )
            throw new Error("Chỉ cho phép schema reference cục bộ");
          return [key, item.replace("#/components/schemas/", "#/$defs/")];
        }
        return [key, schemaForAjv(item)];
      }),
    );
  }
  return value;
}
function assertLocalRefs(value) {
  if (!value || typeof value !== "object") return;
  for (const [key, item] of Object.entries(value)) {
    if (key === "$ref" && (typeof item !== "string" || !item.startsWith("#/")))
      throw new Error(
        "Chỉ cho phép reference cục bộ; không tải URL/file ngoài",
      );
    assertLocalRefs(item);
  }
}
export async function kiemTraHopDong(options = {}) {
  const document =
    options.document ??
    JSON.parse(await readFile(new URL("hop-dong-api-v1.json", base), "utf8"));
  const fixtureSet =
    options.fixtureSet ??
    JSON.parse(
      await readFile(new URL("mau-kiem-tra-api-v1.json", base), "utf8"),
    );
  assertLocalRefs(document);
  await SwaggerParser.validate(structuredClone(document), {
    resolve: { external: false },
  });
  if (fixtureSet.contract_version !== document.info.version)
    throw new Error("Fixture khác phiên bản hợp đồng");
  if (!fixtureSet.fixtures?.length)
    throw new Error("Không có fixture kiểm chứng");
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const money = (min) => (s) =>
    typeof s === "string" &&
    s.length <= 16 &&
    /^(0|[1-9][0-9]*)$/.test(s) &&
    BigInt(s) >= min &&
    BigInt(s) <= 9007199254740991n;
  ajv.addFormat("demo-vnd-amount", { type: "string", validate: money(1000n) });
  ajv.addFormat("demo-vnd-balance", { type: "string", validate: money(0n) });
  const schemas = schemaForAjv(document.components.schemas);
  const validators = new Map();
  for (const name of Object.keys(schemas))
    validators.set(
      name,
      ajv.compile({ $defs: schemas, $ref: `#/$defs/${name}` }),
    );
  const results = fixtureSet.fixtures.map((fixture) => {
    const validate = validators.get(fixture.schema);
    if (!validate || typeof fixture.valid !== "boolean")
      throw new Error(`Fixture không hợp lệ: ${fixture.name}`);
    let valid = validate(fixture.value);
    if (valid && fixture.semantic) {
      if (fixture.schema !== "TransferRequest")
        throw new Error("Không có semantic validator cho schema này");
      try {
        canonicalizeTransferRequest(fixture.value);
      } catch {
        valid = false;
      }
    }
    return {
      name: fixture.name,
      expected: fixture.valid,
      actual: valid,
      passed: valid === fixture.valid,
    };
  });
  return {
    passed: results.filter((x) => x.passed).length,
    failed: results.filter((x) => !x.passed).length,
    results,
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const result = await kiemTraHopDong();
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.failed ? 1 : 0;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
