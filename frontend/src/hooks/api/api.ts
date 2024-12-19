import axios from "axios";
import { selectionRange } from "../../context/generateTariff/functions/handleForm";
import RowModalDiscount from "../../context/generateTariff/interfaces/rowModalDiscount";
import RequirementSubmitProps from "../../context/generateTariff/interfaces/requirementSubmitProps";
import DataContentProps from "../../context/generateTariff/interfaces/tableBudgetDataContentProps";
import {
  AllTariffsProps,
  ApiDiscountProps,
  ApiRequirementsProps,
  ApiSavedBudgetsProps,
  CheckInValuesProps,
  CorporateBodyResponseBudget,
  FindHolidaysProps,
  FindMonthWithTariffProps,
  FoodProps,
  SpecificTariffProps,
  TariffValuesProps,
} from "./interfaces";
import { CorporateBodySendBudget } from "../../context/generateTariff/interfaces/corporateProps";
import { API_URL } from "../../config";
import { insights } from "./all/insights.api";
import { auth } from "./all/auth.api";
import { user } from "./all/user.api";
import { rd } from "./all/rd.api";
import { budget } from "./all/budget.api";
import { budgetDu } from "./all/budgetDu.api";
import { budgetCorp } from "./all/budgetCorp.api";
import { requirement } from "./all/requirement.api";
import { tariff } from "./all/tariff.api";
import { discount } from "./all/discount.api";

const storageData = localStorage.getItem("authToken");

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${storageData}`,
  },
});

export const useApi = () => ({
  insights: insights(api),
  auth: auth(api),
  user: user(api),
  rd: rd(api),
  budget: budget(api),
  budgetDu: budgetDu(api),
  budgetCorp: budgetCorp(api),
  requirement: requirement(api),
  tariff: tariff(api),
  discount: discount(api),
});
