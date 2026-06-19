import { Request, Response } from "express";
import { fsAssistGoogleForms } from "../../crons/fsAssistGoogleForms";
import { fsAttDataAppHotel } from "../../crons/fsAttDataAppHotel";

export class RoutinesAutomations {
    async googleForms(request: Request, response: Response) {
        const gf = await fsAssistGoogleForms();
        return response.json(gf)
    }

    async attAppHotel(request: Request, response: Response) {
        await fsAttDataAppHotel();
        return response.json("attAppHotel")
    }
}
