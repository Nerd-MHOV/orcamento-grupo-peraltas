import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useGenerateTariff } from "../../../context/generateTariff/generateTariff";


const parcels = [
  { label: "3 x", value: '3' },
  { label: "4 x", value: '4' },
  { label: "5 x", value: '5' },
  { label: "6 x", value: '6' },
  { label: "7 x", value: '7' },
  { label: "8 x", value: '8' },
  { label: "9 x", value: '9' },
  { label: "10x", value: '10' },
]

export const ParcelInputForm = () => {
  const {callHandleForm} = useGenerateTariff();
  const [select, setSelect] = useState("10");

  useEffect(() => {
    callHandleForm();
  }, [select])

  return (
    <FormControl fullWidth variant="standard">
      <InputLabel id="applied_in_field">Em até ...</InputLabel>
      <Select
        labelId="applied_in_field"
        id="applied_in"
        value={select}
        name="parcel"
        onChange={(e) => {
          setSelect(e.target.value);
        }}
      >
        {parcels.map((el) => (
          <MenuItem key={el.value} value={el.value}>{el.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
