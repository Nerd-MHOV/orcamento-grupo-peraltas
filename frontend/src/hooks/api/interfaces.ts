import {
  BudgetsContentProps,
  BudgetsFavoritesProps,
} from "../../components/TableCollapseBudgets/helpers";
import { DateRange, RoomCorporate } from "../../context/generateTariff/interfaces/corporateProps";
import RequirementSubmitProps from "../../context/generateTariff/interfaces/requirementSubmitProps";

export interface AllTariffsProps {
  name: string;
  product_rd: string;
  active: boolean;
  order_id: number;
  food_id: number;
  food?: FoodProps;
  TariffCheckInValues?: CheckInValuesProps[];
  TariffValues?: TariffValuesProps[];
  tariffs_to_midweek?: CommonTariffProps[];
  tariffs_to_weekend?: CommonTariffProps[];
  SpecificDates?: SpecificTariffProps[];
}

export interface ApiDiscountProps {
  id: string;
  name: string;
  percent_general: {
    occupancy: number,
    percent: number,
  }[];
  percent_unitary: {
    occupancy: number,
    percent: number,
  }[];
  daily_courtesy: boolean;
  daily_minimum: number;
  daily_maximum: number;
  payers_minimum: number;
  applicable_in: "midweek" | "weekend" | "all";
  active: boolean;
  dates: ApiDiscountDateProps[];
}

export interface ApiDiscountDateProps {
  date: string;
  discount_id: string;
}

export interface GroupValuesProps {
  adt: number;
  adtex: number;
  chd0: number;
  chd4: number;
  chd8: number;
}

export interface FoodProps extends GroupValuesProps {
  id: number;
}
export interface CheckInValuesProps extends GroupValuesProps {
  id: number;
  tariffs_id: string;
  type: string;
}

export interface TariffValuesProps extends GroupValuesProps {
  id: number;
  tariffs_id: string;
  category_id: string;
}

export interface CommonTariffProps {
  date: string;
  tariff_to_midweek_id: string;
  tariff_to_weekend_id: string;
}

export interface SpecificTariffProps {
  date: string;
  tariffs_id: string;
}

export interface FindMonthWithTariffProps {
  date: string;
  tariff_to_midweek_id: string;
  tariff_to_weekend_id: string;
}

export interface FindHolidaysProps {
  date: string;
  tariffs_id: string;
}

export interface ApiUserProps {
  id: string;
  name: string;
  username: string;
  email: string;
  level: number;
  phone: string;
  token_rd: string;
  user_rd: string;
  active: boolean;
}

export interface ApiSavedBudgetsProps {
  id: string;
  user_id: string;
  responsible: ApiUserProps;
  createdAt: Date;
  budgets: BudgetsContentProps[];
  favorites: BudgetsFavoritesProps[];
  name: string;
  status: string;
}

export interface RoomCorporateResponse extends RoomCorporate {
  rowsValues: ResponseValues
}

export type RowsPropsApi = {
  id: number;
  desc: string;
  values: number[];
  total: number;
  type: string;
  noDiscount: number[];
  totalNoDiscount: number;
  discountApplied: number;
};
export interface ResponseValues { 
  rows: RowsPropsApi[],
  total: RowsPropsApi,
}
export interface CorporateBodyResponseBudget {
  rooms: RoomCorporateResponse[],
  pension: string
  agencyPercent: number,
  requirements: RequirementSubmitProps[],
  dateRange: DateRange[],
  idClient: string | null,
  rowsValues: ResponseValues
}

export interface ApiRequirementsProps {
  name: string;
  price: number;
  typeModal: 'ticket' | 'person' | 'amount' | 'participant';
  type: "accommodation" | 'corporate' | 'both' | 'location';
  active: boolean;
}

export type TariffTypesProps = "specific" | "common";
