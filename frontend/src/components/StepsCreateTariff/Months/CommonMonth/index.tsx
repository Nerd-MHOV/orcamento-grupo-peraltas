import { Autocomplete, TextField } from "@mui/material";
import { addMonths, addYears, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useContext, useEffect, useState } from "react";
import { CreateTariffContext } from "../../../../context/createTariff/createTariff";
import { useApi } from "../../../../hooks/api/api";

interface CommonMonthOptionsProps {
  label: string;
  date: string;
  disabled: boolean;
}

export const CommonMonths = () => {
  const { setDates } = useContext(CreateTariffContext);
  const api = useApi();
  const [options, setOptions] = useState<CommonMonthOptionsProps[]>([]);

  const getMonth = async () => {
    let nowMonth = new Date();
    nowMonth.setMonth(0);
    let maxMonth = addYears(nowMonth, 2);
    let monthOptions = [];
    const selectedMonths = await api.tariff.common.get();

    while (nowMonth < maxMonth) {
      let disabled = false;
      selectedMonths.map((month) => {
        if (month.date === format(nowMonth, "yyyy-MM")) disabled = true;
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
  return (
    <div className="common-month">
      <Autocomplete
        multiple
        size="small"
        options={options}
        getOptionDisabled={(option) => option.disabled}
        sx={{ maxWidth: 400, margin: "0 auto" }}
        onChange={(event, value) => {
          let dates = value.map((date) => date.date);
          setDates(dates);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Meses aplicados"
            type="text"
            variant="standard"
          />
        )}
      />
    </div>
  );
};
