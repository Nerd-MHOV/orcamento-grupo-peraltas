import SelectionRangeProps from "./selectionRangeProps";
import RowsProps from "./tableBudgetRowsProps";

interface DataContentProps {
    rows: RowsProps[];
    columns: string[];
    arrComplete?: ArrComplete;
    total?: {
        total: number;
        noDiscount: number;
    };
}

export interface ArrComplete {
    petValue: string[];
    childValue: number[];
    selectionRange: SelectionRangeProps
    responseForm: {
        adult: string | number;
        pension: string;
        category: string;
        rd_client?: string;
        housingUnit: string;
        parcel: string | number;
        discount?: string | number;
        action?: string;
    }
}

export default DataContentProps
