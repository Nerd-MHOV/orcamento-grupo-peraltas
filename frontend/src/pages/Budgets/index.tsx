import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { LayoutBudget } from "../../components/Layout";
import { SearchInputBudget } from "../../components/SearchBudget";
import CollapsibleTableBudgets from "../../components/TableCollapseBudgets";
import { createData } from "../../components/TableCollapseBudgets/helpers";
import { useApi } from "../../hooks/api/api";
import { ApiSavedBudgetsProps } from "../../hooks/api/interfaces";

import "./style.scss";

export const BudgetsPage = () => {
  const api = useApi();

  const [rows, setRows] = useState<ReturnType<typeof createData>[]>([]);
  const [budgets, setBudgets] = useState<ApiSavedBudgetsProps[]>([]);
  const [search, setSearch] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const getBudgets = async () => {
    const response = await api.budget.getSaved(search, onlyFavorites);
    setBudgets(response);
  };

  const makeRows = async () => {
    let rows: ReturnType<typeof createData>[] = [];

    budgets.map((bud) => {
      let id_rd = "";
      let total = 0;
      let uhs = 0;
      bud.budgets.forEach((row) => {
        id_rd =
          row.arrComplete.responseForm?.rd_client !== undefined
            ? row.arrComplete.responseForm?.rd_client
            : id_rd;

        total += row.total.total;
        uhs++;
      });
      rows.push(
        createData({
          budgets: bud.budgets,
          date: new Date(bud.createdAt),
          rd_client: id_rd,
          total: total,
          id: bud.id,
          user: bud.responsible.name,
          uhs: uhs,
          favorites: bud.favorites,
          name: bud.name,
          status: bud.status,
        })
      );
    });

    setRows(rows);
  };

  useEffect(() => {
    makeRows();
  }, [budgets]);

  useEffect(() => {
    getBudgets();
  }, [search, onlyFavorites]);

  return (
    <LayoutBudget>
      <div className="p20">
        <div className="containerBx">
          <div className="top">
            <div className="titleContainerBx">Gerenciar Orçamentos</div>
            <Box>
              <SearchInputBudget setWord={setSearch} word={search} />
              <Box display="flex" alignItems="center">
                <p style={{ color: "gray" }}>Somente favoritos</p>
                <IconButton
                  aria-label="expand row"
                  size="small"
                  onClick={() => setOnlyFavorites(!onlyFavorites)}
                >
                  {onlyFavorites ? <CheckBox /> : <CheckBoxOutlineBlank />}
                </IconButton>
              </Box>
            </Box>
          </div>
          <div className="table">
            <CollapsibleTableBudgets rows={rows} reloadRows={getBudgets} />
          </div>
        </div>
      </div>
    </LayoutBudget>
  );
};
