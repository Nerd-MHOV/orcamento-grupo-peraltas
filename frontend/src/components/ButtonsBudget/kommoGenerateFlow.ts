import { CorporateBodyResponseBudget } from "../../hooks/api/interfaces";
import DataContentProps from "../../context/generateTariff/interfaces/tableBudgetDataContentProps";
import { Notify } from "../../context/notification/notificationContext";

/**
 * Orquestração resiliente do fluxo "gerar orçamento" (PUSH para o Kommo).
 *
 * Extraído do hook `useComponentButtonsBudget` para permitir teste unitário
 * sem renderizar todo o contexto de providers. O hook injeta as dependências.
 *
 * Ordem (design.md → Fluxo 1, Req 4.5/5.1/5.2):
 * 1. Gera o PDF localmente e captura o Blob — SEMPRE ocorre, abre em nova aba.
 * 2. Resolve o lead id.
 * 3. try/catch isolado: `kommoSaveProcess` (campos+preço+tarifários no lead).
 *    Falha → aviso e segue.
 * 4. try/catch SEPARADO: se houver lead id, anexa o PDF. Falha → aviso e segue.
 * 5. `budget.save` local SEMPRE roda (não bloqueia no CRM).
 */

const WARN_SYNC = "Não foi possível sincronizar o orçamento com o Kommo";
const WARN_PDF = "Não foi possível anexar o PDF ao lead";

/** number inteiro positivo ou null (lead id do Kommo). */
function parseLeadId(raw: string | null | undefined): number | null {
  if (!raw) {
    return null;
  }
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** Lê o lead id dos budgets de hospedagem (campo legado `rd_client`). */
function resolveHospedagemLeadId(budgets: DataContentProps[]): number | null {
  let raw = "";
  for (const budget of budgets) {
    const candidate = budget.arrComplete?.responseForm.rd_client;
    if (candidate) {
      raw = candidate;
    }
  }
  return parseLeadId(raw);
}

export interface GenerateBudgetFlowDeps {
  /** Gera o PDF localmente (abre em nova aba) e resolve com o Blob. */
  generatePdf: () => Promise<Blob>;
  /** Sincroniza campos/preço/tarifários do orçamento com o lead do Kommo. */
  syncToKommo: () => Promise<void>;
  /** Anexa o PDF ao lead do Kommo. */
  uploadPdf: (leadId: number, blob: Blob, filename: string) => Promise<void>;
  /** Salva o orçamento localmente (sempre, independente do CRM). */
  saveBudget: (name: string) => void;
  /** Exibe avisos ao consultor. */
  notify: Notify;
  /** Nome para nomear o orçamento/arquivo (vindo do prefill/clientName). */
  name: string;
}

/**
 * Executa o fluxo resiliente para o orçamento de hospedagem.
 * O PDF e o `saveBudget` ocorrem mesmo que o Kommo esteja indisponível.
 */
export async function runGenerateBudgetFlow(
  budgets: DataContentProps[],
  deps: GenerateBudgetFlowDeps
): Promise<void> {
  const blob = await deps.generatePdf();
  const leadId = resolveHospedagemLeadId(budgets);

  try {
    await deps.syncToKommo();
  } catch {
    deps.notify(WARN_SYNC, "warning");
  }

  if (leadId !== null) {
    try {
      await deps.uploadPdf(leadId, blob, buildFilename(deps.name));
    } catch {
      deps.notify(WARN_PDF, "warning");
    }
  }

  deps.saveBudget(deps.name);
}

export type GenerateBudgetCorpFlowDeps = GenerateBudgetFlowDeps;

/**
 * Executa o fluxo resiliente para o orçamento corporativo.
 * Mesma estrutura do fluxo de hospedagem; o lead id vem de `idClient`.
 */
export async function runGenerateBudgetCorpFlow(
  budget: CorporateBodyResponseBudget,
  deps: GenerateBudgetCorpFlowDeps
): Promise<void> {
  const blob = await deps.generatePdf();
  const leadId = parseLeadId(budget.idClient);

  try {
    await deps.syncToKommo();
  } catch {
    deps.notify(WARN_SYNC, "warning");
  }

  if (leadId !== null) {
    try {
      await deps.uploadPdf(leadId, blob, buildFilename(deps.name));
    } catch {
      deps.notify(WARN_PDF, "warning");
    }
  }

  deps.saveBudget(deps.name);
}

/** Nome de arquivo do PDF a partir do nome do cliente (fallback estável). */
function buildFilename(name: string): string {
  const safe = (name || "orcamento").trim().replace(/[^\w\-]+/g, "_");
  return `${safe || "orcamento"}.pdf`;
}
