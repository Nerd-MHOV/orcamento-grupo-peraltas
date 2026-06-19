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
 * Resposta de `GET /api/v4/account?with=drive_url`.
 * Só o `drive_url` é consumido pelo upload de PDF (Files API). O host do drive
 * NUNCA é hardcoded — é descoberto a cada upload (research.md → Files API).
 */
export interface KommoAccountDrive {
  drive_url: string;
}

/**
 * Resposta da criação de sessão de upload:
 * `POST {drive_url}/v1.0/sessions` → `{ session_id, upload_url, max_part_size, max_file_size }`.
 * `upload_url` é absoluta (sobrepõe o baseURL do drive em `drivePost`).
 */
export interface KommoUploadSession {
  session_id: string;
  upload_url: string;
  max_part_size: number;
  max_file_size: number;
}

/**
 * Resposta de cada `POST` de parte para a sessão de upload:
 * - parte intermediária → `{ next_url }` (URL absoluta da próxima parte);
 * - parte FINAL → `{ uuid }` (id do arquivo no drive, usado no attach).
 */
export interface KommoUploadedFile {
  uuid?: string;
  next_url?: string;
}

/**
 * Valor de um campo personalizado no formato de leitura/escrita do Kommo.
 * - Escrita texto/número/data: `{ field_id, values: [{ value }] }`.
 * - Escrita/leitura de select: `{ field_id, values: [{ enum_id }] }`.
 * - Leitura de select: o Kommo também retorna `value` (rótulo) junto do `enum_id`.
 * (research.md → Data Contracts & Integration; MAPA FINAL DE CAMPOS.)
 */
export interface KommoCustomFieldValue {
  field_id: number;
  values: Array<{ value?: string | number; enum_id?: number }>;
}

/**
 * Lead do Kommo no shape consumido pelo `fieldMapper.readLead`.
 * `GET /api/v4/leads/{id}` retorna ao menos `id`, `name`, `price` e
 * `custom_fields_values` (research.md). `custom_fields_values` pode vir
 * ausente/`null` em leads sem campos preenchidos — o mapeador tolera isso.
 */
export interface KommoLead {
  id: number;
  name: string;
  price?: number;
  custom_fields_values?: KommoCustomFieldValue[] | null;
}

/**
 * Entrada de orçamento a ser escrita no lead (design.md → fieldMapper).
 * - `price` vai para o campo nativo `price` do lead (NÃO custom field) — tratado
 *   pelo serviço de leads, não pelo `toCustomFields`.
 * - `tariffs` é a lista de tarifários usados, persistida no orçamento.
 */
export interface BudgetLeadInput {
  checkIn: Date;
  checkOut: Date;
  adt: number;
  chdAges: number[];
  petSizes: string[];
  price: number;
  tariffs: string[];
}

/**
 * Dados extraídos do lead para pré-preencher o formulário (PULL).
 * Campos opcionais ausentes no lead vêm `undefined` (Req 2.3, sem exceção).
 */
export interface LeadPrefill {
  id: number;
  name: string;
  checkIn?: string;
  checkOut?: string;
  adt?: number;
  chdAges?: number[];
  petSizes?: string[];
}

/**
 * Contrato do mapeador de campos do orçamento ↔ Kommo (design.md → fieldMapper).
 */
export interface FieldMapper {
  toCustomFields(input: BudgetLeadInput): KommoCustomFieldValue[];
  readLead(lead: KommoLead): LeadPrefill;
}

/**
 * Contrato do serviço de leitura/escrita de orçamento no lead (design.md → leads).
 * - `getLead` resolve `name` + campos de prefill (GET /leads/{id}, Req 6.1). Um
 *   `404` propaga `KommoError{kind:'not_found'}` (Req 6.4, tratado upstream).
 * - `updateLeadBudget` envia `{ price, custom_fields_values }` via PATCH parcial
 *   (Req 3.1–3.4) e NUNCA `status_id`/`pipeline_id`/`deal_stage_id` (Req 3.5).
 */
export interface LeadsService {
  getLead(id: number): Promise<LeadPrefill>;
  updateLeadBudget(id: number, input: BudgetLeadInput): Promise<void>;
}

/**
 * Contrato do serviço de upload + anexação de PDF ao lead (design.md → files).
 * Orquestra o fluxo da Files API: descobrir drive → criar sessão → enviar
 * partes → anexar o uuid ao lead. Requer escopo "files" no token (Req 4.4).
 */
export interface FilesService {
  uploadPdfToLead(leadId: number, pdf: Buffer, filename: string): Promise<void>;
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
