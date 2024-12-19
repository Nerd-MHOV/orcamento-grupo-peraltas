import { addDays, differenceInDays, format } from "date-fns";
import { useApi } from "../../../../hooks/api/api";
import { ApiDiscountProps } from "../../../../hooks/api/interfaces";

export const getAllowedDiscount = async (
  selectionRange: {
    startDate: Date;
    endDate: Date;
    key: string;
  },
  payers: number
) => {
  const api = useApi();
  const discountData = await api.discount.get();
  let initialDate = selectionRange.startDate;
  let finalDate = selectionRange.endDate;
  let days = differenceInDays(finalDate, initialDate);
  let actionsInPeriod: ApiDiscountProps[] = [];
  let isWeekend = false;

  while (initialDate <= finalDate) {
    discountData.map((el) => {
      el.dates.map((date) => {
        if (date.date === format(initialDate, "yyyy-MM-dd")) {
          const isDuplicated = actionsInPeriod.find((obj) => obj.id === el.id);
          if (
            days >= el.daily_minimum &&
            days <= el.daily_maximum &&
            payers >= el.payers_minimum &&
            !isDuplicated
          ) {
            if (initialDate.getDay() == 6) isWeekend = true;
            actionsInPeriod.push(el);
          }
        }
      });
    });

    //filtrar se são somente fim de semana ou meio de semana
    if (isWeekend) {
      actionsInPeriod = actionsInPeriod.filter(
        (action) => action.applicable_in !== "midweek"
      );
    } else {
      actionsInPeriod = actionsInPeriod.filter(
        (action) => action.applicable_in !== "weekend"
      );
    }

    initialDate = addDays(initialDate, 1);
  }

  return actionsInPeriod;
};
