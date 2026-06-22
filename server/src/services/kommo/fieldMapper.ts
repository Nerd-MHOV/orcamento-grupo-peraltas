import { kommoConfig, KommoConfig, KommoPetSizeEnum } from "../../config/kommoConfig";
import {
  BudgetLeadInput,
  FieldMapper,
  KommoCustomFieldValue,
  KommoLead,
  LeadPrefill,
} from "./kommo.types";

/**
 * Mapeador puro entre o orçamento e o formato `custom_fields_values` do Kommo
 * (design.md → fieldMapper). Não faz I/O nem regra de negócio do valor:
 * recebe `price`/`tariffs` prontos e apenas traduz campos.
 *
 * Convenções de escrita (research.md → MAPA FINAL DE CAMPOS):
 * - datas (check_in/out) → unix timestamp em SEGUNDOS do início do dia (UTC).
 * - numéricos (adt, chd_amount, pet_amount) → string.
 * - chd_ages (texto) → csv de idades.
 * - pet_sizes (multiselect) → `{ enum_id }` por rótulo; rótulo desconhecido é
 *   ignorado (não quebra).
 * - tariffs_used (texto) → lista de tarifários unida em string.
 * - `price` NÃO entra aqui (campo nativo do lead).
 * Campos com origem vazia/indefinida são omitidos (sem entradas vazias).
 */

/**
 * Segundos do MEIO-DIA UTC (12:00:00) do dia informado.
 *
 * O Kommo normaliza campos de data para a meia-noite do fuso DA CONTA (UTC-3).
 * Se enviássemos 00:00 UTC, o valor cairia para o dia anterior (00:00Z = 21:00
 * do dia anterior em UTC-3). Ancorar ao meio-dia UTC garante que, para qualquer
 * fuso entre UTC-11 e UTC+11, a data permaneça no dia pretendido. (Verificado
 * contra a API real: 12:00Z de 25/07 é gravado como 25/07.)
 */
function toUnixDateNoon(date: Date): number {
  const ms = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    12,
    0,
    0
  );
  return Math.floor(ms / 1000);
}

/** Converte unix (segundos) → `YYYY-MM-DD` (UTC). */
function unixToIsoDate(seconds: number): string {
  return new Date(seconds * 1000).toISOString().slice(0, 10);
}

/** Entrada de campo de valor único (texto/número/data). */
function valueField(
  fieldId: number,
  value: string | number
): KommoCustomFieldValue {
  return { field_id: fieldId, values: [{ value }] };
}

/** Mapa reverso enum_id → rótulo de porte de PET. */
function reversePetEnum(
  enumMap: KommoPetSizeEnum
): Map<number, keyof KommoPetSizeEnum> {
  const reverse = new Map<number, keyof KommoPetSizeEnum>();
  (Object.keys(enumMap) as Array<keyof KommoPetSizeEnum>).forEach((label) => {
    reverse.set(enumMap[label], label);
  });
  return reverse;
}

class FieldMapperImpl implements FieldMapper {
  private readonly config: KommoConfig;

  constructor(config: KommoConfig) {
    this.config = config;
  }

  public toCustomFields(input: BudgetLeadInput): KommoCustomFieldValue[] {
    const { fields } = this.config;
    const out: KommoCustomFieldValue[] = [];

    if (input.checkIn instanceof Date && !isNaN(input.checkIn.getTime())) {
      out.push(valueField(fields.check_in, toUnixDateNoon(input.checkIn)));
    }
    if (input.checkOut instanceof Date && !isNaN(input.checkOut.getTime())) {
      out.push(valueField(fields.check_out, toUnixDateNoon(input.checkOut)));
    }

    if (typeof input.adt === "number" && input.adt > 0) {
      out.push(valueField(fields.adt, String(input.adt)));
    }

    const chdAges = input.chdAges ?? [];
    if (chdAges.length > 0) {
      out.push(valueField(fields.chd_amount, String(chdAges.length)));
      out.push(valueField(fields.chd_ages, chdAges.join(",")));
    }

    const petSizes = input.petSizes ?? [];
    if (petSizes.length > 0) {
      const enumMap = fields.pet_sizes_enum;
      const enumValues: Array<{ enum_id: number }> = [];
      petSizes.forEach((size) => {
        const enumId = enumMap[size as keyof KommoPetSizeEnum];
        if (typeof enumId === "number") {
          enumValues.push({ enum_id: enumId });
        }
      });
      // pet_amount reflete a quantidade informada (mesmo que algum porte seja
      // desconhecido na multiseleção).
      out.push(valueField(fields.pet_amount, String(petSizes.length)));
      if (enumValues.length > 0) {
        out.push({ field_id: fields.pet_sizes, values: enumValues });
      }
    }

    const tariffs = input.tariffs ?? [];
    if (tariffs.length > 0) {
      out.push(valueField(fields.tariffs_used, tariffs.join(", ")));
    }

    const salesActions = (input.salesActions ?? "").trim();
    if (salesActions.length > 0) {
      out.push(valueField(fields.sales_actions, salesActions));
    }

    return out;
  }

