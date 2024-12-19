import { AxiosInstance } from "axios";
import { ApiDiscountProps } from "../interfaces";

export const discount = (api: AxiosInstance) => ({
  get: async (): Promise<ApiDiscountProps[]> => {
    const response = await api.get("/discount");
    return response.data;
  },
  create: async (
    name: string,
    percent_general: {
      occupancy: number;
      percent: number;
    }[],
    percent_unitary: {
      occupancy: number;
      percent: number;
    }[],
    daily_minimum: number,
    daily_maximum: number,
    payers_minimum: number,
    dates: { date: string }[],
    daily_courtesy: boolean,
    applicable_in: "midweek" | "weekend" | "all"
  ): Promise<"success" | "error"> => {
    const response = await api.post("/discount", {
      name,
      percent_general,
      percent_unitary,
      dates,
      daily_courtesy,
      daily_minimum,
      daily_maximum,
      payers_minimum,
      applicable_in,
    });
    return response.data.msg;
  },
  delete: async (id: string) => {
    const response = await api.delete("/discount/" + id);
    return response.data;
  },
  update: async (
    id: string,
    percent_general: {
      occupancy: number;
      percent: number;
    }[],
    percent_unitary: {
      occupancy: number;
      percent: number;
    }[],
    dates: { date: string }[]
  ): Promise<"success" | "error"> => {
    const response = await api.put("/discount/" + id, {
      percent_general,
      percent_unitary,
      dates,
    });
    return response.data.msg;
  },
  toggleActive: async (id: string) => {
    const response = await api.put(`/discount/${id}/active`);
    return response.data;
  },
  toggleDailyCourtesy: async (id: string) => {
    const response = await api.put(`/discount/${id}/daily_courtesy`);
    return response.data;
  },
});
