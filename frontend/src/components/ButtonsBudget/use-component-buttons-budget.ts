import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { useApi } from "../../hooks/api/api";
import pdfBudget from "../../context/generateTariff/functions/pdfBudget";
import pdfDescription from "../../context/generateTariff/functions/pdfDescription";
import {
  rdSaveProcess,
  rdSaveProcessCorp,
} from "../../context/generateTariff/functions/rdSaveProcess";
import {
  useGenerateTariff,
  useGenerateTariffCorporate,
} from "../../context/generateTariff/generateTariff";
import * as React from "react";
import pdfBudgetCorp from "../../context/generateTariff/functions/pdfBudgetCorp/pdfBudgetCorp";
import pdfDescriptionCorp from "../../context/generateTariff/functions/pdfDescriptionCorp/pdfDescriptionCorp";
import { Descendant } from "slate";
import slateToPdfMake from "../ModalEditableText/ConvertText";

export function useComponentButtonsBudget(corporate: boolean) {
  const { userLogin } = useContext(AuthContext);
  const {
    budgets,
    bodyResponseBudget,
    handleSaveBudget,
    clearTariffs,
    handleOpenBackdrop,
    dataTable,
    handleCloseBackdrop,
  } = corporate
    ? useGenerateTariffCorporate()
    : { ...useGenerateTariff(), bodyResponseBudget: null };
  const api = useApi();
  const [openModalConfirmGroup, setOpenModalConfirmGroup] =
    React.useState(false);
  const [openModalEditableText, setOpenModalEditableText] =
    React.useState(false);

  const handleOpenModalConfirmGroup = () => {
    const dealId = budgets.reduce((acc, budget) => {
      if (!acc && budget.arrComplete?.responseForm.rd_client) {
        return budget.arrComplete.responseForm.rd_client;
      }
      return acc;
    }, "");

    if (budgets.length > 1 && dealId) {
      setOpenModalConfirmGroup(true);
      return;
    }

    handleOpenBackdrop();
    if (!corporate) generatePdfBudget();
    else if (bodyResponseBudget) setOpenModalEditableText(true);
    else handleCloseBackdrop();
  };

  const handleCloseModal = () => {
    setOpenModalConfirmGroup(false);
    setOpenModalEditableText(false);
  };

  async function generatePdfBudgetCorporate(
    text: Descendant[],
    linesToBreakPage: number
  ) {
    handleCloseModal();
    if (!bodyResponseBudget) {
      handleCloseBackdrop();
      return;
    }
    await rdSaveProcessCorp(bodyResponseBudget);
    const arrUser = await api.user.getById(userLogin);
    await pdfBudgetCorp(
      bodyResponseBudget!,
      arrUser.name,
      arrUser.email,
      arrUser.phone,
      slateToPdfMake(text),
      linesToBreakPage
    );

    // save budget
    const deal_id = bodyResponseBudget.idClient;
    let response;
    if (deal_id) response = await api.rd.getDealById(deal_id);
    api.budgetCorp.save(userLogin, bodyResponseBudget, true, response?.name);

    handleCloseBackdrop();
  }

  async function generatePdfBudget(group = false) {
    handleCloseModal();
    if (budgets.length < 1) {
      return;
    }
    await rdSaveProcess(budgets, group);
    if (
      budgets.find((budget) =>
        budget.arrComplete?.responseForm.category.match(/Day-Use/)
      )
    ) {
      return;
    }
    const arrUser = await api.user.getById(userLogin);
    await pdfBudget(budgets, arrUser.name, arrUser.email, arrUser.phone);

    const deal_id = budgets[0].arrComplete?.responseForm.rd_client;
    let response;
    if (deal_id) response = await api.rd.getDealById(deal_id);

    api.budget.save(userLogin, budgets, true, response?.name);

    handleCloseBackdrop();
  }

  async function generatePdfDescriptionCorporate() {
    handleOpenBackdrop();
    if (!bodyResponseBudget) {
      handleCloseBackdrop();
      return;
    }
    const deal_id = bodyResponseBudget.idClient;
    let response;
    if (deal_id) response = await api.rd.getDealById(deal_id);
    let name = response?.name || "undefined";
    await pdfDescriptionCorp(dataTable, bodyResponseBudget, name);
    handleCloseBackdrop();
  }

  async function generatePdfDescription() {
    // if (
    //   budgets.find((budget) =>
    //     budget.arrComplete.responseForm.category.match(/Day-Use/)
    //   )
    // ) {
    //   return;
    // }
    handleOpenBackdrop();
    const deal_id = budgets[0].arrComplete?.responseForm.rd_client;
    let response;
    if (deal_id) response = await api.rd.getDealById(deal_id);
    let name = response?.name || "undefined";
    await pdfDescription(budgets, name);
    handleCloseBackdrop();
  }

  return {
    openModalConfirmGroup,
    handleCloseModal,
    generatePdfBudget,
    openModalEditableText,
    generatePdfBudgetCorporate,
    handleSaveBudget,
    handleOpenModalConfirmGroup,
    generatePdfDescriptionCorporate,
    generatePdfDescription,
    clearTariffs,
  };
}
