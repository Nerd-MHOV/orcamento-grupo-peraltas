import { describe, it, expect, vi, beforeEach } from "vitest";
import { kommoSaveProcess, kommoSaveProcessCorp } from "../kommoSaveProcess";
import DataContentProps from "../../interfaces/tableBudgetDataContentProps";
import { CorporateBodyResponseBudget } from "../../../../hooks/api/interfaces";

const saveBudgetToLead = vi.fn().mockResolvedValue(undefined);

vi.mock("../../../../hooks/api/api", () => ({
  useApi: () => ({
    kommo: {
      saveBudgetToLead,
    },
  }),
}));

/** Constrói um budget de hospedagem mínimo com lead id opcional. */
function makeBudget(
  total: number,
  leadId: string | undefined,
  over: Partial<DataContentProps["arrComplete"]> = {}
): DataContentProps {
  return {
    rows: [],
    columns: [],
    total: { total, noDiscount: total },
    tariffsUsed: ["Alta", "Balada"],
    arrComplete: {
      petValue: ["pequeno"],
      childValue: [6, 9],
      selectionRange: {
        startDate: new Date("2026-07-01T00:00:00.000Z"),
        endDate: new Date("2026-07-05T00:00:00.000Z"),
        key: "selection",
      },
      responseForm: {
        adult: 2,
        pension: "",
        category: "",
        rd_client: leadId,
        housingUnit: "",
        parcel: 1,
      },
      ...over,
    },
  } as DataContentProps;
}

describe("kommoSaveProcess (hospedagem)", () => {
  beforeEach(() => {
    saveBudgetToLead.mockClear();
  });

  it("group=true → envia a SOMA dos total.total de todos os budgets", async () => {
    const budgets = [makeBudget(1000, "555"), makeBudget(700, "555")];

    await kommoSaveProcess(budgets, true);

    expect(saveBudgetToLead).toHaveBeenCalledTimes(1);
    const [leadId, input] = saveBudgetToLead.mock.calls[0];
    expect(leadId).toBe(555);
    expect(input.price).toBe(1700);
  });

  it("group=false (simples) → envia o MAIS BARATO por total.total", async () => {
    const budgets = [makeBudget(1000, "555"), makeBudget(700, "555")];

    await kommoSaveProcess(budgets, false);

    expect(saveBudgetToLead).toHaveBeenCalledTimes(1);
    const [, input] = saveBudgetToLead.mock.calls[0];
    expect(input.price).toBe(700);
  });

  it("monta o BudgetLeadInput com datas ISO YYYY-MM-DD, adt, chdAges, petSizes e tariffs de tariffsUsed", async () => {
    const budgets = [makeBudget(800, "999")];

    await kommoSaveProcess(budgets, false);

    const [leadId, input] = saveBudgetToLead.mock.calls[0];
    expect(leadId).toBe(999);
    expect(input.checkIn).toBe("2026-07-01");
    expect(input.checkOut).toBe("2026-07-05");
    expect(input.adt).toBe(2);
    expect(input.chdAges).toEqual([6, 9]);
    expect(input.petSizes).toEqual(["pequeno"]);
    expect(input.tariffs).toEqual(["Alta", "Balada"]);
  });

  it("usa tariffsUsed ?? [] quando ausente", async () => {
    const budget = makeBudget(800, "999");
    delete budget.tariffsUsed;

    await kommoSaveProcess([budget], false);

    const [, input] = saveBudgetToLead.mock.calls[0];
    expect(input.tariffs).toEqual([]);
  });

  it("sem lead id (rd_client ausente) → NÃO chama o CRM", async () => {
    const budgets = [makeBudget(1000, undefined), makeBudget(700, undefined)];

    await kommoSaveProcess(budgets, true);

    expect(saveBudgetToLead).not.toHaveBeenCalled();
  });
});

describe("kommoSaveProcessCorp (corporativo)", () => {
  beforeEach(() => {
    saveBudgetToLead.mockClear();
  });

  function makeCorp(
    idClient: string | null
  ): CorporateBodyResponseBudget {
    return {
      rooms: [
        {
          adt: 2,
          chd: [6],
          pet: ["pequeno"],
          roomNumber: {} as never,
          isStaff: false,
          rowsValues: { rows: [], total: {} as never },
        },
        {
          adt: 1,
          chd: [8, 10],
          pet: ["grande"],
          roomNumber: {} as never,
          isStaff: false,
          rowsValues: { rows: [], total: {} as never },
        },
      ],
      pension: "",
      agencyPercent: 0,
      requirements: [],
      dateRange: [
        {
          startDate: new Date("2026-08-10T00:00:00.000Z"),
          endDate: new Date("2026-08-12T00:00:00.000Z"),
          key: "selection",
        },
      ],
      idClient,
      rowsValues: {
        rows: [],
        total: { total: 4321 } as never,
      },
      tariffs: ["Corp"],
    };
  }

  it("usa rowsValues.total.total como price e agrega adt/chd/pet dos rooms", async () => {
    await kommoSaveProcessCorp(makeCorp("123"));

    expect(saveBudgetToLead).toHaveBeenCalledTimes(1);
    const [leadId, input] = saveBudgetToLead.mock.calls[0];
    expect(leadId).toBe(123);
    expect(input.price).toBe(4321);
    expect(input.adt).toBe(3);
    expect(input.chdAges).toEqual([6, 8, 10]);
    expect(input.petSizes).toEqual(["pequeno", "grande"]);
    expect(input.checkIn).toBe("2026-08-10");
    expect(input.checkOut).toBe("2026-08-12");
    expect(input.tariffs).toEqual(["Corp"]);
  });

  it("sem idClient → NÃO chama o CRM", async () => {
    await kommoSaveProcessCorp(makeCorp(null));
    expect(saveBudgetToLead).not.toHaveBeenCalled();
  });
});
