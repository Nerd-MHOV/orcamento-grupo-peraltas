import { Request, Response, Router } from "express";
import { createLeadsService } from "../../services/kommo/leads";
import { createFilesService } from "../../services/kommo/files";
import {
  BudgetLeadInput,
  FilesService,
  KommoError,
  LeadsService,
  isKommoError,
} from "../../services/kommo/kommo.types";
import { uploadPdf } from "../../middlewares/uploadPdf";

/**
 * Controller dos endpoints `/kommo/*` (design.md → KommoController).
 *
 * Contrato:
 *   POST /kommo/lead         { leadId }                  → LeadPrefill (200)
 *   POST /kommo/lead/budget  { leadId, budget }          → { ok: true } (200)
 *   POST /kommo/lead/pdf     multipart: leadId + `pdf`   → { ok: true } (200)
 *
 * Mapa de erros (Req 5.3, 3.7, 4.2):
 *   - validação de `leadId`               → 400
 *   - KommoError{kind:'not_found'}        → 404 (apenas no GET de lead)
 *   - qualquer outra falha de CRM          → 502
 *
 * Cada falha é logada de forma ESTRUTURADA (`{ endpoint, leadId, kind }`) e
 * NUNCA expõe o token nem o request completo — a resposta carrega só um código
 * de erro genérico (Req 4.2). Os serviços são injetáveis para testes; por
 * padrão usam as fábricas reais.
 */
export class KommoController {
  constructor(
    private readonly leads: LeadsService = createLeadsService(),
    private readonly files: FilesService = createFilesService()
  ) {
    this.getLead = this.getLead.bind(this);
    this.updateBudget = this.updateBudget.bind(this);
    this.uploadPdf = this.uploadPdf.bind(this);
  }

  /** POST /kommo/lead — lê um lead e devolve o prefill (PULL, Req 6.1). */
  public async getLead(request: Request, response: Response) {
    const leadId = parseLeadId((request.body ?? {}).leadId);
    if (leadId === null) {
      return response.status(400).json({ error: "invalid_lead_id" });
    }

    try {
      const prefill = await this.leads.getLead(leadId);
      return response.json(prefill);
    } catch (err) {
      return this.handleKommoError(response, err, "/kommo/lead", leadId);
    }
  }

  /** POST /kommo/lead/budget — grava orçamento no lead (PUSH, Req 3.1–3.4). */
  public async updateBudget(request: Request, response: Response) {
    const body = request.body ?? {};
    const leadId = parseLeadId(body.leadId);
    if (leadId === null) {
      return response.status(400).json({ error: "invalid_lead_id" });
    }

    const rawBudget = body.budget;
    if (rawBudget === undefined || rawBudget === null) {
      return response.status(400).json({ error: "invalid_budget" });
    }

    // O body chega como JSON: datas trafegam como STRING ISO e o
    // `fieldMapper.toCustomFields` só grava a data quando é `instanceof Date`.
    // Coage aqui (defensivo: datas inválidas são ignoradas) para que as datas
    // de fato persistam no lead. Os numéricos são normalizados para number.
    const budget = coerceBudget(rawBudget);

    try {
      await this.leads.updateLeadBudget(leadId, budget);
      return response.json({ ok: true });
    } catch (err) {
      return this.handleKommoError(response, err, "/kommo/lead/budget", leadId);
    }
  }

  /** POST /kommo/lead/pdf — anexa o PDF ao lead via Files API (Req 4.1). */
  public async uploadPdf(request: Request, response: Response) {
    const leadId = parseLeadId((request.body ?? {}).leadId);
    if (leadId === null) {
      return response.status(400).json({ error: "invalid_lead_id" });
    }

    const file = request.file;
    if (!file || !file.buffer) {
      return response.status(400).json({ error: "missing_pdf" });
    }

    try {
      const filename = file.originalname || `orcamento-${leadId}.pdf`;
      await this.files.uploadPdfToLead(leadId, file.buffer, filename);
      return response.json({ ok: true });
    } catch (err) {
      return this.handleKommoError(response, err, "/kommo/lead/pdf", leadId);
    }
  }

  /**
   * Log estruturado + mapeamento de status. `not_found` → 404; todo o resto de
   * CRM → 502. NUNCA serializa o erro bruto na resposta (poderia conter token);
   * apenas o `kind` (ou `unknown`) é logado e um código genérico é devolvido.
   */
  private handleKommoError(
    response: Response,
    err: unknown,
    endpoint: string,
    leadId: number
  ) {
    const kind = isKommoError(err) ? (err as KommoError).kind : "unknown";

    // Log estruturado sem dados sensíveis (Req 5.3, 4.2).
    console.error({ endpoint, leadId, kind });

    if (kind === "not_found") {
      return response.status(404).json({ error: "not_found" });
    }
    return response.status(502).json({ error: "crm_unavailable" });
  }

  /**
   * Router com os três endpoints. O `uploadPdf` multer roda ANTES do handler
   * para popular `req.file`/`req.body.leadId` a partir do multipart.
   * Montado em routes.ts já atrás de `authMiddleware`.
   */
  public router(): Router {
    const router = Router();
    router.post("/kommo/lead", this.getLead);
    router.post("/kommo/lead/budget", this.updateBudget);
    router.post("/kommo/lead/pdf", uploadPdf, this.uploadPdf);
    return router;
  }
}

/**
 * Aceita number ou string numérica inteira positiva; devolve `null` para
 * ausente/NaN/não-inteiro/≤0. Garante que o serviço só receba ids válidos (400).
 */
function parseLeadId(raw: unknown): number | null {
  if (typeof raw === "number") {
    return Number.isInteger(raw) && raw > 0 ? raw : null;
  }
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number(raw);
    return Number.isInteger(n) && n > 0 ? n : null;
  }
  return null;
}

/**
 * Converte uma data ISO (string) em `Date`. Já-`Date` passa direto; valores
 * ausentes/inválidos retornam `undefined` (defensivo: o mapper apenas omite a
 * data nesse caso, sem quebrar).
 */
function coerceDate(raw: unknown): Date | undefined {
  if (raw instanceof Date) {
    return isNaN(raw.getTime()) ? undefined : raw;
  }
  if (typeof raw === "string" && raw.trim() !== "") {
    const date = new Date(raw);
    return isNaN(date.getTime()) ? undefined : date;
  }
  return undefined;
}

/** Garante um number (aceita string numérica do JSON); fallback `0`. */
function coerceNumber(raw: unknown, fallback = 0): number {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

/**
 * Normaliza o budget cru do body (JSON) em um `BudgetLeadInput` que o
 * `fieldMapper` consegue persistir: datas viram `Date` (quando válidas),
 * numéricos viram `number`. Campos de lista são preservados como vieram.
 */
function coerceBudget(raw: Record<string, unknown>): BudgetLeadInput {
  const checkIn = coerceDate(raw.checkIn);
  const checkOut = coerceDate(raw.checkOut);
  return {
    ...(raw as unknown as BudgetLeadInput),
    // Só sobrescreve quando há data válida; senão mantém o valor original
    // (string inválida/undefined) para o mapper apenas ignorá-lo via instanceof.
    checkIn: (checkIn ?? raw.checkIn) as BudgetLeadInput["checkIn"],
    checkOut: (checkOut ?? raw.checkOut) as BudgetLeadInput["checkOut"],
    adt: coerceNumber(raw.adt),
    price: coerceNumber(raw.price),
  };
}
