import { format } from "date-fns";
import { useAppApi } from "../../../../hooks/appHotel/app";
import SelectionRangeProps from "../../interfaces/selectionRangeProps";

export async function getUnitUsing(date: SelectionRangeProps) {
  const app = useAppApi();
  const response = await app.getHousingUnitsUsing(
    `${format(date.startDate, "yyyy-MM-dd")} 16:00:00`,
    `${format(date.endDate, "yyyy-MM-dd")} 16:00:00`,
    true
  );
  let units: string[] = [];
  const filter = response?.reservas
    // This filter is used to remove the units that are not rooms.
    ?.filter((unit: { unidade: string }) => !!Number(unit.unidade))
    .map((unit: { unidade: string }) => {
      units.push(unit.unidade);
      return unit;
    });

  return {
    response: response,
    units: units,
  };
}
