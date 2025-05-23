import { rdGetDeals } from "../services/rdstation/getDeals";
import { prismaClient } from "../database/prismaClient";
import { winChange } from "../services/winChange";
import { Deal } from "../services/rdstation/rd.types";

/*
    verifica alterações feitas no rd e att os status no sistema de orçamento
*/
export const fsAssistOpportunity = async () => {
  const { has_change, find_last_edit, page, has_more } =
    await assistOpportunity();

  if (!find_last_edit && has_more) {
    await assistOpportunity(page + 1);
  }
};

export const assistOpportunity = async (page = 1) => {
  const opportunities = await rdGetDeals({
    order: "updated_at",
    page: page.toString(),
  });

  let has_more = opportunities.has_more;
  let total = opportunities.total;
  let deals = opportunities.deals;
  let find_last_edit = false;
  let has_change = false;
  const last_edit = await prismaClient.routines.findUnique({
    where: {
      routine: "opportunity",
    },
  });
  deals.map(async (deal) => {
    const field = deal.deal_custom_fields;
    let deal_change = false;

    const check_in =
      field.filter(
        (fil) => fil.custom_field_id === "64b7e36af4f07f001ab229e9"
      )[0]?.value + "" || null;
    const check_out =
      field.filter(
        (fil) => fil.custom_field_id === "64b7e389d59c560018d30e20"
      )[0]?.value + "" || null;
    const budget_status =
      field.filter(
        (fil) => fil.custom_field_id === "64b94d33862444000e56696e"
      )[0]?.value + "" || null;

    const win = deal.win + "" || null;
    const amount_total = deal.amount_total + "" || null;

    let db_deal = await prismaClient.deals.findUnique({
      where: { id: deal.id },
    });

    if (!db_deal) {
      db_deal = await prismaClient.deals.create({
        data: {
          id: deal.id,
          budget_status,
          win,
          check_out,
          amount_total,
          check_in,
        },
      });
    }

    if (db_deal.budget_status != budget_status) {
      console.log("%c[ CRON ]", "background: #000; color: #3232CD");
      console.log(
        "found a change in budget status on deal: " + deal.id + " " + deal.name
      );
      console.log(db_deal.budget_status, budget_status);
      deal_change = true;
    }

    if (db_deal.check_in != check_in) {
      console.log("%c[ CRON ]", "background: #000; color: #3232CD");

      console.log(
        "found a change in check in on deal: " + deal.id + " " + deal.name
      );
      console.log(db_deal.check_in, check_in);

      deal_change = true;
    }

    if (db_deal.check_out != check_out) {
      console.log("%c[ CRON ]", "background: #000; color: #3232CD");

      console.log(
        "found a change in check out on deal: " + deal.id + " " + deal.name
      );
      console.log(db_deal.check_out, check_out);

      deal_change = true;
    }

    if (db_deal.win != win) {
      console.log("%c[ CRON ]", "background: #000; color: #3232CD");

      console.log(
        "found a change in deal status on deal: " + deal.id + " " + deal.name
      );
      console.log(db_deal.win, deal.win);

      deal_change = true;
    }

    if (db_deal.amount_total != amount_total) {
      console.log("%c[ CRON ]", "background: #000; color: #3232CD");

      console.log(
        "found a change in products value on deal: " + deal.id + " " + deal.name
      );
      console.log(db_deal.amount_total, amount_total);

      deal_change = true;
    }

    // HOSPEDAGEM --------------------------------------------------init
    const budgets_deal = await prismaClient.saveBudgets.findMany({
      where: {
        budgets: {
          path: ["0", "arrComplete", "responseForm", "rd_client"],
          string_contains: db_deal.id,
        },
      },
    });

    if (budgets_deal.length > 0) {
      deal_change = await updateStatusInOpportunity(
        budgets_deal,
        deal,
        false,
        deal_change
      );
    }
    // HOSPEDAGEM --------------------------------------------------end

    // CORPORATIVO --------------------------------------------------init
    const corp_deal = await prismaClient.saveBudgetsCorp.findMany({
      where: {
        budget: {
          path: ["idClient"],
          string_contains: db_deal.id,
        },
      },
    });
    if (corp_deal.length > 0) {
      console.log("change corp");
      deal_change = await updateStatusInOpportunity(
        corp_deal,
        deal,
        true,
        deal_change
      );
    }
    // CORPORATIVO --------------------------------------------------end

    if (deal_change) {
      const updated = await prismaClient.deals.update({
        where: {
          id: deal.id,
        },
        data: {
          budget_status,
          win,
          check_out,
          amount_total,
          check_in,
        },
      });

      const updated_last_action = await prismaClient.routines
        .update({
          where: {
            routine: "opportunity",
          },
          data: {
            last_action: deal.updated_at,
            last_deal: deal.id,
          },
        })
        .catch(async () => {
          await prismaClient.routines.create({
            data: {
              routine: "opportunity",
            },
          });
        });

      has_change = true;
      console.log("att changes");
    }
  });

  const verify_if_find = deals.filter(
    (deal) => (last_edit?.last_action ?? 0) >= deal.updated_at
  );

  if (verify_if_find.length > 0) find_last_edit = true;

  return {
    has_change,
    find_last_edit,
    page,
    has_more,
  };
};

async function updateStatusInOpportunity(
  budget_deal: { status: string }[],
  deal: Deal,
  corp: boolean,
  deal_change: boolean
) {
  const onlyWin = budget_deal.filter((budget) => budget.status === "ganho");
  const onlyLose = budget_deal.filter((budget) => budget.status === "perdido");
  if (deal.win === true && onlyWin.length !== budget_deal.length) {
    await winChange(deal, "ganho", corp);
    deal_change = true;
  } else if (deal.win === false && onlyLose.length !== budget_deal.length) {
    await winChange(deal, "perdido", corp);
    deal_change = true;
  } else if (deal.win === null && (onlyWin.length > 0 || onlyLose.length > 0)) {
    await winChange(deal, "em andamento", corp);
    deal_change = true;
  }
  return deal_change;
}
