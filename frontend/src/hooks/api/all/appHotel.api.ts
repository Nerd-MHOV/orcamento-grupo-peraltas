import { AxiosInstance } from "axios";


export const appHotel = (api: AxiosInstance) => ({
    getPeriodOccupancy: async ({ start, end }: {
        start: string;
        end: string;
    }) => {
        const response = await api.post("/app-hotel", {
            start,
            end
        });
        return response.data;
    }
})