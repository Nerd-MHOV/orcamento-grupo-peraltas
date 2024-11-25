import { prismaClient } from "../../../database/prismaClient";

export async function getTariff(specificDay: string, commonDay: string, isFirstDayJanuary2025 = false) {
  const responseSpecific = await prismaClient.specificDates.findFirst({
    where: {
      date: specificDay,
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


  /// REMOVE LATER - essa regra esta sendo criada apenas para janeiro de 2025 --------- START

  const isJanuary2025 = specificDay === "2025-01-01" || specificDay === "2025-01-02" || specificDay === "2025-01-03";

  /// REMOVE LATER - essa regra esta sendo criada apenas para janeiro de 2025 --------- FIM

  if (responseSpecific && !(isFirstDayJanuary2025 && isJanuary2025)) {
    return {
      type: "specific",
      tariff_mw_id: responseSpecific.tariffs_id,
      tariff_we_id: responseSpecific.tariffs_id,
      tariff_mw: responseSpecific.tariffs,
      tariff_we: responseSpecific.tariffs,
    };
  }

  const responseCommon = await prismaClient.commonDates.findFirst({
    where: {
      date: commonDay,
    },
    include: {
      tariff_to_midweek: {
        include: {
          food: true,
          TariffValues: true,
        },
      },
      tariff_to_weekend: {
        include: {
          food: true,
          TariffValues: true,
        },
      },
    },
  });

  if (responseCommon) {
    return {
      type: "common",
      tariff_mw_id: responseCommon.tariff_to_midweek_id,
      tariff_we_id: responseCommon.tariff_to_weekend_id,
      tariff_mw: responseCommon.tariff_to_midweek,
      tariff_we: responseCommon.tariff_to_weekend,
    };
  }

  return {
    type: "Not Found Tariff",
  };
}
