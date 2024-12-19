import { useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/api/api";

export async function deleteRequirement(id: string) {
  const api = useApi();
  await api.requirement.delete(id);
}
