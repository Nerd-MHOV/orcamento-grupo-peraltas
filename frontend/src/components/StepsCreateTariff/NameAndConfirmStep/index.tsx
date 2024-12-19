import { TextField } from "@mui/material";
import { format } from "date-fns";
import ptBR from "date-fns/esm/locale/pt-BR/index.js";
import { useContext, useEffect, useState } from "react";
import { CreateTariffContext } from "../../../context/createTariff/createTariff";
import { useApi } from "../../../hooks/api/api";
import { AllTariffsProps } from "../../../hooks/api/interfaces";
import CollapsibleTableTariff from "../../TableCollapseTariffs";
import { createData } from "../../TableCollapseTariffs/helpers";

export const NameAndConfirmStep = () => {
  const api = useApi();
  const {
    typeTariff,
    getValues,
    arrTariffs,
    next,
    setRelationTariffs,
    foodPad,
    specificName,
  } = useContext(CreateTariffContext);
  const [rows, setRows] = useState<ReturnType<typeof createData>[]>([]);
  const [name, setName] = useState("");
  const [nameMDS, setNameMDS] = useState("");
  const [nameFDS, setNameFDS] = useState("");
  const [pipeNum, setPipeNum] = useState("");
  const [pipeNumMDS, setPipeNumMDS] = useState("");
  const [pipeNumFDS, setPipeNumFDS] = useState("");
  const [tariffs, setTariffs] = useState<AllTariffsProps[]>([]);

  const getTariffs = async () => {
    const response = await api.tariff.get();
    setTariffs(response);
  };

  const makeRow = () => {
    let rowTariff = [];

    if (typeTariff === "specific") {
      let dates = arrTariffs.dates.map((date) => ({
        date: date,
        tariffs_id: name,
      }));

      rowTariff.push(
        createData({
          name,
          product_rd: pipeNum.toString(),
          active: true,
          order_id: 0,
          food_id: foodPad ? 1 : 0,
          food: {
            id: foodPad ? 1 : 0,
            ...getValues("specific").foodValue,
          },
          SpecificDates: dates,
          TariffCheckInValues: [
            {
              id: 0,
              tariffs_id: name,
              type: "10h",
              ...getValues("specific").earlyEntryValues.tenHour,
            },
            {
              id: 0,
              tariffs_id: name,
              type: "12h",
              ...getValues("specific").earlyEntryValues.twentyHour,
            },
          ],
          TariffValues: [
            {
              id: 0,
              category_id: "PAD",
              tariffs_id: name,
              ...getValues("specific").UHsValues.PAD,
            },
            {
              id: 0,
              category_id: "PADV",
              tariffs_id: name,
              ...getValues("specific").UHsValues.PADV,
            },
            {
              id: 0,
              category_id: "LUX",
              tariffs_id: name,
              ...getValues("specific").UHsValues.LUX,
            },
            {
              id: 0,
              category_id: "LUXC",
              tariffs_id: name,
              ...getValues("specific").UHsValues.LUXC,
            },
            {
              id: 0,
              category_id: "LUXH",
              tariffs_id: name,
              ...getValues("specific").UHsValues.LUXH,
            },
          ],
        })
      );
    }

    if (typeTariff === "common") {
      let dates = arrTariffs.dates.map((date) => ({
        date: date,
        tariff_to_midweek_id: nameMDS,
        tariff_to_weekend_id: nameFDS,
      }));
      rowTariff.push(
        createData({
          name: nameMDS,
          product_rd: pipeNumMDS.toString(),
          active: true,
          order_id: 0,
          food_id: foodPad ? 1 : 0,
          food: {
            id: foodPad ? 1 : 0,
            ...getValues("midweek").foodValue,
          },
          tariffs_to_midweek: dates,
          TariffCheckInValues: [
            {
              id: 0,
              tariffs_id: nameMDS,
              type: "10h",
              ...getValues("midweek").earlyEntryValues.tenHour,
            },
            {
              id: 0,
              tariffs_id: nameMDS,
              type: "12h",
              ...getValues("midweek").earlyEntryValues.twentyHour,
            },
          ],
          TariffValues: [
            {
              id: 0,
              category_id: "PAD",
              tariffs_id: nameMDS,
              ...getValues("midweek").UHsValues.PAD,
            },
            {
              id: 0,
              category_id: "PADV",
              tariffs_id: nameMDS,
              ...getValues("midweek").UHsValues.PADV,
            },
            {
              id: 0,
              category_id: "LUX",
              tariffs_id: nameMDS,
              ...getValues("midweek").UHsValues.LUX,
            },
            {
              id: 0,
              category_id: "LUXC",
              tariffs_id: nameMDS,
              ...getValues("midweek").UHsValues.LUXC,
            },
            {
              id: 0,
              category_id: "LUXH",
              tariffs_id: nameMDS,
              ...getValues("midweek").UHsValues.LUXH,
            },
          ],
        })
      );
      rowTariff.push(
        createData({
          name: nameFDS,
          product_rd: pipeNumFDS.toString(),
          active: true,
          order_id: 0,
          food_id: foodPad ? 1 : 0,
          food: {
            id: foodPad ? 1 : 0,
            ...getValues("weekend").foodValue,
          },
          tariffs_to_weekend: dates,
          TariffCheckInValues: [
            {
              id: 0,
              tariffs_id: nameFDS,
              type: "10h",
              ...getValues("weekend").earlyEntryValues.tenHour,
            },
            {
              id: 0,
              tariffs_id: nameFDS,
              type: "12h",
              ...getValues("weekend").earlyEntryValues.twentyHour,
            },
          ],
          TariffValues: [
            {
              id: 0,
              category_id: "PAD",
              tariffs_id: nameFDS,
              ...getValues("weekend").UHsValues.PAD,
            },
            {
              id: 0,
              category_id: "PADV",
              tariffs_id: nameFDS,
              ...getValues("weekend").UHsValues.PADV,
            },
            {
              id: 0,
              category_id: "LUX",
              tariffs_id: nameFDS,
              ...getValues("weekend").UHsValues.LUX,
            },
            {
              id: 0,
              category_id: "LUXC",
              tariffs_id: nameFDS,
              ...getValues("weekend").UHsValues.LUXC,
            },
            {
              id: 0,
              category_id: "LUXH",
              tariffs_id: nameFDS,
              ...getValues("weekend").UHsValues.LUXH,
            },
          ],
        })
      );
    }

    setRows(rowTariff);
  };

  const generateName = () => {
    let firstDate = format(new Date(arrTariffs.dates[0] + "-02"), "MMMM", {
      locale: ptBR,
    });
    firstDate = firstDate[0].toUpperCase() + firstDate.substring(1);

    let lastDate = format(
      new Date(arrTariffs.dates[arrTariffs.dates.length - 1] + "-02"),
      "MMMM",
      {
        locale: ptBR,
      }
    );
    lastDate = lastDate[0].toUpperCase() + lastDate.substring(1);

    if (arrTariffs.dates.length > 1) {
      setNameFDS(
        `${firstDate} a ${lastDate} ${arrTariffs.dates[
          arrTariffs.dates.length - 1
        ].slice(0, 4)} - FDS`
      );
      setNameMDS(
        `${firstDate} a ${lastDate} ${arrTariffs.dates[
          arrTariffs.dates.length - 1
        ].slice(0, 4)} - MDS`
      );
    } else {
      setNameFDS(
        `${firstDate} ${arrTariffs.dates[arrTariffs.dates.length - 1].slice(
          0,
          4
        )} - FDS`
      );
      setNameMDS(
        `${firstDate} ${arrTariffs.dates[arrTariffs.dates.length - 1].slice(
          0,
          4
        )} - MDS`
      );
    }
  };

  const verifyToFinish = () => {
    next(false);
    if (typeTariff === "common") {
      if (nameFDS && nameMDS && pipeNumFDS && pipeNumMDS) next(true);
    } else {
      if (name && pipeNum) next(true);
    }
  };

  useEffect(() => {
    makeRow();
    getTariffs();
    if (typeTariff === "common") generateName();
    if (typeTariff === "specific") setName(specificName);
  }, []);

  useEffect(() => {
    makeRow();

    verifyToFinish();
  }, [name, nameFDS, nameMDS, pipeNum, pipeNumFDS, pipeNumMDS]);

  useEffect(() => {
    setRelationTariffs(rows);
  }, [rows]);
  return (
    <div className="name-and-confirm-step">
      <div
        className="input-name-for-tariff"
        style={{
          margin: 50,
        }}
      >
        {typeTariff === "specific" ? (
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
            />
            <TextField
              label="ID RDStation"
              value={pipeNum}
              onChange={(e) => {
                setPipeNum(e.target.value);
              }}
            />
          </div>
        ) : (
          <div
            className="input-name-box"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div
              className="input-name-single"
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <TextField
                label="Nome do Tarifário para MDS"
                disabled
                value={nameMDS}
              />
              <TextField
                label="ID RDStation"
                value={pipeNumMDS}
                onChange={(e) => setPipeNumMDS(e.target.value)}
              />
            </div>

            <div
              className="input-name-single"
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <TextField
                label="Nome do Tarifário para FDS"
                disabled
                value={nameFDS}
              />
              <TextField
                label="ID RDStation"
                value={pipeNumFDS}
                onChange={(e) => setPipeNumFDS(e.target.value)}
              />
            </div>
          </div>
        )}
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
