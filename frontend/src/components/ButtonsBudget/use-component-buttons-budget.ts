import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { useApi } from "../../hooks/api/api";
import pdfBudget from "../../context/generateTariff/functions/pdfBudget";
import pdfDescription from "../../context/generateTariff/functions/pdfDescription";
import {
  kommoSaveProcess,
  kommoSaveProcessCorp,
} from "../../context/generateTariff/functions/kommoSaveProcess";
import {
  useGenerateTariff,
  useGenerateTariffCorporate,
} from "../../context/generateTariff/generateTariff";
import * as React from "react";
import pdfBudgetCorp from "../../context/generateTariff/functions/pdfBudgetCorp/pdfBudgetCorp";
import pdfDescriptionCorp from "../../context/generateTariff/functions/pdfDescriptionCorp/pdfDescriptionCorp";
import { Descendant } from "slate";
import slateToPdfMake from "../ModalEditableText/ConvertText";
import { useNotification } from "../../context/notification/notificationContext";
import {
  runGenerateBudgetFlow,
  runGenerateBudgetCorpFlow,
} from "./kommoGenerateFlow";

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
    clientName,
  } = corporate
    ? useGenerateTariffCorporate()
    : { ...useGenerateTariff(), bodyResponseBudget: null };
  const api = useApi();
  const notify = useNotification();
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
    const arrUser = await api.user.getById(userLogin);

    await runGenerateBudgetCorpFlow(bodyResponseBudget, {
      // O PDF abre em nova aba e é capturado como Blob — sempre ocorre.
      generatePdf: () =>
        pdfBudgetCorp(
          bodyResponseBudget,
          arrUser.name,
          arrUser.email,
          arrUser.phone,
          slateToPdfMake(text),
          linesToBreakPage
        ),
      syncToKommo: () => kommoSaveProcessCorp(bodyResponseBudget),
      uploadPdf: (leadId, blob, filename) =>
        api.kommo.uploadBudgetPdf(leadId, blob, filename),
      saveBudget: (name) =>
        api.budgetCorp.save(userLogin, bodyResponseBudget, true, name),
      notify,
      name: clientName,
    });

    handleCloseBackdrop();
  }

  async function generatePdfBudget(group = false) {
    handleCloseModal();
    if (budgets.length < 1) {
      return;
    }
    if (
      budgets.find((budget) =>
        budget.arrComplete?.responseForm.category.match(/Day-Use/)
      )
    ) {
      // Day-use: comportamento legado preservado (sem PDF/CRM aqui).
      return;
    }
    const arrUser = await api.user.getById(userLogin);

    await runGenerateBudgetFlow(budgets, {
      // O PDF abre em nova aba e é capturado como Blob — sempre ocorre.
      generatePdf: () =>
        pdfBudget(budgets, arrUser.name, arrUser.email, arrUser.phone),
      syncToKommo: () => kommoSaveProcess(budgets, group),
      uploadPdf: (leadId, blob, filename) =>
        api.kommo.uploadBudgetPdf(leadId, blob, filename),
      saveBudget: (name) => api.budget.save(userLogin, budgets, true, name),
      notify,
      name: clientName,
    });

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
    if (deal_id) response = await api.kommo.getLead(Number(deal_id));
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
    if (deal_id) response = await api.kommo.getLead(Number(deal_id));
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
