// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { LeadPrefill } from "../../../../hooks/api/all/kommo.api";
import usePrefillFromLead from "../usePrefillFromLead";

const getLead = vi.fn<[number], Promise<LeadPrefill>>();
const notify = vi.fn();
let search = "";

vi.mock("../../../../hooks/api/api", () => ({
  useApi: () => ({
    kommo: { getLead },
  }),
}));

vi.mock("../../../../hooks/urlQuery/query", () => ({
  default: () => new URLSearchParams(search),
}));

vi.mock("../../../notification/notificationContext", () => ({
  useNotification: () => notify,
}));

beforeEach(() => {
  getLead.mockReset();
  notify.mockReset();
  search = "";
});

describe("usePrefillFromLead", () => {
  it("com client_id e lead válido → expõe nome e campos de prefill e aciona os setters", async () => {
    search = "?client_id=123";
    getLead.mockResolvedValue({
      id: 123,
      name: "João da Silva",
      checkIn: "2026-07-01",
      checkOut: "2026-07-05",
      adt: 2,
      chdAges: [6, 9],
      petSizes: ["pequeno"],
    });

    const setChildValue = vi.fn();
    const setPetValue = vi.fn();
    const handleSelectDate = vi.fn();

    const { result } = renderHook(() =>
      usePrefillFromLead({ setChildValue, setPetValue, handleSelectDate })
    );

    await waitFor(() => expect(getLead).toHaveBeenCalledWith(123));

    await waitFor(() => expect(result.current.name).toBe("João da Silva"));
    expect(result.current.adt).toBe(2);

    expect(setChildValue).toHaveBeenCalledWith([6, 9]);
    expect(setPetValue).toHaveBeenCalledWith(["pequeno"]);
    expect(handleSelectDate).toHaveBeenCalledWith(
      expect.objectContaining({
        selection: expect.objectContaining({
          // Datas parseadas no fuso LOCAL (não UTC) para não rolar de dia no
          // calendário; ver parseLocalDate em usePrefillFromLead.
          startDate: new Date(2026, 6, 1),
          endDate: new Date(2026, 6, 5),
          key: "selection",
        }),
      })
    );
    expect(notify).not.toHaveBeenCalled();
  });

  it("portes de PET capitalizados (Kommo) → normaliza para minúsculas e descarta desconhecidos", async () => {
    // O adaptador Kommo entrega os rótulos capitalizados (`Pequeno`/`Médio`/...),
    // mas `petOptions` e o campo `carrying` do banco usam minúsculas. Sem
    // normalizar, o cálculo casa o porte por igualdade exata e zera o PET.
    search = "?client_id=123";
    getLead.mockResolvedValue({
      id: 123,
      name: "Ana",
      petSizes: ["Pequeno", "Médio", "Gigante"],
    });

    const setChildValue = vi.fn();
    const setPetValue = vi.fn();
    const handleSelectDate = vi.fn();

    renderHook(() =>
      usePrefillFromLead({ setChildValue, setPetValue, handleSelectDate })
    );

    await waitFor(() =>
      expect(setPetValue).toHaveBeenCalledWith(["pequeno", "médio"])
    );
  });

  it("campos ausentes no lead → preenche o que existe e deixa o resto em branco", async () => {
    search = "?client_id=123";
    getLead.mockResolvedValue({
      id: 123,
      name: "Maria",
      adt: 3,
    });

    const setChildValue = vi.fn();
    const setPetValue = vi.fn();
    const handleSelectDate = vi.fn();

    const { result } = renderHook(() =>
      usePrefillFromLead({ setChildValue, setPetValue, handleSelectDate })
    );

    await waitFor(() => expect(result.current.name).toBe("Maria"));
    expect(result.current.adt).toBe(3);
    expect(setChildValue).not.toHaveBeenCalled();
    expect(setPetValue).not.toHaveBeenCalled();
    expect(handleSelectDate).not.toHaveBeenCalled();
  });

  it("getLead rejeita (not_found) → não preenche nada e dispara aviso", async () => {
    search = "?client_id=123";
    getLead.mockRejectedValue(new Error("not_found"));

    const setChildValue = vi.fn();
    const setPetValue = vi.fn();
    const handleSelectDate = vi.fn();

    const { result } = renderHook(() =>
      usePrefillFromLead({ setChildValue, setPetValue, handleSelectDate })
    );

    await waitFor(() => expect(notify).toHaveBeenCalled());

    expect(result.current.name).toBe("");
    expect(result.current.adt).toBeUndefined();
    expect(setChildValue).not.toHaveBeenCalled();
    expect(setPetValue).not.toHaveBeenCalled();
    expect(handleSelectDate).not.toHaveBeenCalled();
  });

  it("sem client_id → não chama getLead (query-params seguem como fallback)", async () => {
    search = "";
    const { result } = renderHook(() =>
      usePrefillFromLead({
        setChildValue: vi.fn(),
        setPetValue: vi.fn(),
        handleSelectDate: vi.fn(),
      })
    );

    await waitFor(() => expect(result.current.name).toBe(""));
    expect(getLead).not.toHaveBeenCalled();
    expect(notify).not.toHaveBeenCalled();
  });

  it("client_id não numérico → não chama getLead", async () => {
    search = "?client_id=abc";
    const { result } = renderHook(() =>
      usePrefillFromLead({
        setChildValue: vi.fn(),
        setPetValue: vi.fn(),
        handleSelectDate: vi.fn(),
      })
    );

    await waitFor(() => expect(result.current.name).toBe(""));
    expect(getLead).not.toHaveBeenCalled();
  });
});
