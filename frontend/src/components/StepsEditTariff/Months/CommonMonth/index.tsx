import { Autocomplete, TextField } from "@mui/material";
import { addMonths, addYears, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useContext, useEffect, useState } from "react";
import { EditTariffContext } from "../../../../context/editTariff/editTariff";
import { useApi } from "../../../../hooks/api/api";

interface CommonMonthOptionsProps {
  label: string;
  date: string;
  disabled: boolean;
}

export const CommonMonths = () => {
  const api = useApi();
  const { setDates, getDates, next } = useContext(EditTariffContext);
  const [options, setOptions] = useState<CommonMonthOptionsProps[]>([]);
  const [selected, setSelected] = useState<CommonMonthOptionsProps[]>([]);

  const getMonth = async () => {
    let nowMonth = new Date();
    nowMonth.setMonth(0);
    let maxMonth = addYears(nowMonth, 2);
    let monthOptions = [];
    const selectedMonths = await api.tariff.common.get();

    while (nowMonth < maxMonth) {
      let disabled = false;
      selectedMonths.map((month) => {
        if (
          month.date === format(nowMonth, "yyyy-MM") &&
          !getDates().includes(month.date)
        )
          disabled = true;
      });

      monthOptions.push({
        label: format(nowMonth, "MMMM yyyy", { locale: ptBR }),
        date: format(nowMonth, "yyyy-MM"),
        disabled: disabled,
      });
      nowMonth = addMonths(nowMonth, 1);
    }

    setOptions(monthOptions);
  };

  useEffect(() => {
    getMonth();
  }, []);

  useEffect(() => {
    next(false);
    if (selected.length > 0) {
      next(true);
    }
  }, [selected]);

  useEffect(() => {
    const selectDates = getDates().map((date) => {
      const arrayDate = date.split("-");
      const dateSingle = new Date(
        Number(arrayDate[0]),
        Number(arrayDate[1]) - 1
      );
      return {
        label: format(dateSingle, "MMMM yyyy", { locale: ptBR }),
        date: date,
        disabled: false,
      };
    });

    setSelected(selectDates);
  }, [options]);

  return (
    <div className="common-month">
      <Autocomplete
        multiple
        size="small"
        options={options}
        value={selected}
        getOptionDisabled={(option) => option.disabled}
        sx={{ maxWidth: 400, margin: "0 auto" }}
        onChange={(event, value) => {
          let dates = value.map((date) => date.date);
          setDates(dates);
          setSelected(value);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Meses aplicados"
            type="text"
            variant="standard"
          />
        )}
        disabled
      />
    </div>
  );
};
