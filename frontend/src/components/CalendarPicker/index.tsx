import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect } from "react";
import { DateRangePicker } from "react-date-range";
import {
  useGenerateTariff,
  useGenerateTariffCorporate,
} from "../../context/generateTariff/generateTariff";
import useQuery from "../../hooks/urlQuery/query";
import { getUnitUsing } from "../../context/generateTariff/functions/getters/getUnitUsing";

export const CalendarPicker = ({ corporate = false }) => {
  const {
    handleSelectDate,
    holidays,
    monthsWithTariffs,
    selectionRange,
    setUnitUsing,
    setStateApp,
    staff,
  } = corporate
    ? useGenerateTariffCorporate()
    : { ...useGenerateTariff(), staff: false };

  const query = useQuery();
  function customDayContent(day: Date) {
    let extraDot = null;
    if (holidays.includes(format(day, "yyyy-MM-dd"))) {
      extraDot = (
        <div
          style={{
            height: "5px",
            width: "5px",
            borderRadius: "100%",
            background: "orange",
            position: "absolute",
            top: 2,
            right: 2,
          }}
        />
      );
    }
    return (
      <div>
        {extraDot}
        <span>{format(day, "d")}</span>
      </div>
    );
  }

  function customDisableDays(day: Date) {
    if (holidays.includes(format(day, "yyyy-MM-dd"))) return false;
    else if (monthsWithTariffs.includes(format(day, "yyyy-MM"))) return false;
    return true;
  }

  async function whenChangeSelectionRange() {
    setUnitUsing([]);
    const response = await getUnitUsing(selectionRange[0]);
    setStateApp(response.response);
    setUnitUsing(response.units);
  }

  useEffect(() => {
    if (query.get("check-in") && query.get("check-out")) {
      setTimeout(() => {
        handleSelectDate({
          selection: {
            startDate: new Date(query.get("check-in")!),
            endDate: new Date(query.get("check-out")!),
            key: "selection",
          },
        });
      }, 1000);
    }
  }, []);

  useEffect(() => {
    whenChangeSelectionRange();
    // callHandleForm()
  }, [selectionRange]);

  useEffect(() => {
    if (staff) {
      handleSelectDate({
        second: {
          startDate: selectionRange[0].startDate,
          endDate: selectionRange[0].startDate,
          key: "second",
          color: "#2b9364bf",
        },
      });
    } else {
      handleSelectDate({ clear: true });
    }
  }, [staff]);

  return (
    <>
      <DateRangePicker
        ranges={selectionRange}
        onChange={handleSelectDate}
        months={2}
        showDateDisplay={corporate}
        disabledDay={customDisableDays}
        dayContentRenderer={customDayContent}
        direction="horizontal"
        locale={ptBR}
      />
      <input
        type="hidden"
        value={JSON.stringify(selectionRange)}
        name="rangeDate"
      />
    </>
  );
};
