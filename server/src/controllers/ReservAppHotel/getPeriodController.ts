import { Request, Response } from "express";
import { prismaClient } from "../../database/prismaClient";
const unidades = ['100', '101', '102', '103', '104', '105', '106', '107', '108', '209', '210', '211', '212', '214', '215',
    '216', '217', '218', '219', '320', '321', '322', '323', '425', '426', '427', '428', '429', '430', '531', '532', '533',
    '534', '535', '637', '638', '639', '640', '641', '701', '702', '705', '706', '707', '708', '709', '710', '711', '703',
    '704', '801', '804', '803', '805', '806', '802', '807',
];

export class AppHotel {
    async getPeriod(request: Request, response: Response) {
        let { start, end } = request.body;
        console.log("[ APP HOTEL ] INFO - Start date:", start);
        console.log("[ APP HOTEL ] INFO - End date:", end);
        try {
            if (!start.includes(":")) start = `${start}T16:00:00-03:00`;
            if (!end.includes(":")) end = `${end}T16:00:00-03:00`;
            const startDate = new Date(start);
            const endDate = new Date(end);

            const reservations = await prismaClient.reservsAppHotel.findMany({
                where: {
                    AND: [
                        { date_init: { lte: endDate } },
                        { date_end: { gte: startDate } },
                        { room: { in: unidades } }
                        // essa verificação já é feita no servidor do app, se for passado ?unidade=true mas ta esquisito....
                    ]
                },
            });

            const amount = reservations.reduce((acc: { adt: number; chd: number; confirmadas: number; processadas: number; bloqueios: number }, item: any) => {

                acc.adt += item.adt;
                acc.chd += item.chd;
                acc.confirmadas += item.situation === "CONFIRMADA" ? 1 : 0;
                acc.processadas += item.situation === "PROCESSADA" ? 1 : 0;
                acc.bloqueios += item.situation === "BLOQUEIO" ? 1 : 0;

                return acc;
            }, {
                adt: 0,
                chd: 0,
                confirmadas: 0,
                processadas: 0,
                bloqueios: 0,
            });

            response.json({
                reservas: reservations,
                ...amount,
                qtd_reservas: reservations.length,
            });
        } catch (error) {
            console.error("Error fetching reservations:", error);
            response.status(500).json({ error: "Internal server error" });
        }
    }
}