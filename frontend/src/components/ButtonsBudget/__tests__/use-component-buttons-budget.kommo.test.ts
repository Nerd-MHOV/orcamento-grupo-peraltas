import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  runGenerateBudgetFlow,
  runGenerateBudgetCorpFlow,
  GenerateBudgetFlowDeps,
} from "../kommoGenerateFlow";
import DataContentProps from "../../../context/generateTariff/interfaces/tableBudgetDataContentProps";
import { CorporateBodyResponseBudget } from "../../../hooks/api/interfaces";

/**
 * A orquestração CRM do hook `useComponentButtonsBudget` foi extraída para
 * `kommoGenerateFlow` (funções puras com dependências injetadas) porque
 * renderizar o hook exige toda a árvore de providers de contexto. Aqui
 * testamos o contrato de resiliência: o PDF e o save local sempre ocorrem,
 * mesmo quando o Kommo está indisponível (Req 4.5/5.1/5.2).
 */

const fakeBlob = new Blob(["pdf"], { type: "application/pdf" });

function makeBudgets(leadId = "123"): DataContentProps[] {
  return [
    {
      rows: [],
      columns: [],
      total: { total: 1000, noDiscount: 1000 },
      arrComplete: {
        petValue: [],
        childValue: [],
        selectionRange: {
          startDate: new Date("2026-07-01"),
          endDate: new Date("2026-07-03"),
        } as NonNullable<DataContentProps["arrComplete"]>["selectionRange"],
        responseForm: {
          adult: 2,
          pension: "simples",
          category: "Hospedagem",
          rd_client: leadId,
          housingUnit: "x",
          parcel: 1,
        },
      },
    },
  ];
}

function makeDeps(
  overrides: Partial<GenerateBudgetFlowDeps> = {}
): {
  deps: GenerateBudgetFlowDeps;
  generatePdf: ReturnType<typeof vi.fn>;
  syncToKommo: ReturnType<typeof vi.fn>;
  uploadPdf: ReturnType<typeof vi.fn>;
  saveBudget: ReturnType<typeof vi.fn>;
  notify: ReturnType<typeof vi.fn>;
} {
  const generatePdf = vi.fn().mockResolvedValue(fakeBlob);
  const syncToKommo = vi.fn().mockResolvedValue(undefined);
  const uploadPdf = vi.fn().mockResolvedValue(undefined);
  const saveBudget = vi.fn();
  const notify = vi.fn();
  const deps: GenerateBudgetFlowDeps = {
    generatePdf,
    syncToKommo,
    uploadPdf,
    saveBudget,
    notify,
    name: "Cliente Teste",
    ...overrides,
  };
  return { deps, generatePdf, syncToKommo, uploadPdf, saveBudget, notify };
}

describe("runGenerateBudgetFlow (hospedagem)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("happy path: gera blob, sincroniza, anexa PDF e salva localmente", async () => {
    const { deps, generatePdf, syncToKommo, uploadPdf, saveBudget, notify } =
      makeDeps();

    await runGenerateBudgetFlow(makeBudgets("123"), deps);

    expect(generatePdf).toHaveBeenCalledTimes(1);
    expect(syncToKommo).toHaveBeenCalledTimes(1);
    expect(uploadPdf).toHaveBeenCalledTimes(1);
    expect(uploadPdf).toHaveBeenCalledWith(123, fakeBlob, expect.any(String));
    expect(saveBudget).toHaveBeenCalledTimes(1);
    expect(notify).not.toHaveBeenCalled();
  });

  it("kommoSaveProcess falha: avisa e MESMO ASSIM salva localmente", async () => {
    const { deps, uploadPdf, saveBudget, notify } = makeDeps({
      syncToKommo: vi.fn().mockRejectedValue(new Error("kommo down")),
    });

    await runGenerateBudgetFlow(makeBudgets("123"), deps);

    expect(notify).toHaveBeenCalledWith(
      "Não foi possível sincronizar o orçamento com o Kommo",
      "warning"
    );
    // anexação ainda ocorre e save local não é bloqueado
    expect(uploadPdf).toHaveBeenCalledTimes(1);
    expect(saveBudget).toHaveBeenCalledTimes(1);
  });

  it("uploadBudgetPdf falha: avisa e MESMO ASSIM salva localmente", async () => {
    const { deps, syncToKommo, saveBudget, notify } = makeDeps({
      uploadPdf: vi.fn().mockRejectedValue(new Error("upload fail")),
    });

    await runGenerateBudgetFlow(makeBudgets("123"), deps);

    expect(syncToKommo).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith(
      "Não foi possível anexar o PDF ao lead",
      "warning"
    );
    expect(saveBudget).toHaveBeenCalledTimes(1);
  });

  it("sem lead id: pula a anexação mas salva localmente", async () => {
    const { deps, uploadPdf, saveBudget } = makeDeps();

    await runGenerateBudgetFlow(makeBudgets(""), deps);

    expect(uploadPdf).not.toHaveBeenCalled();
    expect(saveBudget).toHaveBeenCalledTimes(1);
  });
});

describe("runGenerateBudgetCorpFlow (corporativo)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const makeCorp = (idClient = "456"): CorporateBodyResponseBudget =>
    ({ idClient } as CorporateBodyResponseBudget);

  it("happy path corporativo", async () => {
    const { deps, generatePdf, syncToKommo, uploadPdf, saveBudget } =
      makeDeps();

    await runGenerateBudgetCorpFlow(makeCorp("456"), deps);

    expect(generatePdf).toHaveBeenCalledTimes(1);
    expect(syncToKommo).toHaveBeenCalledTimes(1);
    expect(uploadPdf).toHaveBeenCalledWith(456, fakeBlob, expect.any(String));
    expect(saveBudget).toHaveBeenCalledTimes(1);
  });

  it("corp: sincronização falha não bloqueia save", async () => {
    const { deps, saveBudget, notify } = makeDeps({
      syncToKommo: vi.fn().mockRejectedValue(new Error("down")),
    });

    await runGenerateBudgetCorpFlow(makeCorp("456"), deps);

    expect(notify).toHaveBeenCalledWith(
      "Não foi possível sincronizar o orçamento com o Kommo",
      "warning"
    );
    expect(saveBudget).toHaveBeenCalledTimes(1);
  });
});
