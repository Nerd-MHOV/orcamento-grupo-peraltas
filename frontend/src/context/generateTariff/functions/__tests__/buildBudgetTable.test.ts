import { describe, it, expect } from "vitest";
import { buildBudgetTable } from "../buildBudgetTable";
import DataContentProps from "../../interfaces/tableBudgetDataContentProps";
import RowsProps from "../../interfaces/tableBudgetRowsProps";

const rows: RowsProps[] = [];

describe("buildBudgetTable / encadeamento de tariffsUsed", () => {
  it("dado uma resposta de cálculo com tariffs, o orçamento montado carrega tariffsUsed", () => {
    // Simula a resposta do backend (/budget ou /budget-corp) que agora inclui `tariffs`.
    const calcResponse = { rows, tariffs: ["Alta", "Baixa"] };

    const patch = buildBudgetTable(
      calcResponse.rows,
      undefined,
      calcResponse.tariffs
    );

    expect(patch.tariffsUsed).toEqual(["Alta", "Baixa"]);

    // Simula o spread feito em handleSaveBudget (...dataTable) ao persistir o orçamento.
    const dataTable: DataContentProps = {
      columns: [],
      ...patch,
    };
    const savedBudget: DataContentProps = { ...dataTable, total: { total: 0, noDiscount: 0 } as DataContentProps["total"] };

    expect(savedBudget.tariffsUsed).toEqual(["Alta", "Baixa"]);
  });

  it("é aditivo: sem tariffs na resposta, tariffsUsed fica undefined", () => {
    const calcResponse: { rows: RowsProps[]; tariffs?: string[] } = { rows };

    const patch = buildBudgetTable(calcResponse.rows, undefined, calcResponse.tariffs);

    expect(patch.tariffsUsed).toBeUndefined();
  });
});
