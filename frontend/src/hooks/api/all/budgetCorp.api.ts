import { AxiosInstance } from "axios";
import { CorporateBodySendBudget } from "../../../context/generateTariff/interfaces/corporateProps";
import { CorporateBodyResponseBudget } from "../interfaces";

export const budgetCorp = (api: AxiosInstance) => ({
  get: async (
    request: CorporateBodySendBudget
  ): Promise<CorporateBodyResponseBudget> => {
    const response = await api.post("/budget-corp", request);
    return response.data;
  },
  save: async (
    user_id: string,
    budget: CorporateBodyResponseBudget,
    remake = true,
    name = ""
  ) => {
    const response = await api.post("/save-budget-corp", {
      user_id,
      budget,
      remake,
      name,
    });

    return response.data;
  },
});
