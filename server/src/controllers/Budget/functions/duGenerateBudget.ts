import { addDays, format, isWeekend } from "date-fns";
import { prismaClient } from "../../../database/prismaClient";

const daysOfWeekend = ["Fri", "Sat", "Sun"];

export async function duGenerateBudget(
  date: Date,
  arrForm: any,
  ageGroup: "adt" | "chd0" | "chd6"
) {
  const valuesBudget = [];
  let tariffBudget = 0;
  let tariffName = "";

  // verifica se é feriado ( sempre final de semana )
  const responseSpecific = await prismaClient.specificDates.findFirst({
    where: {
      date: format(date, "yyyy-MM-dd"),
    },
    include: {
      tariffs: {
        include: {
          food: true,
          TariffValues: true,
        },
      },
    },
  });

  if (arrForm.category.match(/Full/)) {
    if (isWeekend(date) || responseSpecific) {
      if (date.getFullYear() < 2026) tariffName = "Day-Use 2023 - Full - FDS";
      if (date.getMonth() < 6) tariffName = "Day-Use 2026 Janeiro - Full - FDS";
      tariffName = "Day-Use 2026 Julho - Full - FDS";
    } else {
      if (date.getFullYear() < 2026) tariffName = "Day-Use 2023 - Full - MDS";
      if (date.getMonth() < 6) tariffName = "Day-Use 2026 Janeiro - Full - MDS";
      tariffName = "Day-Use 2026 Julho - Full - MDS";
    }
  }

  if (arrForm.category.match(/Tradicional/)) {
    if (isWeekend(date) || responseSpecific) {
      if (date.getFullYear() < 2026)
        tariffName = "Day-Use 2023 - Tradicional - FDS";
      if (date.getMonth() < 6)
        tariffName = "Day-Use 2026 Janeiro - Tradicional - FDS";
      tariffName = "Day-Use 2026 Julho - Tradicional - FDS";
    } else {
      if (date.getFullYear() < 2026)
        tariffName = "Day-Use 2023 - Tradicional - MDS";
      if (date.getMonth() < 6)
        tariffName = "Day-Use 2026 Janeiro - Tradicional - MDS";
      tariffName = "Day-Use 2026 Julho - Tradicional - MDS";
    }
  }

  let tariffs = await prismaClient.dUTariff.findUnique({
    where: { name: tariffName },
    include: {
      DUTariffValues: true,
    },
  });

  if (tariffs) {
    tariffBudget = tariffs.DUTariffValues[0][ageGroup];
  }

  valuesBudget.push(tariffBudget);

  date = addDays(date, 1);

  return valuesBudget;
}
