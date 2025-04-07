import { ApiDiscountProps } from "../../../hooks/api/interfaces";
import { AppHotelProps } from "../../../hooks/appHotel/interfaces";

export function getDiscountLimit({
    stateApp,
    action,
    handleOpenBackdrop,
    handleCloseBackdrop,
}: {
    stateApp: AppHotelProps | null,
    action: {
        occupancy: number,
        percent: number,
    }[];
    handleOpenBackdrop: (message: string) => void;
    handleCloseBackdrop: VoidFunction
}) {
    if (action.length === 1)
        return action[0].percent;

    if (!stateApp?.qntdReservas) {
        handleOpenBackdrop(
            "Verificando ocupação...",
        );
        return null;
    }
    handleCloseBackdrop();
    const sorted = action.sort((a, b) => a.occupancy - b.occupancy);

    return sorted.reduce((acc, item) => {
        if (stateApp.qntdReservas >= item.occupancy) {
            return item.percent;
        }
        return acc;
    }, sorted[0].percent);
}