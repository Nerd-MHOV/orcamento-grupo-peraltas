// Empacota o fonte da extensão "Orçamento Peraltas" em um .zip servido pelo app.
//
// Gera `frontend/public/orcamento-plugin.zip` a partir de `frontend/extension/`,
// incluindo o README de instalação e EXCLUINDO arquivos de desenvolvimento
// (testes e o package.json marcador de CommonJS).
//
// Roda no `yarn build` (local e no Dockerfile) usando uma lib Node multiplataforma
// (`adm-zip`), pois o estágio de build `node:20-alpine` não traz o binário `zip`.
// Falha com código != 0 se o fonte estiver ausente ou o pacote não puder ser escrito,
// quebrando o build de forma visível (Req 3.4) em vez de publicar um pacote velho/ausente.

import AdmZip from "adm-zip";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = resolve(__dirname, "..");
const SOURCE_DIR = resolve(FRONTEND_DIR, "extension");
const OUTPUT_DIR = resolve(FRONTEND_DIR, "public");
const OUTPUT_ZIP = resolve(OUTPUT_DIR, "orcamento-plugin.zip");

// Arquivos do fonte que NÃO entram no pacote distribuído.
const EXCLUDE = (name) => name.endsWith(".test.js") || name === "package.json";

function fail(message) {
  console.error(`[package-extension] ERRO: ${message}`);
  process.exit(1);
}

if (!existsSync(SOURCE_DIR) || !statSync(SOURCE_DIR).isDirectory()) {
  fail(`fonte da extensão não encontrado em ${SOURCE_DIR}`);
}

const entries = readdirSync(SOURCE_DIR).filter(
  (name) => statSync(resolve(SOURCE_DIR, name)).isFile() && !EXCLUDE(name)
);

if (!entries.some((name) => name === "manifest.json")) {
  fail("manifest.json ausente no fonte da extensão");
}

try {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  const zip = new AdmZip();
  for (const name of entries) {
    zip.addLocalFile(resolve(SOURCE_DIR, name));
  }
  zip.writeZip(OUTPUT_ZIP);

  console.log(
    `[package-extension] ${OUTPUT_ZIP} gerado com ${entries.length} arquivos: ${entries.join(", ")}`
  );
} catch (err) {
  fail(`falha ao gerar o pacote: ${err?.message ?? err}`);
}
