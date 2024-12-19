import { useApi } from "../../../../hooks/api/api";

export async function getListRequirements() {
  const api = useApi();
  const response = await api.requirement.get();
  return response;
}
