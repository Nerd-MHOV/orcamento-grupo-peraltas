import * as React from "react";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useApi } from "../../hooks/api/api";

import {
  CalendarMonth,
  CheckBox,
  CheckBoxOutlineBlank,
  Delete,
  Edit,
  Event,
  Person,
} from "@mui/icons-material";
import { ApiDiscountProps } from "../../hooks/api/interfaces";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DialogDeleteDiscount } from "../DialogDeleteDiscount";
import { DateRange } from "react-date-range";
import { Box } from "@mui/system";
import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";

export const head = [
  "Nome",
  "Porcentagem Geral",
  "Porcentagem Unitária",
  "Diária Cortesia",
  "Ativo",
  // "Editar",
  "Deletar",
];

export function Row(props: {
  row: ApiDiscountProps;
  ButtonsOn: boolean;
  reloadRows: VoidFunction;
  onMouseEnter?: React.MouseEventHandler<HTMLTableCellElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLTableCellElement>;
}) {
  const api = useApi();
  const { row, ButtonsOn, reloadRows } = props;
  const [open, setOpen] = React.useState(false);
  const [openUH, setOpenUH] = React.useState(false);
  const [rowToDelete, setRowToDelete] = React.useState<
    ApiDiscountProps | undefined
  >();
  const [deleteOpenModal, setDeleteOpenModal] = React.useState(false);

  const handleToggleActive = async (id: string) => {
    await api.discount.toggleActive(id);
    reloadRows();
  };

  const handleToggleDailyCourtesy = async (id: string) => {
    await api.discount.toggleDailyCourtesy(id);
    reloadRows();
  };

  const handleCloseModal = () => {
    setDeleteOpenModal(false);
  };

  const handleOpenModal = (row: ApiDiscountProps) => {
    setRowToDelete(row);
    setDeleteOpenModal(true);
  };

  const handleDelete = async () => {
    if (rowToDelete === undefined) return;
    await api.discount.delete(rowToDelete.id);
    handleCloseModal();
    reloadRows();
  };

  return (
    <React.Fragment>
      <DialogDeleteDiscount
        open={deleteOpenModal}
        handleClose={handleCloseModal}
        handleDelete={handleDelete}
        rowDelete={rowToDelete}
      />
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell
          component="th"
          scope="row"
          onMouseEnter={props.onMouseEnter}
          onMouseLeave={props.onMouseLeave}
        >
          {row.name}
        </TableCell>
        <TableCell>
          {row.percent_general.map((percent, index) => {
            return (
              <div key={index}>
                {percent.occupancy} - {percent.percent}%
              </div>
            );
          })}
        </TableCell>
        <TableCell>
          {row.percent_unitary.map((percent, index) => {
            return (
              <div key={index}>
                {percent.occupancy} - {percent.percent}%
              </div>
            );
          })}
        </TableCell>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => {
              handleToggleDailyCourtesy(row.id);
            }}
          >
            {row.daily_courtesy ? <CheckBox /> : <CheckBoxOutlineBlank />}
          </IconButton>
        </TableCell>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => {
              handleToggleActive(row.id);
            }}
          >
            {row.active ? <CheckBox /> : <CheckBoxOutlineBlank />}
          </IconButton>
        </TableCell>
        {/* <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => {}}>
            <Edit />
          </IconButton>
        </TableCell> */}
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => {
              handleOpenModal(row);
            }}
          >
            <Delete />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0, position: "relative" }}
          colSpan={4}
        >
          <Collapse
            in={open}
            timeout="auto"
            unmountOnExit
            style={{ position: "relative" }}
          >
            <Box
              display="flex"
              gap={4}
              mt={4}
              justifyContent="center"
              position="relative"
            >
              <DateRange
                className="calendar"
                ranges={row.dates.map((date, index) => {
                  return {
                    startDate: new Date(date.date),
                    endDate: new Date(date.date),
                    key: index.toString(),
                  };
                })}
                onChange={() => {}}
                rangeColors={[]}
                locale={ptBR}
              />

              <Box>
                <List
                  sx={{
                    width: "100%",
                    maxWidth: 360,
                    bgcolor: "background.paper",
                  }}
                >
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <CalendarMonth />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Mínimo de diárias:"
                      secondary={row.daily_minimum}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <CalendarMonth />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Máximo de diárias:"
                      secondary={row.daily_maximum}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Mínimo de pagantes:"
                      secondary={row.payers_minimum}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <Event />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Aplicado em:"
                      secondary={
                        row.applicable_in === "midweek"
                          ? "Somente Meio de Semana"
                          : row.applicable_in === "weekend"
                          ? "Somente Fim de Semana"
                          : "Tudo"
                      }
                    />
                  </ListItem>
                </List>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}
