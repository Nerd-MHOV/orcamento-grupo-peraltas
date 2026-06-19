/**
 * Tipos compartilhados do módulo Kommo.
 *
 * O `KommoError` é a união discriminada usada por todo o cliente HTTP para
 * normalizar falhas da API/Drive do Kommo. O token NUNCA aparece em nenhum
 * destes tipos — a invariante é que ele só existe no servidor (design.md
 * "Responsibilities & Constraints" do KommoClient).
 */

/**
 * Erro tipado de qualquer chamada ao Kommo (API v4 ou Drive).
 * Discriminado por `kind`:
 * - `auth`        → token inválido/ausente/sem escopo (HTTP 401 ou 403).
 * - `not_found`   → recurso inexistente, p.ex. lead (HTTP 404).
 * - `rate_limited`→ limite de taxa atingido (HTTP 429).
 * - `network`     → sem resposta do servidor (timeout/DNS/conexão).
 * - `unknown`     → qualquer outro status HTTP não mapeado.
 */
export type KommoError =
  | { kind: "auth"; status: 401 | 403 }
  | { kind: "not_found"; status: 404 }
  | { kind: "rate_limited"; status: 429 }
  | { kind: "network" }
  | { kind: "unknown"; status: number };

/**
 * Type guard para identificar um `KommoError` em blocos catch.
 */
export function isKommoError(value: unknown): value is KommoError {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const kind = (value as { kind?: unknown }).kind;
  return (
    kind === "auth" ||
    kind === "not_found" ||
    kind === "rate_limited" ||
    kind === "network" ||
    kind === "unknown"
  );
}

/**
 * Corpo da requisição que vincula arquivos do Drive a um lead.
 * `PUT /api/v4/leads/{id}/files` espera `[{ file_uuid }]` (research.md, fluxo de upload).
 */
export interface KommoFileLink {
  file_uuid: string;
}

/**
 * Contrato do cliente HTTP autenticado e limitado em taxa do Kommo.
 * Toda chamada ao Kommo passa por aqui (design.md → KommoClient).
 */
export interface KommoClient {
  /** GET autenticado na API v4. `path` relativo a `baseUrl`. */
  get<T>(path: string, params?: Record<string, string>): Promise<T>;
  /** PATCH autenticado na API v4. `path` relativo a `baseUrl`. */
  patch<T>(path: string, body: unknown): Promise<T>;
  /** Vincula arquivos do Drive a um lead: `PUT /leads/{id}/files` com `[{file_uuid}]`. */
  putFilesLink(leadId: number, fileUuids: string[]): Promise<void>;
  /** POST direto no Drive (`drive.kommo.com`), com headers opcionais (p.ex. binário). */
  drivePost<T>(url: string, body: unknown, headers?: Record<string, string>): Promise<T>;
}
