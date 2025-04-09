import axios from "axios";
import { prismaClient } from "../database/prismaClient";
import https from "https";
import { ReservsAppHotel } from "@prisma/client";

const config = {
    daysToInit: -7,
    daysToEnd: 365,
}

export async function fsAttDataAppHotel() {
    console.log("[ APP HOTEL ] INFO - Starting data update");
    const { init: date_init, end: date_end } = getInitAndEnd(config);
    const url = `https://servicesapp.brotasecoresort.com.br:8009/testes/get_uhs.php?check_in=${date_init}&check_out=${date_end}`;

    // Create an HTTPS agent that bypasses certificate verification
    const agent = new https.Agent({ rejectUnauthorized: false });

    // capture informations;
    const response = await axios.get(url, { httpsAgent: agent });

    if (response.status !== 200 || response.data?.reservas === undefined) {
        console.error("[ APP HOTEL ] ERROR - Error fetching data from API");
        return;
    }

    type item = {
        K_HOACODIGO: string,
        K_HORCODIGO: string,
        HORTUDATAENTRADA: string,
        HORTUDATASAIDA: string,
        HORTUQUANTIDADEADULTO: number,
        HORTUQUANTIDADECRIANCA: number,
        unidade: string,
        HORTUSITUACAO: string,
    }

    const data = (response.data.reservas as item[]).map((item): Omit<ReservsAppHotel, "id"> => ({
        type_reserv_code: item.K_HOACODIGO,
        reserv_code: item.K_HORCODIGO,
        date_init: new Date(item.HORTUDATAENTRADA),
        date_end: new Date(item.HORTUDATASAIDA),
        adt: item.HORTUQUANTIDADEADULTO,
        chd: item.HORTUQUANTIDADECRIANCA,
        room: item.unidade,
        situation: item.HORTUSITUACAO,
    }))

    // clean database;
    await prismaClient.reservsAppHotel.deleteMany({ where: { id: { not: undefined } } })

    // save informations;
    const saveReservesInDatabase = await prismaClient.reservsAppHotel.createMany({ data })

    if (!saveReservesInDatabase) {
        console.error("[ APP HOTEL ] ERROR - Error saving data in database");
        return;
    }

    console.log("[ APP HOTEL ] INFO - Data saved successfully in database");
    console.log(saveReservesInDatabase.count, " records saved");
}


function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function getInitAndEnd(params: {
    daysToInit: number,
    daysToEnd: number
}): { init: string, end: string } {
    const now = new Date();
    const pastDate = new Date(now);
    pastDate.setDate(now.getDate() + params.daysToInit);
    const futureDate = new Date(now);
    futureDate.setDate(now.getDate() + params.daysToEnd);
    return {
        init: formatDate(pastDate),
        end: formatDate(futureDate),
    }
}
