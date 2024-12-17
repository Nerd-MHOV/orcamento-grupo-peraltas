import {useApi} from "../../../hooks/api/api";
import { CorporateBodyResponseBudget } from "../../../hooks/api/interfaces";
import DataContentProps from "../interfaces/tableBudgetDataContentProps";
import {format} from "date-fns";



export async function rdSaveProcess(budgets: DataContentProps[], group = false) {
    const api = useApi();

    
    let realBudget: DataContentProps = budgets[0];
    let dealId = "";
    for (let budget of budgets) {
        if (budget.arrComplete?.responseForm.rd_client) {
            dealId = budget.arrComplete?.responseForm.rd_client;
        }
    }

    if (dealId == "") {
        return;
    }

    await deleteOldProd(dealId);
    
    if(group) {
        // add all budgets
        for (const budget of budgets) {
            await apiAddProd(
                budget.arrComplete?.selectionRange.startDate!,
                 budget.arrComplete?.selectionRange.endDate!,
                 budget?.total?.total ?? 0,
                  dealId
                );
        } 
    } else {
        const budget = budgets.reduce((old, current) => {
            const oldValue = old?.total?.total ?? 0;
            const currentValue = current?.total?.total ?? 0;

            return currentValue < oldValue ? current : old;
        }, budgets[0]);
        await apiAddProd(
            budget.arrComplete?.selectionRange.startDate!,
             budget.arrComplete?.selectionRange.endDate!,
             budget?.total?.total ?? 0,
            dealId
            );
    }

    await api.rd.changeStage(
        dealId, 
        format(realBudget.arrComplete?.selectionRange.startDate!, "dd/MM/yyyy"), 
        format(realBudget.arrComplete?.selectionRange.endDate!, "dd/MM/yyyy"), 
        +realBudget.arrComplete?.responseForm.adult!, 
        realBudget.arrComplete?.childValue || [], 
        realBudget.arrComplete?.petValue || []
        )
}

export async function rdSaveProcessCorp(budget: CorporateBodyResponseBudget) {
    const api = useApi();
    const idClient = budget.idClient;
    if(!idClient) return;

    const dateIn = new Date(budget.dateRange[0].startDate)
    const dateOut = new Date(budget.dateRange[0].endDate)
    const adt = budget.rooms.reduce((accumulator, currentValue) => accumulator + currentValue.adt, 0);
    const chd = budget.rooms.map( room => room.chd ).flat();
    const pet = budget.rooms.map( room => room.pet ).flat();
    const corp = true;
    await deleteOldProd(idClient);
    await apiAddProd(
        dateIn,
        dateOut,
        budget.rowsValues.total.total,
        idClient,
    );
    await api.rd.changeStage(
        idClient,
        format(dateIn, "dd/MM/yyyy"),
        format(dateOut, "dd/MM/yyyy"),
        adt,
        chd,
        pet,
        corp,
    )
}

async function deleteOldProd(dealId: string) {
    const api = useApi();
    // delete old products
    const productsToDelete = (await api.rd.getDealById(dealId)).deal_products
    for (const prod of productsToDelete) {
        await api.rd.deleteProduct(dealId, prod.id)
    }
}
async function apiAddProd(
    dateIn: Date,
    dateOut: Date,
    total: number,
    dealId: string) {
    const api = useApi();
    try {
        await api
            .getTariffORM(dateIn, dateOut)
            .then((tariff_id) => {
                // pipe.addFile();
                api.rd.addProduct(dealId, tariff_id.product_rd, total)
            })
    } catch (error) {}
}