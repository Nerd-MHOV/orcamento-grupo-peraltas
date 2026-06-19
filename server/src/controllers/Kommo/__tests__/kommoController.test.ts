import fs from "fs";
import path from "path";
import express from "express";
import request from "supertest";
import { KommoController } from "../KommoController";
import {
  FilesService,
  KommoError,
  LeadPrefill,
  LeadsService,
} from "../../../services/kommo/kommo.types";

/**
 * Token fictício usado pelas fakes para provar que ele NUNCA vaza para a
 * resposta nem para os headers (Req 4.2 / 7.3). Se aparecer no body/headers,
 * o teste falha.
 */
const SECRET_TOKEN = "kommo-secret-token-ABC123-must-never-leak";

/** Fake do LeadsService injetável (sem rede). */
function makeLeads(over: Partial<LeadsService> = {}): jest.Mocked<LeadsService> {
  return {
    getLead: jest.fn(),
    updateLeadBudget: jest.fn(),
    ...over,
  } as jest.Mocked<LeadsService>;
}

/** Fake do FilesService injetável (sem rede). */
function makeFiles(over: Partial<FilesService> = {}): jest.Mocked<FilesService> {
  return {
    uploadPdfToLead: jest.fn(),
    ...over,
  } as jest.Mocked<FilesService>;
}

/**
 * Monta um app express isolado com o router do KommoController, cabeado com
 * serviços fake injetados. NÃO usa authMiddleware aqui (a proteção é verificada
 * separadamente, lendo a ordem das rotas em routes.ts).
 */
function makeApp(leads: LeadsService, files: FilesService) {
  const controller = new KommoController(leads, files);
  const app = express();
  app.use(express.json());
  app.use(controller.router());
  return app;
}

const samplePrefill: LeadPrefill = {
  id: 42,
  name: "João Cliente",
  checkIn: "2026-07-01",
  checkOut: "2026-07-05",
  adt: 2,
  chdAges: [6, 9],
  petSizes: ["pequeno"],
};

/**
 * Orçamento como chega no controller via JSON: as datas trafegam como string
 * ISO (o controller repassa o body cru ao serviço; a coerção de Date é
 * responsabilidade do fieldMapper, fora do escopo deste controller).
 */
const sampleBudget = {
  checkIn: "2026-07-01T00:00:00.000Z",
  checkOut: "2026-07-05T00:00:00.000Z",
  adt: 2,
  chdAges: [6, 9],
  petSizes: ["pequeno"],
  price: 1234.56,
  tariffs: ["Alta"],
};

