import { addDays, format, isDate } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useContext, useEffect, useState } from "react";
import { DateRange } from "react-date-range";
import { EditTariffContext } from "../../../../context/editTariff/editTariff";
import { useApi } from "../../../../hooks/api/api";
import { FindHolidaysProps } from "../../../../hooks/api/interfaces";
const initialDays = {
  startDate: new Date(),
  endDate: new Date(),
  key: "selection",
};

export const SpecificMonth = () => {
  const { setDates, getDates, next } = useContext(EditTariffContext);
  const api = useApi();
  const [days, setDays] = useState<{
    startDate: Date;
    endDate: Date;
    key: string;
  }>(initialDays);
  const [holidays, setHolidays] = useState<FindHolidaysProps[]>([]);

  const getHolidays = async () => {
    const response = await api.tariff.specific.getHolidays();
    setHolidays(response);
  };

  const handleGetDays = (ranges: { startDate: Date; endDate: Date }) => {
    if (isDate(ranges.startDate) && isDate(ranges.endDate)) {
      let stringDates = [];
      let init = ranges.startDate;
      while (init <= ranges.endDate) {
        stringDates.push(format(init, "yyyy-MM-dd"));
        init = addDays(init, 1);
      }
      setDates(stringDates);
    }
  };

  const getDays = () => {
    const firstDay = getDates()[0].split("-");
    const lastDay = getDates()[getDates().length - 1].split("-");
    setDays({
      startDate: new Date(
        Number(firstDay[0]),
        Number(firstDay[1]) - 1,
        Number(firstDay[2])
      ),
      endDate: new Date(
        Number(lastDay[0]),
        Number(lastDay[1]) - 1,
        Number(lastDay[2])
      ),
      key: "selection",
    });
  };

  useEffect(() => {
    getHolidays();
    getDays();
    next(true);
  }, []);

  return (
    <div
      className="specific-month"
      style={{ display: "flex", width: "100%", justifyContent: "center" }}
    >
      <DateRange
        ranges={[days]}
        onChange={(ranges) => {
          if (
            typeof ranges.selection.startDate !== "undefined" &&
            typeof ranges.selection.endDate !== "undefined"
          ) {
            handleGetDays({
              startDate: ranges.selection.startDate,
              endDate: ranges.selection.endDate,
            });
            setDays({
              startDate: ranges.selection.startDate,
              endDate: ranges.selection.endDate,
              key: "selection",
            });
          }
        }}
        locale={ptBR}
        disabledDay={(day: Date) => {
          let holidaysDates = holidays.map((day) => day.date);
          if (
            holidaysDates.includes(format(day, "yyyy-MM-dd")) &&
            !getDates().includes(format(day, "yyyy-MM-dd"))
          )
            return true;
          return false;
        }}
      />
    </div>
  );
};
