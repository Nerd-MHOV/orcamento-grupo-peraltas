import React, { ReactNode, useEffect, useState } from "react";
import { getColumnData } from "./functions/getters/getColumnData";
import { handleForm } from "./functions/handleForm";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import usePermission from "./hooks/usePermission";
import useUnitaryDiscount from "./hooks/useUnitaryDiscount";
import useClientName from "./hooks/useClientName";
import useDateRange from "./hooks/useDateRange";
import useRequirement from "./hooks/useRequirement";
import useCategory from "./hooks/useCategory";
import useDiscountModal from "./hooks/useDiscountModal";
import { GenerateTariffContext } from "./generateTariff";
import useActionsDiscount from "./hooks/useActionsDiscount";
import useRoomLayout from "./hooks/useRoomLayout";
import useInfoBudgets from "./hooks/useInfoBudgets";

const AccommodadtionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  
  
  const permissionHook = usePermission();
  const unitaryDiscountHook = useUnitaryDiscount();
  const clientNameHook = useClientName();
  const selectionRangeHook = useDateRange();
  const requirementsHook = useRequirement();
  const categoryHook = useCategory();
  const discountModalHook = useDiscountModal();
  const actionsDiscountHook = useActionsDiscount();
  const roomLayoutHook = useRoomLayout();
  const infoBudgetHook = useInfoBudgets();

  //Loading Component
  const [openBackdrop, setOpenBackdrop] = useState(false)
  const [messageBackdrop, setMessageBackdrop] = useState('Carregando...');
  const [canCloseBackdrop, setCanColseBackdrop] = useState(true);
  const handleOpenBackdrop = (
    message = 'Carregando...',
    canClose = true,
  ) => {
    setCanColseBackdrop(canClose);
    setMessageBackdrop(message);
    setOpenBackdrop(true);
  };

  const handleCloseBackdrop = () => {
    setOpenBackdrop(false);
  }

  const callHandleForm = () => {
    handleForm(
      categoryHook.occupancy.category,
      selectionRangeHook.selectionRange[0],
      unitaryDiscountHook.unitaryDiscount,
      actionsDiscountHook.dailyCourtesy,
      infoBudgetHook.addRows,
    );
  };

  useEffect(() => {
    callHandleForm();
  }, [
    unitaryDiscountHook.unitaryDiscount,
  ]);


  useEffect(() => {
    infoBudgetHook.setDataTable((par) => ({
      rows: par.rows,
      columns: getColumnData(selectionRangeHook.selectionRange[0]),
    }))
  }, [selectionRangeHook.selectionRange]);

  return (
    <GenerateTariffContext.Provider
      value={{
        ...permissionHook,
        ...unitaryDiscountHook,
        ...clientNameHook,
        ...selectionRangeHook,
        ...requirementsHook,
        ...categoryHook,
        ...discountModalHook,
        ...actionsDiscountHook,
        ...roomLayoutHook,
        ...infoBudgetHook,
        callHandleForm,
        handleOpenBackdrop,
        handleCloseBackdrop,
      }}
    >
      <Backdrop
        sx={{ color: '#54a0ff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={openBackdrop}
        onClick={canCloseBackdrop ? handleCloseBackdrop : undefined}
      >
        <CircularProgress color="inherit" />
        <p style={{
          marginLeft: '10px',
        }} >{messageBackdrop}</p>
      </Backdrop>


      {children}
    </GenerateTariffContext.Provider>
  );
}


export default AccommodadtionProvider