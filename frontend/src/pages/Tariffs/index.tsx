import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Btn from "../../components/Btn";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import CollapsibleTableTariff from "../../components/TableCollapseTariffs";
import { createData } from "../../components/TableCollapseTariffs/helpers";
import { useApi } from "../../hooks/api/api";
import { AllTariffsProps } from "../../hooks/api/interfaces";
import "./style.scss";

export const TariffsPage = () => {
  const api = useApi();
  const [rows, setRows] = useState<ReturnType<typeof createData>[]>([]);
  const [tariffs, setTariffs] = useState<AllTariffsProps[]>([]);

  const getTariffs = async () => {
    const response = await api.tariff.get();
    setTariffs(response);
  };

  const makeRows = async () => {
    let rows: ReturnType<typeof createData>[] = [];
    tariffs.map((tariff) => {
      rows.push(createData(tariff));
    });

    setRows(rows);
  };

  const handleChangeOrder = async (id: number, side: string) => {
    await api.tariff.changeOrder(id, side).then((response) => {
      getTariffs();
    });
  };

  const handleToggleActive = async (name: string, active: boolean) => {
    await api.tariff.toggleActive(name, active).then((response) => {
      getTariffs();
    });
  };

  useEffect(() => {
    makeRows();
  }, [tariffs]);

  useEffect(() => {
    getTariffs();
  }, []);
  return (
    <div className="tariffs">
      <Sidebar />
      <div className="tariffsBx">
        <Navbar />

        <div className="p20">
          <div className="containerBx">
            <div className="top">
              <div className="titleContainerBx">Lista de Tarifários</div>
              <Link to="/tariffs/create" className="link">
                <Btn action=" + " color="dashboard" onClick={() => {}} />
              </Link>
            </div>
            <div className="table">
              <CollapsibleTableTariff
                rows={rows}
                handleChangeOrder={handleChangeOrder}
                handleToggleActive={handleToggleActive}
                allTariffs={tariffs}
                reloadRows={getTariffs}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
