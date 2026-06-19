import { useEffect, useState } from "react";
import { useApi } from "../../../hooks/api/api";
import useQuery from "../../../hooks/urlQuery/query";
import { useNotification } from "../../notification/notificationContext";

/**
 * Setters do estado do formulário que este hook precisa para popular os dados
 * vindos do lead. São fornecidos pelo provider (mesmo estado que os componentes
 * de query-param já consomem), mantendo a integração mínima.
 */
export interface PrefillFormSetters {
  setChildValue: (value: number[]) => void;
  setPetValue: (value: string[]) => void;
  handleSelectDate: (ranges: {
    selection: { startDate: Date; endDate: Date; key: "selection" };
  }) => void;
}

/**
 * Converte `YYYY-MM-DD` em uma data no fuso LOCAL (meia-noite local).
 * `new Date("2026-07-25")` seria interpretado como meia-noite UTC e, exibido no
 * calendário em UTC-3, cairia para o dia anterior (24). Construir a data pelos
 * componentes mantém o dia pretendido no calendário.
 */
function parseLocalDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export interface UsePrefillFromLeadResult {
  /** Nome do cliente associado ao lead (Req 6.2). Vazio quando não houve prefill. */
  name: string;
  /** Quantidade de adultos vinda do lead, quando presente (Req 6.1). */
  adt: number | undefined;
  /** Indica que a consulta ao lead está em andamento. */
  loading: boolean;
}

/**
 * Ao montar, lê `client_id` da query string. Se presente e numérico, consulta o
 * lead no Kommo e pré-preenche o formulário (Req 6.1, 6.2). Campos ausentes
 * permanecem em branco (Req 6.3). Em caso de erro (lead inexistente ou falha de
 * rede), o formulário abre vazio e um aviso é exibido (Req 6.4). Quando não há
 * `client_id`, nada é feito e os query-params seguem como fallback.
 */
const usePrefillFromLead = (
  setters: PrefillFormSetters
): UsePrefillFromLeadResult => {
  const api = useApi();
  const query = useQuery();
  const notify = useNotification();

  const [name, setName] = useState("");
  const [adt, setAdt] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const clientId = query.get("client_id");

  useEffect(() => {
    if (!clientId) return;

    const leadId = Number(clientId);
    if (!Number.isInteger(leadId) || leadId <= 0) return;

    let active = true;
    setLoading(true);

    api.kommo
      .getLead(leadId)
      .then((lead) => {
        if (!active) return;

        setName(lead.name ?? "");
        if (typeof lead.adt === "number") setAdt(lead.adt);

        if (lead.checkIn && lead.checkOut) {
          setters.handleSelectDate({
            selection: {
              startDate: parseLocalDate(lead.checkIn),
              endDate: parseLocalDate(lead.checkOut),
              key: "selection",
            },
          });
        }

        if (lead.chdAges && lead.chdAges.length > 0) {
          setters.setChildValue(lead.chdAges);
        }

        if (lead.petSizes && lead.petSizes.length > 0) {
          setters.setPetValue(lead.petSizes);
        }
      })
      .catch((err: unknown) => {
        if (!active) return;
        const message =
          err instanceof Error && err.message === "not_found"
            ? "Lead não encontrado"
            : "Não foi possível carregar o lead";
        notify(message, "warning");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // Executa uma vez por client_id; os setters são estáveis o suficiente para o prefill inicial.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  return { name, adt, loading };
};

export default usePrefillFromLead;
