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
exports.requirementBudget = void 0;
var generateBudgetRequirement_1 = require("./generateBudgetRequirement");
function requirementBudget(arrForm, arrRequirement, unitaryDiscount, initDate, finalDate) {
    return __awaiter(this, void 0, void 0, function () {
        var requirementRows, _loop_1, countRequirement;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requirementRows = [];
                    //voucher municipal:
                    if (arrForm.adult)
                        arrRequirement.push({
                            requirement: "voucher",
                            type: "voucher",
                            values: {
                                adult: 0,
                                child: [],
                                amount: arrForm.adult
                            }
                        });
                    _loop_1 = function (countRequirement) {
                        var numRequirement, valueRequirement, totalRequirement, uRequirement, uType, id, discount, totalNoDiscount, valueWithDiscount, quantity, nameRequirement;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    numRequirement = countRequirement + 1;
                                    valueRequirement = [];
                                    totalRequirement = 0;
                                    uRequirement = arrRequirement[countRequirement].requirement;
                                    uType = arrRequirement[countRequirement].type;
                                    id = 400 + numRequirement;
                                    discount = 0;
                                    totalNoDiscount = 0;
                                    return [4 /*yield*/, (0, generateBudgetRequirement_1.generateBudgetRequirement)(initDate, finalDate, arrForm, arrRequirement[countRequirement])];
                                case 1:
                                    valueRequirement = _b.sent();
                                    //verify unitary discount
                                    unitaryDiscount.map(function (unit) {
                                        if (unit.id === id && unit.name === nameRequirement) {
                                            discount = unit.discount / 100;
                                        }
                                    });
                                    valueWithDiscount = valueRequirement.map(function (value) {
                                        totalNoDiscount += value;
                                        var resultDiscount = value * discount;
                                        var result = Math.round(value - resultDiscount);
                                        totalRequirement += result;
                                        return result;
                                    });
                                    quantity = arrRequirement[countRequirement].values;
                                    nameRequirement = uRequirement + " [";
                                    if (quantity.adult > 0)
                                        nameRequirement += " ".concat(quantity.adult, " ADT");
                                    if (quantity.child.length > 0)
                                        nameRequirement += " ".concat(quantity.child.length, " CHD");
                                    if (quantity.amount > 0)
                                        nameRequirement += " ".concat(quantity.amount, "x");
                                    nameRequirement += " ]";
                                    requirementRows.push({
                                        id: id,
                                        desc: nameRequirement,
                                        values: valueWithDiscount,
                                        total: totalRequirement,
                                        noDiscount: valueRequirement,
                                        totalNoDiscount: totalNoDiscount,
                                        discountApplied: discount * 100
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    };
                    countRequirement = 0;
                    _a.label = 1;
                case 1:
                    if (!(countRequirement < arrRequirement.length)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(countRequirement)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    countRequirement++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, requirementRows];
            }
        });
    });
}
exports.requirementBudget = requirementBudget;
//# sourceMappingURL=requirementBudget.js.map