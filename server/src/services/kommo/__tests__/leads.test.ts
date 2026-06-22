import { createLeadsService } from "../leads";
import {
  BudgetLeadInput,
  FieldMapper,
  KommoClient,
  KommoCustomFieldValue,
  KommoError,
  KommoLead,
  LeadPrefill,
} from "../kommo.types";

/**
 * Fake do KommoClient injetado no LeadsService.
 *
 * Apenas `get` e `patch` são usados pelo serviço de leads:
 * - `get`   → `GET /leads/{id}` (leitura para prefill).
 * - `patch` → `PATCH /leads/{id}` (escrita parcial de orçamento).
 *
 * Não há rede real: cada teste programa os retornos esperados.
 */
function makeClient(over: Partial<KommoClient> = {}): jest.Mocked<KommoClient> {
  return {
    get: jest.fn(),
    patch: jest.fn(),
    putFilesLink: jest.fn(),
    drivePost: jest.fn(),
    ...over,
  } as jest.Mocked<KommoClient>;
}

/**
 * Fake do FieldMapper. `toCustomFields` retorna uma lista determinística;
 * `readLead` ecoa id+name e devolve o restante do prefill programado.
 */
function makeMapper(over: Partial<FieldMapper> = {}): jest.Mocked<FieldMapper> {
  return {
    toCustomFields: jest.fn(),
    readLead: jest.fn(),
    ...over,
  } as jest.Mocked<FieldMapper>;
}

const sampleInput: BudgetLeadInput = {
  checkIn: new Date("2026-07-01T00:00:00.000Z"),
  checkOut: new Date("2026-07-05T00:00:00.000Z"),
  adt: 2,
  chdAges: [6, 9],
  petSizes: ["pequeno"],
  price: 1234.56,
  tariffs: ["Alta", "Pacote X"],
  salesActions: "Padrão",
};

const sampleCustomFields: KommoCustomFieldValue[] = [
  { field_id: 101, values: [{ value: 1751328000 }] },
  { field_id: 102, values: [{ value: "2" }] },
];

describe("LeadsService.updateLeadBudget", () => {
  it("faz PATCH /leads/{id} com price numérico + custom_fields_values, e SEM status_id/pipeline_id/deal_stage_id", async () => {
    const mapper = makeMapper({
      toCustomFields: jest.fn().mockReturnValue(sampleCustomFields),
    });
    const client = makeClient();
    client.patch.mockResolvedValueOnce(undefined);

    const service = createLeadsService(client, mapper);
    await service.updateLeadBudget(55, sampleInput);

    expect(mapper.toCustomFields).toHaveBeenCalledWith(sampleInput);

    expect(client.patch).toHaveBeenCalledTimes(1);
    const [path, body] = client.patch.mock.calls[0];

    // Path correto.
    expect(path).toBe("/leads/55");

    const sentBody = body as Record<string, unknown>;

    // price numérico igual ao input.
    expect(typeof sentBody.price).toBe("number");
    expect(sentBody.price).toBe(sampleInput.price);

    // custom_fields_values é um array (vindo do mapper).
    expect(Array.isArray(sentBody.custom_fields_values)).toBe(true);
    expect(sentBody.custom_fields_values).toEqual(sampleCustomFields);

    // Req 3.5 — NUNCA enviar troca de etapa/pipeline.
    expect(sentBody).not.toHaveProperty("status_id");
    expect(sentBody).not.toHaveProperty("pipeline_id");
    expect(sentBody).not.toHaveProperty("deal_stage_id");

    // O body contém apenas as chaves esperadas.
    expect(Object.keys(sentBody).sort()).toEqual(
      ["custom_fields_values", "price"].sort()
    );
  });

  it("propaga KommoError do cliente sem engolir (ex.: 404 no PATCH)", async () => {
    const notFound: KommoError = { kind: "not_found", status: 404 };
    const mapper = makeMapper({
      toCustomFields: jest.fn().mockReturnValue(sampleCustomFields),
    });
    const client = makeClient();
    client.patch.mockRejectedValueOnce(notFound);

    const service = createLeadsService(client, mapper);
    await expect(service.updateLeadBudget(7, sampleInput)).rejects.toMatchObject({
      kind: "not_found",
      status: 404,
    });
  });
});

describe("LeadsService.getLead", () => {
  it("GET /leads/{id} → retorna LeadPrefill mapeado com id e name", async () => {
    const lead: KommoLead = {
      id: 42,
      name: "João Cliente",
      price: 1000,
      custom_fields_values: sampleCustomFields,
    };
    const prefill: LeadPrefill = {
      id: 42,
      name: "João Cliente",
      checkIn: "2026-07-01",
      adt: 2,
    };

    const mapper = makeMapper({
      readLead: jest.fn().mockReturnValue(prefill),
    });
    const client = makeClient();
    client.get.mockResolvedValueOnce(lead);

    const service = createLeadsService(client, mapper);
    const result = await service.getLead(42);

    expect(client.get).toHaveBeenCalledWith("/leads/42");
    expect(mapper.readLead).toHaveBeenCalledWith(lead);
    expect(result).toEqual(prefill);
    expect(result.id).toBe(42);
    expect(result.name).toBe("João Cliente");
  });

  it("404 → rejeita com KommoError {kind:'not_found'} (Req 6.1/6.4)", async () => {
    const notFound: KommoError = { kind: "not_found", status: 404 };
    const mapper = makeMapper();
    const client = makeClient();
    client.get.mockRejectedValueOnce(notFound);

    const service = createLeadsService(client, mapper);
    await expect(service.getLead(123)).rejects.toMatchObject({
      kind: "not_found",
      status: 404,
    });
    expect(mapper.readLead).not.toHaveBeenCalled();
  });
});
