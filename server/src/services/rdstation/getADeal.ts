import {rdApi} from "./rdApi";
import {Deal, Opportunity, OpportunityParams} from "./rd.types";

export function rdGetADeal(deal_id: string): Promise<Deal> {
    return new Promise<Deal>((resolve, reject) => {
        rdApi.get("/deals/"+deal_id)
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                console.error(" [ ERROR ] - error getting negotiations in RD Stations", deal_id);
                reject(error);
            });
    });
}

