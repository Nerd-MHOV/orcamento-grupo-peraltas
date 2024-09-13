import { AxiosInstance } from "axios";


export interface ActionsInsightsApi {
    [key: string]: {
        total: number;
        totalUtil: number;
        ganho: number;
        perdido: number;
        emAndamento: number;
        vencido: number;
        aguardando: number;
        refeito: number;
        none: number;
    }
}

export const insights = (api: AxiosInstance) => ({
    actions: async (): Promise<ActionsInsightsApi> => {
        const { data } = await api.get('/insights/actions');
        return data;
    }
})