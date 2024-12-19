import { useApi } from "../../../../hooks/api/api";
import { CategoryOptionsProps } from "../../interfaces/categoriesProps";
export async function getCategoryOptions() {
  const api = useApi();
  const response = await api.tariff.getHus();
  let list: CategoryOptionsProps[] = [];

  response.map((res: any) => {
    list.push({
      label: `${res.id} - ${res.category_id}`,
      unit: res.id,
      category: res.category.name,
    });
  });

  list.push({
    label: "Day-Use Full",
    unit: "Day-Use Full",
    category: "Day-Use Full",
  });

  list.push({
    label: "Day-Use Tradicional",
    unit: "Day-Use Tradicional",
    category: "Day-Use Tradicional",
  });

  return {
    response: response,
    list: list,
  };
}
