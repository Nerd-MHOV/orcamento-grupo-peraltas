
import Btn from "../Btn";
import {ModalConfirmGroup} from "../ModalConfirmGroup";
import { ModalEditableText } from "../ModalEditableText";
import { useComponentButtonsBudget } from "./use-component-buttons-budget";

export const ButtonsBudget = ({ corporate = false }) => {
  const {
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
  } = useComponentButtonsBudget(corporate);

  return (
    <div className="boxButtons" style={{ marginTop: 32 }}>
      <ModalConfirmGroup
       open={openModalConfirmGroup}
       handleClose={handleCloseModal}
       handleConclusion={generatePdfBudget}
      />

      <ModalEditableText
       open={openModalEditableText}
       handleClose={handleCloseModal}
       handleConclusion={generatePdfBudgetCorporate}
      />

      { !corporate && <Btn action="Salvar Orçamento" color="blue" onClick={handleSaveBudget} />}
      <Btn
        action="Gerar PDF Orçamento"
        color="darkBlue"
        onClick={handleOpenModalConfirmGroup}
      />
      <Btn
        action="Memória de Cálculo"
        color="dashboard"
        onClick={corporate ? generatePdfDescriptionCorporate : generatePdfDescription}
      />
      { !corporate && <Btn action="Limpar" color="red" onClick={clearTariffs} /> }
    </div>
  );
};
