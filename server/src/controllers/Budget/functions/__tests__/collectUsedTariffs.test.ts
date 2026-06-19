import { collectUsedTariffs } from "../collectUsedTariffs";
import { getTariff } from "../getTariff";

// Mocka a camada que acessa o DB (getTariff), sem DB real.
jest.mock("../getTariff");

const mockedGetTariff = getTariff as jest.MockedFunction<typeof getTariff>;

/**
 * Helper para montar um retorno mínimo de getTariff com nomes de tarifário
 * para midweek e weekend. tariff_mw/tariff_we só precisam expor `.name` para
 * collectUsedTariffs; demais campos não são lidos.
 */
function tariffResponse(mwName: string, weName: string) {
  return {
    type: "common",
    tariff_mw_id: mwName,
    tariff_we_id: weName,
    tariff_mw: { name: mwName },
    tariff_we: { name: weName },
  } as unknown as Awaited<ReturnType<typeof getTariff>>;
}

describe("collectUsedTariffs", () => {
  beforeEach(() => {
    mockedGetTariff.mockReset();
  });

  it("retorna lista deduplicada dos nomes de tarifário usados por dia", async () => {
    // Quarta (midweek) -> "Baixa"; Sexta (weekend) -> "Alta".
    // Repete um dia midweek para validar a deduplicação.
    mockedGetTariff
      .mockResolvedValueOnce(tariffResponse("Baixa", "Alta")) // 2025-06-18 Wed
      .mockResolvedValueOnce(tariffResponse("Baixa", "Alta")) // 2025-06-19 Thu (mw, mês 06)
      .mockResolvedValueOnce(tariffResponse("Baixa", "Alta")); // 2025-06-20 Fri (we)

    const period = [
      new Date("2025-06-18T00:00:00"),
      new Date("2025-06-19T00:00:00"),
      new Date("2025-06-20T00:00:00"),
    ];

    const result = await collectUsedTariffs(period);

    expect(mockedGetTariff).toHaveBeenCalledTimes(3);
    expect(result).toHaveLength(2);
    expect(result).toEqual(expect.arrayContaining(["Baixa", "Alta"]));
  });

  it("coleta nomes distintos quando dias diferentes resolvem tarifários diferentes", async () => {
    // Quinta em julho conta como weekend -> usa tariff_we.
    mockedGetTariff
      .mockResolvedValueOnce(tariffResponse("MWJun", "WEJun")) // 2025-07-09 Wed -> mw
      .mockResolvedValueOnce(tariffResponse("MWJul", "WEJul")); // 2025-07-10 Thu (mês 07) -> we

    const period = [
      new Date("2025-07-09T00:00:00"),
      new Date("2025-07-10T00:00:00"),
    ];

    const result = await collectUsedTariffs(period);

    expect(result).toEqual(["MWJun", "WEJul"]);
  });

  it("ignora dias sem tarifário encontrado (Not Found Tariff)", async () => {
    mockedGetTariff
      .mockResolvedValueOnce(tariffResponse("Baixa", "Alta")) // Wed -> mw
      .mockResolvedValueOnce({ type: "Not Found Tariff" } as Awaited<
        ReturnType<typeof getTariff>
      >);

    const period = [
      new Date("2025-06-18T00:00:00"),
      new Date("2025-06-25T00:00:00"),
    ];

    const result = await collectUsedTariffs(period);

    expect(result).toEqual(["Baixa"]);
  });
});
