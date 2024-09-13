import { useState } from "react";
import DataContentProps, { ArrComplete } from "../interfaces/tableBudgetDataContentProps";
import { calcTotal } from "../functions/calcTotal";
import RowsProps from "../interfaces/tableBudgetRowsProps";
import { dataInitial } from "../initial";

const useInfoBudgets = () => {
    const [budgets, setBudgets] = useState<DataContentProps[]>([]);
    const [dataTable, setDataTable] = useState<DataContentProps>(dataInitial);

    async function handleSaveBudget() {
        if (dataTable.rows.length === 0) {
            return;
        }
        const total = calcTotal(dataTable).total;
        setBudgets((old) => {
            return [...old, { ...dataTable, total }];
        });
    }

    async function clearTariffs() {
        setBudgets([]);
    }

    function addRows(rows: RowsProps[], arrComplete?: ArrComplete) {
        setDataTable((par) => ({...par, rows, arrComplete}));
    }
    function clearRows() {
        addRows([]);
    }
    function deleteLine(indexDelete: number) {
        setBudgets((old) => {
            return old.filter((arr, index) => index !== indexDelete);
        });
    }

    return {
        addRows,
        budgets,
        deleteLine,
        handleSaveBudget,
        clearTariffs,
        clearRows,
        setDataTable,
        dataTable,
    }

}

export default useInfoBudgets;