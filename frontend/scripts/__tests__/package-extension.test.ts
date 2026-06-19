import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import AdmZip from "adm-zip";

const FRONTEND_DIR = resolve(__dirname, "..", "..");
const PACK_SCRIPT = resolve(FRONTEND_DIR, "scripts", "package-extension.mjs");
const OUTPUT_ZIP = resolve(FRONTEND_DIR, "public", "orcamento-plugin.zip");
const EXT_TEST = resolve(FRONTEND_DIR, "extension", "extractLeadId.test.js");

describe("package-extension", () => {
  it("gera o pacote com manifesto, script e README, sem testes nem package.json", () => {
    execFileSync("node", [PACK_SCRIPT], { stdio: "pipe" });
    expect(existsSync(OUTPUT_ZIP)).toBe(true);

    const names = new AdmZip(OUTPUT_ZIP).getEntries().map((e) => e.entryName);
    // Conteúdo essencial da extensão + guia de instalação (Req 3.1, 5.1).
    expect(names).toContain("manifest.json");
    expect(names).toContain("script.js");
    expect(names).toContain("README.md");
    // Arquivos de desenvolvimento NÃO entram no pacote distribuído.
    expect(names.some((n) => n.endsWith(".test.js"))).toBe(false);
    expect(names).not.toContain("package.json");
  });
});

describe("extractLeadId (extensão pós-move)", () => {
  it("o teste node da função pura passa a partir de frontend/extension", () => {
    // Sai com código 0 quando todos os asserts passam (Req 6.1).
    expect(() => execFileSync("node", [EXT_TEST], { stdio: "pipe" })).not.toThrow();
  });
});
