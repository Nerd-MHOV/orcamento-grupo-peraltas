import { TextField } from "@mui/material";
import { format } from "date-fns";
import ptBR from "date-fns/esm/locale/pt-BR/index.js";
import { useContext, useEffect, useState } from "react";
import { EditTariffContext } from "../../../context/editTariff/editTariff";
import { useApi } from "../../../hooks/api/api";
import { AllTariffsProps } from "../../../hooks/api/interfaces";
import CollapsibleTableTariff from "../../TableCollapseTariffs";
import { createData } from "../../TableCollapseTariffs/helpers";

export const NameAndConfirmStep = () => {
  const api = useApi();
  const { getTariffType, getFoodID, getFoodValue, tariff, getDates, next } =
    useContext(EditTariffContext);
  const [rows, setRows] = useState<ReturnType<typeof createData>[]>([]);
  const [name, setName] = useState("");
  const [pipeNum, setPipeNum] = useState("");
  const [tariffs, setTariffs] = useState<AllTariffsProps[]>([]);

  const getTariffs = async () => {
    const response = await api.tariff.get();
    setTariffs(response);
  };

  const makeRow = () => {
    let rowTariff = [];
    rowTariff.push(
      createData({
        name: getTariffType() === "specific" ? tariff.name : name,
        product_rd: pipeNum.toString(),
        active: true,
        order_id: 0,
        food_id: getFoodID() || 0,
        food: getFoodValue(),
        SpecificDates: tariff.SpecificDates,
        tariffs_to_midweek: tariff.tariffs_to_midweek,
        tariffs_to_weekend: tariff.tariffs_to_weekend,
        TariffCheckInValues: tariff.TariffCheckInValues,
        TariffValues: tariff.TariffValues,
      })
    );
    setRows(rowTariff);
  };

  const generateName = () => {
    let firstDate = format(new Date(getDates()[0] + "-02"), "MMMM", {
      locale: ptBR,
    });
    firstDate = firstDate[0].toUpperCase() + firstDate.substring(1);

    let lastDate = format(
      new Date(getDates()[getDates().length - 1] + "-02"),
      "MMMM",
      {
        locale: ptBR,
      }
    );
    lastDate = lastDate[0].toUpperCase() + lastDate.substring(1);

    if (getDates().length > 1) {
      if (getTariffType() === "fds")
        setName(
          `${firstDate} a ${lastDate} ${getDates()[getDates().length - 1].slice(
            0,
            4
          )} - FDS`
        );

      if (getTariffType() === "mds")
        setName(
          `${firstDate} a ${lastDate} ${getDates()[getDates().length - 1].slice(
            0,
            4
          )} - MDS`
        );
    } else {
      if (getTariffType() === "fds")
        setName(
          `${firstDate} ${getDates()[getDates().length - 1].slice(0, 4)} - FDS`
        );
      if (getTariffType() === "mds")
        setName(
          `${firstDate} ${getDates()[getDates().length - 1].slice(0, 4)} - MDS`
        );
    }
  };

  const verifyToFinish = () => {
    next(false);
    if (name && pipeNum) next(true);
  };

  useEffect(() => {
    makeRow();
    getTariffs();
    if (getTariffType() !== "specific") generateName();
    if (getTariffType() === "specific") setName(tariff.name);
    setPipeNum(tariff.product_rd);
  }, []);

  useEffect(() => {
    makeRow();

    verifyToFinish();
  }, [name, pipeNum]);

  return (
    <div className="name-and-confirm-step">
      <div
        className="input-name-for-tariff"
        style={{
          margin: 50,
        }}
      >
        <div
          className="input-name-box"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <TextField
            label="Nome do Tarifário"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            disabled={getTariffType() === "specific" ? false : true}
          />
          <TextField
            label="ID RDStation"
            value={pipeNum}
            onChange={(e) => {
              setPipeNum(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="confirm-information">
        <div
          className="titleContainerBx"
          style={{ fontSize: 18, color: "#1976d2" }}
        >
          Confirme as Informações!
        </div>
        <CollapsibleTableTariff
          rows={rows}
          allTariffs={tariffs}
          ButtonsOn={false}
        />
      </div>
    </div>
  );
};
