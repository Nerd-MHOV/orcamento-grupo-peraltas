import bcrypt from "bcrypt";

export const UserSeed = [
  {
    email: "matheus.henrique4245@gmail.com",
    phone: "14 991578451",
    name: "Matheus Henrique",
    username: "admin",
    password: bcrypt.hashSync("admin", 10),
    level: 3
  },
];
