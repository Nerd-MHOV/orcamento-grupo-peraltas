import { addDays, format } from "date-fns";
import { prismaClient } from "../../../database/prismaClient";
import { getTariff } from "./getTariff";
import getPercentAdjustmentCorp from "./getPercentAdjustmentCorp";
import inMainPeriod from "./inMainPeriod";

const daysOfWeekend = ["Fri", "Sat", "Sun"];

export async function generateBudget(
  mainPeriod: Date[],
  completePeriod: Date[],
  arrForm: any,
  ageGroup: "adt" | "adtex" | "chd0" | "chd4" | "chd8",
  onlyFood: boolean,
  daily_courtesy: boolean,
  isCorporate: boolean,
) {
  const valuesBudget = await Promise.all(completePeriod.map(async (date) => {
    let tariffBudget = 0;
    // verifica se essa data é cobrada
    if (!inMainPeriod(mainPeriod, date)) return tariffBudget

    /// REMOVE LATER - essa regra esta sendo criada apenas para janeiro de 2025 --------- START

    const isFirstDayJanuary2025 = date == mainPeriod[0] || date == mainPeriod[1] || date == mainPeriod[2];

    /// REMOVE LATER - essa regra esta sendo criada apenas para janeiro de 2025 --------- FIM

    let dayMonthYear = format(date, "yyyy-MM-dd");
    let monthYear = format(date, "yyyy-MM");
    let dayWeek = format(date, "E");
    let month = format(date, "MM");
    let tariffs = await getTariff(dayMonthYear, monthYear, isFirstDayJanuary2025);

    let numCategory = (await prismaClient.categories.findFirst({
      where: {
        name: arrForm.category,
      },
    })) || { id: 0 };

    let pension = 0;
    if (arrForm.pension === "simples") pension = 0;
    if (arrForm.pension === "meia") pension = 1;
    if (arrForm.pension === "completa") pension = 2;

    if (tariffs.tariff_mw) {
      let tariffWeek;
      let tariffFood = 0;
      if (
        daysOfWeekend.includes(dayWeek) ||
        (dayWeek === "Thu" && (month === "07" || month === "01"))
      ) {
        tariffWeek = tariffs.tariff_we.TariffValues;
        tariffFood = tariffs.tariff_we.food[ageGroup] * pension;
      } else {
        tariffWeek = tariffs.tariff_mw.TariffValues;
        tariffFood = tariffs.tariff_mw.food[ageGroup] * pension;
      }

      let tariffDay = tariffWeek.filter(
        (arr: any) => arr.category_id === numCategory.id
      )[0];

      let tariffDayAgeGroup = tariffDay[ageGroup]
      if (isCorporate) {
        tariffDayAgeGroup = Math.round(tariffDayAgeGroup * (1 - getPercentAdjustmentCorp(date)));
      }
      tariffBudget = tariffDayAgeGroup + tariffFood;

      if (onlyFood) tariffBudget = 90;
    }

    if (daily_courtesy && date == mainPeriod[mainPeriod.length - 1]) {
      tariffBudget = 0;
    }

    return tariffBudget;
  }))
  return valuesBudget;
}
