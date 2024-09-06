import { prismaClient } from "../../database/prismaClient";
import { SaveBudgets, SaveBudgetsCorp } from "@prisma/client";
import { addDays } from "date-fns";
import { UpdateDeal } from "../../services/rdstation/updateDeal";


export const assistDBStatus = async () => {

    const filterNotIn = [
        "perdido", "ganho", "none", "refeito",
    ]

    const budgets = await prismaClient.saveBudgets.findMany({
        where: {
            status: {
                notIn: filterNotIn
            }
        }
    })

    const corps = await prismaClient.saveBudgetsCorp.findMany({
        where: {
            status: {
                notIn: filterNotIn
            }
        }
    })

    console.log(corps);

    await verifyHasExpired(budgets, corps);
}


const verifyHasExpired = async (budgets: SaveBudgets[], corps: SaveBudgetsCorp[] ) => {
    for (const budget of budgets) {
        const expireIn = addDays(budget.createdAt, 3);
        // const loseIn = addDays(budget.createdAt, 5)
        // if(loseIn < new Date()) {
        //     // atualizar para perdido
        //    await updateStatus(budget, "perdido")
        //
        // }else
        if (expireIn < new Date()) {
            // atualizar para vencido
            await updateStatus(budget, "vencido")
        }

    }

    for (const corp of corps) {
        const expireIn = addDays(corp.createdAt, 3);
        if (expireIn < new Date()) {
            // atualizar para vencido
            await updateStatusCorp(corp, "vencido")
        }
    }
}

async function updateStatus(budget: SaveBudgets, status: string) {
    // @ts-ignore
    const deal_id = budget.budgets[0].arrComplete.responseForm.rd_client
    updateStatusInDeal(deal_id, status)
        .then(() => {
            console.log(` [ INFO ] - Updated status budget ${budget.id}`)
        })
        .catch(() => {
            console.log(` [ ERROR ] - Update status to budget ${budget.id}`)
        })
    await prismaClient.saveBudgets.update({
        where: { id: budget.id },
        data: { status: status }
    })
}

async function updateStatusCorp(budget: SaveBudgetsCorp, status: string) {
    // @ts-ignore
    const deal_id = budget.budget.idClient;
    updateStatusInDeal(deal_id, status)
        .then(() => {
            console.log(` [ INFO ] - Updated status budget CORPORATE ${budget.id}`)
        })
        .catch(() => {
            console.log(` [ ERROR ] - Update status to budget CORPORATE ${budget.id}`)
        })
    await prismaClient.saveBudgetsCorp.update({
        where: { id: budget.id },
        data: { status: status }
    })
}

async function updateStatusInDeal(deal_id:string, status: string) {
    const cf_id = "64b94d33862444000e56696e";
    return UpdateDeal(deal_id, {
        deal: {
            deal_custom_fields: [
                {
                    custom_field_id: cf_id,
                    value: status,
                }
            ]
        }
    })
}