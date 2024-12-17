import { useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/api/api";

export async function deleteUser(id: string) {
  const api = useApi();
  await api.user.delete(id);
}
