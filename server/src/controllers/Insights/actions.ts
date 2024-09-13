import { Request, Response } from "express";
import { prismaClient } from "../../database/prismaClient";
import { getInsightsActions } from "./functions/getInsightsActions";

export class Actions {
  async action(request: Request, response: Response) {
    const { action } = request.params;
    const data = getInsightsActions(action);
    return response.json(data);
  }

  async all(request: Request, response: Response) {
    const actions = await prismaClient.discounts.findMany( { where: { active: true } } );
    let data: any = {};
    await Promise.all(actions.map(async (action) => {
        const insights = await getInsightsActions(action.name);
        data[`${action.name}`] = insights
        console.log(data);
    }));

    return response.json(data);
  }
}
