import { RowsProps } from "../CalcBudgetController";
import { CorporateBodyResponseBudget, CorporateBodySendBudget, RoomCorporateResponse } from "../CalcBudgetCorpController";
import { adultBudget } from "./adultBudget";
import { calcTotal, calcTotalBudgets } from "./calcTotal";
import { calcTotalAgency } from "./calcTotalAgency";
import { childBudget } from "./childBudget";
import getPeriod from "./getPeriod";
import { petBudget } from "./petBudget";
import { requirementBudget } from "./requirementBudget";


export async function mainCorp(bodyRequest: CorporateBodySendBudget) {

    const { agency, dateRange, rooms, pension, requirements } = bodyRequest;



    const completePeriod = getPeriod(dateRange);
    const dateSelection = dateRange.find(range => range.key === 'selection') ?? dateRange[0];
    const dateSecond = dateRange.find(range => range.key === 'second');

    // mock variables
    const dailyCourtesy: boolean = false;
    const newRoomsPromises = rooms.map(async (room) => {
        const discount = bodyRequest.unitaryDiscount.find(unitaryD => unitaryD.id === Number(room.roomNumber.unit) && unitaryD.type === "room")?.discount ?? bodyRequest.discount;
        const arrForm = {
            adult: room.adt,
            discount,
            category: room.roomNumber.category,
            pension: pension,
        }

        let mainPeriod = room.isStaff && dateSecond ? getPeriod([dateSecond]) : getPeriod([dateSelection])
        const idRoom = Number(room.roomNumber.unit) * 100
        // calculate cost for adult, child, pet and requirements
        let adultRows = await adultBudget(arrForm, room.chd, bodyRequest.unitaryDiscount, dailyCourtesy, mainPeriod, completePeriod, true, idRoom);
        let childRows = await childBudget(arrForm, room.chd, bodyRequest.unitaryDiscount, dailyCourtesy, mainPeriod, completePeriod, true, idRoom);
        let petRows = await petBudget(arrForm, room.pet, bodyRequest.unitaryDiscount, mainPeriod, completePeriod, idRoom);
        let requirementRows = await requirementBudget(arrForm, [], bodyRequest.unitaryDiscount, mainPeriod, completePeriod, idRoom, true);

        const rows = [...adultRows, ...childRows, ...petRows, ...requirementRows]
        let newRoom: RoomCorporateResponse = {
            ...room,
            rowsValues: {
                rows: rows,
                total: calcTotal(rows, discount)
            }
        };
        return newRoom
    })

    // Awaiting to conclusion each async operation
    const newRooms = await Promise.all(newRoomsPromises);

    // requirement to budget ( all rooms )
    let requirementRows = await requirementBudget({ adult: 0 }, requirements, bodyRequest.unitaryDiscount, completePeriod, completePeriod, 0, true);
    const roomsRows = calcTotalBudgets(newRooms);
    const rowsFinal: RowsProps[] = [...roomsRows, ...requirementRows];

    if (agency && agency > 0) {
        // apartir de 29/08/2025 vai ser calculado apenas o valor da hospedagem para a agencia;
        const totalNeto = calcTotal(roomsRows, bodyRequest.discount)
        const totalAgency = calcTotalAgency(totalNeto, agency)
        rowsFinal.push(totalAgency);
    }


    const response: CorporateBodyResponseBudget = {
        ...bodyRequest,
        rooms: newRooms,
        agencyPercent: agency,
        rowsValues: {
            rows: rowsFinal,
            total: calcTotal(rowsFinal, bodyRequest.discount)
        }
    }

    return response;
}