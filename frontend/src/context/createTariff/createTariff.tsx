import { createContext, useState } from "react";
import {
  CreateTariffProps,
  keyGroup,
  keyUH,
} from "../../components/StepsCreateTariff/interfaces";
import { createData } from "../../components/TableCollapseTariffs/helpers";
import { useApi } from "../../hooks/api/api";
import { GroupValuesProps, TariffTypesProps } from "../../hooks/api/interfaces";
import {
  initValuesUHS,
  stepsCommon,
  stepsSpecific,
} from "../../pages/Tariffs/NewTariffs";
import { initialValue, initValues } from "./initials";
import { ContextTariffProps } from "./interface";

export const CreateTariffContext = createContext<ContextTariffProps>({
  arrTariffs: initialValue,
  typeTariff: "common",
  setTypeTariff() {},
  setDates() {},
  setEarlyEntryValues() {},
  setFoodValues() {},
  setAllFoodValues() {},
  setUHValues() {},
  getValues() {
    return {
      UHsValues: initValuesUHS,
      earlyEntryValues: {
        tenHour: initValues,
        twentyHour: initValues,
      },
      foodValue: initValues,
    };
  },
  next() {},
  setRelationTariffs() {},
  relationTariffs: [],
  foodPad: false,
  setFoodPad() {},
  activeStep() {},
  specificName: "",
  setSpecificName() {},
  loading: false,
  stateResponse: "success",
  createTariff() {},
});

export const CreateTariffContextProvider = ({
  children,
  next,
  step,
  activeStep,
}: {
  children: JSX.Element;
  next(active: boolean): void;
  step(steps: string[]): void;
  activeStep(step: number): void;
}) => {
  const api = useApi();
  const [loading, setLoading] = useState(true);
  const [stateResponse, setStateResponse] = useState<"success" | "error">(
    "success"
  );
  const [arrTariffs, setArrTariffs] = useState<CreateTariffProps>(initialValue);
  const [relationTariffs, setRelationTariffs] = useState<
    ReturnType<typeof createData>[]
  >([]);
  const [foodPad, setFoodPad] = useState(false);
  const [specificName, setSpecificName] = useState("");

  const setTypeTariff = (type: TariffTypesProps) => {
    next(false);
    setArrTariffs((prev) => {
      return {
        ...prev,
        type: type,
      };
    });
    next(true);
    if (type === "common") step(stepsCommon);
    else step(stepsSpecific);
  };

  const setDates = (dates: string[]) => {
    next(false);
    setArrTariffs((prev) => {
      return {
        ...prev,
        dates: dates,
      };
    });
    if (dates.length > 0) next(true);
  };

  const setFoodValues = (
    keyType: "specific" | "midweek" | "weekend",
    keyGroup: keyGroup,
    value: number
  ) => {
    next(true);
    setArrTariffs((prev) => {
      return {
        ...prev,
        tariffs: {
          ...prev.tariffs,
          [keyType]: {
            ...prev.tariffs[keyType],
            values: {
              ...prev.tariffs[keyType].values,
              foodValue: {
                ...prev.tariffs[keyType].values.foodValue,
                [keyGroup]: value,
              },
            },
          },
        },
      };
    });
  };

  const setAllFoodValues = (
    keyType: "specific" | "midweek" | "weekend",
    values: GroupValuesProps
  ) => {
    next(true);

    setArrTariffs((prev) => {
      return {
        ...prev,
        tariffs: {
          ...prev.tariffs,
          [keyType]: {
            ...prev.tariffs[keyType],
            values: {
              ...prev.tariffs[keyType].values,
              foodValue: values,
            },
          },
        },
      };
    });
  };

  const setEarlyEntryValues = (
    keyType: "specific" | "midweek" | "weekend",
    keyTypeEarly: "tenHour" | "twentyHour",
    keyGroup: keyGroup,
    value: number
  ) => {
    setArrTariffs((prev) => {
      return {
        ...prev,
        tariffs: {
          ...prev.tariffs,
          [keyType]: {
            ...prev.tariffs[keyType],
            values: {
              ...prev.tariffs[keyType].values,
              earlyEntryValues: {
                ...prev.tariffs[keyType].values.earlyEntryValues,
                [keyTypeEarly]: {
                  ...prev.tariffs[keyType].values.earlyEntryValues[
                    keyTypeEarly
                  ],
                  [keyGroup]: value,
                },
              },
            },
          },
        },
      };
    });
  };

  const setUHValues = (
    keyType: "specific" | "midweek" | "weekend",
    keyGroup: keyGroup,
    keyUH: keyUH,
    value: number
  ) => {
    next(true);
    setArrTariffs((prev) => {
      return {
        ...prev,
        tariffs: {
          ...prev.tariffs,
          [keyType]: {
            ...prev.tariffs[keyType],
            values: {
              ...prev.tariffs[keyType].values,
              UHsValues: {
                ...prev.tariffs[keyType].values.UHsValues,
                [keyUH]: {
                  ...prev.tariffs[keyType].values.UHsValues[keyUH],
                  [keyGroup]: value,
                },
              },
            },
          },
        },
      };
    });
  };

  const getValues = (keyType: "specific" | "midweek" | "weekend") => {
    return arrTariffs.tariffs[keyType].values;
  };

  const createTariff = async () => {
    if (arrTariffs.type === "common") {
      api.tariff.common.create(relationTariffs).then((response) => {
        setLoading(false);
        setStateResponse(response);
      });
    } else {
      api.tariff.specific.create(relationTariffs).then((response) => {
        setLoading(false);
        setStateResponse(response);
      });
    }
  };

  return (
    <CreateTariffContext.Provider
      value={{
        arrTariffs,
        setTypeTariff,
        typeTariff: arrTariffs.type,
        setDates,
        setFoodValues,
        setAllFoodValues,
        setEarlyEntryValues,
        setUHValues,
        getValues,
        next,
        setRelationTariffs,
        relationTariffs,
        foodPad,
        setFoodPad,
        activeStep,
        specificName,
        setSpecificName,
        loading,
        createTariff,
        stateResponse,
      }}
    >
      {children}
    </CreateTariffContext.Provider>
  );
};
