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

export function DialogDeleteUser({
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
  const [user, setUser] = React.useState("");

  const getUser = async () => {
    if (id === undefined) return handleClose();

    const user = await api.user.getById(id);

    if (!user) {
      return handleClose();
    }

    setUser(user.name);
  };

  React.useEffect(() => {
    getUser();
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
          Clicar em sim excluirá totalmente o usuário: <b>{user}</b>.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Não</Button>
        <Button onClick={handleDelete}>Sim</Button>
      </DialogActions>
    </Dialog>
  );
}