describe("POST /kommo/lead (getLead)", () => {
  it("happy path → 200 com o LeadPrefill em JSON", async () => {
    const leads = makeLeads({
      getLead: jest.fn().mockResolvedValue(samplePrefill),
    });
    const app = makeApp(leads, makeFiles());

    const res = await request(app).post("/kommo/lead").send({ leadId: 42 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(samplePrefill);
    expect(leads.getLead).toHaveBeenCalledWith(42);
  });

  it("KommoError not_found → 404", async () => {
    const notFound: KommoError = { kind: "not_found", status: 404 };
    const leads = makeLeads({
      getLead: jest.fn().mockRejectedValue(notFound),
    });
    const app = makeApp(leads, makeFiles());

    const res = await request(app).post("/kommo/lead").send({ leadId: 7 });

    expect(res.status).toBe(404);
  });

  it("outro KommoError (auth) → 502", async () => {
    const authErr: KommoError = { kind: "auth", status: 401 };
    const leads = makeLeads({
      getLead: jest.fn().mockRejectedValue(authErr),
    });
    const app = makeApp(leads, makeFiles());

    const res = await request(app).post("/kommo/lead").send({ leadId: 7 });

    expect(res.status).toBe(502);
  });

  it("KommoError rate_limited → 502 (qualquer CRM != not_found)", async () => {
    const rate: KommoError = { kind: "rate_limited", status: 429 };
    const leads = makeLeads({
      getLead: jest.fn().mockRejectedValue(rate),
    });
    const app = makeApp(leads, makeFiles());

    const res = await request(app).post("/kommo/lead").send({ leadId: 7 });

    expect(res.status).toBe(502);
  });

  it("leadId ausente/inválido → 400, sem chamar o serviço", async () => {
    const leads = makeLeads();
    const app = makeApp(leads, makeFiles());

    const missing = await request(app).post("/kommo/lead").send({});
    expect(missing.status).toBe(400);

    const invalid = await request(app)
      .post("/kommo/lead")
      .send({ leadId: "abc" });
    expect(invalid.status).toBe(400);

    expect(leads.getLead).not.toHaveBeenCalled();
  });

  it("nunca expõe o token na resposta nem nos headers (Req 4.2)", async () => {
    // A fake estoura um erro que CONTÉM o token na mensagem; o controller jamais
    // pode repassar isso para o cliente.
    const leaky = new Error(`falha usando ${SECRET_TOKEN}`) as Error & {
      token: string;
    };
    leaky.token = SECRET_TOKEN;

    const leads = makeLeads({
      getLead: jest.fn().mockRejectedValue(leaky),
    });
    const app = makeApp(leads, makeFiles());

    const res = await request(app).post("/kommo/lead").send({ leadId: 42 });

    const serialized = JSON.stringify(res.body) + JSON.stringify(res.headers);
    expect(serialized).not.toContain(SECRET_TOKEN);
  });
});

describe("POST /kommo/lead/budget (updateBudget)", () => {
  it("happy path → 200 { ok: true } e chama updateLeadBudget", async () => {
    const leads = makeLeads({
      updateLeadBudget: jest.fn().mockResolvedValue(undefined),
    });
    const app = makeApp(leads, makeFiles());

    const res = await request(app)
      .post("/kommo/lead/budget")
      .send({ leadId: 55, budget: sampleBudget });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(leads.updateLeadBudget).toHaveBeenCalledTimes(1);
    expect(leads.updateLeadBudget).toHaveBeenCalledWith(55, sampleBudget);
  });

  it("leadId ausente/inválido → 400, sem chamar o serviço", async () => {
    const leads = makeLeads();
    const app = makeApp(leads, makeFiles());

    const missing = await request(app)
      .post("/kommo/lead/budget")
      .send({ budget: sampleBudget });
    expect(missing.status).toBe(400);

    const invalid = await request(app)
      .post("/kommo/lead/budget")
      .send({ leadId: "x", budget: sampleBudget });
    expect(invalid.status).toBe(400);

    expect(leads.updateLeadBudget).not.toHaveBeenCalled();
  });

  it("KommoError CRM → 502", async () => {
    const authErr: KommoError = { kind: "auth", status: 403 };
    const leads = makeLeads({
      updateLeadBudget: jest.fn().mockRejectedValue(authErr),
    });
    const app = makeApp(leads, makeFiles());

    const res = await request(app)
      .post("/kommo/lead/budget")
      .send({ leadId: 55, budget: sampleBudget });

    expect(res.status).toBe(502);
  });
});

describe("POST /kommo/lead/pdf (uploadPdf)", () => {
  it("happy path multipart → 200 { ok: true }, lê buffer + leadId do body", async () => {
    const files = makeFiles({
      uploadPdfToLead: jest.fn().mockResolvedValue(undefined),
    });
    const app = makeApp(makeLeads(), files);

    const res = await request(app)
      .post("/kommo/lead/pdf")
      .field("leadId", "77")
      .attach("pdf", Buffer.from("%PDF-1.4 fake"), "orcamento.pdf");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(files.uploadPdfToLead).toHaveBeenCalledTimes(1);
    const [leadId, buffer, filename] = files.uploadPdfToLead.mock.calls[0];
    expect(leadId).toBe(77);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect((buffer as Buffer).toString()).toBe("%PDF-1.4 fake");
    expect(typeof filename).toBe("string");
  });

  it("sem arquivo/leadId inválido → 400", async () => {
    const files = makeFiles();
    const app = makeApp(makeLeads(), files);

    // leadId presente mas sem arquivo.
    const noFile = await request(app)
      .post("/kommo/lead/pdf")
      .field("leadId", "77");
    expect(noFile.status).toBe(400);

    // arquivo presente mas leadId inválido.
    const badId = await request(app)
      .post("/kommo/lead/pdf")
      .field("leadId", "abc")
      .attach("pdf", Buffer.from("x"), "o.pdf");
    expect(badId.status).toBe(400);

    expect(files.uploadPdfToLead).not.toHaveBeenCalled();
  });

  it("KommoError CRM no upload → 502", async () => {
    const authErr: KommoError = { kind: "auth", status: 403 };
    const files = makeFiles({
      uploadPdfToLead: jest.fn().mockRejectedValue(authErr),
    });
    const app = makeApp(makeLeads(), files);

    const res = await request(app)
      .post("/kommo/lead/pdf")
      .field("leadId", "77")
      .attach("pdf", Buffer.from("x"), "o.pdf");

    expect(res.status).toBe(502);
  });
});

/**
 * Proteção das rotas: a forma mais confiável (sem montar prisma/jwt reais) é
 * verificar a ORDEM em routes.ts — todas as rotas `/kommo/*` devem estar
 * registradas DEPOIS de `routes.use(authMiddleware)`, e nenhuma rota `/rd/*`
 * pode restar.
 */
describe("routes.ts — kommo atrás de authMiddleware e /rd removido", () => {
  const routesSrc = fs.readFileSync(
    path.join(__dirname, "../../../routes.ts"),
    "utf8"
  );

  it("aplica authMiddleware antes de montar o router do Kommo", () => {
    const authIdx = routesSrc.indexOf("routes.use(authMiddleware)");
    expect(authIdx).toBeGreaterThan(-1);

    // O KommoController é montado via `routes.use(kommo.router())` — todos os
    // paths /kommo/* vivem dentro desse router, logo basta garantir que o
    // registro ocorre DEPOIS do authMiddleware.
    const kommoIdx = routesSrc.indexOf("kommo.router()");
    expect(kommoIdx).toBeGreaterThan(-1);
    expect(kommoIdx).toBeGreaterThan(authIdx);
  });

  it("não registra mais nenhuma rota /rd/*", () => {
    expect(routesSrc).not.toMatch(/["'`]\/rd\//);
    expect(routesSrc).not.toContain("RDController");
  });
});
