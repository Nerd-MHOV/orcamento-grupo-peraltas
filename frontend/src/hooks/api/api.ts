import axios from "axios";
import {selectionRange} from "../../context/generateTariff/functions/handleForm";
import RowModalDiscount from "../../context/generateTariff/interfaces/rowModalDiscount";
import RequirementSubmitProps from "../../context/generateTariff/interfaces/requirementSubmitProps";
import DataContentProps from "../../context/generateTariff/interfaces/tableBudgetDataContentProps";
import {
    AllTariffsProps,
    ApiDiscountProps,
    ApiRequirementsProps,
    ApiSavedBudgetsProps,
    ApiUserProps,
    CheckInValuesProps,
    CorporateBodyResponseBudget,
    FindHolidaysProps,
    FindMonthWithTariffProps,
    FoodProps,
    SpecificTariffProps,
    TariffValuesProps,
} from "./interfaces";
import { CorporateBodySendBudget } from "../../context/generateTariff/interfaces/corporateProps";

const storageData = localStorage.getItem("authToken");

const api = axios.create({
    baseURL: "http://192.168.10.87:3335",
    headers: {
        Authorization: `Bearer ${storageData}`,
    },
});

export const useApi = () => ({
    validateToken: async () => {
        const response = await api.get("/validate");
        return response.data;
    },

    login: async (username: string, password: string) => {
        const response = await api.post("/login", {username, password});
        return response.data;
    },

    getUsers: async (): Promise<ApiUserProps[]> => {
        const response = await api.get("/user");
        return response.data;
    },

    getaUser: async (id: string): Promise<ApiUserProps> => {
        const response = await api.post("/unique-user", {id});
        return response.data;
    },

    getSavedBudgets: async (
        query: string,
        favorites: boolean
    ): Promise<ApiSavedBudgetsProps[]> => {
        const response = await api.get("/budget?q=" + query + "&f=" + favorites);
        return response.data;
    },

    getBudget: async (
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

    getBudgetDU: async (
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

    getBudgetCorp: async (request: CorporateBodySendBudget): Promise<CorporateBodyResponseBudget> => {
        const response = await api.post('/budget-corp', request)
        return response.data;
    },

    getRequirements: async (): Promise<ApiRequirementsProps[]> => {
        const response = await api.get("/requirement");
        return response.data;
    },

    getaRequirement: async (name: string): Promise<ApiRequirementsProps> => {
        const response = await api.post("/requirement/unique", {
            name,
        });

        return response.data;
    },

    getTariffPipe: async (date_in: Date, date_out: Date) => {
        const response = await api.post("/tariff_pipe", {
            date_in,
            date_out,
        });

        return response.data;
    },

    getaTariff: async (tariff_id: string): Promise<AllTariffsProps> => {
        const response = await api.post("/tariff/unique", {
            tariff_id,
        });
        return response.data;
    },

    getAllTariffs: async (): Promise<AllTariffsProps[]> => {
        const response = await api.get("/tariff");
        return response.data;
    },

    getAllDiscounts: async (): Promise<ApiDiscountProps[]> => {
        const response = await api.get("/discount");
        return response.data;
    },

    findUniqueUser: async (id: string) => {
        const response = await api.post("/unique-user", {id});
        return response.data;
    },

    findAllHousingUnits: async () => {
        const response = await api.get("/housing-units");
        return response.data;
    },

    findHolidays: async (): Promise<FindHolidaysProps[]> => {
        const response = await api.get("/specific-date");
        return response.data;
    },

    findMonthWithTariff: async (): Promise<FindMonthWithTariffProps[]> => {
        const response = await api.get("/common-date");
        return response.data;
    },

    createUser: async (
        name: string,
        email: string,
        phone: string,
        username: string,
        password: string,
        token_rd: string,
        user_rd: string
    ) => {
        const response = await api.post("/user", {
            name,
            email,
            phone,
            username,
            password,
            token_rd,
            user_rd,
        });

        return response;
    },

    createCommonTariff: async (
        tariffs: AllTariffsProps[]
    ): Promise<"success" | "error"> => {
        const response = await api.post("/common-date", {tariffs: tariffs});
        return response.data.msg;
    },

    createSpecificTariff: async (
        tariffs: AllTariffsProps[]
    ): Promise<"success" | "error"> => {
        const response = await api.post("/specific-date", {tariffs: tariffs});
        return response.data.msg;
    },

    createRequirement: async (name: string, price: number, type: string, typeModal: string) => {
        const response = await api.post("/requirement", {
            name,
            price,
            type,
            typeModal,
        });
        return response.data;
    },

    createDiscount: async (
        name: string,
        percent_general: number,
        percent_unitary: number,
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

    deleteTariff: async (tariffs: string[]): Promise<"success" | "error"> => {
        const response = await api.post("/tariff/delete", {tariffs: tariffs});
        return response.data;
    },

    deleteUser: async (id: string): Promise<"success" | "error"> => {
        const response = await api.delete("/user/" + id);
        return response.data;
    },

    deleteRequirement: async (name: string) => {
        const response = await api.delete("/requirement/" + name);
        return response.data;
    },

    deleteDiscount: async (id: string) => {
        const response = await api.delete("/discount/" + id);
        return response.data;
    },

    updateUser: async (
        id: string,
        name: string,
        email: string,
        phone: string,
        username: string,
        password: string,
        token_rd: string,
        user_rd: string
    ): Promise<ApiUserProps> => {
        const response = await api.put("/user/" + id, {
            name,
            email,
            phone,
            username,
            password,
            token_rd,
            user_rd,
        });
        return response.data;
    },

    updateCommonTariff: async (
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

    updateSpecificTariff: async (
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

    updateDiscount: async (
        id: string,
        percent_general: number,
        percent_unitary: number,
        dates: { date: string }[]
    ): Promise<"success" | "error"> => {
        const response = await api.put("/discount/" + id, {
            percent_general,
            percent_unitary,
            dates,
        });
        return response.data.msg;
    },

    toggleActiveDiscount: async (id: string) => {
        const response = await api.put(`/discount/${id}/active`);
        return response.data;
    },

    toggleDailyCourtesy: async (id: string) => {
        const response = await api.put(`/discount/${id}/daily_courtesy`);
        return response.data;
    },

    changeOrderTariff: async (order_id: number, side: string) => {
        const response = await api.post("/tariff/order", {order_id, side});
        return response.data;
    },

    toggleActiveTariff: async (name: string, active: boolean) => {
        const response = await api.post("/tariff/active", {
            name,
            active,
        });
        return response.data;
    },

    saveBudget: async (user_id: string, budgets: DataContentProps[], remake = true, name = "") => {

        const budgetId = budgets.find(obj => obj.arrComplete.responseForm.rd_client);
        if (budgetId) {
            budgets.forEach(obj => {
                obj.arrComplete.responseForm.rd_client = budgetId.arrComplete.responseForm.rd_client;
            })
        }

        const response = await api.post("/save-budget", {
            user_id,
            budgets,
            remake,
            name,
        });

        return response.data;
    },

    renameBudget: async (id: string, name: string) => {
        const response = await api.put("/save-budget/rename", {
            id, name
        })
        return response.data;
    },

    activeRequirement: async (name: string) => {
        const response = await api.put("/requirement/active/" + name);
        return response.data;
    },

    priceRequirement: async (name: string, price: number) => {
        const response = await api.put("/requirement/price", {
            name,
            price,
        });

        return response.data;
    },

    favoriteBudget: async (id: string) => {
        const response = await api.put("/favorite/" + id);
        return response.data;
    },


    //RD
    rdDeleteProduct: async (deal_id: string, deal_product_id: string) => {
        const response = await api.post("/rd/delete_product", {
            deal_id, deal_product_id
        })
        return response.data;
    },
    rdAddProduct: async (
        deal_id: string,
        product_id: string,
        price: number,
        amount = 1,
    ) => {
        const response = await api.post(
            `/rd/add_product`,
            {deal_id, product_id, price, amount}
        );
        return response.data;
    },
    rdChangeStage: async (deal_id: string, check_in: string, check_out: string, adt: number, chd: number[], pet: string[]) => {
        const response = await api.post(`/rd/change_stage`, {
            deal_id,
            check_in,
            check_out,
            adt,
            chd,
            pet
        });
        return response.data;
    },
    rdGetaDeal: async (deal_id: string) => {
        const response = await api.post(`/rd/get_a_deal`, {
            deal_id
        });
        return response.data;
    },
});
