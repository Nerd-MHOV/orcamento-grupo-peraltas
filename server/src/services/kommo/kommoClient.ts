import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import Bottleneck from "bottleneck";
import { kommoConfig, KommoConfig } from "../../config/kommoConfig";
import { KommoClient, KommoError, KommoFileLink } from "./kommo.types";

/**
 * Cliente HTTP do Kommo: autenticação Bearer única da conta + limite de taxa.
 *
 * - Um axios para a API v4 (`baseUrl`) e outro para o Drive (`driveUrl`).
 * - Toda chamada é serializada por um `Bottleneck` configurado para ≤ 7 req/s
 *   (Req 5.4). `minTime = 150ms` garante no máximo ~6,6 req/s; `maxConcurrent`
 *   limitado evita rajadas.
 * - Erros do axios são normalizados em `KommoError` (união discriminada).
 * - O token nunca é incluído em erros lançados/retornados (invariante de design).
 */

// ~6,6 req/s (1000ms / 150ms), abaixo do teto de 7 req/s do Kommo.
const RATE_LIMIT_MIN_TIME_MS = 150;
const RATE_LIMIT_MAX_CONCURRENT = 5;

/**
 * Converte qualquer falha de chamada ao Kommo em um `KommoError` tipado.
 * Importante: não inclui token nem corpo bruto da resposta para não vazar segredos.
 */
function toKommoError(error: unknown): KommoError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;

    if (status === undefined) {
      // Sem resposta do servidor: timeout, DNS, conexão recusada, etc.
      return { kind: "network" };
    }
    if (status === 401 || status === 403) {
      return { kind: "auth", status };
    }
    if (status === 404) {
      return { kind: "not_found", status };
    }
    if (status === 429) {
      return { kind: "rate_limited", status };
    }
    return { kind: "unknown", status };
  }

  // Erro não-axios (inesperado): trata como network para não vazar detalhes.
  return { kind: "network" };
}

/**
 * Implementação concreta do `KommoClient`.
 */
class KommoHttpClient implements KommoClient {
  private readonly api: AxiosInstance;
  private readonly drive: AxiosInstance;
  private readonly limiter: Bottleneck;

  constructor(config: KommoConfig) {
    const { token, baseUrl, driveUrl } = config;

    // Precondition (Req 1.5): token e base presentes; senão erro de auth.
    // `baseUrl` é `${CRM_BASE_URL}/api/v4`; se CRM_BASE_URL faltar, vira "undefined/api/v4".
    const hasToken = typeof token === "string" && token.length > 0;
    const hasBase =
      typeof baseUrl === "string" &&
      baseUrl.length > 0 &&
      !baseUrl.startsWith("undefined");

    if (!hasToken || !hasBase) {
      // NUNCA inclui o token na mensagem/erro.
      const authError: KommoError = { kind: "auth", status: 401 };
      throw authError;
    }

    const authHeaders: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    this.api = axios.create({
      baseURL: baseUrl,
      headers: authHeaders,
    });

    this.drive = axios.create({
      baseURL: driveUrl,
      headers: authHeaders,
    });

    this.limiter = new Bottleneck({
      minTime: RATE_LIMIT_MIN_TIME_MS,
      maxConcurrent: RATE_LIMIT_MAX_CONCURRENT,
    });
  }

  /**
   * Agenda uma requisição no limiter e normaliza qualquer falha em KommoError.
   */
  private async run<T>(
    instance: AxiosInstance,
    config: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.limiter.schedule(() => instance.request<T>(config));
      return response.data;
    } catch (error) {
      throw toKommoError(error);
    }
  }

  public get<T>(path: string, params?: Record<string, string>): Promise<T> {
    return this.run<T>(this.api, { method: "get", url: path, params });
  }

  public patch<T>(path: string, body: unknown): Promise<T> {
    return this.run<T>(this.api, { method: "patch", url: path, data: body });
  }

  public async putFilesLink(leadId: number, fileUuids: string[]): Promise<void> {
    const body: KommoFileLink[] = fileUuids.map((file_uuid) => ({ file_uuid }));
    await this.run<unknown>(this.api, {
      method: "put",
      url: `/leads/${leadId}/files`,
      data: body,
    });
  }

  public drivePost<T>(
    url: string,
    body: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.run<T>(this.drive, {
      method: "post",
      url,
      data: body,
      headers,
    });
  }
}

/**
 * Fábrica do cliente Kommo. Lança `KommoError{kind:'auth'}` se a config
 * (token/base) estiver ausente, sem nunca vazar o token (Req 1.5).
 *
 * Por padrão usa `kommoConfig` (env). Aceita override para testes/injeção.
 */
export function createKommoClient(config: KommoConfig = kommoConfig): KommoClient {
  return new KommoHttpClient(config);
}
