import { Request, Response } from "express";
import { rdGetDeals } from "../../services/rdstation/getDeals";
import { assistOpportunity } from "../../crons/fsAssistOpportunity";
import assist48hInWalking from "../../crons/DBStatus/assist48hInWalking";
import assist24hInExpend from "../../crons/DBStatus/assist24hInExpend";
import { fsAssistDaysDeadLine } from "../../crons/fsAssistDaysDeadLine";
import { assistDBStatus } from "../../crons/DBStatus/assistDBStatus";
import { fsAssistGoogleForms } from "../../crons/fsAssistGoogleForms";
import { fsAttDataAppHotel } from "../../crons/fsAttDataAppHotel";

export class RoutinesAutomations {
    async getOpportunities(request: Request, response: Response) {
        const opportunities = await rdGetDeals({});
        return response.json(opportunities);
    }

    async assistOpportunities(request: Request, response: Response) {
        const { has_change } = await assistOpportunity()
        return response.json(has_change ? "I found changes" : "All is ok")
    }

    async assistDBStatus(request: Request, response: Response) {
        assistDBStatus();
        return response.json("assistDBStatus")
    }
    async assist48hInWalked(request: Request, response: Response) {
        const res = await assist48hInWalking()
        return response.json(res)
    }

    async assist24hInExpend(request: Request, response: Response) {
        const res = await assist24hInExpend()
        return response.json(res)
    }

    async daysToDeadLine(request: Request, response: Response) {
        fsAssistDaysDeadLine();
        return response.json("Init process to check date in stage")
    }

    async googleForms(request: Request, response: Response) {
        const gf = await fsAssistGoogleForms();
        return response.json(gf)
    }

    async attAppHotel(request: Request, response: Response) {
        await fsAttDataAppHotel();
        return response.json("attAppHotel")
    }
}