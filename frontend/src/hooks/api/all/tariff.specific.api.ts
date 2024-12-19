import { AxiosInstance } from "axios";
import {
  AllTariffsProps,
  CheckInValuesProps,
  FindHolidaysProps,
  FoodProps,
  SpecificTariffProps,
  TariffValuesProps,
} from "../interfaces";

export const tariffSpecific = (api: AxiosInstance) => ({
  getHolidays: async (): Promise<FindHolidaysProps[]> => {
    const response = await api.get("/specific-date");
    return response.data;
  },
  create: async (tariffs: AllTariffsProps[]): Promise<"success" | "error"> => {
    const response = await api.post("/specific-date", { tariffs: tariffs });
    return response.data.msg;
  },
  update: async (
    name: string,
    product_rd: string,
    values: TariffValuesProps[],
    checkIn: CheckInValuesProps[],
    food: FoodProps,
    dates: SpecificTariffProps[]
  ) => {
    const response = await api.put("/specific-date/" + name, {
      product_rd,
      values,
      checkIn,
      food,
      dates,
    });
    return response.data;
  },
});
