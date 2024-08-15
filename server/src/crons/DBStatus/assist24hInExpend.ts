import {prismaClient} from "../../database/prismaClient";
import {addDays} from "date-fns";
import ChatGuru from "../../services/chatguru/main";
import {rdGetContactDeal} from "../../services/rdstation/getContactDeal";


/*
    Após 24h no status: "vencido" ele manda o dialogo para os cliente
*/
export default async function assist24hInExpend() {

    const budgets = await prismaClient.saveBudgets.findMany({
        where: {
            status: "vencido",
        },

    })

    let response: {
        number: string,
        status: "success" | "error",
        data: any
    }[] = [];

    for (let budget  of budgets) {
        //@ts-ignore
        const rd_id = budget.budgets[0].arrComplete.responseForm.rd_client;
        if (!rd_id) continue;

        const dealContacts = await rdGetContactDeal(rd_id);
        const number = dealContacts.contacts[0]?.phones[0]?.whatsapp_full_internacional
        if(!number) continue;
        const dateToSend = addDays(budget.createdAt, 4);
        const dateEnd = addDays(budget.createdAt, 5);
        if(dateToSend < new Date() && dateEnd > new Date()) {
            console.log(" [ CRON ] - ", number)

            await ChatGuru.dialog(number.replace(/\D/g, ''), "64ef84d5cfb7f47dd8a65f1d")
                .then(res => {
                    response.push({ number, data: res, status: "success" })
                })
                .catch(err => {
                    response.push({ number, data: err, status: "error" })
                })
        }
    }
    return response;
}