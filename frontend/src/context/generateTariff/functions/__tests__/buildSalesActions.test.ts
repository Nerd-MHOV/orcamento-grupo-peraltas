import { describe, it, expect } from "vitest";
import { buildSalesActions } from "../buildSalesActions";

describe("buildSalesActions", () => {
  it("desconto geral com ação: 'Ação: <nome> | Desconto: <X>%'", () => {
    expect(buildSalesActions("Black Friday", 10, [])).toBe(
      "Ação: Black Friday | Desconto: 10%"
    );
  });

  it("desconto geral sem ação selecionada usa '—'", () => {
    expect(buildSalesActions("", 15, [])).toBe("Ação: — | Desconto: 15%");
    expect(buildSalesActions(undefined, 15, [])).toBe(
      "Ação: — | Desconto: 15%"
    );
  });

  it("inclui descontos unitários (cada um com % > 0)", () => {
    const out = buildSalesActions("Promo", 10, [
      { id: 1, name: "Quarto 2", type: "x", discount: 5 },
      { id: 2, name: "Quarto 3", type: "x", discount: 0 }, // ignorado (0%)
      { id: 3, name: "Quarto 4", type: "x", discount: 8 },
    ]);
    expect(out).toBe(
      "Ação: Promo | Desconto: 10%\nUnitário — Quarto 2: 5%\nUnitário — Quarto 4: 8%"
    );
  });

  it("só unitários, sem desconto geral", () => {
    expect(
      buildSalesActions(undefined, 0, [
        { id: 1, name: "Quarto 2", type: "x", discount: 5 },
      ])
    ).toBe("Unitário — Quarto 2: 5%");
  });

  it("sem nenhum desconto → 'Padrão'", () => {
    expect(buildSalesActions(undefined, 0, [])).toBe("Padrão");
    expect(buildSalesActions("Black Friday", 0, [])).toBe("Padrão");
  });
});
