import { Delete, Paid } from "@mui/icons-material";
import {
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import { useGenerateTariff, useGenerateTariffCorporate } from "../../context/generateTariff/generateTariff";

export const InfoTable = ({ corporate = false }) => {
  const { budgets, deleteLine } = corporate ? useGenerateTariffCorporate() : useGenerateTariff();
  return (
    <div className="infoTable">
      <>
        <Typography sx={{ mb: 2 }} variant="h6" component="div">
          Orçamentos:
        </Typography>
        {budgets.map((budget, index) => {
          let countDaily = budget.columns.length - 1;
          let primary = `${countDaily} diárias - ${budget.arrComplete?.responseForm.category}`;
          let total = 0;
          budget.rows.map((row) => {
            total += Number(row.total);
          });
          return (
            <List dense={true} key={index}>
              <ListItem
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => deleteLine(index)}
                  >
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar>
                    <Paid />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={primary}
                  secondary={`Pensão: ${
                    budget.arrComplete?.responseForm.pension
                  } \n Total: R$ ${total.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
                />
              </ListItem>
            </List>
          );
        })}
      </>
    </div>
  );
};
