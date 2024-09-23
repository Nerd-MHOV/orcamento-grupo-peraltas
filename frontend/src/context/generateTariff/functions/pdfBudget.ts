import { addDays, format } from "date-fns";
import { TDocumentDefinitions } from "pdfmake/interfaces";

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import getLayoutRooms from "./file-part/getLayoutRooms";
(<any>pdfMake).vfs = pdfFonts && pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : globalThis.pdfMake.vfs;

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

async function pdfBudget(
  budgets: any[],
  name: string,
  email: string,
  numberPhone: string,
) {
  const now = format(new Date(), "dd/MM/yyyy HH:mm");
  const validate = format(addDays(new Date(), 3), "dd/MM/yyyy");
  const monthNum = Number(budgets[0].columns[1].substr(-2));
  const titleMonth = months[monthNum - 1];

  const arrValues: any[] = [];

  for (let budget of budgets) {
    const rowBudget = [];
    const layoutRooms = getLayoutRooms(
      budget.arrComplete.responseForm.adult,
      budget.arrComplete.childValue,
      budget.arrComplete.petValue
    );
 
    let total = 0;
    let totalNoDiscount = 0;
    budget.rows.map((row: any) => {
      total += Number(row.total);
      totalNoDiscount += Number(row.totalNoDiscount);
    });

    let requirementString = [];
    let requirementChild = true;
    let requirementObsCeu = true;
    let requirementTourism = true;
    let requirementDecoration = true;
    let requirementCheckIn = true;

    for (let rowRequirement of budget.rows) {
      if (rowRequirement.desc.match(/observação C.E.U/) && requirementObsCeu) {
        requirementString.push({
          text: "\n+Observação C.E.U",
          style: "descRoom",
        });
        requirementObsCeu = false;
      } else if (
        (rowRequirement.desc.match(/Eco A./) ||
          rowRequirement.desc.match(/Território/)) &&
        requirementTourism
      ) {
        requirementString.push({ text: "\n+Turismo", style: "descRoom" });
        requirementTourism = false;
      } else if (
        rowRequirement.desc.match(/decoração romântica./) &&
        requirementDecoration
      ) {
        requirementString.push({
          text: "\n+decoração romântica",
          style: "descRoom",
        });
        requirementDecoration = false;
      } else if (
        rowRequirement.desc.match(/check-in às./) &&
        requirementCheckIn
      ) {
        requirementString.push({
          text: "\n+check-in antecipado",
          style: "descRoom",
        });
        requirementCheckIn = false;
      } else if (
        rowRequirement.desc.match(/CHD 1/) &&
        requirementChild &&
        (rowRequirement.values[0] === 0 || rowRequirement.values[0] === 90)
      ) {
        requirementString.push({
          text: "\n+criança cortesia",
          style: "descRoom",
        });
        requirementChild = false;
      }
    }

    rowBudget.push({
      text: [
        {
          text: budget.arrComplete.responseForm.category.toUpperCase(),
          bold: true,
        },
        layoutRooms,
        ...requirementString,
      ],
      style: "tbody",
      border: [false, false, false, true],
      borderColor: "#c8c8c8",
      margin: 8,
    });
    rowBudget.push({
      text:
        format(budget.arrComplete.selectionRange.startDate, "dd/MM") +
        " à " +
        format(budget.arrComplete.selectionRange.endDate, "dd/MM"),
      style: "tbody",
      border: [false, false, false, true],
      borderColor: "#c8c8c8",
      margin: 8,
      bold: true,
    });
    rowBudget.push({
      text:
        "R$ " +
        total.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      style: "tbody",
      border: [false, false, false, true],
      borderColor: "#c8c8c8",
      margin: 8,
      bold: true,
    });
    rowBudget.push({
      text:
        "R$ " +
        Math.ceil(total * 0.95).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      style: "tbody",
      border: [false, false, false, true],
      borderColor: "#c8c8c8",
      margin: 8,
      color: "#137173",
      bold: true,
    });

    arrValues.push(rowBudget);
  }

  const docDefinitions: TDocumentDefinitions = {
    defaultStyle: {
      //   font: "Helvetica",
      alignment: "center",
    },
    pageSize: {
      width: 595.28,
      height: "auto",
    },
    info: {
      title: "PDF Orçamento cliente",
      author: "Matheus Henrique"
    },
    pageMargins: [0, 0, 0, 0],
    images: {
      top: {
        url: "https://i.postimg.cc/C1cGv2Bd/top.jpg",
      },
    },
    content: [
      {
        image: "top",
        width: 600,
        margin: [0, 0, 0, 8],
      },
      { text: `Consultor(a): ${name}`, style: "vendedora", bold: true },
      {
        text: `e-mail: ${email} telefone: ${numberPhone}`,
        style: "vendedora",
        margin: [0, 0, 0, 8],
      },
      {
        style: "titleTag",
        layout: "noBorders",
        fillColor: "#137173",
        table: {
          widths: ["*"],
          body: [
            [
              {
                text: titleMonth,
                style: "titulo",
                bold: true,
              },
            ],
          ],
        },
      },
      {
        fillColor: "#c8c8c8",
        //   layout: "noBorders",
        table: {
          widths: [145, "*", 150, 150],
          body: [
            [
              {
                text: "",
                borderColor: ["#c8c8c8", "#c8c8c8", "#c8c8c8", "#c8c8c8"],
              },
              {
                text: "Período da Viagem",
                style: "headerTable",
                bold: true,
                margin: 10,
                borderColor: ["#c8c8c8", "#c8c8c8", "#c8c8c8", "#c8c8c8"],
              },
              {
                text: "Valor por quarto",
                style: "headerTable",
                bold: true,
                margin: 10,
                borderColor: ["#c8c8c8", "#c8c8c8", "#c8c8c8", "#c8c8c8"],
              },
              {
                text: "Especial para você!",
                style: "headerTable",
                bold: true,
                margin: 10,
                borderColor: ["#c8c8c8", "#c8c8c8", "#c8c8c8", "#c8c8c8"],
              },
            ],
            [
              {
                text: "",
                borderColor: ["#c8c8c8", "#c8c8c8", "#c8c8c8", "#c8c8c8"],
              },
              {
                text: [
                  "Check in ",
                  { text: "18h", color: "#137173", bold: true },
                  " e\nCheck out as ",
                  { text: "15h", color: "#137173", bold: true },
                ],
                style: "headerTable",
                margin: 8,
                borderColor: ["#c8c8c8", "#c8c8c8", "#c8c8c8", "#c8c8c8"],
              },
              {
                text: [
                  "Pagamento parcelado no cartão de crédito em até",
                  { text: " 10x ", color: "#137173", bold: true },
                  "sem juros.\n",
                  { text: "(Mastercard/Visa/Elo)", bold: true },
                ],
                style: "headerTable",
                // bold: true,
                margin: [0, 8, 0, 8],

                borderColor: ["#c8c8c8", "#c8c8c8", "#c8c8c8", "#c8c8c8"],
              },
              {
                text: [
                  { text: "À VISTA ", color: "#137173", bold: true, fontSize: 10 },
                ],
                style: "headerTable",
                margin: 8,
                borderColor: ["#c8c8c8", "#c8c8c8", "#c8c8c8", "#c8c8c8"],
              },
            ],
            ...arrValues,
          ],
        },
      },
      {
        table: {
          widths: ["*"],
          body: [
            // [
            //   {
            //     text: [
            //       "Não aceitamos cheques de terceiros, pessoa jurídica, comprovantes de agendamento de transferência, DOC, depósito em caixa eletrônico e\ncomprovantes em prints de tela. Trabalhamos apenas com as bandeiras de cartão: ",
            //       { text: "Mastercard/Visa/Elo", bold: true },
            //       {
            //         text: ". Não aceitamos outras bandeiras.",
            //         bold: true,
            //         color: "#137173",
            //       },
            //     ],
            //     borderColor: ["", "#c8c8c8", "", "#c8c8c8"],
            //     border: [false, true, false, true],
            //     style: "descriptions",
            //   },
            // ],
            // [
            //   {
            //     text: [
            //       { text: "PETS", color: "#137173" },
            //       " são muito bem-vindos em nosso hotel fazenda, porém como nossa política é satisfazer a todos, informamos que a ala luxo(800) é a única do nosso hotel que não recebe animais de estimação. Caso tenha um animalzinho informe seu consultor para remanejamento de apartamento. É obrigatório o envio da carteira de vacinação do PET e regulamento animal assinado.",
            //     ],
            //     bold: true,
            //     borderColor: ["", "#c8c8c8", "", "#c8c8c8"],
            //     border: [false, true, false, true],
            //     style: "descriptions",
            //   },
            // ],
            // [
            //   {
            //     text: "É de suma importância comunicar com antecedência que trará seu animal de estimação, visto que os mesmos só poderão ser acomodados nas alas PADRÃO VARANDA e sob aviso prévio.",
            //     borderColor: ["", "#c8c8c8", "", "#c8c8c8"],
            //     border: [false, true, false, true],
            //     style: "descriptions",
            //   },
            // ],
            [
              {
                text: [
                  { text: "Informação importante", bold: true },
                  "\nNo período de baixa temporada recebemos alguns grupos escolares,",
                  "\npode acontecer de termos crianças durante sua estadia.",
                  "\nNesse cenário temos uma adequação quanto a equipe de lazer."
                ],
                borderColor: ["", "#c8c8c8", "", "#c8c8c8"],
                border: [false, true, false, true],
                style: "descriptions",
                margin: [8, 8, 8, 8],
              },
            ],
          ],
        },
      },
      {
        style: "titleTag",
        layout: "noBorders",
        fillColor: "#137173",
        table: {
          widths: ["*"],
          body: [
            [
              {
                text: "OLHA QUE LEGAL O QUE APROVEITARÁ EM NOSSO HOTEL:",
                style: "titulo",
                bold: true,
              },
            ],
          ],
        },
      },
      {
        columns: [
          { width: "*", text: "" },
          {
            width: "auto",
            margin: [15, 0, 15, 0],
            table: {
              body: [
                [
                  {
                    text: "ALIMENTAÇÃO",
                    border: [false, false, false, true],
                    borderColor: ["", "", "", "#c8c8c8"],
                    bold: true,
                    color: "#137173",
                    margin: 30,
                    noWrap: true,
                  },
                  {
                    text: [
                      { text: "PENSÃO COMPLETA:", bold: true },
                      ` Café da manhã, almoço e jantar + suco natural do dia e sobremesa (outras bebidas e consumos cobrados à parte).`,
                      ` Contamos com refeições temáticas com pratos ecléticos e feitos com ingredientes naturais da fazenda.`,
                      { text: "IMPORTANTE:", bold: true },
                      ` Trabalhamos com regime de pensão completa no sistema "Buffet Self
                                        Service" à vontade acima de 21 apartamentos. Quando há um fluxo menor de
                                        hóspedes, servimos o sistema "À La Carte" com a opção também à vontade.`,
                    ],
                    border: [false, false, false, true],
                    borderColor: ["", "", "", "#c8c8c8"],
                    fontSize: 9,
                    alignment: "left",
                    margin: [0, 8, 0, 8],
                  },
                ],
                [
                  {
                    text: "RELAX",
                    border: [false, false, false, true],
                    borderColor: ["", "", "", "#c8c8c8"],
                    bold: true,
                    color: "#137173",
                    margin: 30,
                  },
                  {
                    text: [
                      `Aproveite gazebos para leitura, bosque com redário, sauna seca e a Lagoa Encantada: uma piscina temática, aquecida e coberta com variação de temperatura entre 28º a 30ºC. Ambientalizada em uma caverna cenográfca, possuindo iluminação cênica computadorizada, som digital, cachoeiras, jatos de água,\nestruturas de pontos de jacuzzi, disponível: Terça a Sexta-feira: das 16h00 às 18h30. Sábado e
Domingo das 10h30 às 12h30 e das 16h às 18h30.`,
                    ],
                    border: [false, false, false, true],
                    borderColor: ["", "", "", "#c8c8c8"],
                    fontSize: 9,
                    alignment: "left",
                    margin: [0, 8, 0, 8],
                  },
                ],
                // [
                //   {
                //     text: "HORA DE SE DIVERTIR",
                //     border: [false, false, false, true],
                //     borderColor: ["", "", "", "#c8c8c8"],
                //     bold: true,
                //     color: "#137173",
                //     margin: 17,
                //   },
                //   {
                //     text: [
                //       `Que tal aproveitar a estadia para curtir: arco e flecha; passeio de bike; campeonatos de
                //               futebol e vôlei; paredão de escalada; touro mecânico; 02 tobogãs; 05 piscinas e muito
                //               mais.`,
                //     ],
                //     border: [false, false, false, true],
                //     borderColor: ["", "", "", "#c8c8c8"],
                //     fontSize: 9,
                //     alignment: "left",
                //     margin: [0, 9, 0, 8],
                //   },
                // ],
                [
                  {
                    text: "PROGRAMAÇÃO HOTEL",
                    border: [false, false, false, true],
                    borderColor: ["", "", "", "#c8c8c8"],
                    bold: true,
                    color: "#137173",
                    margin: 20,
                  },
                  {
                    text: [
                      `Contamos com uma equipe de lazer especializada para adultos e crianças a partir de 04 anos. Atividades desde o café da manhã até o jantar, como oficinas de artes e culinária, desafios aquáticos, passeios ecológicos internos, ordenha, futebol de sabão, arco e flecha, mini circuito de arvorismo, campeonatos de futebol e volei, paredão de escalada, touro mecânico, tirolesa no lago, gincanas em família e muito mais!`,
                    ],
                    border: [false, false, false, true],
                    borderColor: ["", "", "", "#c8c8c8"],
                    fontSize: 9,
                    alignment: "left",
                    margin: [0, 8, 0, 8],
                  },
                ],
                [
                  {
                    text: "PETFRIENDLY",
                    border: [false, false, false, true],
                    borderColor: ["", "", "", "#c8c8c8"],
                    bold: true,
                    color: "#137173",
                    margin: [0, 48, 0, 48],
                    noWrap: true,
                  },
                  {
                    text: [
                      `PETS pequenos, médios e de grande porte de raças dóceis são muito bem-vindos em nosso hotel fazenda, porém como nossa política é satisfazer a todos, informamos que a ala luxo (800) é a única do nosso hotel que não recebe animais de estimação. É obrigatório o envio da carteira de vacinação do PET e regulamento animal assinado. Orientamos a passear com o seu melhor amigo munido de guia e em áreas abertas que não interfiram em piscinas e restaurantes. Contamos com o DOG PARK - local dedicado a acondicionar o pet em canis individuais na ausência do tutor e um circuito de agility, ideal para se exercitarem.`,
                      `É de suma importância comunicar com antecedência que trará seu animal de estimação, visto que os mesmos só poderão ser acomodados nas alas PADRÃO VARANDA e sob aviso prévio.`
                    ],
                    border: [false, false, false, true],
                    borderColor: ["", "", "", "#c8c8c8"],
                    fontSize: 9,
                    alignment: "left",
                    margin: [0, 8, 0, 8],
                  },
                ],
                [
                  {
                    text: "OBSERVAÇÃO DOS ASTROS",
                    border: [false, false, false, true],
                    borderColor: ["", "", "", "#c8c8c8"],
                    bold: true,
                    color: "#137173",
                    margin: 12,
                  },
                  {
                    text: [
                      `Faça a sua reserva antecipadamente para o Centro de Estudos do Universo e ganhe 20% de desconto nos ingressos integrais! Nesse local poderá realizar obervação de astros em telescópios profissionais e sessão de planetário com conteúdo exclusivo!`,
                      {
                        text: ' www.ceubrotas.com.br\n',
                        bold: true,
                      },
                      {
                        text: "Consulte se há sessão aberta e disponivel na data de sua estada",
                        bold: true,
                      },
                    ],
                    border: [false, false, false, true],
                    borderColor: ["", "", "", "#c8c8c8"],
                    fontSize: 9,
                    alignment: "left",
                    margin: [0, 8, 0, 8],
                  },
                ],
                [
                  {
                    text: "RADICAL",
                    border: [false, false, false, true],
                    borderColor: ["", "", "", "#c8c8c8"],
                    bold: true,
                    color: "#137173",
                    margin: 17,
                  },
                  {
                    text: [
                      `Aproveite a sua vinda a Brotas para realizar as melhores atividades ecológicas e radicais do país! Temos parceria com as principais operadoras certificadas da cidade para que conheçam, o Rafting, Tirolesa, Boia Cross, Rapel entre muitas outras!`,
                    ],
                    border: [false, false, false, true],
                    borderColor: ["", "", "", "#c8c8c8"],
                    fontSize: 9,
                    alignment: "left",
                    margin: [0, 9, 0, 8],
                  },
                ],
              ],
            },
          },
        ],
      },
      {
        text: `DATA DA COTAÇÃO: ${now} - VALIDADE DA COTAÇÃO: ${validate}`,
        style: "vendedora",
        margin: [0, 20, 0, 0],
        bold: true,
      },
      {
        marginTop: 20,
        layout: "noBorders",
        fillColor: "#137173",
        table: {
          widths: ["*"],
          body: [[{ text: "", margin: 30 }]],
        },
      },
    ],
    styles: {
      vendedora: {
        fontSize: 9,
        color: "#646464",
        marginTop: 2.4,
      },
      titulo: {
        color: "white",
        fontSize: 18,
        margin: 15,
      },
      titleTag: {
        background: "#137173",
      },
      headerTable: {
        marginTop: 3,
        marginBottom: 10,
        fontSize: 8,
        alignment: "center",
      },
      tbody: {
        fontSize: 10,
        background: "white",
        fillColor: "white",
        lineHeight: 1.2,
      },
      descRoom: {
        color: "#137173",
        fontSize: 8,
      },
      descriptions: {
        fontSize: 8,
        lineHeight: 1.2,
        margin: 8,
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

export default pdfBudget;
