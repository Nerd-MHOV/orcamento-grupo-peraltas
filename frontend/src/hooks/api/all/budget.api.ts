import { AxiosInstance } from "axios";
import { ApiSavedBudgetsProps } from "../interfaces";
import RequirementSubmitProps from "../../../context/generateTariff/interfaces/requirementSubmitProps";
import { selectionRange } from "../../../context/generateTariff/functions/handleForm";
import RowModalDiscount from "../../../context/generateTariff/interfaces/rowModalDiscount";
import DataContentProps from "../../../context/generateTariff/interfaces/tableBudgetDataContentProps";

export const budget = (api: AxiosInstance) => ({
  getSaved: async (
    query: string,
    favorites: boolean
  ): Promise<ApiSavedBudgetsProps[]> => {
    const response = await api.get("/budget?q=" + query + "&f=" + favorites);
    return response.data;
  },
  get: async (
    arrForm: any,
    arrChild: string[],
    arrPet: string[],
    arrRequirement: RequirementSubmitProps[],
    rangeDate: selectionRange,
    unitaryDiscount: RowModalDiscount[],
    dailyCourtesy: boolean
  ) => {
    const response = await api.post("/budget", {
      arrForm,
      arrChild,
      arrPet,
      arrRequirement,
      rangeDate,
      unitaryDiscount,
      dailyCourtesy,
    });
    return response.data;
  },
  save: async (
    user_id: string,
    budgets: DataContentProps[],
    remake = true,
    name = ""
  ) => {
    const budgetId = budgets.find(
      (obj) => obj.arrComplete?.responseForm.rd_client
    );
    if (budgetId) {
      budgets.forEach((obj) => {
        obj.arrComplete!.responseForm.rd_client =
          budgetId.arrComplete?.responseForm.rd_client;
      });
    }

    const response = await api.post("/save-budget", {
      user_id,
      budgets,
      remake,
      name,
    });

    return response.data;
  },
  rename: async (id: string, name: string) => {
    const response = await api.put("/save-budget/rename", {
      id,
      name,
    });
    return response.data;
  },
  favorite: async (id: string) => {
    const response = await api.put("/favorite/" + id);
    return response.data;
  },
});
