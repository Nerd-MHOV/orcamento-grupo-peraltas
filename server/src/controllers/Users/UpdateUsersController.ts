import { Request, Response } from "express";
import { prismaClient } from "../../database/prismaClient";
import bcrypt from "bcrypt";

export class UpdateUserController {
  async handle(request: Request, response: Response) {
    const { name, email, password, phone, username, token_rd, user_rd } =
      request.body;
    const { id } = request.params;

    console.log(password);

    await bcrypt
      .hash(password, 10)
      .then(async (hashPassword) => {
        if (!password) {
          return prismaClient.user.update({
            data: {
              name,
              email,
              phone,
              username,
              token_rd,
              user_rd,
            },
            where: {
              id,
            },
          });
        } else {
          return prismaClient.user.update({
            data: {
              name,
              email,
              password: hashPassword,
              phone,
              username,
              token_rd,
              user_rd,
            },
            where: {
              id,
            },
          });
        }
      })
      .then((newUser) => {
        const { password: _, ...user } = newUser;

        return response.json(user);
      })
      .catch((err) => {
        let message = "Erro interno do servidor";
        if (err.meta?.target[0] === "username")
          message = "Esse username já esta sendo usado!";
        if (err.meta?.target[0] === "email")
          message = "Esse email já esta sendo usado!";
        if (err.meta?.target[0] === "name")
          message = "Esse colaborador já foi cadastrado!";

        return response.status(500).json({
          err: err,
          message: {
            type: "error",
            message: message,
            debug: err,
          },
        });
      });
  }
}
