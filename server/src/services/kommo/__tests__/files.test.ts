import { createFilesService } from "../files";
import { KommoClient, KommoError } from "../kommo.types";

/**
 * Fake do KommoClient injetado no FilesService.
 *
 * Apenas os métodos usados pelo upload de PDF são implementados como jest.fn:
 * - `get` → busca a `drive_url` da conta (`GET /account?with=drive_url`).
 * - `drivePost` → cria a sessão (`{drive_url}/v1.0/sessions`) e envia as partes
 *   (URL absoluta de upload; sobrepõe o baseURL do drive).
 * - `putFilesLink` → anexa o uuid final ao lead (`PUT /leads/{id}/files`).
 *
 * Não há rede real: cada teste programa os retornos esperados.
 */
function makeClient(over: Partial<KommoClient> = {}): jest.Mocked<KommoClient> {
  return {
    get: jest.fn(),
    patch: jest.fn(),
    putFilesLink: jest.fn(),
    drivePost: jest.fn(),
    ...over,
  } as jest.Mocked<KommoClient>;
}

const DRIVE_URL = "https://drive-c.kommo.com";
const SESSIONS_URL = `${DRIVE_URL}/v1.0/sessions`;
const UPLOAD_URL = `${DRIVE_URL}/upload/session-token-abc`;

describe("FilesService.uploadPdfToLead", () => {
  it("happy path (arquivo ≤ max_part_size): account → sessão → 1 parte → attach", async () => {
    const client = makeClient();
    const pdf = Buffer.from("%PDF-1.4 small file");
    const filename = "orcamento.pdf";

    // Passo 1: drive_url da conta.
    client.get.mockResolvedValueOnce({ drive_url: DRIVE_URL });

    // Passos 2 e 3 usam drivePost. Resolvemos na ordem das chamadas:
    client.drivePost
      // Passo 2: criar sessão.
      .mockResolvedValueOnce({
        session_id: "sess-1",
        upload_url: UPLOAD_URL,
        max_part_size: 1024 * 1024, // 1MB → bem maior que o buffer
        max_file_size: 100 * 1024 * 1024,
      })
      // Passo 3: única parte (final) → retorna uuid/version/size.
      .mockResolvedValueOnce({
        uuid: "file-uuid-final",
        version_uuid: "ver-final",
        size: pdf.length,
      });

    client.patch.mockResolvedValueOnce(undefined);

    const service = createFilesService(client);
    await service.uploadPdfToLead(77, pdf, filename);

    // Passo 1: GET /account?with=drive_url.
    expect(client.get).toHaveBeenCalledWith("/account", { with: "drive_url" });

    // Passo 2: POST {drive_url}/v1.0/sessions com o body correto.
    const sessionCall = client.drivePost.mock.calls[0];
    expect(sessionCall[0]).toBe(SESSIONS_URL);
    expect(sessionCall[1]).toMatchObject({
      file_name: filename,
      file_size: pdf.length,
      content_type: "application/pdf",
    });

    // Passo 3: uma única parte enviada para o upload_url.
    const partCall = client.drivePost.mock.calls[1];
    expect(partCall[0]).toBe(UPLOAD_URL);
    expect(partCall[1]).toEqual(pdf);
    // total de 2 drivePost: sessão + 1 parte.
    expect(client.drivePost).toHaveBeenCalledTimes(2);

    // Passo 4: preenche o custom field file "PDF - Orçamento Hotel" (786340).
    expect(client.patch).toHaveBeenCalledWith("/leads/77", {
      custom_fields_values: [
        {
          field_id: 786340,
          values: [
            {
              value: {
                file_uuid: "file-uuid-final",
                version_uuid: "ver-final",
                file_name: filename,
                file_size: pdf.length,
              },
            },
          ],
        },
      ],
    });
    expect(client.putFilesLink).not.toHaveBeenCalled();
  });

  it("chunking: buffer > max_part_size resulta em várias partes e anexa o uuid final", async () => {
    const client = makeClient();
    const MAX_PART = 4; // bytes minúsculos para forçar várias partes
    const pdf = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]); // 10 bytes → 3 partes (4,4,2)
    const expectedParts = Math.ceil(pdf.length / MAX_PART); // 3

    client.get.mockResolvedValueOnce({ drive_url: DRIVE_URL });

    // Sessão primeiro.
    client.drivePost.mockResolvedValueOnce({
      session_id: "sess-2",
      upload_url: UPLOAD_URL,
      max_part_size: MAX_PART,
      max_file_size: 100 * 1024 * 1024,
    });
    // Partes intermediárias retornam next_url; a final retorna uuid.
    const NEXT_1 = `${DRIVE_URL}/upload/next-1`;
    const NEXT_2 = `${DRIVE_URL}/upload/next-2`;
    client.drivePost
      .mockResolvedValueOnce({ next_url: NEXT_1 }) // parte 1
      .mockResolvedValueOnce({ next_url: NEXT_2 }) // parte 2
      .mockResolvedValueOnce({
        uuid: "chunked-uuid",
        version_uuid: "ver-chunk",
        size: pdf.length,
      }); // parte 3 (final)

    client.patch.mockResolvedValueOnce(undefined);

    const service = createFilesService(client);
    await service.uploadPdfToLead(99, pdf, "grande.pdf");

    // 1 drivePost de sessão + N partes.
    expect(client.drivePost).toHaveBeenCalledTimes(1 + expectedParts);

    // A primeira parte vai para o upload_url da sessão; as seguintes para os next_url.
    const partUrls = client.drivePost.mock.calls.slice(1).map((c) => c[0]);
    expect(partUrls).toEqual([UPLOAD_URL, NEXT_1, NEXT_2]);

    // Preenche o campo file com o uuid devolvido pela parte final.
    expect(client.patch).toHaveBeenCalledWith(
      "/leads/99",
      expect.objectContaining({
        custom_fields_values: [
          expect.objectContaining({
            field_id: 786340,
            values: [
              {
                value: {
                  file_uuid: "chunked-uuid",
                  version_uuid: "ver-chunk",
                  file_name: "grande.pdf",
                  file_size: pdf.length,
                },
              },
            ],
          }),
        ],
      })
    );
  });

  it("propaga KommoError {kind:'auth'} (403 sem escopo 'files') sem engolir", async () => {
    const authError: KommoError = { kind: "auth", status: 403 };
    const client = makeClient();
    // Falha já no fetch da conta (poderia ser em qualquer passo); deve propagar.
    client.get.mockRejectedValueOnce(authError);

    const service = createFilesService(client);
    await expect(
      service.uploadPdfToLead(1, Buffer.from("x"), "f.pdf")
    ).rejects.toMatchObject({ kind: "auth", status: 403 });
  });
});
