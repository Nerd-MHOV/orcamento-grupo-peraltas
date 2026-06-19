import axios from "axios";
import { createKommoClient } from "../kommoClient";
import { isKommoError, KommoError } from "../kommo.types";
import { KommoConfig } from "../../../config/kommoConfig";

jest.mock("axios");

// Tipagem do axios mockado.
const mockedAxios = axios as jest.Mocked<typeof axios>;

/**
 * Cada instância criada via `axios.create` recebe seu próprio mock de método.
 * Guardamos a config passada ao create para inspecionar o header Authorization.
 */
interface FakeInstance {
  config: { baseURL?: string; headers?: Record<string, string> };
  request: jest.Mock;
  get: jest.Mock;
  patch: jest.Mock;
  put: jest.Mock;
  post: jest.Mock;
}

const createdInstances: FakeInstance[] = [];

function makeInstance(config: FakeInstance["config"]): FakeInstance {
  return {
    config,
    request: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
    post: jest.fn(),
  };
}

const VALID_TOKEN = "super-secret-token-value-123";

/**
 * Config injetada diretamente no `createKommoClient`, evitando depender de env
 * e de `jest.resetModules()`/`require` fresco (que desacopla o mock do axios).
 */
function makeConfig(overrides: Partial<KommoConfig> = {}): KommoConfig {
  return {
    token: VALID_TOKEN,
    baseUrl: "https://acct.kommo.com/api/v4",
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
      pdf_orcamento: 786340,
    },
    ...overrides,
  };
}

describe("kommoClient", () => {
  beforeEach(() => {
    createdInstances.length = 0;
    mockedAxios.create.mockImplementation((config?: unknown) => {
      const instance = makeInstance((config ?? {}) as FakeInstance["config"]);
      createdInstances.push(instance);
      return instance as unknown as ReturnType<typeof axios.create>;
    });
    // isAxiosError default: trata como axios error qualquer objeto com isAxiosError === true.
    mockedAxios.isAxiosError.mockImplementation(
      (e: unknown): e is import("axios").AxiosError =>
        typeof e === "object" &&
        e !== null &&
        (e as { isAxiosError?: boolean }).isAxiosError === true
    );
  });

  function apiInstance(): FakeInstance {
    // O primeiro create é o cliente da API v4 (com baseURL terminando em /api/v4).
    const inst = createdInstances.find((i) =>
      (i.config.baseURL ?? "").includes("/api/v4")
    );
    if (!inst) {
      throw new Error("instância da API não foi criada");
    }
    return inst;
  }

  function axiosError(status?: number) {
    return {
      isAxiosError: true,
      response: status === undefined ? undefined : { status, data: {} },
      message: "request failed",
    };
  }

  it("(a) envia o header Authorization: Bearer <token> a partir da config", async () => {
    const client = createKommoClient(makeConfig());
    apiInstance().request.mockResolvedValueOnce({ data: { ok: true } });

    await client.get("/leads/1");

    const headers = apiInstance().config.headers ?? {};
    expect(headers.Authorization).toBe(`Bearer ${VALID_TOKEN}`);
  });

  it("(b) mapeia 401 e 403 para KommoError kind 'auth'", async () => {
    const client = createKommoClient(makeConfig());

    apiInstance().request.mockRejectedValueOnce(axiosError(401));
    await expect(client.get("/leads/1")).rejects.toMatchObject({
      kind: "auth",
      status: 401,
    });

    apiInstance().request.mockRejectedValueOnce(axiosError(403));
    await expect(client.get("/leads/1")).rejects.toMatchObject({
      kind: "auth",
      status: 403,
    });
  });

  it("(b) mapeia 404 para 'not_found', 429 para 'rate_limited', sem-resposta para 'network', outros para 'unknown'", async () => {
    const client = createKommoClient(makeConfig());

    apiInstance().request.mockRejectedValueOnce(axiosError(404));
    await expect(client.get("/leads/1")).rejects.toMatchObject({
      kind: "not_found",
      status: 404,
    });

    apiInstance().request.mockRejectedValueOnce(axiosError(429));
    await expect(client.get("/leads/1")).rejects.toMatchObject({
      kind: "rate_limited",
      status: 429,
    });

    apiInstance().request.mockRejectedValueOnce(axiosError(undefined));
    await expect(client.get("/leads/1")).rejects.toMatchObject({
      kind: "network",
    });

    apiInstance().request.mockRejectedValueOnce(axiosError(500));
    await expect(client.get("/leads/1")).rejects.toMatchObject({
      kind: "unknown",
      status: 500,
    });
  });

  it("(c) token ausente gera KommoError 'auth' SEM vazar o token", async () => {
    let caught: unknown;
    try {
      const client = createKommoClient(makeConfig({ token: undefined }));
      await client.get("/leads/1");
    } catch (e) {
      caught = e;
    }

    expect(isKommoError(caught)).toBe(true);
    expect((caught as KommoError).kind).toBe("auth");

    // Nunca deve vazar o valor do token em nenhuma serialização do erro.
    const serialized =
      JSON.stringify(caught) +
      String((caught as { message?: string }).message ?? "");
    expect(serialized).not.toContain(VALID_TOKEN);
  });

  it("putFilesLink faz PUT /leads/{id}/files com body [{file_uuid}]", async () => {
    const client = createKommoClient(makeConfig());
    apiInstance().request.mockResolvedValueOnce({ data: {} });

    await client.putFilesLink(42, ["uuid-a", "uuid-b"]);

    const call = apiInstance().request.mock.calls[0][0];
    expect(call.method).toBe("put");
    expect(call.url).toBe("/leads/42/files");
    expect(call.data).toEqual([
      { file_uuid: "uuid-a" },
      { file_uuid: "uuid-b" },
    ]);
  });

  it("cria um cliente separado para o Drive (drive.kommo.com)", async () => {
    createKommoClient(makeConfig());
    const driveInst = createdInstances.find((i) =>
      (i.config.baseURL ?? "").includes("drive.kommo.com")
    );
    expect(driveInst).toBeDefined();
  });
});
