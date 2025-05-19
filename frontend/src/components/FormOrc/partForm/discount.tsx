import { TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useGenerateTariff } from "../../../context/generateTariff/generateTariff";
import { getDiscountLimit } from "./get_discount_limit";

export const DiscountInputForm = () => {
  const {
    disabledPension,
    callHandleForm,
    handleOpenModalPermission,
    selectionRange,
    handleOpenBackdrop,
    handleCloseBackdrop,
    actionSelected,
    stateApp,
  } = useGenerateTariff();
  const [discount, setDiscount] = useState<number | null>(null);
  const [change, setChange] = useState<number | null>(null);
  const handleChangeDiscount = async (value: number) => {
    let limit =
      (actionSelected?.percent_general &&
        getDiscountLimit({
          action: actionSelected.percent_general,
          stateApp,
          handleOpenBackdrop,
          handleCloseBackdrop,
        })) ??
      0;

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
  }, [selectionRange, actionSelected, stateApp]);
  return (
    <TextField
      name="discount"
      disabled={disabledPension}
      label="Desconto %"
      type="number"
      className="textField"
      variant="standard"
      value={discount}
      onBlur={() => {
        if (discount !== change) {
          setChange(discount);
          handleChangeDiscount(discount || -1);
        }
      }}
      onChange={(e) => setDiscount(Number(e.target.value))}
    />
  );
};
