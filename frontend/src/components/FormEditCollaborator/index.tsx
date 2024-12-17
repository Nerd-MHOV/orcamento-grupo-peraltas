import { TextField } from "@mui/material";
import InputMask from "react-input-mask";
import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useApi } from "../../hooks/api/api";
import Btn from "../Btn";
import { ErrorComponent } from "./ErrorComponent";
import "./style.scss";
import { useNavigate } from "react-router-dom";
import { ApiUserProps } from "../../hooks/api/interfaces";

export const FormEditCollaborator = ({ fields }: { fields: ApiUserProps }) => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const api = useApi();
  const [errForm, setErrForm] = useState("");

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const name = `${data.firstname} ${data.lastname}`;
    api
      .user.update(
        fields.id,
        name,
        data.email,
        data.phone,
        data.username,
        data.password === "padrao" ? "" : data.password,
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
            defaultValue={fields.name.split(" ")[0]}
          />
          <TextField
            required
            margin="dense"
            {...register("lastname")}
            label="Sobrenome"
            type="text"
            variant="outlined"
            defaultValue={fields.name.substring(
              fields.name.split(" ")[0].length + 1
            )}
          />
          <TextField
            required
            margin="dense"
            {...register("email")}
            label="E-mail"
            type="email"
            variant="outlined"
            defaultValue={fields.email}
          />

          <TextField
            required
            margin="dense"
            {...register("phone")}
            label="Celular (aparece no orçamento)"
            type="text"
            variant="outlined"
            InputProps={<InputMask mask="(99) 99999 - 9999" />}
            defaultValue={fields.phone}
          />

          <TextField
            required
            margin="dense"
            {...register("username")}
            label="Username"
            type="text"
            variant="outlined"
            defaultValue={fields.username}
          />
          <TextField
            required
            margin="dense"
            {...register("password")}
            label="Senha"
            type="password"
            variant="outlined"
            defaultValue="padrao"
          />
          <TextField
            required
            margin="dense"
            {...register("token")}
            label="Token RD"
            type="text"
            variant="outlined"
            defaultValue={fields.token_rd}
          />
          <TextField
            required
            margin="dense"
            {...register("user_pipe")}
            label="ID do Usuário RD"
            type="text"
            variant="outlined"
            defaultValue={fields.user_rd}
          />
        </div>

        <div className="button">
          <Btn action="Atualizar" color="darkBlue" onClick={() => {}} />
        </div>
      </form>
    </div>
  );
};
