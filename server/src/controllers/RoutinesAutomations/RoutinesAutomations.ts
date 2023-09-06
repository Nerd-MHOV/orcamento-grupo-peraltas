import {Request, Response} from "express";
import {rdGetDeals} from "../../services/rdstation/getDeals";
import {assistOpportunity} from "../../crons/fsAssistOpportunity";
import assist48hInWalking from "../../crons/DBStatus/assist48hInWalking";
import assist24hInExpend from "../../crons/DBStatus/assist24hInExpend";

export class RoutinesAutomations {
    async getOpportunities (request: Request, response: Response) {
        const opportunities = await rdGetDeals({});
        return response.json(opportunities);
    }

    async assistOpportunities (request: Request, response: Response) {
        const {has_change} = await assistOpportunity()
        return response.json(has_change ? "I found changes" : "All is ok")
    }

    async assist48hInWalked (request: Request, response: Response) {
        const res = await assist48hInWalking()
        return response.json(res)
    }

    async assist24hInExpend ( request: Request, response: Response) {
        const res = await assist24hInExpend()
        return response.json(res)
    }
}