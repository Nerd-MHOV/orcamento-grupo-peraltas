import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { createData } from "../TableCollapseTariffs/helpers";
import { useApi } from "../../hooks/api/api";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function DialogDeleteRequirement({
  open,
  handleClose,
  handleDelete,
  id,
}: {
  open: boolean;
  handleClose: VoidFunction;
  handleDelete: VoidFunction;
  id: string | undefined;
}) {
  const api = useApi();
  const [requirement, setRequirement] = React.useState("");

  const getRequirement = async () => {
    if (id === undefined) return handleClose();

    const requirement = await api.requirement.getByName(id);

    if (!requirement) {
      return handleClose();
    }

    setRequirement(requirement.name);
  };

  React.useEffect(() => {
    getRequirement();
  }, [open]);
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>{"Certeza que deseja deletar?"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          Clicar em sim excluirá totalmente o requerimento: <b>{requirement}</b>
          .
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Não</Button>
        <Button onClick={handleDelete}>Sim</Button>
      </DialogActions>
    </Dialog>
  );
}
