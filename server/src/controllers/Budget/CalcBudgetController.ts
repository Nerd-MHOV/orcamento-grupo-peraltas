import { addDays } from "date-fns";
import { Request, Response } from "express";
import { adultBudget } from "./functions/adultBudget";
import { childBudget } from "./functions/childBudget";
import { petBudget } from "./functions/petBudget";
import { requirementBudget } from "./functions/requirementBudget";

export type RowsProps = {
  id: number;
  desc: string;
  values: number[];
  total: number;
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

export type PetProps = "pequeno" | "médio" | "grande";

export class CalcBudgetController {
  async handle(request: Request, response: Response) {
    const {
      arrForm,
      arrChild,
      arrPet,
      arrRequirement,
      rangeDate,
    }: {
      arrForm: ArrFormProps;
      arrChild: number[];
      arrPet: PetProps[];
      arrRequirement: any[];
      rangeDate: {
        startDate: string;
        endDate: string;
        [key: string]: any;
      };
    } = request.body;

    console.log(arrForm.category);
    //vars:
    let adultRows: RowsProps[] = [];
    let childRows: RowsProps[] = [];
    let petRows: RowsProps[] = [];

    let requirementRows: RowsProps[] = [];

    let initDate = new Date(rangeDate.startDate);
    let finalDate = new Date(rangeDate.endDate);

    //adult
    adultRows = await adultBudget(arrForm, arrChild, initDate, finalDate);

    //child
    childRows = await childBudget(arrForm, arrChild, initDate, finalDate);

    //pet
    petRows = await petBudget(arrForm, arrPet, initDate, finalDate);

    //requirement
    requirementRows = await requirementBudget(
      arrForm,
      arrRequirement,
      initDate,
      finalDate
    );

    let completeRows = [
      ...adultRows,
      ...childRows,
      ...petRows,
      ...requirementRows,
    ];

    return response.json({
      rows: completeRows,
    });
  }
}
