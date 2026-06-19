import {Request, Response} from "express";
import { mainCorp } from "./functions/mainCorp";
import { ArrRequirementProps, PetProps, RowsProps, UnitaryDiscountProps } from "./CalcBudgetController";

export interface RoomCorporate {
    adt: number,
    chd: number[],
    pet: PetProps[],
    roomNumber: Category,
    isStaff: boolean,
}

export interface RoomCorporateResponse extends RoomCorporate {
    rowsValues: ResponseValues
}

export interface ResponseValues { 
    rows: RowsProps[],
    total: RowsProps,
}

export interface CorporateBodySendBudget {
    rooms: RoomCorporate[],
    pension: string,
    requirements: ArrRequirementProps[],
    agency: number,
    discount: number,
    dateRange: DateRange[],
    idClient: string | null,
    unitaryDiscount: UnitaryDiscountProps[],
}

export interface CorporateBodyResponseBudget {
    rooms: RoomCorporateResponse[],
    pension: string,
    agencyPercent: number,
    requirements: ArrRequirementProps[],
    dateRange: DateRange[],
    idClient: string | null,
    rowsValues: ResponseValues,
    tariffs: string[]
}

export interface Category {
    label: string;
    unit: string;
    category: string;
}

export interface DateRange {
    startDate: string;
    endDate: string;
    key: string;
}


export class CalcBudgetCorpController {
    async handle(request: Request, response: Response) {
        const budget: CorporateBodySendBudget = request.body;
        let responseBudget = await mainCorp(budget)
        return response.json(responseBudget);
    }
}
