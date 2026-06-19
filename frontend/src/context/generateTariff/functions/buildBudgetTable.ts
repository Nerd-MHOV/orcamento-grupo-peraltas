import DataContentProps, {
  ArrComplete,
} from "../interfaces/tableBudgetDataContentProps";
import RowsProps from "../interfaces/tableBudgetRowsProps";

/**
 * Monta o patch do orçamento (dataTable) a partir das linhas calculadas, do
 * arrComplete e da lista de tarifários usados retornada pelo backend.
 *
 * Função pura: facilita teste do encadeamento `tariffs` (resposta da API) ->
 * `tariffsUsed` (objeto de orçamento) sem precisar montar a árvore React.
 * Aditiva: se `tariffsUsed` não for informado, o campo fica `undefined` e os
 * consumidores existentes não são afetados.
 */
export function buildBudgetTable(
  rows: RowsProps[],
  arrComplete?: ArrComplete,
  tariffsUsed?: string[]
): Pick<DataContentProps, "rows" | "arrComplete" | "tariffsUsed"> {
  return { rows, arrComplete, tariffsUsed };
}
