import { useState } from "react";
import Button from "@mui/material/Button";
import { Popover, TextField } from "@mui/material";
import { useApi } from "../../hooks/api/api";

export default function BudgetNameField({
  name,
  id,
  reload,
}: {
  name: string;
  id: string;
  reload: VoidFunction;
}) {
  const api = useApi();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [nameBudget, setNameBudget] = useState(name);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRename = async () => {
    await api.budget.rename(id, nameBudget);
    reload();
    handleClose();
  };

  const open = Boolean(anchorEl);
  const idMui = open ? "simple-popover" : undefined;
  return (
    <>
      <Button
        style={{
          background: "transparent",
          color: "black",
        }}
        aria-describedby={id}
        onClick={handleClick}
      >
        {name}
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: 4,
            gap: 2,
          }}
        >
          <TextField
            autoComplete={"none"}
            label={"Nome do orçamento"}
            variant={"standard"}
            value={nameBudget}
            onChange={(e) => {
              setNameBudget(e.target.value);
            }}
          />
          <Button variant="contained" onClick={handleRename}>
            Renomear
          </Button>
        </div>
      </Popover>
    </>
  );
}
