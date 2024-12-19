import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  CheckBox,
  CheckBoxOutlineBlank,
  Delete,
  Edit,
} from "@mui/icons-material";
import { useApi } from "../../hooks/api/api";
import { DialogDeleteRequirement } from "../DialogDeleteRequirement";
import { deleteRequirement } from "../../pages/Requirements/deleteRequirement";
import DialogPriceRequirement from "../DialogPriceRequirement";

export interface dataRequirementsProps {
  name: string;
  price: number;
  type: string;
  typeModal: string;
  active: boolean;
}

export function createRequirementsData(
  name: string,
  price: number,
  type: string,
  typeModal: string,
  active: boolean
) {
  return {
    name,
    type: translateType(type),
    typeModal: translateTypeModal(typeModal),
    price,
    active,
  };
}

const translateType = (type: string) => {
  const translations: { [key: string]: string } = {
    accommodation: "Hospedagem",
    corporate: "Corporativo",
    location: "Locação",
    both: "Ambos",
  };
  return translations[type] || type;
};
const translateTypeModal = (type: string) => {
  const translations: { [key: string]: string } = {
    ticket: "Ingresso",
    person: "Especial não usar",
    amount: "Quantidade",
    participant: "Participante",
  };
  return translations[type] || type;
};

export default function TableRequirements({
  rows,
  att,
}: {
  rows: dataRequirementsProps[];
  att: VoidFunction;
}) {
  const [openDelete, setOpenDelete] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState("");
  const [requirementId, setRequirementId] = React.useState("");

  const api = useApi();

  return (
    <TableContainer component={Paper}>
      <DialogPriceRequirement
        open={openEdit}
        close={() => {
          setOpenEdit(false);
        }}
        confirm={async (price: number) => {
          const response = await api.requirement.price(requirementId, price);
          att();
          return true;
        }}
        requirement={requirementId}
      />
      <DialogDeleteRequirement
        open={openDelete}
        handleClose={() => {
          setOpenDelete(false);
        }}
        handleDelete={() => {
          deleteRequirement(deleteId).finally(() => {
            att();
          });
          setOpenDelete(false);
        }}
        id={deleteId}
      />
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell align="right">Valor</TableCell>
            <TableCell align="right">Tipo</TableCell>
            <TableCell align="right">Modal</TableCell>
            <TableCell align="right">Editar</TableCell>
            <TableCell align="right">Ativo</TableCell>
            <TableCell align="right">Apagar</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="right">{row.price}</TableCell>
              <TableCell align="right">{row.type}</TableCell>
              <TableCell align="right">{row.typeModal}</TableCell>
              <TableCell align="right">
                <button
                  style={{ cursor: "pointer" }}
                  className="css-1pe4mpk-MuiButtonBase-root-MuiIconButton-root"
                  onClick={() => {
                    setRequirementId(row.name);
                    setOpenEdit(true);
                  }}
                >
                  <Edit />
                </button>
              </TableCell>
              <TableCell align="right">
                <button
                  style={{ cursor: "pointer" }}
                  className="css-1pe4mpk-MuiButtonBase-root-MuiIconButton-root"
                  onClick={() => {
                    api.requirement.active(row.name).finally(() => {
                      att();
                    });
                  }}
                >
                  {row.active ? <CheckBox /> : <CheckBoxOutlineBlank />}
                </button>
              </TableCell>

              <TableCell align="right">
                <button
                  style={{ cursor: "pointer" }}
                  className="css-1pe4mpk-MuiButtonBase-root-MuiIconButton-root"
                  onClick={() => {
                    setDeleteId(row.name);
                    setOpenDelete(true);
                  }}
                >
                  <Delete />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
