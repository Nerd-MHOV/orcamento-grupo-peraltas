import { Alert, AlertTitle, TextField } from "@mui/material";
import { Stack } from "@mui/system";
import serialize from "form-serialize";
import InputMask from "react-input-mask";
import { ReactNode, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useApi } from "../../hooks/api/api";
import Btn from "../Btn";
import { ErrorComponent } from "./ErrorComponent";
import "./style.scss";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import { useNavigate } from "react-router-dom";
import { ApiUserProps } from "../../hooks/api/interfaces";

export const FormNewCollaborator = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const api = useApi();
  const [errForm, setErrForm] = useState("");

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const name = `${data.firstname} ${data.lastname}`;
    api
      .user.create(
        name,
        data.email,
        data.phone,
        data.username,
        data.password,
        data.token,
        data.user_pipe
      )
      .then((response) => {
        navigate("/users");
      })
      .catch((err) => {
        setErrForm("Erro do servidor");
        if (err?.response?.data?.message?.message)
          setErrForm(err.response.data.message.message);
      });
  };

  return (
    <div className="new-collaborator">
      {!!errForm && <ErrorComponent msg={errForm} />}
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid">
          <TextField
            required
            margin="dense"
            {...register("firstname")}
            label="Nome"
            type="text"
            variant="outlined"
          />
          <TextField
            required
            margin="dense"
            {...register("lastname")}
            label="Sobrenome"
            type="text"
            variant="outlined"
          />
          <TextField
            required
            margin="dense"
            {...register("email")}
            label="E-mail"
            type="email"
            variant="outlined"
          />

          <TextField
            required
            margin="dense"
            {...register("phone")}
            label="Celular (aparece no orçamento)"
            type="text"
            variant="outlined"
            InputProps={<InputMask mask="(99) 99999 - 9999" />}
          />

          <TextField
            required
            margin="dense"
            {...register("username")}
            label="Username"
            type="text"
            variant="outlined"
          />
          <TextField
            required
            margin="dense"
            {...register("password")}
            label="Senha"
            type="password"
            variant="outlined"
          />
          <TextField
            required
            margin="dense"
            {...register("token")}
            label="Token RD"
            type="text"
            variant="outlined"
          />
          <TextField
            required
            margin="dense"
            {...register("user_pipe")}
            label="ID do Usuário RD"
            type="text"
            variant="outlined"
          />
        </div>

        <div className="button">
          <Btn action="Cadastrar" color="darkBlue" onClick={() => {}} />
        </div>
      </form>
    </div>
  );
};
