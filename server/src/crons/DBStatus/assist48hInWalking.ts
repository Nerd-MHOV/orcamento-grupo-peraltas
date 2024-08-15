import {prismaClient} from "../../database/prismaClient";
import {addDays} from "date-fns";
import ChatGuru from "../../services/chatguru/main";
import {rdGetContactDeal} from "../../services/rdstation/getContactDeal";


/*
    Após 48h no status: "em andamento" ele manda o dialogo para os clientes
*/
export default async function assist48hInWalking() {

    const budgets = await prismaClient.saveBudgets.findMany({
        where: {
            status: "em andamento",
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
        console.log(" [ CRON ] - ", number)
        const dateToSend = addDays(budget.createdAt, 2);
        const dateEnd = addDays(budget.createdAt, 3);
        if(dateToSend < new Date() && dateEnd > new Date()) {
           await ChatGuru.dialog(number.replace(/\D/g, ''), "64ef819313efd67665a39e75")
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