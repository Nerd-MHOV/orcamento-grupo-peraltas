import { format } from "date-fns";
import SelectionRangeProps from "../../interfaces/selectionRangeProps";
import { useApi } from "../../../../hooks/api/api";

export async function getUnitUsing(date: SelectionRangeProps) {
  const api = useApi();
  const response = await api.appHotel.getPeriodOccupancy(
    {
      start: `${format(date.startDate, "yyyy-MM-dd")} 21:00:00`,
      end: `${format(date.endDate, "yyyy-MM-dd")} 16:00:00`,
    }
  );
  let units: string[] = [];
  response?.reservas
    // This filter is used to remove the units that are not rooms.
    ?.filter((unit: { room: string }) => !!Number(unit.room))
    .map((unit: { room: string }) => {
      units.push(unit.room);
      return unit;
    });

  return {
    response: response,
    units: units,
  };
}
