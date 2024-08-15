import { Content, TDocumentDefinitions } from "pdfmake/interfaces";

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { addDays, format } from "date-fns";
import { CorporateBodyResponseBudget } from "../../../../hooks/api/interfaces";
import { applyBoder } from "./applyBorder";
import { doBodyAccommodation } from "./accommodation";
import { doTableBudgetCorp } from "./doTableBudgetCorp";
import { stylesBudgetCorp } from "./styles.pdfBudgetCorp";
import { doBodyRequirements } from "./requirements";
import { layoutPageCollaborators } from "./LayoutPageCollaborator";
import { breakPage } from "./breakPage";
import { doBodyLocations } from "./location";
import { PATH_IMAGES_BUDGET } from "../../../../config";
(<any>pdfMake).vfs = pdfFonts && pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : globalThis.pdfMake.vfs;

const slideImagesPath = PATH_IMAGES_BUDGET;

async function pdfBudgetCorp(
  budget: CorporateBodyResponseBudget,
  name: string,
  email: string,
  numberPhone: string,
  descriptionBudget: Content[],
) {
  const now = format(new Date(), "dd/MM/yyyy HH:mm");
  const validate = format(addDays(new Date(), 3), "dd/MM/yyyy");
  const slidesContent = []
  for (let index = 1; index <= 10; index++) {
    slidesContent.push({
      image: `slide${index}`,
      width: 600,
      // margin: [0, 0, 0, 0],
    })
  }

  const callLayoutPageCollaborators = () => {
    return layoutPageCollaborators(
      name, numberPhone, email, now, validate
    )
  }

  const callBreakPage = () => {
    return breakPage(callLayoutPageCollaborators)
  }

  const dateSelection = budget.dateRange.find(date => date.key === 'selection');
  const dateSecond = budget.dateRange.find(date => date.key === 'second');

  const stringDateSelection = dateSelection && dateSecond ? ` (${format(new Date(dateSelection?.startDate), 'dd')} à ${format(new Date(dateSelection?.endDate), 'dd/MM')})` : '';
  const stringDateSecond = dateSecond ? ` (${format(new Date(dateSecond?.startDate), 'dd')} à ${format(new Date(dateSecond?.endDate), 'dd/MM')})` : '';

  const accommodationTable = doTableBudgetCorp([
    applyBoder([`HOSPEDAGEM${stringDateSelection}`, "DISPOSIÇÃO", "PREÇO"], 'total_block'),
    ...doBodyAccommodation(budget, false),
  ], callBreakPage, !!budget.rooms.filter(room => !room.isStaff).length)

  const accommodationTableStaff = doTableBudgetCorp([
    applyBoder([`HOSPEDAGEM${stringDateSecond}`, "DISPOSIÇÃO", "PREÇO"], 'total_block'),
    ...doBodyAccommodation(budget, true),
  ], callBreakPage, !!budget.rooms.filter(room => room.isStaff).length, accommodationTable.rows)

  const requirementTable = doTableBudgetCorp([
    applyBoder(["REQUERIMENTOS", "QUANTIDADE", "PREÇO"], 'total_block'),
    ...doBodyRequirements(budget),
  ], callBreakPage, !!budget.requirements.some(req => req.type !== "location"), accommodationTableStaff.rows)

  const locationTable = doTableBudgetCorp([
    applyBoder(["LOCAÇÃO", "QUANTIDADE", "PREÇO"], 'total_block'),
    ...doBodyLocations(budget),
  ], callBreakPage, !!budget.requirements.some(req => req.type === "location"), requirementTable.rows)
  const agencyTable = doTableBudgetCorp([
    applyBoder(["AGÊNCIA",
      `${budget.agencyPercent}%`,
      "R$ " + budget.rowsValues.rows.find(row => row.type === 'agency')?.total.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })]
      , 'total_block'),
  ], callBreakPage, !!budget.rowsValues.rows.some(row => row.type === "agency"), locationTable.rows)

  const docDefinitions: TDocumentDefinitions = {
    defaultStyle: {
      //   font: "Helvetica",
      alignment: "center",
    },
    // pageSize: {
    //   width: 595.28,
    //   height: "auto",
    // },
    pageSize: 'A4',
    info: {
      title: "PDF Orçamento cliente",
      author: "Matheus Henrique"
    },
    pageMargins: [0, 0, 0, 0],
    images: {
      slide1: { url: `${slideImagesPath}Slide1.JPG` },
      slide2: { url: `${slideImagesPath}Slide2.JPG` },
      slide3: { url: `${slideImagesPath}Slide3.JPG` },
      slide4: { url: `${slideImagesPath}Slide4.JPG` },
      slide5: { url: `${slideImagesPath}Slide5.JPG` },
      slide6: { url: `${slideImagesPath}Slide6.JPG` },
      slide7: { url: `${slideImagesPath}Slide7.JPG` },
      slide8: { url: `${slideImagesPath}Slide8.JPG` },
      slide9: { url: `${slideImagesPath}Slide9.JPG` },
      slide10: { url: `${slideImagesPath}Slide10.JPG` },
      slide14: { url: `${slideImagesPath}Slide14.JPG` },
      top: { url: `${slideImagesPath}top.JPG` },
      bottom: { url: `${slideImagesPath}bottom.JPG` },
    },
    content: [
      ...slidesContent,
      callLayoutPageCollaborators(),
      accommodationTable.content,
      accommodationTableStaff.content,
      requirementTable.content,
      locationTable.content,
      agencyTable.content,
      doTableBudgetCorp([
        applyBoder(["TOTAL", "",
          "R$ " + budget.rowsValues.total.total.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
        ], 'total_block'),
      ], callBreakPage, true, agencyTable.rows).content,
      callBreakPage(),
      descriptionBudget.map( desc => {
        //@ts-ignore
        if (desc?.text === '<---------------------breakPage--------------------->')
          return callBreakPage()
        return desc
      }),
      {
        image: `slide14`,
        width: 600,
        // pageBreak: 'before',
      }
    ],
    styles: stylesBudgetCorp,
    // pageBreakBefore: (currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) => {
    //   return currentNode.startPosition.top > 700; // Adjust this value as needed
    // },
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

export default pdfBudgetCorp;
