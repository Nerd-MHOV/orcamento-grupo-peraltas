import { TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useGenerateTariff } from "../../../context/generateTariff/generateTariff";

export const DiscountInputForm = () => {
  const {
    disabledPension,
    callHandleForm,
    handleOpenModalPermission,
    selectionRange,
    actionSelected,
  } = useGenerateTariff();
  const [discount, setDiscount] = useState<number | null>(null);
  const handleChangeDiscount = async (value: number) => {
    
    let limit = actionSelected?.percent_general ?? 0;
    
    if (value > limit) {
      verifyPermission(value);
      value = limit;
    }
    if (value < 0) setDiscount(null);
    else if (value > 100) setDiscount(100);
    else setDiscount(value);

    setTimeout(() => {
      callHandleForm();
    }, 200);
  };

  const verifyPermission = (value: number) => {
    handleOpenModalPermission(value, setDiscount);
  };

  useEffect(() => {
    handleChangeDiscount(discount || -1);
  }, [selectionRange, actionSelected]);
  return (
    <TextField
      name="discount"
      disabled={disabledPension}
      label="Desconto %"
      type="number"
      className="textField"
      variant="standard"
      value={discount}
      onChange={(e) => {
        handleChangeDiscount(+e.target.value);
      }}
    />
  );
};
