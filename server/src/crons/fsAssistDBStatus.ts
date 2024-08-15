import {assistDBStatus} from "./DBStatus/assistDBStatus";

/*
    verifica se a data de expiração do orçamento esta vencida  e atualiza o status no RD e no sistema de orçamento
*/
export const fsAssistDBStatus = async  () => {

    console.log(" [ CRON ] fs assist db Status ")
    await assistDBStatus();

}





