import { prismaClient } from "../../../database/prismaClient";

export async function getInsightsActions( action: string ) {
    const finded = await prismaClient.saveBudgets.findMany({where: {
        OR: [
            {budgets: {path: ["0", "arrComplete", "responseForm", "action"], equals: action}},
            {budgets: {path: ["1", "arrComplete", "responseForm", "action"], equals: action}},
            {budgets: {path: ["2", "arrComplete", "responseForm", "action"], equals: action}},
            {budgets: {path: ["3", "arrComplete", "responseForm", "action"], equals: action}},
            {budgets: {path: ["4", "arrComplete", "responseForm", "action"], equals: action}},
            {budgets: {path: ["5", "arrComplete", "responseForm", "action"], equals: action}},
        ]
    }});
    const data = {
        total: finded.length,
        totalUtil: 0,
        ganho: finded.filter((item) => item.status === 'ganho').length,
        perdido: finded.filter((item) => item.status === 'perdido').length,
        emAndamento: finded.filter((item) => item.status === 'em andamento').length,
        vencido: finded.filter((item) => item.status === 'vencido').length,
        aguardando: finded.filter((item) => item.status === 'aguardando').length,
        refeito: finded.filter((item) => item.status === 'refeito').length,
        none: finded.filter((item) => item.status === 'none').length,
    }
    data.totalUtil = data.ganho + data.aguardando + data.emAndamento;
    return data;
}