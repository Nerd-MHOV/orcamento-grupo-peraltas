import { Request, Response } from "express";
import axios from "axios";
import formatPhone from "../../services/formatPhone";
import { EditField } from "../../services/chatguru/EditField";
import { rdGetADeal } from "../../services/rdstation/getADeal";
import { rdGetContactDeal } from "../../services/rdstation/getContactDeal";
import { CustomFieldFilter } from "../../services/rdstation/CustomFieldFilter";

const rdApi = axios.create({
    baseURL: "https://crm.rdstation.com/api/v1",
});

export class RDController {
    async deleteProduct(request: Request, response: Response) {
        const { deal_id, deal_product_id } = request.body;
        const user = request.user;
        try {
            const axiosResponse = await rdApi
                .delete(`/deals/${deal_id}/deal_products/${deal_product_id}`, {
                    params: { token: user.token_rd }
                })
            return response.json(axiosResponse.data)
        } catch (e) {
            return response.status(400).json({ msg: "error", debug: e });
        }

    }

    async addProduct(request: Request, response: Response) {
        const { deal_id, product_id, price, amount } = request.body
        const user = request.user;
        try {
            console.log(request.body)
            const axiosResponse = await rdApi.post(`/deals/${deal_id}/deal_products`, {
                product_id, price, amount: amount,
            }, {
                params: { token: user.token_rd }
            });
            return response.json(axiosResponse.data);
        } catch (e) {
            console.log(e);
            return response.status(400).json({ msg: "error", debug: e });
        }

    }

    async changeStage(request: Request, response: Response) {
        const { deal_id, check_in, check_out, adt, chd, pet, corp = false } = request.body;
        const user = request.user;
        const deal_stage_id = corp ? "64ca54153fc57f000d2c00e2" : "649dcc5287d5af0023d4aaa0";
        console.log(request.body)
        try {
            const axiosResponse = await rdApi.put(`/deals/${deal_id}`, {
                deal_stage_id, deal: {
                    user_id: user.user_rd, deal_custom_fields: [{
                        "custom_field_id": "64ff4e1f2ab269001b8bb10f", //check-in
                        "value": check_in
                    }, {
                        "custom_field_id": "64ff4e32966cc10022693bc2", //check-out
                        "value": check_out
                    }, {
                        "custom_field_id": "64b7e553c69b74001c0e0048", //quantidade de crianças
                        "value": chd.length
                    }, {
                        "custom_field_id": "64b7ed74bfabcc002b264818", //idade das crianças
                        "value": chd.toString()
                    }, {
                        "custom_field_id": "64b7e57ec69b74000c0dfffc", // adultos
                        "value": adt
                    }, {
                        "custom_field_id": "64b7eda36ea9c8000c03efa8", // quantidade de pets
                        "value": pet.length
                    }, {
                        "custom_field_id": "64b7edb9f217510019a64bc5", // porte de pets
                        "value": pet.toString()
                    }, {
                        "custom_field_id": "64b94d33862444000e56696e", // status orçamento
                        "value": "em andamento"
                    }]
                },
            }, {
                params: { token: user.token_rd }
            });


            // att cg new automations
            let deal = await rdGetADeal(deal_id);
            let contact = await rdGetContactDeal(deal_id);
            if( contact ) {
                const number = formatPhone(contact.contacts[0]?.phones[0]?.phone)
                if (number) {
                    const chd = CustomFieldFilter("chd", deal)?.value
                    const adt = CustomFieldFilter("adt", deal)?.value
                    const check_in = CustomFieldFilter("check_in", deal)?.value
                    const check_out = CustomFieldFilter("check_out", deal)?.value
                    const points = CustomFieldFilter("points", deal)?.value
                    const redLinePoints = check_out
                
                    try {
                        EditField(number, {
                            "ID_RD": deal.id,
                            "CHD_IDADE": chd,
                            "ADULTOS": adt,
                            "Data_inicial_da_viagem": formatToDate(String(check_in)),
                            "Data_final_da_viagem": formatToDate(String(check_out)),
                            "Data_de_validade_clube_Fidelidade": formatToDate(String(redLinePoints)),
                            "Pontos_fidelidade": Number(points),
                        })
                    } catch (error) {}
                }
            }
            
            

            return response.json(axiosResponse.data);
        } catch (e) {
            console.log(e);
            return response.status(400).json({ msg: "error", debug: e });
        }

    }

    async getDeal(request: Request, response: Response) {
        const { deal_id } = request.body;
        const user = request.user;
        try {
            const axiosResponse = await rdApi.get(`/deals/${deal_id}`, {
                params: { token: user.token_rd }
            });
            return response.json(axiosResponse.data)
        } catch (e) {
            console.log(e);
            return response.status(400).json({ msg: "error", debug: e });
        }

    }
}


function formatToDate(date: string) {
    const [day, month, year] = date.split("/")
    return `${year}-${month}-${day}`
}