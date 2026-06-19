import {Request, Response} from "express";
import { MainBudgetProps, mainBudget } from "./functions/mainBudget";

export type RowsProps = {
    id: number;
    desc: string;
    values: number[];
    total: number;
    type: string;
    noDiscount: number[];
    totalNoDiscount: number;
    discountApplied: number;
};

export interface ArrFormProps {
    adult?: number;
    discount?: number;
    category?: string;
    pension?: string;
    numberPipe?: number;
}

export interface UnitaryDiscountProps {
    id: number;
    name: string;
    discount: number;
    type: string;
}

export interface ArrRequirementProps {
    requirement: string;
    type: string;
    typeModal: string;
    values: {
        adult: number; child: number[]; amount: number;
    };
}

export type PetProps = "pequeno" | "médio" | "grande";

export class CalcBudgetController {
    async handle(request: Request, response: Response) {
        const budget: MainBudgetProps = request.body;
        let {rows, tariffs} = await mainBudget(budget)
        return response.json({
            rows,
            tariffs,
        });
    }
}
