import { CircularProgress } from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FormEditCollaborator } from "../../../components/FormEditCollaborator";
import { LayoutBudget } from "../../../components/Layout";
import { useApi } from "../../../hooks/api/api";
import { ApiUserProps } from "../../../hooks/api/interfaces";
import "./style.scss";

export const EditUsers = () => {
  const api = useApi();
  const { id } = useParams();
  const [user, setUser] = useState<ApiUserProps | undefined>();

  const getUser = async () => {
    const responseUser = await api.user.getById(id as string);
    setUser(responseUser);
  };

  useEffect(() => {
    getUser();
  }, []);

  if (user?.name === undefined) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center" }} m={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LayoutBudget>
      <div className="p20">
        <div className="containerBx">
          <div className="top">
            <div className="titleContainerBx">
              Editar Cadastro: {user?.name}
            </div>
          </div>
          <div className="form">
            <FormEditCollaborator fields={user} />
          </div>
        </div>
      </div>
    </LayoutBudget>
  );
};
