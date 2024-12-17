import * as React from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {useApi} from "../../hooks/api/api";
import Btn from "../Btn";
import {
    CategoryOptionsProps
} from "../../context/generateTariff/interfaces/categoriesProps";
import PensionsOptionsProps from "../../context/generateTariff/interfaces/pensionOptionsProps";
import RowsProps from "../../context/generateTariff/interfaces/tableBudgetRowsProps";
import SelectionRangeProps from "../../context/generateTariff/interfaces/selectionRangeProps";
import {format} from "date-fns";
import {ptBR} from "date-fns/locale";
import {AuthContext} from "../../context/authContext";
import pdfDescription from "../../context/generateTariff/functions/pdfDescription";
import pdfBudget from "../../context/generateTariff/functions/pdfBudget";
import {Star, StarOutline, StartOutlined} from "@mui/icons-material";
import {StatusBudget} from "../StatusBudget/StatusBudget";
import BudgetNameField from "./BudgetNameField";
import Button from "@mui/material/Button";
import DataContentProps from "../../context/generateTariff/interfaces/tableBudgetDataContentProps";

export const head = ["Data", "nome", "User", "ID RD", "UHs", "TOTAL", "status", "favoritos"];

export function convertForReal(number?: number) {
    if (typeof number !== "number") {
        return number;
    }
    return `R$ ${number.toLocaleString("pt-BR", {
        minimumFractionDigits: 2, maximumFractionDigits: 2,
    })}`;
}

export interface BudgetsProps {
    date: Date;
    rd_client?: string;
    budgets: BudgetsContentProps[];
    total: number;
    id: string;
    user: string;
    uhs: number;
    favorites: BudgetsFavoritesProps[];
    name: string;
    status: string;
}

export interface BudgetsFavoritesProps {
    id: string;
    budget_id: string;
    user_id: string;
}

export interface BudgetsContentProps {
    rows: RowsProps[];
    columns: string[];
    arrComplete: BudgetsArrCompleteProps;
    total: {
        total: number; noDiscount: number;
    };
}

export interface BudgetsArrCompleteProps {
    petValue: string[];
    childValue: number[];
    responseForm: BudgetsResponseFormProps;
    selectionRange: SelectionRangeProps;
}

export interface BudgetsResponseFormProps {
    adult: string | number;
    pension: PensionsOptionsProps;
    category: string;
    categoryComplete: CategoryOptionsProps;
    parcel: string | number;
    discount?: string | number;
    rd_client?: string;
    housingUnit: string;
}

export function createData({date, rd_client, budgets, total, id, user, uhs, favorites, name, status }: BudgetsProps) {
    return {
        date, rd_client, total, id, user, budgets, uhs, favorites, name, status,
    };
}

