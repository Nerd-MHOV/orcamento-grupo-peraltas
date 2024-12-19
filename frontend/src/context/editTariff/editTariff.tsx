import { createContext, useState } from "react";
import { useApi } from "../../hooks/api/api";
import {
  CheckInValuesProps,
  FoodProps,
  GroupValuesProps,
  SpecificTariffProps,
  TariffValuesProps,
} from "../../hooks/api/interfaces";
import { initTariffContext } from "./initials";
import {
  keyUH,
  EditTariffContextProps,
  EditTariffContextProviderProps,
  keyGroup,
} from "./interface";

export const EditTariffContext = createContext<EditTariffContextProps>({
  tariff: initTariffContext,
  getTariffType: () => "mds",
  getDates: () => [],
  setDates: (dates) => {},
  next(active) {},
  activeStep(step) {},
  getValue: () => {
    return undefined;
  },
  getFoodValue() {
    return undefined;
  },
  getEarlyValue(time) {
    return undefined;
  },
  setUHValue(category, group, value) {},
  setFoodValue(group, value) {},
  setAllFoodValue(values) {},
  setEarlyEntryValue(time, group, value) {},
  getFoodID() {
    return undefined;
  },
  updateTariff: async () => {},
  loading: false,
  stateResponse: "error",
});

export const EditTariffContextProvider = ({
  children,
  tariff,
  next,
  activeStep,
}: EditTariffContextProviderProps) => {
  const api = useApi();
  const [loading, setLoading] = useState(true);
  const [stateResponse, setStateResponse] = useState<"success" | "error">(
    "success"
  );

  const getTariffType = () => {
    return tariff?.SpecificDates && tariff?.SpecificDates?.length > 0
      ? "specific"
      : tariff?.tariffs_to_midweek && tariff.tariffs_to_midweek.length > 0
      ? "mds"
      : "fds";
  };

  const getDates = () => {
    if (getTariffType() == "mds") {
      return tariff?.tariffs_to_midweek
        ? tariff?.tariffs_to_midweek.map((date) => date.date)
        : [];
    }

    if (getTariffType() == "fds") {
      return tariff?.tariffs_to_weekend
        ? tariff?.tariffs_to_weekend.map((date) => date.date)
        : [];
    }

    return tariff?.SpecificDates
      ? tariff?.SpecificDates.map((date) => date.date)
      : [];
  };

  const getValue = (category: keyUH) => {
    return tariff?.TariffValues?.find((key) => key.category_id === category);
  };

  const getFoodID = () => {
    return tariff?.food_id;
  };

  const getFoodValue = () => {
    return tariff?.food;
  };

  const getEarlyValue = (time: "10h" | "12h") => {
    return tariff?.TariffCheckInValues?.find((key) => key.type === time);
  };

  const setDates = (dates: string[]) => {
    dates = dates.sort();
    if (getTariffType() == "specific" && tariff?.SpecificDates) {
      tariff.SpecificDates = dates.map((date) => {
        if (tariff.SpecificDates)
          return {
            date: date,
            tariffs_id: tariff.SpecificDates[0].tariffs_id,
          };
        return {
          date: "",
          tariffs_id: "",
        };
      });

      return;
    }

    if (getTariffType() == "fds" && tariff?.tariffs_to_weekend) {
      tariff.tariffs_to_weekend = dates.map((date) => {
        if (tariff.tariffs_to_weekend)
          return {
            date: date,
            tariff_to_midweek_id:
              tariff.tariffs_to_weekend[0].tariff_to_midweek_id,
            tariff_to_weekend_id:
              tariff.tariffs_to_weekend[0].tariff_to_weekend_id,
          };

        return {
          date: "",
          tariff_to_weekend_id: "",
          tariff_to_midweek_id: "",
        };
      });

      return;
    }

    if (getTariffType() == "mds" && tariff?.tariffs_to_midweek) {
      tariff.tariffs_to_midweek = dates.map((date) => {
        if (tariff.tariffs_to_midweek)
          return {
            date: date,
            tariff_to_midweek_id:
              tariff.tariffs_to_midweek[0].tariff_to_midweek_id,
            tariff_to_weekend_id:
              tariff.tariffs_to_midweek[0].tariff_to_weekend_id,
          };

        return {
          date: "",
          tariff_to_weekend_id: "",
          tariff_to_midweek_id: "",
        };
      });

      return;
    }
  };

  const setUHValue = (category: keyUH, group: keyGroup, value: number) => {
    tariff?.TariffValues?.find((key) => {
      if (key.category_id === category) {
        key[group] = value;
      }
    });
  };

  const setFoodValue = (group: keyGroup, value: number) => {
    if (tariff?.food) tariff.food[group] = value;
  };

  const setAllFoodValue = (values: GroupValuesProps) => {
    if (tariff?.food)
      tariff.food = {
        id: tariff?.food.id,
        ...values,
      };
  };

  const setEarlyEntryValue = (
    time: "10h" | "12h",
    group: keyGroup,
    value: number
  ) => {
    if (tariff?.TariffCheckInValues)
      tariff.TariffCheckInValues.find((key) => {
        if (key.type === time) {
          key[group] = value;
        }
      });
  };

  const updateTariff = async () => {
    if (tariff === undefined) return;
    if (getTariffType() !== "specific") {
      const response = await api.tariff.common.update(
        tariff.name,
        tariff.product_rd,
        tariff.TariffValues as TariffValuesProps[],
        tariff.TariffCheckInValues as CheckInValuesProps[],
        tariff.food as FoodProps
      );

      setStateResponse(response.msg);
      setLoading(false);
    } else {
      const response = await api.tariff.specific.update(
        tariff.name,
        tariff.product_rd,
        tariff.TariffValues as TariffValuesProps[],
        tariff.TariffCheckInValues as CheckInValuesProps[],
        tariff.food as FoodProps,
        tariff.SpecificDates as SpecificTariffProps[]
      );
      setStateResponse(response.msg);
      setLoading(false);
    }
  };

  return (
    <EditTariffContext.Provider
      value={{
        tariff: tariff || initTariffContext,
        getTariffType,
        getDates,
        setDates,
        next,
        activeStep,
        getValue,
        getFoodID,
        getFoodValue,
        getEarlyValue,
        setUHValue,
        setFoodValue,
        setAllFoodValue,
        setEarlyEntryValue,
        updateTariff,
        loading,
        stateResponse,
      }}
    >
      {children}
    </EditTariffContext.Provider>
  );
};
