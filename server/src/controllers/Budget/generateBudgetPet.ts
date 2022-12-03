import { addDays, format } from "date-fns";
import { prismaClient } from "../../database/prismaClient";
import { getTariff } from "./getTariff";

const daysOfWeekend = ["Fri", "Sat", "Sun"];

export async function generateBudgetPet(
  initDate: Date,
  finalDate: Date,
  arrForm: any,
  carrying: "pequeno" | "médio" | "grande"
) {
  const valuesBudget = [];
  while (initDate < finalDate) {
    let dayMonthYear = format(initDate, "yyyy-MM-dd");
    let tariffBudget = 0;
    let tariffs = await prismaClient.pet.findMany();

    let tariffSpecific = tariffs.filter((arr) => arr.carrying === carrying);
    if (tariffSpecific) tariffBudget = tariffSpecific[0].daily_price;

    valuesBudget.push(tariffBudget);

    initDate = addDays(initDate, 1);
  }

  return valuesBudget;
}
