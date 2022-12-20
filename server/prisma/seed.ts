import { prisma, PrismaClient } from "@prisma/client";
import { CategorySeed } from "./seeds/categories";
import { CheckSeed } from "./seeds/checkinValues";
import { CommonDateSeed } from "./seeds/commonDates";
import { FoodSeed } from "./seeds/food";
import { HUsSeed } from "./seeds/housingUnits";
import { PetSeed } from "./seeds/pets";
import { RequirementSeed } from "./seeds/requirements";
import { SpecificDateSeed } from "./seeds/specificDates";
import { TariffValueSeed } from "./seeds/tariffValues";
import { TariffSeed } from "./seeds/tarrifs";
import { UserSeed } from "./seeds/users";

const prismaClient = new PrismaClient();

async function main() {
  for (let user of UserSeed) {
    const createdUsers = await prismaClient.user.upsert({
      where: { id: user.id },
      update: {},
      create: user,
    });
    console.log("created user:" + user.name);
  }

  for (let food of FoodSeed) {
    const createdFood = await prismaClient.foods.upsert({
      where: {
        id: food.id,
      },
      update: {},
      create: food,
    });

    console.log("created price food", food);
  }

  for (let category of CategorySeed) {
    const createdCategory = await prismaClient.categories.upsert({
      where: { id: category.id },
      update: {},
      create: category,
    });
    console.log("created category " + category.id);
  }

  for (let tariff of TariffSeed) {
    const createdTariff = await prismaClient.tariff.upsert({
      where: { name: tariff.name },
      update: {},
      create: tariff,
    });
  }

  for (let commonDate of CommonDateSeed) {
    const createdDate = await prismaClient.commonDates.upsert({
      where: { date: commonDate.date },
      update: {},
      create: commonDate,
    });
    console.log("created common Tariff ", commonDate.date);
  }

  for (let specificDate of SpecificDateSeed) {
    const createdDate = await prismaClient.specificDates.upsert({
      where: { date: specificDate.date },
      update: {},
      create: specificDate,
    });
  }

  for (let tariffValue of TariffValueSeed) {
    const { id: tariffId, ...restTariff } = tariffValue;
    const createdValue = await prismaClient.tariffValues.upsert({
      where: { id: tariffId },
      update: {},
      create: restTariff,
    });
  }

  for (let checkIn of CheckSeed) {
    const createdCheckIn = await prismaClient.tariffCheckInValues.upsert({
      where: { id: checkIn.id },
      update: {},
      create: checkIn,
    });
    console.log("created tariff for" + checkIn.type + checkIn.tariffs_id);
  }

  for (let pet of PetSeed) {
    const createdPet = await prismaClient.pet.upsert({
      where: { id: pet.id },
      update: {},
      create: pet,
    });
    console.log("created price for pet " + pet.carrying);
  }

  for (let requirement of RequirementSeed) {
    const createdRequirement = await prismaClient.requirement.upsert({
      where: { id: requirement.id },
      update: {},
      create: requirement,
    });
  }

  for (let unit of HUsSeed) {
    const createdHU = await prismaClient.hUs.upsert({
      where: { id: unit.id },
      update: {},
      create: unit,
    });
    console.log("Housing unit created: " + unit.id);
  }
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
