import { Day_x } from "./CheckDayToChangeStage";
import preChangeStageDefault from "./functions/preChangeStageDefault";
import simpleDialogDaysToStage from "./functions/simpleDialog";
import { rdGetContactDeal } from "../../services/rdstation/getContactDeal";
import { CustomFieldFilter, CustomFieldFilterContact } from "../../services/rdstation/CustomFieldFilter";
import hasEnoughPoints from "./functions/hasEnoughPoints";




export const days_to_check_dead_line = {
    "BE_pos-venda_180": () => Day_x(-185, "651c29032f49be000fb3520f", "64b7f36d1bfc7f000d53f87d", "check_out", preChangeStageDefault),
    "BE_pos-venda_100": () => Day_x(-180, "64b7f36d1bfc7f000d53f87c", "651c29032f49be000fb3520f", "check_out", preChangeStageDefault, function_to_days_to_check_dead_line["BE_pos-venda_100"].pos),
    "BE_pos-venda_50": () => Day_x(-100, "64b7f36d1bfc7f000d53f87b", "64b7f36d1bfc7f000d53f87c", "check_out", preChangeStageDefault, function_to_days_to_check_dead_line["BE_pos-venda_50"].pos),
    "BE_pos-venda_20": () => Day_x(-50, "64b7f36d1bfc7f000d53f87a", "64b7f36d1bfc7f000d53f87b", "check_out", preChangeStageDefault, function_to_days_to_check_dead_line["BE_pos-venda_20"].pos),
    "BE_pos-venda_3": () => Day_x(-20, "64b7f36d1bfc7f000d53f879", "64b7f36d1bfc7f000d53f87a", "check_out", preChangeStageDefault, function_to_days_to_check_dead_line["BE_pos-venda_3"].pos),
    "BE_pos-venda_x": () => Day_x(-3, "651c2869b68030002280a5f2", "64b7f36d1bfc7f000d53f879", "check_out", preChangeStageDefault, function_to_days_to_check_dead_line["BE_pos-venda_x"].pos),
    //
    // "E_pos-venda_180": () => Day_x(-240, "651c28d063557500187d61d1", "651c28e163bae5000f6c74ad", "check_out"),
    // "E_pos-venda_120": () => Day_x(-180, "64ca51a5c152910021b23eaf", "651c28d063557500187d61d1", "check_out"),
    // "E_pos-venda_90": () => Day_x(-120, "64ca51a5c152910021b23eae", "64ca51a5c152910021b23eaf", "check_out"),
    // "E_pos-venda_60": () => Day_x(-90, "64ca51a5c152910021b23ead", "64ca51a5c152910021b23eae", "check_out"),
    // "E_pos-venda_30": () => Day_x(-60, "64ca51a5c152910021b23eac", "64ca51a5c152910021b23ead", "check_out"),
    // "E_pos-venda_3": () => Day_x(-30, "64ca51a5c152910021b23eab", "64ca51a5c152910021b23eac", "check_out"),
    // "E_pos-venda_x": () => Day_x(-3, "651c25b80f3443001aaa545e", "64ca51a5c152910021b23eab", "check_out"),
    //
    // // "E_adesao_15": () => Day_x(10, "64ca5106c152910010b23f58", "64ca519cf7bccd002ae3e81e", "check_out"),
    // "E_adesao_30": () => Day_x(15, "64ca5106c152910010b23f57", "64ca5106c152910010b23f58", "check_in"),
    // "E_adesao_45": () => Day_x(30, "64ca5106c152910010b23f56", "64ca5106c152910010b23f57", "check_in"),
    // "E_adesao_60": () => Day_x(45, "64ca5106c152910010b23f55", "64ca5106c152910010b23f56", "check_in"),
    // "E_adesao_90": () => Day_x(60, "651c289e8afbb8000f2c8788", "64ca5106c152910010b23f55", "check_in"),
    // "E_adesao_x": () => Day_x(90, "64ca5106c152910010b23f54", "651c289e8afbb8000f2c8788", "check_in"),
    //
    // "CORP_pos-venda_180": () => Day_x(-240, "64ca5669e1b3c2000f9bb132", "64ca5676c5217d000f7d6402", "check_out"),
    // "CORP_pos-venda_120": () => Day_x(-180, "64ca56257b1b98002a2f27a4", "64ca5669e1b3c2000f9bb132", "check_out"),
    // "CORP_pos-venda_90": () => Day_x(-120, "64ca56257b1b98002a2f27a3", "64ca56257b1b98002a2f27a4", "check_out"),
    // "CORP_pos-venda_60": () => Day_x(-90, "64ca56257b1b98002a2f27a2", "64ca56257b1b98002a2f27a3", "check_out"),
    // "CORP_pos-venda_30": () => Day_x(-60, "64ca56257b1b98002a2f27a1", "64ca56257b1b98002a2f27a2", "check_out"),
    // "CORP_pos-venda_3": () => Day_x(-30, "64ca56257b1b98002a2f27a0", "64ca56257b1b98002a2f27a1", "check_out"),
    // "CORP_pos-venda_x": () => Day_x(-3, "651c258168c23a0018119db3", "64ca56257b1b98002a2f27a0", "check_out"),
}


export const function_to_days_to_check_dead_line = {
    "BE_pos-venda_100": {
        "pre": preChangeStageDefault,
        "pos": async (params: any) => {
            const {deal} = params;
            if(!hasEnoughPoints(deal)) return;
            const dialog = "65f3571c9fbeaf90e6caacd9";
            await simpleDialogDaysToStage(deal, dialog);
        }
    },
    "BE_pos-venda_50": {
        "pre": preChangeStageDefault,
        "pos": async (params: any) => {
            const {deal} = params;
            if(!hasEnoughPoints(deal)) return;
            const dialog = "65f356f004dc2ee830f45ad6";
            await simpleDialogDaysToStage(deal, dialog);
        }
    },
    "BE_pos-venda_20": {
        "pre": preChangeStageDefault,
        "pos": async (params: any) => {
            const {deal} = params;
            const has_chd = CustomFieldFilter("chd_amount", deal)?.value;
            if(!hasEnoughPoints(deal)) return;
            if (!has_chd || Number(has_chd) === 0) {
                const dialog = "65f34b6361127701c59d2ea8";
                await simpleDialogDaysToStage(deal, dialog);
            }else {
                const dialog = "65f347d06712991c710d4b12";
                await simpleDialogDaysToStage(deal, dialog);
            }
        }
    },
    "BE_pos-venda_3": {
        "pre": preChangeStageDefault,
        "pos": async (params: any) => {
            const {deal} = params;
            const contactDeal = await rdGetContactDeal(deal.id);
            const cpf = CustomFieldFilterContact("cpf", contactDeal.contacts[0])?.value;
            if (!cpf) {
                console.log(` [ ERROR ] - *BE_pos-venda_3.pos() - GET CPF TO ${deal.name} ${cpf}`)
                return;
            };
            if(!hasEnoughPoints(deal)) return;
            const dialog = "652e9071979df6ae0adaa0ce";
            await simpleDialogDaysToStage(deal, dialog);
        }
    },
    "BE_pos-venda_x": {
        "pre": preChangeStageDefault,
        "pos": async (params: any) => {
            const {deal} = params;
            const dialog = "652e87e272abd8b911a4d18a";
            await simpleDialogDaysToStage(deal, dialog);
        }
    },
}


