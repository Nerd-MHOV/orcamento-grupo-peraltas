// ============================================================================
// APP_BASE — URL base do app de orçamento. ALTERE AQUI por ambiente.
// Produção: domínio público do app de orçamento (HTTPS).
// ============================================================================
const APP_BASE = "https://orcamento.grupoperaltas.com.br";

// Conta Kommo da Peraltas. Padrão de URL do lead:
//   https://admperaltasturismo.kommo.com/leads/detail/{id}
const KOMMO_LEAD_URL_RE =
  /^https:\/\/admperaltasturismo\.kommo\.com\/leads\/detail\/(\d+)/;

/**
 * Função PURA: extrai o id numérico do lead a partir da URL do Kommo.
 * Retorna a string do id quando a URL é uma página de detalhe de lead,
 * ou null caso contrário (dashboard ou qualquer outra página).
 * @param {string} url
 * @returns {string|null}
 */
function extractLeadId(url) {
  if (typeof url !== "string") return null;
  const match = url.match(KOMMO_LEAD_URL_RE);
  return match ? match[1] : null;
}

// Exporta a função pura para checagem via Node, sem quebrar o código no browser.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { extractLeadId };
}

// ---------------------------------------------------------------------------
// O bloco abaixo só roda no contexto da extensão (popup), onde `document` e
// `chrome.tabs` existem. Sob Node (para o teste) ele é simplesmente ignorado.
// ---------------------------------------------------------------------------
if (typeof document !== "undefined" && typeof chrome !== "undefined") {
  const budget_button = document.getElementById("budget");
  const budget_corp_button = document.getElementById("budget-corp");
  const listBudget_button = document.getElementById("list-budgets");
  const statusEl = document.getElementById("status");
  const actionButtons = [budget_button, budget_corp_button, listBudget_button];

  // Configurações da janela popup (centralizada).
  const openPopup = (url) => {
    const width = 1000; // Largura da janela em pixels
    const height = 650; // Altura da janela em pixels
    const left = (window.innerWidth - width) / 2; // Centraliza horizontalmente
    const top = (window.innerHeight - height) / 2; // Centraliza verticalmente
    const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
    window.open(url, "_blank", features);
  };

  // Retorna o leadId da aba ativa, ou null se não for uma página de lead do Kommo.
  const getActiveLeadId = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    return extractLeadId(tab?.url ?? "");
  };

  const setStatus = (text, kind) => {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = `status status--${kind}`;
  };

  // Ao abrir o popup: detecta o lead e habilita/desabilita as ações com feedback.
  const refreshState = async () => {
    const leadId = await getActiveLeadId();
    const enabled = Boolean(leadId);
    actionButtons.forEach((btn) => {
      if (btn) btn.disabled = !enabled;
    });
    if (enabled) {
      setStatus(`Lead detectado: #${leadId}`, "ok");
    } else {
      setStatus("Abra um lead do Kommo para gerar o orçamento.", "warn");
    }
  };

  // Liga um botão a um fluxo do app; só age quando há um lead na aba (Req 6.3).
  const wireAction = (button, buildUrl) => {
    if (!button) return;
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      const leadId = await getActiveLeadId();
      if (!leadId) return; // Não é página de lead do Kommo → nada a fazer.
      openPopup(buildUrl(leadId));
    });
  };

  wireAction(budget_button, (id) => `${APP_BASE}/?client_id=${id}`);
  wireAction(
    budget_corp_button,
    (id) => `${APP_BASE}/corporate?client_id=${id}`,
  );
  wireAction(listBudget_button, (id) => `${APP_BASE}/budgets?find=${id}`);

  document.addEventListener("DOMContentLoaded", refreshState);
  // Caso o DOM já esteja pronto quando o script roda.
  if (document.readyState !== "loading") refreshState();
}
