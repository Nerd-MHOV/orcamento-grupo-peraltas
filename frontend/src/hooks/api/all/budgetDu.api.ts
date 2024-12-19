import { AxiosInstance } from "axios";
import RequirementSubmitProps from "../../../context/generateTariff/interfaces/requirementSubmitProps";
import { selectionRange } from "../../../context/generateTariff/functions/handleForm";
import RowModalDiscount from "../../../context/generateTariff/interfaces/rowModalDiscount";

export const budgetDu = (api: AxiosInstance) => ({
  get: async (
    arrForm: any,
    arrChild: string[],
    arrPet: string[],
    arrRequirement: RequirementSubmitProps[],
    rangeDate: selectionRange,
    unitaryDiscount: RowModalDiscount[]
  ) => {
    const response = await api.post("/budget-du", {
      arrForm,
      arrChild,
      arrPet,
      arrRequirement,
      rangeDate,
      unitaryDiscount,
    });
    return response.data;
  },
});
