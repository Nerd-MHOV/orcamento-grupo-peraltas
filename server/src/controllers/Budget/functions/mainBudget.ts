import { ArrFormProps, ArrRequirementProps, PetProps, RowsProps, UnitaryDiscountProps } from "../CalcBudgetController";
import { adultBudget } from "./adultBudget";
import { childBudget } from "./childBudget";
import { collectUsedTariffs } from "./collectUsedTariffs";
import getPeriod from "./getPeriod";
import { petBudget } from "./petBudget";
import { requirementBudget } from "./requirementBudget";

export interface MainBudgetProps {
    arrForm: ArrFormProps;
    arrChild: number[];
    arrPet: PetProps[];
    arrRequirement: ArrRequirementProps[];
    rangeDate: {
        startDate: string; endDate: string; key: string;
    };
    unitaryDiscount: UnitaryDiscountProps[];
    dailyCourtesy: boolean;
}

export async function mainBudget({
    arrForm, arrChild, arrPet, arrRequirement, rangeDate, unitaryDiscount, dailyCourtesy,
}: MainBudgetProps) {
    //vars:
    let adultRows: RowsProps[] = [];
    let childRows: RowsProps[] = [];
    let petRows: RowsProps[] = [];

    let requirementRows: RowsProps[] = [];

    const mainPeriod = getPeriod([rangeDate]);

    //adult
    adultRows = await adultBudget(arrForm, arrChild, unitaryDiscount, dailyCourtesy, mainPeriod, mainPeriod);

    //child
    childRows = await childBudget(arrForm, arrChild, unitaryDiscount, dailyCourtesy, mainPeriod, mainPeriod);

    //pet
    petRows = await petBudget(arrForm, arrPet, unitaryDiscount, mainPeriod, mainPeriod);

    //requirement
    requirementRows = await requirementBudget(arrForm, arrRequirement, unitaryDiscount, mainPeriod, mainPeriod);

    //tarifários efetivamente usados (deduplicados)
    const tariffs = await collectUsedTariffs(mainPeriod);

    return {
        rows: [...adultRows, ...childRows, ...petRows, ...requirementRows,],
        tariffs,
    };
}