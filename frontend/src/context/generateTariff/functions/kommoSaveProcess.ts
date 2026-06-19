import { useApi } from "../../../hooks/api/api";
import { BudgetLeadInput } from "../../../hooks/api/all/kommo.api";
import { CorporateBodyResponseBudget } from "../../../hooks/api/interfaces";
import DataContentProps from "../interfaces/tableBudgetDataContentProps";

/**
 * Montagem do orçamento para o lead do Kommo (design.md → kommoSaveProcess).
 * Substitui o `rdSaveProcess`/`Corp`: SEM produtos e SEM troca de etapa — apenas
 * deriva um `BudgetLeadInput` e chama `kommo.saveBudgetToLead` (Req 3.1–3.3).
 *
 * Resolução do lead id: mesmos campos do fluxo legado RD
 * (`arrComplete.responseForm.rd_client` p/ hospedagem; `idClient` p/ corporativo).
 * Sem lead vinculado → retorna sem tocar no CRM (Req 3.7).
 *
 * Regra de `price` (Req 3.3):
 * - hospedagem grupo (`group === true`)  → SOMA dos `total.total` de todos os budgets.
 * - hospedagem simples (`group === false`) → o budget MAIS BARATO por `total.total`.
 * - corporativo → `rowsValues.total.total`.
 *
 * `tariffs` (Req 3.3): lista persistida em `tariffsUsed` no objeto de orçamento;
 * nunca resolvida de forma lazy aqui.
 */

/** Datas vão como ISO `YYYY-MM-DD` (contrato do BudgetLeadInput). UTC para não
 * deslocar o dia. Aceita `Date` ou string serializada (JSON do orçamento). */
function toIsoDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) {
    return "";
  }
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Lê o lead id do Kommo dos budgets de hospedagem (campo legado `rd_client`). */
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

/** number inteiro positivo ou null. */
function parseLeadId(raw: string | null | undefined): number | null {
  if (!raw) {
    return null;
  }
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function kommoSaveProcess(
  budgets: DataContentProps[],
  group: boolean
): Promise<void> {
  const api = useApi();

  const leadId = resolveHospedagemLeadId(budgets);
  if (leadId === null) {
    return;
  }

  // Budget de referência p/ datas/ocupação: o mais barato (simples) ou o
  // primeiro (grupo). Mantém o comportamento do fluxo legado.
  const cheapest = budgets.reduce((old, current) => {
    const oldValue = old?.total?.total ?? 0;
    const currentValue = current?.total?.total ?? 0;
    return currentValue < oldValue ? current : old;
  }, budgets[0]);

  const reference = group ? budgets[0] : cheapest;

  const price = group
    ? budgets.reduce((sum, budget) => sum + (budget?.total?.total ?? 0), 0)
    : cheapest?.total?.total ?? 0;

  const arr = reference.arrComplete;
  const input: BudgetLeadInput = {
    checkIn: arr ? toIsoDate(arr.selectionRange.startDate) : "",
    checkOut: arr ? toIsoDate(arr.selectionRange.endDate) : "",
    adt: arr ? Number(arr.responseForm.adult) || 0 : 0,
    chdAges: arr?.childValue ?? [],
    petSizes: arr?.petValue ?? [],
    price,
    tariffs: reference.tariffsUsed ?? [],
  };

  await api.kommo.saveBudgetToLead(leadId, input);
}

export async function kommoSaveProcessCorp(
  budget: CorporateBodyResponseBudget
): Promise<void> {
  const api = useApi();

  const leadId = parseLeadId(budget.idClient);
  if (leadId === null) {
    return;
  }

  const adt = budget.rooms.reduce((acc, room) => acc + room.adt, 0);
  const chdAges = budget.rooms.map((room) => room.chd).flat();
  const petSizes = budget.rooms.map((room) => room.pet).flat();
  const range = budget.dateRange[0];

  const input: BudgetLeadInput = {
    checkIn: range ? toIsoDate(range.startDate) : "",
    checkOut: range ? toIsoDate(range.endDate) : "",
    adt,
    chdAges,
    petSizes,
    price: budget.rowsValues.total.total,
    tariffs: budget.tariffs ?? [],
  };

  await api.kommo.saveBudgetToLead(leadId, input);
}
