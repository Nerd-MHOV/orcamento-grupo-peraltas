import dotenv from "dotenv";

dotenv.config();

/**
 * Enum de portes de PET do campo multiselect "Porte PET" (field_id 786326).
 * Mapeia o rótulo exibido para o `enum_id` numérico esperado pelo Kommo na escrita.
 */
export interface KommoPetSizeEnum {
  Pequeno: number;
  Médio: number;
  Grande: number;
}

/**
 * Mapa dos campos personalizados do lead no Kommo.
 * Cada chave aponta para o `field_id` numérico confirmado (research.md → MAPA FINAL DE CAMPOS).
 *
 * Notas de escrita:
 * - check_in / check_out: data → unix timestamp.
 * - adt / chd_amount / pet_amount: numéricos → string.
 * - chd_ages: texto → csv de idades.
 * - pet_sizes: multiselect → `enum_id` (ver `pet_sizes_enum`).
 * - tariffs_used: texto ("Condições comerciais") → lista de tarifários como string.
 *
 * Não há custom field para o valor: usa-se o campo nativo `price` do lead.
 * O PDF não usa custom field: vai para a aba genérica de Arquivos via Files API.
 */
export interface KommoFields {
  /** Check-in (grupo Brotas Eco) — date (unix timestamp) */
  check_in: number;
  /** Check-out (grupo Brotas Eco) — date (unix timestamp) */
  check_out: number;
  /** Quant. Adulto — numeric (string) */
  adt: number;
  /** Quant. CHD — numeric (string) */
  chd_amount: number;
  /** Idade CHD — text (csv de idades) */
  chd_ages: number;
  /** Quant. PETS — numeric (string) */
  pet_amount: number;
  /** Porte PET — multiselect (enum_id) */
  pet_sizes: number;
  /** enum_id do multiselect Porte PET */
  pet_sizes_enum: KommoPetSizeEnum;
  /** Condições comerciais — text (lista de tarifários usados) */
  tariffs_used: number;
}

export interface KommoConfig {
  /** Token long-lived (Bearer) da conta — só existe no servidor. */
  token: string | undefined;
  /** `${CRM_BASE_URL}/api/v4` — base da API v4 do Kommo. */
  baseUrl: string;
  /** Base do drive da conta para a Files API. */
  driveUrl: string;
  /** Mapa de field_ids dos campos personalizados do lead. */
  fields: KommoFields;
}

export const kommoConfig: KommoConfig = {
  token: process.env.CRM_TOKEN,
  baseUrl: `${process.env.CRM_BASE_URL}/api/v4`,
  driveUrl: "https://drive.kommo.com",
  fields: {
    check_in: 804864,
    check_out: 804868,
    adt: 786330,
    chd_amount: 786328,
    chd_ages: 786322,
    pet_amount: 786324,
    pet_sizes: 786326,
    pet_sizes_enum: {
      Pequeno: 648186,
      Médio: 648188,
      Grande: 648190,
    },
    tariffs_used: 805299,
  },
};
