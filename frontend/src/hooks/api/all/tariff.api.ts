import { AxiosInstance } from "axios";
import { AllTariffsProps } from "../interfaces";
import { tariffSpecific } from "./tariff.specific.api";
import { tariffCommon } from "./tariff.common.api";

export const tariff = (api: AxiosInstance) => ({
  specific: tariffSpecific(api),
  common: tariffCommon(api),
  orm: async (date_in: Date, date_out: Date) => {
    const response = await api.post("/tariff_pipe", {
      date_in,
      date_out,
    });

    return response.data;
  },
  getById: async (tariff_id: string): Promise<AllTariffsProps> => {
    const response = await api.post("/tariff/unique", {
      tariff_id,
    });
    return response.data;
  },
  get: async (): Promise<AllTariffsProps[]> => {
    const response = await api.get("/tariff");
    return response.data;
  },
  delete: async (tariffs: string[]): Promise<"success" | "error"> => {
    const response = await api.post("/tariff/delete", { tariffs: tariffs });
    return response.data;
  },
  changeOrder: async (order_id: number, side: string) => {
    const response = await api.post("/tariff/order", { order_id, side });
    return response.data;
  },
  toggleActive: async (name: string, active: boolean) => {
    const response = await api.post("/tariff/active", {
      name,
      active,
    });
    return response.data;
  },
  getHus: async () => {
    const response = await api.get("/housing-units");
    return response.data;
  },
});
