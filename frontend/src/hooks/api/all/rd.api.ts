import { AxiosInstance } from "axios";

export const rd = (api: AxiosInstance) => ({
    deleteProduct: async (deal_id: string, deal_product_id: string) => {
        const response = await api.post("/rd/delete_product", {
            deal_id, deal_product_id
        })
        return response.data;
    },
    addProduct: async (
        deal_id: string,
        product_id: string,
        price: number,
        amount = 1,
    ) => {
        const response = await api.post(
            `/rd/add_product`,
            { deal_id, product_id, price, amount }
        );
        return response.data;
    },
    changeStage: async (
        deal_id: string,
        check_in: string,
        check_out: string,
        adt: number,
        chd: number[],
        pet: string[],
        corp = false
    ) => {
        const response = await api.post(`/rd/change_stage`, {
            deal_id,
            check_in,
            check_out,
            adt,
            chd,
            pet,
            corp
        });
        return response.data;
    },
    getDealById: async (deal_id: string) => {
        const response = await api.post(`/rd/get_a_deal`, {
            deal_id
        });
        return response.data;
    },
})