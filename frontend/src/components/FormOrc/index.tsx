import "./style.scss";
import { ModalRequirement } from "../ModalRequirement";
import { AdultInputForm } from "./partForm/adult";
import { ChildInputForm } from "./partForm/child";
import { PetInputForm } from "./partForm/pet";
import { DiscountInputForm } from "./partForm/discount";
import { CategoryInputForm } from "./partForm/category";
import { PensionInputForm } from "./partForm/pension";
import { PipeNumberInputForm } from "./partForm/pipeNumber";
import { RdClientInputForm } from "./partForm/rdClient";
import { RequirementInputForm } from "./partForm/requirement";
import { InfoApp } from "../InfoApp";
import { useGenerateTariff } from "../../context/generateTariff/generateTariff";
import { ActionInputForm } from "./partForm/action";
import { GetClientName } from "./partForm/getClientName";
import { DailyCourtesy } from "./partForm/dailyCourtesy";
import { ParcelInputForm } from "./partForm/parcel";

export const FormOrc = () => {
  const {
    stateApp,
    occupancyWrong,
    occupancy,
    clientName,
  } = useGenerateTariff();

  return (
    <div>
      <div className="modal">
        <ModalRequirement />
      </div>
      <div className="boxFormAndInfo">
        <div className="form">
          <div className="formBox">
            <AdultInputForm />
            <ChildInputForm />
            <PetInputForm />
            <DiscountInputForm />
          </div>
          <div className="formBox">
            <CategoryInputForm />
            <PensionInputForm />
            {/*<PipeNumberInputForm />*/}
            <RdClientInputForm />
            <ParcelInputForm />

          </div>
        </div>
        <div style={{ width: "100%" }}>
          <RequirementInputForm />
        </div>
        <div style={{ width: "100%" }}>
          <ActionInputForm />
        </div>

        <div className="pos-form">
          <div>
            <div
              className="occupancy"
              style={occupancyWrong ? { color: "red" } : {}}
            >
              {occupancy.text}
            </div>
            <InfoApp stateApp={stateApp} />
          </div>
          <DailyCourtesy />
        </div>
        <GetClientName clientName={clientName} />
      </div>
    </div>
  );
};
