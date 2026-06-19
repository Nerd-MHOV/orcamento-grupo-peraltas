/**
 * Script de descoberta de campos personalizados do lead no Kommo (Req 2.2).
 *
 * Uso (admin/CLI): consulta `GET /leads/custom_fields?limit=250` e imprime, de
 * forma legível, cada campo (`id`, `type`, `name`) e — para campos enum/select/
 * multiselect — suas entradas `enum_id: value`.
 *
 * Este script é de AUDITORIA / re-descoberta. Os `field_id`s reais já estão
 * confirmados e commitados em `server/src/config/kommoConfig.ts` (task 1.2);
 * este script NÃO muta a config. Use-o para conferir/re-mapear quando os campos
 * do Kommo mudarem.
 *
 * Executar:  `ts-node src/scripts/kommoDiscoverFields.ts`
 * (requer `CRM_TOKEN` e `CRM_BASE_URL` no ambiente — ver `kommoConfig`).
 */

import { createKommoClient } from "../services/kommo/kommoClient";
import { isKommoError, KommoError } from "../services/kommo/kommo.types";

/** Entrada de enum de um campo select/multiselect: `{ id, value }`. */
export interface KommoFieldEnum {
  id: number;
  value: string;
}

/**
 * Forma (parcial) de um custom field retornado por
 * `GET /api/v4/leads/custom_fields`. Só os campos que este script imprime.
 */
export interface KommoCustomField {
  id: number;
  type: string;
  name: string;
  /** Presente em campos select/multiselect/radiobutton, etc. */
  enums?: KommoFieldEnum[] | null;
}

/** Envelope `_embedded.custom_fields[]` da resposta da API v4. */
interface CustomFieldsResponse {
  _embedded?: {
    custom_fields?: KommoCustomField[];
  };
}

/**
 * Formatador puro (testável sem rede): transforma a lista de campos em um
 * texto legível. Cada campo vira uma linha `[id] type — name`; campos com
 * `enums` ganham linhas indentadas `enum_id: value`.
 */
export function formatFields(fields: KommoCustomField[]): string {
  if (fields.length === 0) {
    return "Nenhum custom field retornado.";
  }

  const lines: string[] = [];
  for (const field of fields) {
    lines.push(`[${field.id}] ${field.type} — ${field.name}`);
    if (field.enums && field.enums.length > 0) {
      for (const e of field.enums) {
        lines.push(`    ${e.id}: ${e.value}`);
      }
    }
  }
  return lines.join("\n");
}

/**
 * Busca os custom fields do lead na API v4 do Kommo.
 * `limit=250` cobre contas com muitos campos em uma única página.
 */
export async function discoverFields(): Promise<KommoCustomField[]> {
  const client = createKommoClient();
  const data = await client.get<CustomFieldsResponse>("/leads/custom_fields", {
    limit: "250",
  });
  return data._embedded?.custom_fields ?? [];
}

/** Mensagem amigável (sem vazar token) para um `KommoError`. */
function describeKommoError(error: KommoError): string {
  switch (error.kind) {
    case "auth":
      return `Falha de autenticação (HTTP ${error.status}). Verifique CRM_TOKEN/CRM_BASE_URL.`;
    case "not_found":
      return `Recurso não encontrado (HTTP ${error.status}).`;
    case "rate_limited":
      return `Limite de taxa atingido (HTTP ${error.status}). Tente novamente.`;
    case "network":
      return "Falha de rede ao contatar o Kommo (timeout/DNS/conexão).";
    case "unknown":
      return `Erro inesperado do Kommo (HTTP ${error.status}).`;
  }
}

/** Ponto de entrada do CLI: busca, formata e imprime. */
async function main(): Promise<void> {
  const fields = await discoverFields();
  process.stdout.write(formatFields(fields) + "\n");
}

if (require.main === module) {
  main().catch((error: unknown) => {
    const message = isKommoError(error)
      ? describeKommoError(error)
      : "Erro inesperado ao descobrir campos do Kommo.";
    process.stderr.write(message + "\n");
    process.exit(1);
  });
}
