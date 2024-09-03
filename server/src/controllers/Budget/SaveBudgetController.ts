import { Request, Response } from "express";
import { prismaClient } from "../../database/prismaClient";

export class SaveBudgetController {
  async handle(request: Request, response: Response) {
    const { user_id, budgets, remake = true, name = ""  } = request.body;
    const id = budgets[0].arrComplete.responseForm.rd_client

    if(remake && id) {
      const ignore = ["perdido", "ganho", "none"]
      await prismaClient.saveBudgets.updateMany({
        where: {
          budgets: {
              path: ["0", "arrComplete", "responseForm", "rd_client"],
              string_contains: id,
          },
          status: {
            notIn: ignore
          }
        },
        data: {
          status: "refeito"
        }
      })
    }
    const save = await prismaClient.saveBudgets.create({
      data: {
        user_id,
        budgets,
        ...!id ? {status: "none"} : "",
        name,
      },
    });

    return response.json(save);
  }

  async renameBudget(request: Request, response: Response) {
    const {id, name} = request.body;

    const updated = await prismaClient.saveBudgets.update({
      where: { id },
      data: {name}
    })
    return response.json(updated);
  }

  async saveCorp(request: Request, response: Response) {
    const { user_id, budget, remake = true, name = ""  } = request.body;
    const id = budget.idClient;

    if(remake && id) {
      const ignore = ["perdido", "ganho", "none"]
      await prismaClient.saveBudgetsCorp.updateMany({
        where: {
          budget: {
              path: ["idClient"],
              string_contains: id,
          },
          status: {
            notIn: ignore
          }
        },
        data: {
          status: "refeito"
        }
      })
    }
    const save = await prismaClient.saveBudgetsCorp.create({
      data: {
        user_id,
        budget,
        ...!id ? {status: "none"} : "",
        name,
      },
    });

    return response.json(save);
  }
}
