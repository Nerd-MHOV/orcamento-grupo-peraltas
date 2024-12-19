import { AxiosInstance } from "axios";
import {
  AllTariffsProps,
  CheckInValuesProps,
  FindMonthWithTariffProps,
  FoodProps,
  TariffValuesProps,
} from "../interfaces";

export const tariffCommon = (api: AxiosInstance) => ({
  get: async (): Promise<FindMonthWithTariffProps[]> => {
    const response = await api.get("/common-date");
    return response.data;
  },
  create: async (tariffs: AllTariffsProps[]): Promise<"success" | "error"> => {
    const response = await api.post("/common-date", { tariffs: tariffs });
    return response.data.msg;
  },
  update: async (
    name: string,
    product_rd: string,
    values: TariffValuesProps[],
    checkIn: CheckInValuesProps[],
    food: FoodProps
  ) => {
    const response = await api.put("/common-date/" + name, {
      product_rd,
      values,
      checkIn,
      food,
    });
    return response.data;
  },
});
