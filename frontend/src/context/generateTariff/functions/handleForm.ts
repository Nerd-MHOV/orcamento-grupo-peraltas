import serialize from "form-serialize";
import { useApi } from "../../../hooks/api/api";
import RowModalDiscount from "../interfaces/rowModalDiscount";
import SelectionRangeProps from "../interfaces/selectionRangeProps";
import { ArrComplete } from "../interfaces/tableBudgetDataContentProps";

export interface selectionRange {
  startDate: Date;
  endDate: Date;
  key: string;
}

export async function handleForm(
  category: string,
  selectionRange: SelectionRangeProps,
  unitaryDiscount: RowModalDiscount[],
  dailyCourtesy: boolean,
  addRows: (rows: any[], arrComplete: ArrComplete) => void
) {
  const api = useApi();

  const formUp: HTMLFormElement | null = document.querySelector("#form");
  if (!formUp) return;

  const responseForm: any = serialize(formUp, { hash: true });
  const childValue = JSON.parse(responseForm.child as string);
  const petValue = JSON.parse(responseForm.pet as string);
  // const selectionRange = JSON.parse(responseForm.rangeDate as string);
  const requirementValue = JSON.parse(
    responseForm.requirementComplete as string
  );

  if (
    typeof responseForm.category === "string" &&
    responseForm.category.match(/Day-Use/)
  ) {
    const response = await api.budgetDu.get(
      responseForm,
      childValue,
      petValue,
      requirementValue,
      selectionRange,
      unitaryDiscount
    );

    addRows(response.rows, {
      responseForm,
      childValue,
      petValue,
      selectionRange,
    });

    return;
  }

  if (!responseForm.category || !responseForm.pension) return;
  responseForm.housingUnit = responseForm.category;
  responseForm.category = category;

  const response = await api.budget.get(
    responseForm,
    childValue,
    petValue,
    requirementValue,
    selectionRange,
    unitaryDiscount,
    dailyCourtesy
  );

  addRows(response.rows, {
    responseForm,
    childValue,
    petValue,
    selectionRange,
  });
}