export function Row(props: {
    row: ReturnType<typeof createData>; ButtonsOn: boolean; reloadRows: VoidFunction;
}) {
    const api = useApi();
    const {row, ButtonsOn, reloadRows} = props;
    const [open, setOpen] = React.useState(false);
    const [openUH, setOpenUH] = React.useState(false);
    const {userLogin} = React.useContext(AuthContext);

    async function generatePdfDescription(budgets: DataContentProps[]) {
        const deal_id = budgets[0].arrComplete?.responseForm.rd_client;
        let name: string;
        name = "";
        if (typeof deal_id === "string") api.rd.getDealById(deal_id)
            .then((response) => {
                name = response?.name || "undefined";
            })
            .finally(() => {
                pdfDescription(budgets, name);
            }); else await pdfDescription(budgets, name);
    }

    async function generatePdfBudget(budgets: BudgetsContentProps[]) {
        if (budgets.length < 1) {
            return;
        }
        const arrUser = await api.user.getById(userLogin);
        await pdfBudget(budgets, arrUser.name, arrUser.email, arrUser.phone,);
    }

    async function handleSendBudget(rd_id: string | undefined, budget_id: string, budget: BudgetsContentProps[]) {
        if(!rd_id) return;
        alert("Enviando!")
    }

    async function handleFavorite(id: string) {
        api.favoriteBudget(id).then((response) => {
            reloadRows();
        });
    }

    return (<React.Fragment>
            <TableRow sx={{"& > *": {borderBottom: "unset"}}}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    {format(row.date, "dd/MM/yy HH:mm", {locale: ptBR})}
                </TableCell>
                <TableCell><BudgetNameField name={row.name} id={row.id} reload={reloadRows} /></TableCell>
                <TableCell>{row.user}</TableCell>
                <TableCell>{row.rd_client}</TableCell>
                <TableCell>{row.uhs}</TableCell>
                <TableCell>{convertForReal(row.total)}</TableCell>
                <TableCell><StatusBudget status={row.status} /></TableCell>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => handleFavorite(row.id)}
                    >
                        {row.favorites.find((favorite) => favorite.user_id === userLogin) ? (<Star/>) : (
                            <StarOutline/>)}
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={9}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <>
                            {row.budgets.map((bud, index) => {
                                let totalDay: number[] = [];
                                return (<Box sx={{margin: 1}} key={index}>
                                        <Box display="flex" alignItems="center">
                                            <IconButton
                                                aria-label="expand row"
                                                size="small"
                                                onClick={() => setOpenUH(!openUH)}
                                            >
                                                {openUH ? (<KeyboardArrowUpIcon/>) : (<KeyboardArrowDownIcon/>)}
                                            </IconButton>
                                            <Typography variant="body2" gutterBottom component="div">
                                                {bud.arrComplete.responseForm?.housingUnit} -{" "}
                                                {convertForReal(bud.total.total)}
                                            </Typography>
                                        </Box>

                                        <Collapse in={openUH} timeout="auto" unmountOnExit>
                                            <Box>
                                                <Table size="small" aria-label="purchases">
                                                    <TableHead>
                                                        <TableRow>
                                                            {bud.columns.map((title) => (
                                                                <TableCell key={title}>{title}</TableCell>))}
                                                            <TableCell>Total</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {bud.rows.map((line) => (<TableRow key={line.id}>
                                                                <TableCell>{line.desc}</TableCell>
                                                                {line.values.map((value, index) => {
                                                                    totalDay[index] = totalDay[index] !== undefined ? totalDay[index] + value : value;
                                                                    return (<TableCell key={index}>
                                                                            {convertForReal(value)}
                                                                        </TableCell>);
                                                                })}
                                                                <TableCell>
                                                                    {convertForReal(+line.total)}
                                                                </TableCell>
                                                            </TableRow>))}
                                                        <TableRow>
                                                            <TableCell>Total</TableCell>
                                                            {totalDay.map((td, index) => {
                                                                return (<TableCell key={index} >{convertForReal(td)}</TableCell>);
                                                            })}
                                                            <TableCell>
                                                                {convertForReal(bud.total.total)}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                                <Box my={1} textAlign="right">
                                                    <div
                                                        className="discount"
                                                        style={{color: "#d05c45", marginBottom: 5}}
                                                    >
                                                        desconto aplicado:{" "}
                                                        {convertForReal(+bud.total.total - bud.total.noDiscount)}
                                                    </div>

                                                    <Box gap={2} display="flex" justifyContent="right">
                                                        <Btn
                                                            action="Memória de cálculo"
                                                            color="dashboard"
                                                            onClick={() => {
                                                                generatePdfDescription([bud]);
                                                            }}
                                                        />
                                                        {/* <Btn
                              action="PDF de Orçamento"
                              color="dashboard"
                              onClick={() => {
                                generatePdfBudget([bud]);
                              }}
                            /> */}
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Collapse>
                                    </Box>);
                            })}
                            <Box display={"flex"} sx={{
                                justifyContent: "end",
                                marginBottom: 2
                            }}>
                                <Button onClick={() => { handleSendBudget(row.rd_client, row.id, row.budgets)}}>Enviar para Cliente</Button>
                            </Box>
                        </>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>);
}
