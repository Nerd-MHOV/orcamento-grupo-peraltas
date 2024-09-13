import {TDocumentDefinitions} from "pdfmake/interfaces";

import {HeaderCalcMemory} from "./file-part/calc-memory/header";
import {DailyCalcMemory} from "./file-part/calc-memory/daily";
import {ExtraCalcMemory} from "./file-part/calc-memory/extra";
import {TotalCalcMemory} from "./file-part/calc-memory/total";
import DataContentProps from "../interfaces/tableBudgetDataContentProps";
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(<any>pdfMake).vfs = pdfFonts && pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : globalThis.pdfMake.vfs;


const onlyNumber = (string: string | undefined) => {
    if (!string) return 0;
    string = string.replace(/[.]/g, "");
    string = string.replace(/[,]/g, ".");
    string = string.replace(/[^0-9 |^.]/g, "");
    return Number(string);
};

async function pdfDescription(
    budgets: DataContentProps[],
    namePerson: string
) {
    const contentFor = [];
    //housing unit

    let realBudget = budgets[0];
    let housingUnit =
        realBudget.arrComplete?.responseForm?.housingUnit?.substr(0, 3) || `1000`;


    for (const singleBudget of budgets) {
        let rows_days = [];
        let rows_extra = [];
        // Line to Line
        for (let budget of singleBudget.rows) {
            let lineRows = [];
            lineRows.push({text: budget.desc, style: {fontSize: 9}});
            for (let value of budget.values) {
                lineRows.push({
                    text: `R$ ${value.toLocaleString("pt-BR", {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                    })}`,
                    style: {
                        fontSize: 9,
                    },
                });
            }
            lineRows.push({
                text: `R$ ${(Number(budget.total) - Number(budget.totalNoDiscount)).toLocaleString(
                    "pt-BR",
                    {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                    }
                )}`,
                style: {
                    fontSize: 9,
                },
                bold: true,
            });
            lineRows.push({
                text: `R$ ${budget.total.toLocaleString("pt-BR", {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                })}`,
                style: {
                    fontSize: 9,
                },
                bold: true,
            });

            const typeToRowsDays = ['adult', 'child', 'pet', 'room'];
            if (typeToRowsDays.includes(budget.type)) rows_days.push(lineRows);
            else rows_extra.push(lineRows);
        }
        let lastRow_days = [];
        let lastRow_extras = [];
        // Total Line
        for (let count = 0; count <= singleBudget.columns.length + 1; count++) {
            if (count === 0) {
                lastRow_days.push({
                    text: "Total de Diárias",
                    bold: true,
                    style: {fontSize: 8},
                });
                lastRow_extras.push({
                    text: "Total de Extras",
                    bold: true,
                    style: {fontSize: 8},
                });
            } else if (count === singleBudget.columns.length) {
                let total_days = 0;
                let total_extras = 0;
                for (let day of rows_days) {
                    total_days += onlyNumber(day[count].text);
                }

                for (let extra of rows_extra) {
                    total_extras += onlyNumber(extra[count].text);
                }

                lastRow_days.push({
                    text: `R$ -${total_days.toLocaleString("pt-BR", {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                    })}`,
                    bold: true,
                    style: {
                        fontSize: 9,
                    },
                    color: "#d05c45",
                });
                lastRow_extras.push({
                    text: `R$ ${total_extras.toLocaleString("pt-BR", {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                    })}`,
                    bold: true,
                    style: {
                        fontSize: 9,
                    },
                    color: "#d05c45",
                });
            } else {
                let total_days = 0;
                let total_extras = 0;
                for (let day of rows_days) {
                    total_days += onlyNumber(day[count].text);
                }

                for (let extra of rows_extra) {
                    total_extras += onlyNumber(extra[count].text);
                }

                lastRow_days.push({
                    text: `R$ ${total_days.toLocaleString("pt-BR", {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                    })}`,
                    style: {
                        fontSize: 9,
                    },
                    bold: true,
                });
                lastRow_extras.push({
                    text: `R$ ${total_extras.toLocaleString("pt-BR", {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                    })}`,
                    style: {
                        fontSize: 9,
                    },
                    bold: true,
                });
            }
        }

        let columns = singleBudget.columns.map((title: string) => ({
            text: title,
            bold: true,
            style: {
                fontSize: 8,
            },
        }));

        // Last Line Total
        columns.push({
            text: "desconto aplicado",
            bold: true,
            style: {
                fontSize: 8,
            },
        });
        columns.push({
            text: "TOTAL",
            bold: true,
            style: {
                fontSize: 8,
            },
        });


        // total
        let total =
            onlyNumber(lastRow_days.at(-1)?.text) +
            onlyNumber(lastRow_extras.at(-1)?.text);
        // const otherColumns = columns;

        let widthTable = [];
        for (let line of lastRow_days) widthTable.push("*");

        const content: any[] = [
            {
                text: singleBudget.arrComplete?.responseForm.category,
                style: {fontSize: 18},
                alignment: "center",
            },
            {
                text: `${singleBudget.arrComplete?.responseForm.housingUnit} - pensão: ${singleBudget.arrComplete?.responseForm.pension}`,
                style: {fontSize: 8},
                alignment: "center",
            },
            ...DailyCalcMemory(widthTable, columns, rows_days, lastRow_days),
            {text: " ", style: {margin: 200}}, //margin
            ...ExtraCalcMemory(widthTable, columns, rows_extra, lastRow_extras),
            ...TotalCalcMemory(total),
            {
                text: "_______________________________________________________________________________________",
                margin: [0, 20, 0, 10],
                noWrap: true,
                alignment: "center"
            }
        ]
        contentFor.push(...content)
    }


    const docDefinitions: TDocumentDefinitions = {
        defaultStyle: {
            //   font: "Helvetica",
            alignment: "left",
        },
        pageSize: {
            width: 600,
            height: "auto"
        },
        info: {
            title: "Memoria de Calculo",
            author: "Matheus Henrique"
        },
        pageMargins: 15,
        content: [
            ...HeaderCalcMemory(namePerson, realBudget.arrComplete?.responseForm.rd_client || ''),
            //for
            {
                text: "_______________________________________________________________________________________",
                margin: [0, 20, 0, 10],
                noWrap: true,
                alignment: "center"
            },
            ...contentFor,
            {
                text: `000000${housingUnit}09928`,
                alignment: "right",
                fontSize: 8,
            },
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
            },
            description: {
                fontSize: 8,
            },
        },
    };

    const pdf = pdfMake.createPdf(docDefinitions);
    //pdf.open();

    pdf.getBlob((blob) => {
        // Converte o blob em uma URL de dados
        const url = URL.createObjectURL(blob);
        // Define o tamanho e posição da janela pop-up
        const width = 1000; // Largura da janela em pixels
        const height = 650; // Altura da janela em pixels
        const left = (window.innerWidth - width) / 2; // Centraliza a janela horizontalmente
        const top = (window.innerHeight - height) / 2; // Centraliza a janela verticalmente
        const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;

        // Abre a janela pop-up com o PDF
        window.open(url, '_blank', features);
    });
}

export default pdfDescription;
