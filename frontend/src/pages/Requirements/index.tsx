import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Btn from "../../components/Btn";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import TableRequirements, {
  createRequirementsData,
  dataRequirementsProps,
} from "../../components/TableRequirements";
import { useApi } from "../../hooks/api/api";
import { ApiRequirementsProps } from "../../hooks/api/interfaces";
import "./style.scss";

export const RequirementsPage = () => {
  const api = useApi();
  const [rows, setRows] = useState<dataRequirementsProps[]>([]);

  const getRequirements = async () => {
    const requirements = await api.requirement.get();
    makeRows(requirements);
  };

  //
  const makeRows = (requirements: ApiRequirementsProps[]) => {
    let lines: dataRequirementsProps[] = [];
    requirements.map((requirement) => {
      if (
        requirement.name !== "check-in às 12h sem apto" &&
        requirement.name !== "check-in às 10h com apto"
      )
        lines.push(
          createRequirementsData(
            requirement.name,
            requirement.price,
            requirement.type,
            requirement.typeModal,
            requirement.active
          )
        );
    });
    setRows(lines);
  };

  useEffect(() => {
    getRequirements();
  }, []);
  return (
    <div className="requirement">
      <Sidebar />
      <div className="requirementBx">
        <Navbar />

        <div className="p20">
          <div className="containerBx">
            <div className="top">
              <div className="titleContainerBx">Requerimentos</div>
              <Link to="/requirements/create" className="link">
                <Btn action=" + " color="dashboard" onClick={() => {}} />
              </Link>
            </div>
            <div className="table">
              <TableRequirements rows={rows} att={getRequirements} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
