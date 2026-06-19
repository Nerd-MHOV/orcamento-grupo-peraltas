import { createFieldMapper } from "../fieldMapper";
import { KommoConfig } from "../../../config/kommoConfig";
import { BudgetLeadInput, KommoCustomFieldValue, KommoLead } from "../kommo.types";

/**
 * Config injetada para não depender de env. Espelha os field_ids/enum_ids
 * confirmados em research.md (MAPA FINAL DE CAMPOS).
 */
function makeConfig(overrides: Partial<KommoConfig> = {}): KommoConfig {
  return {
    token: "tok",
    baseUrl: "https://acct.kommo.com/api/v4",
    driveUrl: "https://drive.kommo.com",
    fields: {
      check_in: 804864,
      check_out: 804868,
      adt: 786330,
      chd_amount: 786328,
      chd_ages: 786322,
      pet_amount: 786324,
      pet_sizes: 786326,
      pet_sizes_enum: {
        Pequeno: 648186,
        Médio: 648188,
        Grande: 648190,
      },
      tariffs_used: 805299,
    },
    ...overrides,
  };
}

/** Encontra a entry de um field_id no array de custom_fields_values. */
function field(
  entries: KommoCustomFieldValue[],
  fieldId: number
): KommoCustomFieldValue | undefined {
  return entries.find((e) => e.field_id === fieldId);
}

// unix (segundos) do início do dia UTC de uma data YYYY-MM-DD.
// Datas são ancoradas ao MEIO-DIA UTC para não rolar de dia no fuso da conta
// Kommo (UTC-3). Ver fieldMapper.toUnixDateNoon.
function noonUtcSeconds(iso: string): number {
  return Date.parse(`${iso}T12:00:00.000Z`) / 1000;
}

describe("fieldMapper.toCustomFields", () => {
  const mapper = createFieldMapper(makeConfig());

  const sample: BudgetLeadInput = {
    checkIn: new Date("2026-03-01T00:00:00.000Z"),
    checkOut: new Date("2026-03-05T00:00:00.000Z"),
    adt: 2,
    chdAges: [4, 7],
    petSizes: ["Médio", "Grande"],
    price: 1234,
    tariffs: ["Alta", "Feriado"],
  };

  it("check_in usa field_id 804864 com valor unix numérico (início do dia)", () => {
    const out = mapper.toCustomFields(sample);
    const entry = field(out, 804864);
    expect(entry).toBeDefined();
    const value = entry!.values[0].value;
    expect(typeof value).toBe("number");
    expect(value).toBe(noonUtcSeconds("2026-03-01"));
  });

  it("check_out usa field_id 804868 com unix numérico", () => {
    const out = mapper.toCustomFields(sample);
    const entry = field(out, 804868);
    expect(entry!.values[0].value).toBe(noonUtcSeconds("2026-03-05"));
  });

  it("adt é escrito como string sob 786330", () => {
    const out = mapper.toCustomFields(sample);
    expect(field(out, 786330)!.values[0].value).toBe("2");
  });

  it("chd_amount (= chdAges.length) string sob 786328", () => {
    const out = mapper.toCustomFields(sample);
    expect(field(out, 786328)!.values[0].value).toBe("2");
  });

  it("chd_ages é csv sob 786322", () => {
    const out = mapper.toCustomFields(sample);
    expect(field(out, 786322)!.values[0].value).toBe("4,7");
  });

  it("pet_amount (= petSizes.length) string sob 786324", () => {
    const out = mapper.toCustomFields(sample);
    expect(field(out, 786324)!.values[0].value).toBe("2");
  });

  it("pet_sizes produz entradas enum_id (648188 para Médio) sob 786326", () => {
    const out = mapper.toCustomFields(sample);
    const entry = field(out, 786326);
    expect(entry).toBeDefined();
    const enumIds = entry!.values.map((v) => v.enum_id);
    expect(enumIds).toContain(648188); // Médio
    expect(enumIds).toContain(648190); // Grande
  });

  it("pet_sizes desconhecidos são ignorados sem quebrar", () => {
    const out = mapper.toCustomFields({
      ...sample,
      petSizes: ["Médio", "Gigante"],
    });
    const entry = field(out, 786326);
    expect(entry!.values).toEqual([{ enum_id: 648188 }]);
  });

  it("tariffs_used é string sob 805299", () => {
    const out = mapper.toCustomFields(sample);
    const value = field(out, 805299)!.values[0].value;
    expect(typeof value).toBe("string");
    expect(value).toContain("Alta");
    expect(value).toContain("Feriado");
  });

  it("não inclui price como custom field", () => {
    const out = mapper.toCustomFields(sample);
    const ids = out.map((e) => e.field_id);
    // price não tem field_id; garante que nenhum custom field carrega o número 1234
    out.forEach((e) =>
      e.values.forEach((v) => expect(v.value).not.toBe(1234))
    );
    expect(ids).not.toContain(0);
  });

  it("lista de pets vazia → nenhuma entrada de pet (786324/786326 ausentes)", () => {
    const out = mapper.toCustomFields({ ...sample, petSizes: [] });
    expect(field(out, 786324)).toBeUndefined();
    expect(field(out, 786326)).toBeUndefined();
  });

  it("lista de chd vazia → nenhuma entrada de chd (786328/786322 ausentes)", () => {
    const out = mapper.toCustomFields({ ...sample, chdAges: [] });
    expect(field(out, 786328)).toBeUndefined();
    expect(field(out, 786322)).toBeUndefined();
  });

  it("tariffs vazios → nenhuma entrada 805299", () => {
    const out = mapper.toCustomFields({ ...sample, tariffs: [] });
    expect(field(out, 805299)).toBeUndefined();
  });
});

describe("fieldMapper.readLead", () => {
  const mapper = createFieldMapper(makeConfig());

  it("extrai campos presentes e deixa ausentes como undefined sem lançar", () => {
    const lead: KommoLead = {
      id: 99,
      name: "Cliente Teste",
      custom_fields_values: [
        {
          field_id: 804864,
          values: [{ value: noonUtcSeconds("2026-03-01") }],
        },
        { field_id: 786330, values: [{ value: "3" }] },
        { field_id: 786322, values: [{ value: "4,7" }] },
        {
          field_id: 786326,
          values: [{ enum_id: 648188, value: "Médio" }],
        },
        // check_out (804868) AUSENTE de propósito
      ],
    };

    const out = mapper.readLead(lead);

    expect(out.id).toBe(99);
    expect(out.name).toBe("Cliente Teste");
    expect(out.checkIn).toBe("2026-03-01");
    expect(out.checkOut).toBeUndefined(); // ausente, sem throw
    expect(out.adt).toBe(3);
    expect(out.chdAges).toEqual([4, 7]);
    expect(out.petSizes).toEqual(["Médio"]);
  });

  it("lead sem custom_fields_values não lança", () => {
    const lead: KommoLead = { id: 1, name: "Sem Campos" };
    expect(() => mapper.readLead(lead)).not.toThrow();
    const out = mapper.readLead(lead);
    expect(out.id).toBe(1);
    expect(out.checkIn).toBeUndefined();
    expect(out.adt).toBeUndefined();
    expect(out.petSizes).toBeUndefined();
  });

  it("mapeia enum_id de pet de volta para o rótulo", () => {
    const lead: KommoLead = {
      id: 2,
      name: "Pets",
      custom_fields_values: [
        {
          field_id: 786326,
          values: [{ enum_id: 648186 }, { enum_id: 648190 }],
        },
      ],
    };
    expect(mapper.readLead(lead).petSizes).toEqual(["Pequeno", "Grande"]);
  });
});
