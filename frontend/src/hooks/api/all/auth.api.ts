import { AxiosInstance } from "axios";


export const auth = (api: AxiosInstance) => ({
    validateToken: async () => {
        const response = await api.get("/validate");
        return response.data;
    },
    login: async (username: string, password: string) => {
        const response = await api.post("/login", { username, password });
        return response.data;
    },
})