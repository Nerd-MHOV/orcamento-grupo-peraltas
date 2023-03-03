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
exports.petBudget = void 0;
var generateBudgetPet_1 = require("./generateBudgetPet");
function petBudget(arrForm, arrPet, unitaryDiscount, initDate, finalDate) {
    return __awaiter(this, void 0, void 0, function () {
        var petRows, _loop_1, countPet;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    petRows = [];
                    _loop_1 = function (countPet) {
                        var numPet, valuesPet, totalPet, totalNoDiscount, uPet, discount, id, desc, valueWithDiscountPet;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    numPet = countPet + 1;
                                    valuesPet = [];
                                    totalPet = 0;
                                    totalNoDiscount = 0;
                                    uPet = arrPet[countPet];
                                    discount = 0;
                                    id = 300 + numPet;
                                    desc = "PET " + uPet;
                                    return [4 /*yield*/, (0, generateBudgetPet_1.generateBudgetPet)(initDate, finalDate, arrForm, uPet)];
                                case 1:
                                    valuesPet = _b.sent();
                                    //verify unitary discount
                                    unitaryDiscount.map(function (unit) {
                                        if (unit.id === id && unit.name === desc) {
                                            discount = unit.discount / 100;
                                        }
                                    });
                                    valueWithDiscountPet = valuesPet.map(function (value) {
                                        totalNoDiscount += value;
                                        var resultDiscount = value * discount;
                                        var result = Math.round(value - resultDiscount);
                                        totalPet += result;
                                        return result;
                                    });
                                    petRows.push({
                                        id: id,
                                        desc: desc,
                                        values: valueWithDiscountPet,
                                        total: totalPet,
                                        noDiscount: valuesPet,
                                        totalNoDiscount: totalNoDiscount,
                                        discountApplied: discount * 100
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    };
                    countPet = 0;
                    _a.label = 1;
                case 1:
                    if (!(countPet < arrPet.length)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(countPet)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    countPet++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, petRows];
            }
        });
    });
}
exports.petBudget = petBudget;
//# sourceMappingURL=petBudget.js.map