import { formatFields, KommoCustomField } from "../kommoDiscoverFields";

describe("formatFields", () => {
  it("inclui id, tipo e nome de um campo simples", () => {
    const fields: KommoCustomField[] = [
      { id: 786330, type: "numeric", name: "Quant. Adulto" },
    ];

    const output = formatFields(fields);

    expect(output).toContain("786330");
    expect(output).toContain("numeric");
    expect(output).toContain("Quant. Adulto");
  });

  it("imprime as entradas enum de um campo multiselect (id: value)", () => {
    const fields: KommoCustomField[] = [
      {
        id: 786326,
        type: "multiselect",
        name: "Porte PET",
        enums: [
          { id: 648186, value: "Pequeno" },
          { id: 648188, value: "Médio" },
          { id: 648190, value: "Grande" },
        ],
      },
    ];

    const output = formatFields(fields);

    expect(output).toContain("786326");
    expect(output).toContain("Porte PET");
    // linha de enum no formato "id: value"
    expect(output).toContain("648186: Pequeno");
    expect(output).toContain("648188: Médio");
    expect(output).toContain("648190: Grande");
  });
});
