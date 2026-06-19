// Checagem Node-runnable da função pura extractLeadId.
// Rodar: node frontend/extension/extractLeadId.test.js
const assert = require("assert");
const { extractLeadId } = require("./script.js");

// URL de lead do Kommo → id correto.
assert.strictEqual(
  extractLeadId("https://admperaltasturismo.kommo.com/leads/detail/123456"),
  "123456",
  "lead URL deve retornar o id"
);

// Lead com query string / hash anexado → ainda extrai o id.
assert.strictEqual(
  extractLeadId(
    "https://admperaltasturismo.kommo.com/leads/detail/789?foo=bar#x"
  ),
  "789",
  "lead URL com query/hash deve retornar o id"
);

// Dashboard do Kommo (não é página de lead) → null.
assert.strictEqual(
  extractLeadId("https://admperaltasturismo.kommo.com/dashboard/"),
  null,
  "dashboard do Kommo deve retornar null"
);

// URL antiga do RD → null.
assert.strictEqual(
  extractLeadId("https://crm.rdstation.com/app/deals/64ff"),
  null,
  "URL do RD deve retornar null"
);

// Entradas inválidas → null.
assert.strictEqual(extractLeadId(""), null, "string vazia deve retornar null");
assert.strictEqual(
  extractLeadId(undefined),
  null,
  "undefined deve retornar null"
);

console.log("OK: todos os asserts de extractLeadId passaram.");
