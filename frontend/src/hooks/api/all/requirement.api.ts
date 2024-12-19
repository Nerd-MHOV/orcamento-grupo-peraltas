import { AxiosInstance } from "axios";
import { ApiRequirementsProps } from "../interfaces";

export const requirement = (api: AxiosInstance) => ({
  get: async (): Promise<ApiRequirementsProps[]> => {
    const response = await api.get("/requirement");
    return response.data;
  },
  getByName: async (name: string): Promise<ApiRequirementsProps> => {
    const response = await api.post("/requirement/unique", {
      name,
    });

    return response.data;
  },
  create: async (
    name: string,
    price: number,
    type: string,
    typeModal: string
  ) => {
    const response = await api.post("/requirement", {
      name,
      price,
      type,
      typeModal,
    });
    return response.data;
  },
  delete: async (name: string) => {
    const response = await api.delete("/requirement/" + name);
    return response.data;
  },
  active: async (name: string) => {
    const response = await api.put("/requirement/active/" + name);
    return response.data;
  },
  price: async (name: string, price: number) => {
    const response = await api.put("/requirement/price", {
      name,
      price,
    });

    return response.data;
  },
});
