import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { head, Row } from "./helpers";
import { ApiDiscountProps } from "../../hooks/api/interfaces";
import { ActionsInsightsApi } from "../../hooks/api/all/insights.api";
import { useState } from "react";
import InsightCloud from "./insights-cloud";

interface CollapsibleTableProps {
  rows: ApiDiscountProps[];
  ButtonsOn?: boolean;
  reloadRows?: VoidFunction;
  insights: ActionsInsightsApi
}

export default function CollapsibleTableDiscounts({
  rows,
  insights,
  ButtonsOn = true,
  reloadRows = () => {},
}: CollapsibleTableProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredRow, setHoveredRow] = useState<ApiDiscountProps | null>(null);

  const handleMouseMove = (event: React.MouseEvent<HTMLTableCellElement, MouseEvent>) => {
    setMousePosition({ x: event.pageX, y: event.pageY });
  };

  const handleMouseEnter = (row: ApiDiscountProps) => {
    setHoveredRow(row);
  };

  const handleMouseLeave = () => {
    setHoveredRow(null);
  };


  return (
    <div onMouseMove={handleMouseMove}>

    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            {head.map((title) => (
              <TableCell key={title}>{title}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <Row
              key={row.id}
              row={row}
              ButtonsOn={ButtonsOn}
              reloadRows={reloadRows}
              onMouseEnter={() => handleMouseEnter(row)}
              onMouseLeave={(handleMouseLeave)}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    {hoveredRow && <InsightCloud mousePosition={mousePosition} insights={insights[hoveredRow.name]} />}
    </div>
  );
}
