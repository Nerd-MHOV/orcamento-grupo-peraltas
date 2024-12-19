import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import { initValues } from "../../../components/StepsCreateTariff/FoodStep";
import { MonthsCommon } from "../../../components/StepsEditTariff/Months";
import { NameAndConfirmStep } from "../../../components/StepsEditTariff/NameAndConfirmStep";
import { StepperTariff } from "../../../components/StepsEditTariff/Stepper";
import { ValuesStep } from "../../../components/StepsEditTariff/ValuesStep";
import { EditTariffContextProvider } from "../../../context/editTariff/editTariff";
import { useApi } from "../../../hooks/api/api";
import { AllTariffsProps, ApiUserProps } from "../../../hooks/api/interfaces";

import "./style.scss";

export const stepsToEdit = ["Datas a serem aplicadas", "Valores R$", "Nome"];

export const initValuesUHS = {
  PAD: initValues,
  PADV: initValues,
  LUX: initValues,
  LUXC: initValues,
  LUXH: initValues,
};

export const EditTariff = () => {
  const api = useApi();
  const [steps, setSteps] = useState(stepsToEdit);
  const [activeStep, setActiveStep] = useState(0);
  const [nextActive, setNextActive] = useState(false);
  const [tariff, setTariff] = useState<AllTariffsProps>();
  const { id } = useParams();
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setNextActive(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setNextActive(false);
  };

  const getTariff = async () => {
    const tariffResponse = await api.tariff.getById(id as string);
    setTariff(tariffResponse);
  };

  useEffect(() => {
    getTariff();
  }, []);

  return (
    <EditTariffContextProvider
      tariff={tariff}
      next={setNextActive}
      activeStep={setActiveStep}
    >
      <div className="new-tariff">
        <Sidebar />
        <div className="new-tariff-bx">
          <Navbar />
          <div className="p20">
            <div className="containerBx">
              <div className="titleContainerBx">Editar: {id}</div>
              <StepperTariff
                nextActive={nextActive}
                activeStep={activeStep}
                handleBack={handleBack}
                handleNext={handleNext}
                steps={steps}
              >
                <>
                  {activeStep === 0 && <MonthsCommon />}
                  {activeStep === 1 && (
                    <ValuesStep title="Valores para MDS" type="midweek" />
                  )}
                  {activeStep === 2 && <NameAndConfirmStep />}
                </>
              </StepperTariff>
            </div>
          </div>
        </div>
      </div>
    </EditTariffContextProvider>
  );
};
