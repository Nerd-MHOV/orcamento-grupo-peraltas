import { rdGetADeal } from "./getADeal";
import { UpdateDealResponse } from "./rd.types";
import { rdApi } from "./rdApi";

export async function UpdateDeal(deal_id: string, params: {
    deal?: {
        deal_custom_fields?: { custom_field_id: string; value: string | number | null }[],
    },
    deal_stage_id?: string
}) {
    return new Promise<UpdateDealResponse>(async (resolve, reject) => {


        if (deal_id === "") reject(" [ ERROR ] - incorrect parameter")
        if (params.deal?.deal_custom_fields) {
            // pegar todos os campos ja existentes, PQ O RD É UMA MERDA
            try {
                const deal = await rdGetADeal(deal_id)

                const newDealCustomFields = deal.deal_custom_fields.map(cf => {
                    return {
                        custom_field_id: cf.custom_field_id,
                        value: cf.value,
                    }
                })
                params.deal?.deal_custom_fields?.forEach((deal_cf) => {
                    const indexCF = newDealCustomFields.findIndex(cf => cf.custom_field_id === deal_cf.custom_field_id);
                    if (indexCF !== -1) {
                        newDealCustomFields[indexCF].value = deal_cf.value;
                    } else {
                        newDealCustomFields.push({ ...deal_cf })
                    }
                })

                params.deal.deal_custom_fields = newDealCustomFields;
            } catch (error) {
                reject(' [ ERROR ] - Deal Id is not valid!')
            }
        }


        rdApi.put("/deals/" + deal_id, { ...params })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                if (error?.response?.status === 422) {
                    console.log(` [ ERROR ] - 422 updated deal but some information is wrong`)
                    if (error?.response?.data) reject(error?.response?.data)
                } else {
                    console.log(` [ ERROR ] - error updating a deal...`)
                }
                reject(error);
            })
    })
}