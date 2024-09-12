import {SaveBudgets} from "@prisma/client";
import {prismaClient} from "../database/prismaClient";
import {rdApiAdm} from "./rdstation/rdApiAdm";
import {Deal} from "./rdstation/rd.types";
import { UpdateDeal } from "./rdstation/updateDeal";

export const winChange = async (deal: Deal, status: string, corp = false ) => {
    console.log("altomação: ", status, deal.name)

    // mudar etapa no db
    const updatedDb = corp 
    ? prismaClient.saveBudgetsCorp.updateMany({
        where: {
            budget: {
                path: ["idClient"],
                string_contains: deal.id,
            },
        },
        data: {
            status: status
        }
    })
    : prismaClient.saveBudgets.updateMany({
        where: {
            budgets: {
                path: ["0", "arrComplete", "responseForm", "rd_client"],
                string_contains: deal.id,
            },
        },
        data: {
            status: status
        }
    })

    console.log(updatedDb);

    
    // mudar etapa no rd
    const updateRd =  UpdateDeal(deal.id, {
        deal: {
            deal_custom_fields: [
                {
                    "custom_field_id": "64b94d33862444000e56696e", // status orçamento
                    "value": status
                }
            ]
        }
    })
    

    return await Promise.all([updatedDb, updateRd]).then(res => {
        console.log(res);
        return true
    }) .catch(err => {
        return false
    })
}
