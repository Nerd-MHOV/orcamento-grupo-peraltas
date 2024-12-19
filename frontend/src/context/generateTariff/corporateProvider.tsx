import React, { ReactNode, useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import { GenerateTariffCorporateContext } from "./generateTariff";
import usePermission from "./hooks/usePermission";
import useDateRange from "./hooks/useDateRange";
import useActionsDiscount from "./hooks/useActionsDiscount";
import useCategory from "./hooks/useCategory";
import useRoomLayout from "./hooks/useRoomLayout";
import useRequirement from "./hooks/useRequirement";
import useClientName from "./hooks/useClientName";
import useInfoBudgets from "./hooks/useInfoBudgets";
import { getColumnData } from "./functions/getters/getColumnData";
import useBodyCorporateBudget from "./hooks/useBodyCorporateBudget";
import { useApi } from "../../hooks/api/api";
import useUnitaryDiscount from "./hooks/useUnitaryDiscount";
import useDiscountModal from "./hooks/useDiscountModal";
import useStaff from "./hooks/useStaff";
import { getColumnDataCorp } from "./functions/getters/getColumnDataCorp";

const CorporateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const api = useApi();
  //Loading Component
  const [openBackdrop, setOpenBackdrop] = useState(false);
  const [messageBackdrop, setMessageBackdrop] = useState("Carregando...");
  const [canCloseBackdrop, setCanColseBackdrop] = useState(true);
  const handleOpenBackdrop = (message = "Carregando...", canClose = true) => {
    setCanColseBackdrop(canClose);
    setMessageBackdrop(message);
    setOpenBackdrop(true);
  };

  const handleCloseBackdrop = () => {
    setOpenBackdrop(false);
  };
  const loadingComponent = {
    handleOpenBackdrop,
    handleCloseBackdrop,
  };

  // NEW for corporate
  const bodySendBudget = useBodyCorporateBudget();
  const categoryHook = useCategory();

  const infoBudgetHook = useInfoBudgets();
  const selectionRangeHook = useDateRange();
  const requirementHook = useRequirement();
  const permissionHook = usePermission();
  const actionDiscountHook = useActionsDiscount();
  const roomLayoutHook = useRoomLayout();
  const clientNameHook = useClientName();
  const unitaryDiscountHook = useUnitaryDiscount();
  const UnitaryDiscountModalHook = useDiscountModal();
  const StaffHook = useStaff();

  useEffect(() => {
    bodySendBudget.changeDateCorporateBudget(selectionRangeHook.selectionRange);
    infoBudgetHook.setDataTable((par) => ({
      ...par,
      columns: getColumnDataCorp(selectionRangeHook.selectionRange),
    }));
  }, [selectionRangeHook.selectionRange]);
  useEffect(() => {
    bodySendBudget.changeCategoryToRoomCorporate(
      categoryHook.categoriesCorporateValues
    );
  }, [categoryHook.categoriesCorporateValues]);

  useEffect(() => {
    callHandleForm();
  }, [bodySendBudget.roomsToBudget]);

  useEffect(() => {
    bodySendBudget.changeRequirementCorporate(
      requirementHook.requirementSubmit
    );
  }, [requirementHook.requirementSubmit]);

  useEffect(() => {
    bodySendBudget.changeUnitaryDiscounts(unitaryDiscountHook.unitaryDiscount);
  }, [unitaryDiscountHook.unitaryDiscount]);

  //Send Objetct To Api Budget
  async function callHandleForm() {
    infoBudgetHook.clearRows();
    if (
      bodySendBudget.roomsToBudget.dateRange &&
      ((bodySendBudget.roomsToBudget.rooms.length > 0 &&
        bodySendBudget.verifyIfAllRoomHasEnoughOnePax()) ||
        requirementHook.requirementSubmit.length > 0)
    ) {
      const response = await api.budgetCorp.get(bodySendBudget.roomsToBudget);
      const responseBudget = response;
      bodySendBudget.setBodyResponseBudget(response);
      infoBudgetHook.addRows(responseBudget.rowsValues.rows, {
        childValue: [],
        petValue: [],
        selectionRange: selectionRangeHook.selectionRange[0],
        responseForm: {
          adult: responseBudget.rooms.reduce((acc, cur) => acc + cur.adt, 0),
          category: `${responseBudget.rooms.length} quartos`,
          pension: responseBudget.pension,
          parcel: 0,
          rd_client: responseBudget.idClient || "",
          housingUnit: `${responseBudget.rooms.length} quartos`,
        },
      });
    }
  }

  return (
    <GenerateTariffCorporateContext.Provider
      value={{
        ...bodySendBudget,
        ...loadingComponent,
        ...permissionHook, // Modal Permission General Discount
        ...selectionRangeHook, // CalendarPicker
        ...actionDiscountHook, // FormOrc/corporate
        ...categoryHook, // FormOrc/corporate
        ...requirementHook, // ModalRequirement, Requirement(form)
        ...roomLayoutHook, // pension(form)
        ...clientNameHook, // rdClient(form)
        ...infoBudgetHook, // infoTables
        ...unitaryDiscountHook,
        ...UnitaryDiscountModalHook,
        ...StaffHook,
        callHandleForm,
        childValue: [], // ModalRequirement
      }}
    >
      <Backdrop
        sx={{ color: "#54a0ff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={openBackdrop}
        onClick={canCloseBackdrop ? handleCloseBackdrop : undefined}
      >
        <CircularProgress color="inherit" />
        <p
          style={{
            marginLeft: "10px",
          }}
        >
          {messageBackdrop}
        </p>
      </Backdrop>

      {children}
    </GenerateTariffCorporateContext.Provider>
  );
};

export default CorporateProvider;
