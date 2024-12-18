import { TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useGenerateTariffCorporate } from "../../../context/generateTariff/generateTariff";
import { getDiscountLimit } from "./get_discount_limit";

export const DiscountInputForm = () => {
  const {
    disabledPension,
    handleOpenModalPermission,
    selectionRange,
    actionSelected,
    changeGenereralDiscount,
    stateApp,
    handleOpenBackdrop,
    handleCloseBackdrop,
  } = useGenerateTariffCorporate();
  const [discount, setDiscount] = useState<number | null>(null);
  const handleChangeDiscount = async (value: number) => {
    let limit = (actionSelected?.percent_general && getDiscountLimit({
      action: actionSelected.percent_general,
      stateApp,
      handleOpenBackdrop,
      handleCloseBackdrop,
    })) ?? 10;

    if (value > limit) {
      verifyPermission(value);
      value = limit;
    }
    if (value < 0) setDiscount(null);
    else if (value > 100) setDiscount(100);
    else setDiscount(value);

  };

  const verifyPermission = (value: number) => {
    handleOpenModalPermission(value, setDiscount);
  };

  useEffect(() => {
    handleChangeDiscount(discount || -1);
  }, [selectionRange]);

  useEffect(() => {
    changeGenereralDiscount(discount || 0)
  }, [discount])
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
