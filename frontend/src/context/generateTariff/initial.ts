import { RowModalDiscount } from "./interfaces";

export const dataInitial = {
  rows: [],
  columns: [],
};

export const selectionRangeInitial = {
  startDate: new Date(),
  endDate: new Date(),
  key: "selection",
};

export const occupancyInitial = {
  text: "",
  max: 0,
  min: 0,
  category: "",
};

export const rowDiscountInitial: RowModalDiscount = {
  id: 0,
  name: "",
  discount: 0,
};
