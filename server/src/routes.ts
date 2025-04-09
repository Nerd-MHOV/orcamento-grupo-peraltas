import express from "express";
import fs from "fs";
import { CalcBudgetController } from "./controllers/Budget/CalcBudgetController";
import { CalcBudgetDUController } from "./controllers/Budget/calcBudgetDUcontroller";
import { GetBudgetController } from "./controllers/Budget/GetBudgetController";
import { SaveBudgetController } from "./controllers/Budget/SaveBudgetController";
import { CreateCategoryController } from "./controllers/Category/CreateCategoryController";
import { FindCategoryController } from "./controllers/Category/FindCategoryController";
import { CreateCommonDateController } from "./controllers/CommonDate/CreateCommonDateController";
import { FindCommonDateController } from "./controllers/CommonDate/FindCommonDateController";
import { UpdateCommonDateController } from "./controllers/CommonDate/UpdateCommonDateController";
import { CreateDiscountController } from "./controllers/Discounts/CreateDiscountController";
import { DeleteDiscountController } from "./controllers/Discounts/DeleteDiscountController";
import { GetDiscountController } from "./controllers/Discounts/GetDiscountController";
import { ToggleActiveDiscountController } from "./controllers/Discounts/ToggleActiveDiscountController";
import { ToggleDailyCourtesyController } from "./controllers/Discounts/ToggleDailyCourtesyController";
import { UpdateDiscountController } from "./controllers/Discounts/UpdateDiscountController";
import { ToggleFavoriteController } from "./controllers/Favorites/ToggleFavoriteController";
import { CreateFoodController } from "./controllers/Food/CreateFoodController";
import { FindFoodController } from "./controllers/Food/FindFoodController";
import { FindAllHousingUnits } from "./controllers/HousingUnits/FindAllHousingUnits";
import { CreatePetController } from "./controllers/Pet/CreatePetController";
import { FindPetController } from "./controllers/Pet/FindPetController";
import { ActiveRequirementController } from "./controllers/Requirement/ActiveRequirementController";
import { DeleteRequirementController } from "./controllers/Requirement/DeleteRequirementController";
import { FindRequirementsController } from "./controllers/Requirement/FindRequirementsController";
import { GetaRequirementController } from "./controllers/Requirement/GetaRequiremetController";
import { NewRequirementController } from "./controllers/Requirement/NewRequirementController";
import { PriceRequirementController } from "./controllers/Requirement/PriceRequirementController";
import { CreateSpecificDateController } from "./controllers/SpecificDate/CreateSpecificDateController";
import { FindSpecificDateController } from "./controllers/SpecificDate/FindSpecificDateController";
import { UpdateSpecificDateController } from "./controllers/SpecificDate/UpdateCommonDateController";
import { ChangeOrderTariffController } from "./controllers/Tariff/ChangeOrderTariffController";
import { CreateTariffController } from "./controllers/Tariff/CreateTariffController";
import { CreateTariffWithTextController } from "./controllers/Tariff/CreateTariffWithTextController";
import { DeleteTariffController } from "./controllers/Tariff/DeleteTariffController";
import { FindTariffController } from "./controllers/Tariff/FindTariffController";
import { GetaTariffController } from "./controllers/Tariff/GetaTariffController";
import { GetNumberPipeController } from "./controllers/Tariff/GetNumberPIpeController";
import { ToggleActiveTariffController } from "./controllers/Tariff/ToggleActiveTariffController";
import { CreateTariffValueController } from "./controllers/TariffValue/CreateTariffValueController";
import { FindTariffValueController } from "./controllers/TariffValue/FindTariffValueController";
import { CreateUserController } from "./controllers/Users/CreateUsersController";
import { DeleteUsersController } from "./controllers/Users/DeleteUsersController";
import { FindUniqueUserController } from "./controllers/Users/FindUniqueUserController";
import { FindUserController } from "./controllers/Users/FindUsersController";
import { LoginUsersController } from "./controllers/Users/LoginUsersController";
import { UpdateUserController } from "./controllers/Users/UpdateUsersController";
import { ValidateUsersController } from "./controllers/Users/ValidateUsersController";
import { authMiddleware } from "./middlewares/authMiddleware";
import { isAdmin } from "./middlewares/isAdmin";
import { RDController } from "./controllers/RdStation/RDController";
import { RoutinesAutomations } from "./controllers/RoutinesAutomations/RoutinesAutomations";
import assist48hInWalking from "./crons/DBStatus/assist48hInWalking";
import { assistDBStatus } from "./crons/DBStatus/assistDBStatus";
import { CalcBudgetCorpController } from "./controllers/Budget/CalcBudgetCorpController";
import { Actions } from "./controllers/Insights/actions";
import { AppHotel } from "./controllers/ReservAppHotel/getPeriodController";

const routes = express.Router();

const createUser = new CreateUserController();
const findUser = new FindUserController();
const findUniqueUser = new FindUniqueUserController();
const deleteUser = new DeleteUsersController();
const updateUser = new UpdateUserController();
const loginUser = new LoginUsersController();
const validateUser = new ValidateUsersController();

const createFood = new CreateFoodController();
const findFood = new FindFoodController();

const findCategory = new FindCategoryController();
const createCategory = new CreateCategoryController();

const findPet = new FindPetController();
const createPet = new CreatePetController();

const findTariff = new FindTariffController();
const getaTariff = new GetaTariffController();
const createTariff = new CreateTariffController();
const createTariffText = new CreateTariffWithTextController();
const deleteTariff = new DeleteTariffController();
const pipeTariff = new GetNumberPipeController();
const changeOrderTariff = new ChangeOrderTariffController();
const toggleActiveTariff = new ToggleActiveTariffController();

