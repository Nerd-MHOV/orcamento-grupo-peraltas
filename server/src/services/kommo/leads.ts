import { createFieldMapper } from "./fieldMapper";
import { createKommoClient } from "./kommoClient";
import {
  BudgetLeadInput,
  FieldMapper,
  KommoClient,
  KommoLead,
  LeadPrefill,
  LeadsService,
} from "./kommo.types";

/**
 * Serviço de leitura/escrita de orçamento no lead do Kommo (design.md → leads).
 *
 * Não decide regra de negócio (preço/tarifários chegam prontos no input); apenas
 * orquestra cliente HTTP + mapeador:
 *
 * - `getLead(id)`  → `GET /leads/{id}` e mapeia para `LeadPrefill` (Req 6.1).
 *   Um `404` é normalizado pelo `KommoClient` em `KommoError{kind:'not_found'}`
 *   e simplesmente propaga (tratado upstream — Req 6.4).
 * - `updateLeadBudget(id, input)` → `PATCH /leads/{id}` com APENAS
 *   `{ price, custom_fields_values }`. O PATCH do Kommo é PARCIAL: não apaga os
 *   campos não enviados (Req 3.4). O corpo NUNCA inclui `status_id`/`pipeline_id`/
 *   `deal_stage_id` — o sistema não troca a etapa do pipeline (Req 3.5).
 */

/** Corpo do PATCH de orçamento no lead: só price + custom fields (Req 3.5). */
interface UpdateLeadBudgetBody {
  price: number;
  custom_fields_values: ReturnType<FieldMapper["toCustomFields"]>;
}

class KommoLeadsService implements LeadsService {
  constructor(
    private readonly client: KommoClient,
    private readonly mapper: FieldMapper
  ) {}

  public async getLead(id: number): Promise<LeadPrefill> {
    const lead = await this.client.get<KommoLead>(`/leads/${id}`);
    return this.mapper.readLead(lead);
  }

  public async updateLeadBudget(
    id: number,
    input: BudgetLeadInput
  ): Promise<void> {
    const body: UpdateLeadBudgetBody = {
      price: input.price,
      custom_fields_values: this.mapper.toCustomFields(input),
    };
    await this.client.patch<unknown>(`/leads/${id}`, body);
  }
}

/**
 * Fábrica do serviço de leads. Por padrão usa o `KommoClient` e o `FieldMapper`
 * reais; ambos podem ser injetados para testes.
 */
export function createLeadsService(
  client: KommoClient = createKommoClient(),
  mapper: FieldMapper = createFieldMapper()
): LeadsService {
  return new KommoLeadsService(client, mapper);
}
