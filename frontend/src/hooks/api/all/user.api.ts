import { AxiosInstance } from "axios";
import { ApiUserProps } from "../interfaces";


export const user = (api: AxiosInstance) => ({
    get: async (): Promise<ApiUserProps[]> => {
        const response = await api.get("/user");
        return response.data;
    },
    getById: async (id: string): Promise<ApiUserProps> => {
        const response = await api.post("/unique-user", { id });
        return response.data;
    },
    create: async (
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
    delete: async (id: string): Promise<"success" | "error"> => {
        const response = await api.delete("/user/" + id);
        return response.data;
    },
    update: async (
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
    
})