const findTariffValue = new FindTariffValueController();
const createTariffValue = new CreateTariffValueController();

const findCommonDate = new FindCommonDateController();
const createCommonDate = new CreateCommonDateController();
const updateCommonData = new UpdateCommonDateController();

const findSpecificDate = new FindSpecificDateController();
const createSpecificDate = new CreateSpecificDateController();
const updateSpecificDate = new UpdateSpecificDateController();

const newRequirement = new NewRequirementController();
const findRequirements = new FindRequirementsController();
const findaRequirement = new GetaRequirementController();
const deleteRequirement = new DeleteRequirementController();
const findAllHousingUnits = new FindAllHousingUnits();
const activeRequirement = new ActiveRequirementController();
const priceRequirement = new PriceRequirementController();

const calcBudget = new CalcBudgetController();
const calcCorpBudget = new CalcBudgetCorpController();
const calcBudgetDU = new CalcBudgetDUController();
const saveBudget = new SaveBudgetController();
const getBudget = new GetBudgetController();
// const changeDeal = new ChangeDealController();

const favoriteBudget = new ToggleFavoriteController();

const createDiscount = new CreateDiscountController();
const getDiscount = new GetDiscountController();
const updateDiscount = new UpdateDiscountController();
const activeDiscount = new ToggleActiveDiscountController();
const daily_courtesy = new ToggleDailyCourtesyController();
const deleteDiscount = new DeleteDiscountController();
const rd = new RDController();
const routinesAutomations = new RoutinesAutomations();
const appHotel = new AppHotel();

const insightsActions = new Actions();

routes.post("/user", createUser.handle);
routes.post("/login", loginUser.handle);


routes.get("/routines/opportunities", routinesAutomations.getOpportunities)
routes.get("/routines/assist-opportunities", routinesAutomations.assistOpportunities)
routes.get("/routines/assist-db-status", routinesAutomations.assistDBStatus)
routes.get("/routines/assist-48h-in-walked", routinesAutomations.assist48hInWalked)
routes.get("/routines/assist-24h-in-expend", routinesAutomations.assist24hInExpend)
routes.get("/routines/days-to-dead-line", routinesAutomations.daysToDeadLine)
routes.get("/routines/google-forms", routinesAutomations.googleForms)
routes.get("/routines/att-app-hotel", routinesAutomations.attAppHotel);

routes.post("/app-hotel", appHotel.getPeriod);

routes.use(authMiddleware);
routes.delete("/user/:id", isAdmin, deleteUser.handle);
routes.put("/user/:id", isAdmin, updateUser.handle);
routes.get("/user", isAdmin, findUser.handle);
routes.get("/validate", validateUser.handle);
routes.post("/unique-user", findUniqueUser.handle);

routes.get("/food", findFood.handle);
routes.post("/food", createFood.handle);

routes.get("/category", findCategory.handle);
routes.post("/category", createCategory.handle);

routes.get("/pet", findPet.handle);
routes.post("/pet", createPet.handle);

routes.get("/tariff", findTariff.handle);
routes.post("/tariff", createTariff.handle);
routes.post("/tariff/unique", getaTariff.handle);
routes.post("/tariff/text", createTariffText.handle);
routes.post("/tariff_pipe", pipeTariff.handle);
routes.post("/tariff/delete", isAdmin, deleteTariff.handle);
routes.post("/tariff/order", changeOrderTariff.handle);
routes.post("/tariff/active", toggleActiveTariff.handle);


//---------- stop here
routes.get("/tariff-value", findTariffValue.handle);
routes.post("/tariff-value", createTariffValue.handle);

routes.get("/common-date", findCommonDate.handle);
routes.post("/common-date", createCommonDate.handle);
routes.put("/common-date/:name", isAdmin, updateCommonData.handle);

routes.get("/specific-date", findSpecificDate.handle);
routes.post("/specific-date", createSpecificDate.handle);
routes.put("/specific-date/:name", isAdmin, updateSpecificDate.handle);

routes.post("/requirement", newRequirement.handle);
routes.get("/requirement", findRequirements.handle);
routes.post("/requirement/unique", findaRequirement.handle);
routes.get("/housing-units", findAllHousingUnits.handle);                           //
routes.put("/requirement/active/:name", isAdmin, activeRequirement.handle);
routes.put("/requirement/price", isAdmin, priceRequirement.handle);
routes.delete("/requirement/:name", deleteRequirement.handle);

routes.post("/budget", calcBudget.handle);
routes.post("/budget-du", calcBudgetDU.handle);
routes.post("/budget-corp", calcCorpBudget.handle);
routes.post("/save-budget", saveBudget.handle);
routes.post("/save-budget-corp", saveBudget.saveCorp);
routes.put("/save-budget/rename", saveBudget.renameBudget);
routes.get("/budget", getBudget.handle);

routes.put("/favorite/:id", authMiddleware, favoriteBudget.handle);

routes.get("/discount", getDiscount.handle);
routes.post("/discount", isAdmin, createDiscount.handle);
routes.put("/discount/:id", isAdmin, updateDiscount.handle);
routes.put("/discount/:id/active", isAdmin, activeDiscount.handle);
routes.put("/discount/:id/daily_courtesy", isAdmin, daily_courtesy.handle);
routes.delete("/discount/:id", isAdmin, deleteDiscount.handle);

routes.post("/rd/get_a_deal", rd.getDeal)
routes.post("/rd/delete_product", rd.deleteProduct)
routes.post("/rd/add_product", rd.addProduct)
routes.post("/rd/change_stage", rd.changeStage)


routes.get("/insights/actions/:action", insightsActions.action);
routes.get("/insights/actions", insightsActions.all);



// routes.post("/pipedrive", changeDeal.handle);
export default routes;
