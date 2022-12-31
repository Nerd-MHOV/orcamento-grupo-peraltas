"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.generateBudget = void 0;
var date_fns_1 = require("date-fns");
var prismaClient_1 = require("../../../database/prismaClient");
var getTariff_1 = require("./getTariff");
var daysOfWeekend = ["Fri", "Sat", "Sun"];
function generateBudget(initDate, finalDate, arrForm, ageGroup, onlyFood) {
    if (onlyFood === void 0) { onlyFood = false; }
    return __awaiter(this, void 0, void 0, function () {
        var valuesBudget, _loop_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    valuesBudget = [];
                    _loop_1 = function () {
                        var dayMonthYear, monthYear, dayWeek, month, tariffBudget, tariffs, numCategory, pension, tariffWeek, tariffFood, tariffDay;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    dayMonthYear = (0, date_fns_1.format)(initDate, "yyyy-MM-dd");
                                    monthYear = (0, date_fns_1.format)(initDate, "yyyy-MM");
                                    dayWeek = (0, date_fns_1.format)(initDate, "E");
                                    month = (0, date_fns_1.format)(initDate, "MM");
                                    tariffBudget = 0;
                                    return [4 /*yield*/, (0, getTariff_1.getTariff)(dayMonthYear, monthYear)];
                                case 1:
                                    tariffs = _b.sent();
                                    return [4 /*yield*/, prismaClient_1.prismaClient.categories.findFirst({
                                            where: {
                                                name: arrForm.category
                                            }
                                        })];
                                case 2:
                                    numCategory = (_b.sent()) || { id: 0 };
                                    pension = 0;
                                    if (arrForm.pension === "simples")
                                        pension = 0;
                                    if (arrForm.pension === "meia")
                                        pension = 1;
                                    if (arrForm.pension === "completa")
                                        pension = 2;
                                    if (tariffs.tariff_mw) {
                                        tariffWeek = void 0;
                                        tariffFood = 0;
                                        if (daysOfWeekend.includes(dayWeek) ||
                                            (dayWeek === "Thu" && (month === "07" || month === "01"))) {
                                            tariffWeek = tariffs.tariff_we.TariffValues;
                                            tariffFood = tariffs.tariff_we.food[ageGroup] * pension;
                                        }
                                        else {
                                            tariffWeek = tariffs.tariff_mw.TariffValues;
                                            tariffFood = tariffs.tariff_mw.food[ageGroup] * pension;
                                        }
                                        tariffDay = tariffWeek.filter(function (arr) { return arr.category_id === numCategory.id; })[0];
                                        tariffBudget = tariffDay[ageGroup] + tariffFood;
                                        if (onlyFood)
                                            tariffBudget = 90;
                                    }
                                    valuesBudget.push(tariffBudget);
                                    initDate = (0, date_fns_1.addDays)(initDate, 1);
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _a.label = 1;
                case 1:
                    if (!(initDate < finalDate)) return [3 /*break*/, 3];
                    return [5 /*yield**/, _loop_1()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/, valuesBudget];
            }
        });
    });
}
exports.generateBudget = generateBudget;
//# sourceMappingURL=generateBudget.js.map