  public readLead(lead: KommoLead): LeadPrefill {
    const { fields } = this.config;
    const prefill: LeadPrefill = { id: lead.id, name: lead.name };

    const entries = lead.custom_fields_values ?? [];
    const byId = new Map<number, KommoCustomFieldValue>();
    entries.forEach((entry) => {
      if (entry && typeof entry.field_id === "number") {
        byId.set(entry.field_id, entry);
      }
    });

    const checkIn = this.readDate(byId.get(fields.check_in));
    if (checkIn !== undefined) {
      prefill.checkIn = checkIn;
    }

    const checkOut = this.readDate(byId.get(fields.check_out));
    if (checkOut !== undefined) {
      prefill.checkOut = checkOut;
    }

    const adt = this.readNumber(byId.get(fields.adt));
    if (adt !== undefined) {
      prefill.adt = adt;
    }

    const chdAges = this.readCsvNumbers(byId.get(fields.chd_ages));
    if (chdAges !== undefined) {
      prefill.chdAges = chdAges;
    }

    const petSizes = this.readPetSizes(byId.get(fields.pet_sizes));
    if (petSizes !== undefined) {
      prefill.petSizes = petSizes;
    }

    return prefill;
  }

  private firstValue(
    entry: KommoCustomFieldValue | undefined
  ): { value?: string | number; enum_id?: number } | undefined {
    if (!entry || !Array.isArray(entry.values) || entry.values.length === 0) {
      return undefined;
    }
    return entry.values[0];
  }

  private readDate(entry: KommoCustomFieldValue | undefined): string | undefined {
    const first = this.firstValue(entry);
    if (first === undefined) {
      return undefined;
    }
    const raw = first.value;
    const seconds = typeof raw === "string" ? Number(raw) : raw;
    if (typeof seconds !== "number" || !Number.isFinite(seconds)) {
      return undefined;
    }
    return unixToIsoDate(seconds);
  }

  private readNumber(entry: KommoCustomFieldValue | undefined): number | undefined {
    const first = this.firstValue(entry);
    if (first === undefined || first.value === undefined) {
      return undefined;
    }
    const num = typeof first.value === "string" ? Number(first.value) : first.value;
    return typeof num === "number" && Number.isFinite(num) ? num : undefined;
  }

  private readCsvNumbers(
    entry: KommoCustomFieldValue | undefined
  ): number[] | undefined {
    const first = this.firstValue(entry);
    if (first === undefined || first.value === undefined) {
      return undefined;
    }
    const raw = String(first.value).trim();
    if (raw === "") {
      return undefined;
    }
    const parsed = raw
      .split(",")
      .map((part) => Number(part.trim()))
      .filter((n) => Number.isFinite(n));
    return parsed.length > 0 ? parsed : undefined;
  }

  private readPetSizes(
    entry: KommoCustomFieldValue | undefined
  ): string[] | undefined {
    if (!entry || !Array.isArray(entry.values) || entry.values.length === 0) {
      return undefined;
    }
    const reverse = reversePetEnum(this.config.fields.pet_sizes_enum);
    const labels: string[] = [];
    entry.values.forEach((v) => {
      if (typeof v.enum_id === "number") {
        const label = reverse.get(v.enum_id);
        if (label) {
          labels.push(label);
          return;
        }
      }
      // Fallback: alguns retornos trazem o rótulo direto em `value`.
      if (typeof v.value === "string" && v.value !== "") {
        labels.push(v.value);
      }
    });
    return labels.length > 0 ? labels : undefined;
  }
}

/**
 * Fábrica do mapeador. Usa `kommoConfig` por padrão; aceita override em testes.
 */
export function createFieldMapper(config: KommoConfig = kommoConfig): FieldMapper {
  return new FieldMapperImpl(config);
}
