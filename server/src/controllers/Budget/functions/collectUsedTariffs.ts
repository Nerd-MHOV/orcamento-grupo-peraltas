import { format } from "date-fns";
import { getTariff } from "./getTariff";

const daysOfWeekend = ["Fri", "Sat", "Sun"];

/**
 * Dado o período (lista de datas) de um orçamento, resolve o tarifário
 * efetivamente aplicado em cada dia (via getTariff) e retorna a lista
 * deduplicada dos nomes de tarifário (Tariff.name) realmente usados.
 *
 * A escolha entre tarifário de meio de semana (midweek) e fim de semana
 * (weekend) segue a mesma regra de generateBudget: sexta/sábado/domingo são
 * fim de semana, assim como quinta-feira em julho ou janeiro.
 */
export async function collectUsedTariffs(period: Date[]): Promise<string[]> {
  const usedNames = new Set<string>();

  for (const date of period) {
    const dayMonthYear = format(date, "yyyy-MM-dd");
    const monthYear = format(date, "yyyy-MM");
    const dayWeek = format(date, "E");
    const month = format(date, "MM");

    const tariffs = await getTariff(dayMonthYear, monthYear);

    const isWeekend =
      daysOfWeekend.includes(dayWeek) ||
      (dayWeek === "Thu" && (month === "07" || month === "01"));

    const applied = isWeekend ? tariffs.tariff_we : tariffs.tariff_mw;

    if (applied?.name) {
      usedNames.add(applied.name);
    }
  }

  return Array.from(usedNames);
}
