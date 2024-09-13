import "./style.scss";
import "react-date-range/dist/styles.css";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import "react-date-range/dist/theme/default.css";
import { ButtonsBudget } from "../../components/ButtonsBudget";
import { CalendarPicker } from "../../components/CalendarPicker";
import { GenerateTariffCorporateProvider} from "../../context/generateTariff/generateTariff";
import ModalPermissionDiscount from "../../components/ModalPermissionDiscount";
import { FormOrcCorporate } from "../../components/FormOrc/corporate";
import { ListUHsCorporate } from "../../components/ListUHsCorporate/ListUHsCorporate";
import TableCalcCorp from "../../components/TableCalc/corp";
import { ModalDiscount } from "../../components/ModalDiscount/corp";

const Corporate = () => {
  return (
    <GenerateTariffCorporateProvider>
        <div className="corporate">
          <Sidebar />
          <div className="corporateBx">
            <Navbar />
            <div className="p20">
              {/* modal */}
               <ModalDiscount />  {/* disconto unitario */}
              <ModalPermissionDiscount corporate />
              <div className="containerBx">

                <div className="top">
                  <CalendarPicker corporate />
                  <FormOrcCorporate />
                </div>
                
                <div className="bottom">
                  <ListUHsCorporate />
                  
                  <TableCalcCorp />
                </div>
                <div className="buttons">
                    {/* <InfoTable corporate /> */}
                    <ButtonsBudget corporate />
                  </div>
              </div>
            </div>
          </div>
        </div>
    </GenerateTariffCorporateProvider>
  );
};

export default Corporate;
