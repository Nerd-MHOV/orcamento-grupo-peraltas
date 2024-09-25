import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { NewTariff } from "./pages/Tariffs/NewTariffs";
import { NewUsersPage } from "./pages/Users/NewUsers";
import { TariffsPage } from "./pages/Tariffs";
import { TestPage } from "./pages/TextPage";
import { UsersPage } from "./pages/Users";
import { Private } from "./private";
import { PrivateRole } from "./privateRole";
import { RequirementsPage } from "./pages/Requirements";
import { NewRequirementPage } from "./pages/Requirements/NewRequirement";
import { Analytic } from "./pages/Analytic";
import { EditTariff } from "./pages/Tariffs/EditTariff";
import { EditUsers } from "./pages/Users/EditUsers";
import { BudgetsPage } from "./pages/Budgets";
import { DiscountsPage } from "./pages/Discounts";
import { NewDiscountPage } from "./pages/Discounts/NewDiscount";
import Corporate from "./pages/Corporate";
import BudgetClient from "./pages/client/budget";

function App() {

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route path="/login" element={<Login />} />
            <Route element={<Private />}>
              <Route index element={<Home />} />

              <Route path="/corporate">
                <Route index element={<Corporate />} />
              </Route>

              <Route path="/budgets">
                <Route index element={<BudgetsPage />} />
              </Route>

              <Route element={<PrivateRole level={2} />}>
                <Route path="/tariffs">
                  <Route index element={<TariffsPage />} />
                  <Route path="/tariffs/create" element={<NewTariff />} />
                  <Route path="/tariffs/edit/:id" element={<EditTariff />} />
                  <Route path="/tariffs/test" element={<TestPage />} />
                </Route>
                <Route path="/users">
                  <Route index element={<UsersPage />} />
                  <Route path="/users/create" element={<NewUsersPage />} />
                  <Route path="/users/:id" element={<EditUsers />} />
                </Route>
                <Route path="/requirements">
                  <Route index element={<RequirementsPage />} />
                  <Route
                    path="/requirements/create"
                    element={<NewRequirementPage />}
                  />
                </Route>

                <Route path="/discounts">
                  <Route index element={<DiscountsPage />} />
                  <Route
                    path="/discounts/create"
                    element={<NewDiscountPage />}
                  />
                </Route>
              </Route>
              <Route element={<PrivateRole level={3} />}>
                <Route path="/analytic">
                  <Route index element={<Analytic />} />
                </Route>
              </Route>
            </Route>
            <Route path="/client/:id/:token" element={<BudgetClient />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
