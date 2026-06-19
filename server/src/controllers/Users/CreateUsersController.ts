import { Request, Response } from "express";
import { prismaClient } from "../../database/prismaClient";
import bcrypt from "bcrypt";

export class CreateUserController {
  async handle(request: Request, response: Response) {
    const { name, email, password, phone, username } = request.body;

    await bcrypt
      .hash(password, 10)
      .then(async (hashPassword) => {
        return prismaClient.user.create({
          data: {
            name,
            email,
            password: hashPassword,
            phone,
            username,
          },
        })
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
