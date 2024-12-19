import {
  Alert,
  AlertTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
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

export const FormNewRequirement = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const api = useApi();
  const [errForm, setErrForm] = useState("");

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    api.requirement
      .create(data.name, Number(data.price), data.type, data.typeModal)
      .then((response) => {
        navigate("/requirements");
      })
      .catch((err) => {
        setErrForm("Erro do servidor");
        if (err?.response?.data?.message?.message)
          setErrForm(err.response.data.message.message);
      });
  };

  return (
    <div className="new-requirement">
      {!!errForm && <ErrorComponent msg={errForm} />}
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid">
          <TextField
            required
            margin="dense"
            {...register("name")}
            label="Nome"
            type="text"
            variant="outlined"
          />
          <TextField
            required
            margin="dense"
            {...register("price")}
            label="Preço"
            type="text"
            variant="outlined"
          />
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Tipo</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Age"
              {...register("type")}
            >
              <MenuItem value={"accommodation"}>Hospedagem</MenuItem>
              <MenuItem value={"corporate"}>Corporativo</MenuItem>
              <MenuItem value={"both"}>Ambos</MenuItem>
              <MenuItem value={"location"}>Locação</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Modal</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Age"
              {...register("typeModal")}
            >
              <MenuItem value={"ticket"}>Ingresso</MenuItem>
              <MenuItem value={"amount"}>Quantidade</MenuItem>
              <MenuItem value={"participant"}>Participante</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div className="button">
          <Btn action="Cadastrar" color="darkBlue" onClick={() => {}} />
        </div>
      </form>
    </div>
  );
};
