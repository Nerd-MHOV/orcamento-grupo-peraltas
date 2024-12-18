import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { TextField } from "@mui/material";
import "./style.scss";
import { useGenerateTariff, useGenerateTariffCorporate } from "../../context/generateTariff/generateTariff";
import { getDiscountLimit } from "../FormOrc/partForm/get_discount_limit";

export function ModalDiscount() {
  const {
    handleCloseModalDiscount: handleClose,
    handleSaveModalDiscount,
    openModalDiscount: open,
    discountBeingEdited,
    addUnitaryDiscount,
    stateApp,
    handleCloseBackdrop,
    handleOpenBackdrop,
    actionSelected,
  } = useGenerateTariffCorporate();

  const [password, setPassword] = React.useState("");
  const [passIsRequired, setPassIsRequired] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [discount, setDiscount] = React.useState<number | null>(null);

  const handleChangeDiscount = async (value: number) => {
    let limit = (actionSelected?.percent_unitary && getDiscountLimit({
          action: actionSelected.percent_unitary,
          stateApp,
          handleOpenBackdrop,
          handleCloseBackdrop,
        })) ?? 0;


    if (value > limit) {
      setPassIsRequired(true);
    } else {
      setPassIsRequired(false);
    }
    if (value < 0) setDiscount(null);
    else if (value > 100) setDiscount(100);
    else setDiscount(value);
  };

  const handleSave = () => {
    setError(false);
    if (password !== "admin@2355" && passIsRequired) {
      // if (password == "ajuste" && discount && discount <= 20) {
      // } else {
        setError(true);
        return;
      // }
    }

    if (discount === discountBeingEdited.discount) {
      handleClose();
      return;
    }
    addUnitaryDiscount({
      id: discountBeingEdited.id,
      name: discountBeingEdited.name,
      discount: discount ?? discountBeingEdited.discount,
      type: discountBeingEdited.type,
    });
    setTimeout(() => {
      handleSaveModalDiscount();
      setPassword("");
      setDiscount(0);
    }, 200);
  };

  React.useEffect(() => {
    setDiscount(discountBeingEdited.discount);
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} className="modalDiscount">
      <Dialog open={open} onClose={handleClose} className="modalRequirements">
        <DialogTitle>{discountBeingEdited.name}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Qual a porcentagem do desconto a ser aplicado ?
          </DialogContentText>
          <div className="form">
            <TextField
              name="discount"
              label="Desconto %"
              type="number"
              className="textField"
              variant="standard"
              value={discount}
              onChange={(e) => {
                handleChangeDiscount(+e.target.value);
              }}
            />

            <TextField
              autoFocus
              margin="dense"
              id="passwordAdmin"
              label="Senha Administrativa"
              type="password"
              error={error}
              fullWidth
              variant="standard"
              disabled={!passIsRequired}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Confirmar</Button>
        </DialogActions>
      </Dialog>

      {/* <input type="hidden" name="unitary_discounts" value={JSON.stringify(unitaryDiscount)} /> */}
    </Dialog>
  );
}
