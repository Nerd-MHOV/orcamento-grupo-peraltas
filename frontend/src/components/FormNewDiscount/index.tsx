import {
  Button,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useApi } from "../../hooks/api/api";
import { ErrorComponent } from "./ErrorComponent";
import "./style.scss";
import { useNavigate } from "react-router-dom";
import { DateRange, RangeKeyDict } from "react-date-range";
import { ptBR } from "date-fns/locale";
import {
  Add,
  CheckBox,
  CheckBoxOutlineBlank,
  ChevronLeft,
  ChevronRight,
  Remove,
} from "@mui/icons-material";
import Btn from "../Btn";
import { addDays, format } from "date-fns";
import { Box } from "@mui/system";

export interface FormDateRangeProps {
  startDate: Date;
  endDate: Date;
  key: string;
}

type ApplicableInType = "midweek" | "weekend" | "all" | "";

export const FormNewDiscount = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const api = useApi();
  const [errForm, setErrForm] = useState("");
  const [checkCourtesy, setCheckCourtesy] = useState(false);
  const [applicableIn, setApplicableIn] = useState<ApplicableInType>("");
  const [datesRange, setDatesRange] = useState<FormDateRangeProps[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "0",
    },
  ]);
  const [actionRuleOccupancy, setActionRuleOccupancy] = useState(1);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {

   

    if (!applicableIn) {
      setErrForm("Selecione a onde deseja aplicar a ação");
      return;
    }
    const arrayDates: { date: string }[] = [];
    datesRange.map((range) => {
      let initDay = range.startDate;
      let lastDay = range.endDate;

      while (initDay <= lastDay) {
        arrayDates.push({ date: format(initDay, "yyyy-MM-dd") });
        initDay = addDays(initDay, 1);
      }
    });

    if (!arrayDates.length) {
      setErrForm("Nem uma data selecionada");
      return;
    }

    const setDates = new Set();

    const filteredDates = arrayDates.filter((dates) => {
      const duplicated = setDates.has(dates.date);
      setDates.add(dates.date);
      return !duplicated;
    });

    const generalPercent = Array.from({ length: actionRuleOccupancy }).map((_, i) => {
      return {
        occupancy: +data["occypancy_"+i],
        percent: +data["generalPercent_"+i],
      }
    });

    const unitaryPercent = Array.from({ length: actionRuleOccupancy }).map((_, i) => {
      return {
        occupancy: +data["occypancy_"+i],
        percent: +data["unitaryPercent_"+i],
      }
    });

    api
      .createDiscount(
        data.name,
        generalPercent,
        unitaryPercent,
        +data.daily_minimum,
        +data.daily_maximum,
        +data.payers_minimum,
        filteredDates,
        checkCourtesy,
        applicableIn
      )
      .then((response) => {
        navigate("/discounts");
      })
      .catch((err) => {
        setErrForm("Erro do servidor");
        if (err?.response?.data?.message?.message)
          setErrForm(err.response.data.message.message);
      });
  };

  const addRange = () => {
    const key = datesRange.length;
    setDatesRange([
      ...datesRange,
      {
        startDate: addDays(new Date(), key),
        endDate: addDays(new Date(), key),
        key: String(key),
      },
    ]);
  };

  const handleChangeRange = (item: RangeKeyDict) => {
    const obj = item[Object.keys(item)[0]];
    if (obj.key === undefined) return;
    const arr = datesRange;
    arr[+obj.key].startDate = obj.startDate || new Date();
    arr[+obj.key].endDate = obj.endDate || new Date();
    setDatesRange(arr);
  };

  const removeRange = () => {
    const arr = datesRange;
    arr.pop();
    setDatesRange([...arr]);
  };

  const addRuleOccupancy = () => { setActionRuleOccupancy(prev => prev + 1) }
  const removeRuleOccupancy = () => { setActionRuleOccupancy(prev => prev > 1 ? prev - 1 : prev) }

  return (
    <div className="new-requirement">
      {!!errForm && <ErrorComponent msg={errForm} />}
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex" gap={2}>
          <div className="grid">
            <TextField
              required
              margin="dense"
              {...register("name")}
              label="Nome"
              type="text"
              disabled={false}
              variant="outlined"
            />
            {Array.from({ length: actionRuleOccupancy }).map((_, i) => (
              <>
                {
                  (i == actionRuleOccupancy - 1 && actionRuleOccupancy > 1) && 
                  <AddButton remove onClick={removeRuleOccupancy} />
                }
                <Box gap={2} display="flex">
                  <TextField
                    required
                    margin="dense"
                    {...register("occypancy_"+i)}
                    label='Ocupação'
                    type="number"
                    variant="outlined"
                  />
                  <TextField
                    required
                    margin="dense"
                    {...register("generalPercent_"+i)}
                    label="% limite Geral"
                    type="number"
                    variant="outlined"
                  />
                  <TextField
                    required
                    margin="dense"
                    {...register("unitaryPercent_"+i)}
                    label="% limite unitário"
                    type="number"
                    variant="outlined"
                  />
                </Box>

              </>
            )
            )}
            <AddButton onClick={addRuleOccupancy} />
            <Box gap={2} display="flex">
              <TextField
                required
                margin="dense"
                {...register("daily_minimum")}
                label="Mínimo de diárias"
                type="number"
                variant="outlined"
              />
              <TextField
                required
                margin="dense"
                {...register("daily_maximum")}
                label="Máximo de diárias"
                type="number"
                variant="outlined"
              />
            </Box>
            <TextField
              required
              margin="dense"
              {...register("payers_minimum")}
              label="Mínimo de pagantes"
              type="number"
              variant="outlined"
            />
            <FormControl fullWidth>
              <InputLabel id="applied_in_field">Aplicar em</InputLabel>
              <Select
                labelId="applied_in_field"
                id="applied_in"
                value={applicableIn}
                label="Aplicar em"
                onChange={(e) => {
                  if (
                    e.target.value === "midweek" ||
                    e.target.value === "weekend" ||
                    e.target.value === "all"
                  )
                    setApplicableIn(e.target.value);
                }}
              >
                <MenuItem value={"midweek"}>Somente meio de semana</MenuItem>
                <MenuItem value={"weekend"}>Somente final de semana</MenuItem>
                <MenuItem value={"all"}>Todos</MenuItem>
              </Select>
            </FormControl>

            <div className="daily-courtesy">
              <IconButton
                aria-label="expand row"
                size="small"
                onClick={() => {
                  setCheckCourtesy(!checkCourtesy);
                }}
              >
                {checkCourtesy ? <CheckBox /> : <CheckBoxOutlineBlank />}
              </IconButton>{" "}
              <p style={{ color: "#757575" }}>Diária Cortesia</p>
            </div>
          </div>

          <Box display="flex" flexDirection="column">
            <h4>Período:</h4>
            <div className="buttons">
              <Button
                variant="outlined"
                startIcon={<ChevronLeft />}
                onClick={removeRange}
              >
                remover
              </Button>
              <Button
                variant="outlined"
                endIcon={<ChevronRight />}
                onClick={addRange}
              >
                adicionar
              </Button>
            </div>

            <DateRange
              onChange={handleChangeRange}
              ranges={datesRange}
              locale={ptBR}
              moveRangeOnFirstSelection={false}
              editableDateInputs={true}
            />
          </Box>
        </Box>

        <div className="button">
          <Btn action="Cadastrar" color="whiteBlue" onClick={() => { }} />
        </div>
      </form>
    </div>
  );
};


const AddButton = ({
  remove = false,
  onClick = () => { }
}) => (
  <div className="add-line">
    <div className="button-add-line">
      {
        remove
          ? <Remove onClick={onClick} fontSize='small' />
          : <Add onClick={onClick} fontSize='small' />
      }
    </div>
    <div className="line">
      <Divider />
    </div>
  </div>
)
