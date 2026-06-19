import { kommoConfig } from "../../config/kommoConfig";
import { createKommoClient } from "./kommoClient";
import {
  FilesService,
  KommoAccountDrive,
  KommoClient,
  KommoUploadedFile,
  KommoUploadSession,
} from "./kommo.types";

/**
 * Serviço de upload e anexação de PDF ao lead via Kommo Files API (Req 4.1, 4.4).
 *
 * Fluxo (contrato verificado contra a conta real — research.md → Files API):
 *   1. `GET /account?with=drive_url` → descobre o host do drive da conta
 *      (NUNCA hardcoded; cada conta pode ter um drive-host diferente).
 *   2. `POST {drive_url}/v1.0/sessions` com `{ file_name, file_size, content_type }`
 *      → `{ session_id, upload_url, max_part_size, max_file_size }`. `upload_url`
 *      é absoluta.
 *   3. Envia o binário ao `upload_url`. Se `file_size <= max_part_size`, um único
 *      POST do buffer inteiro; senão, fatia em partes ≤ `max_part_size` e POSTa
 *      sequencialmente, seguindo o `next_url` de cada resposta intermediária. A
 *      parte FINAL responde `{ uuid, version_uuid, size }`.
 *   4. `PATCH /leads/{leadId}` preenchendo o custom field do tipo `file`
 *      "PDF - Orçamento Hotel" (`pdf_orcamento`) com a referência do arquivo
 *      `{ file_uuid, version_uuid, file_name, file_size }` (verificado na API real).
 *      O PDF passa a aparecer NO CAMPO do lead (aba Brotas Eco), não na aba Arquivos.
 *
 * Resiliência (Req 4.4): em 403 (token sem escopo "files"), o `KommoClient` já
 * normaliza para `KommoError{kind:'auth'}`; aqui nada é capturado — o erro
 * propaga para o chamador decidir (o controller informa "sincronização falhou").
 *
 * Content-Type do anexo binário: `application/octet-stream` (a API aceita o
 * binário cru; o tipo lógico do arquivo já foi declarado na criação da sessão).
 */

const PDF_CONTENT_TYPE = "application/pdf";
const BINARY_CONTENT_TYPE = "application/octet-stream";

class KommoFilesService implements FilesService {
  constructor(private readonly client: KommoClient) {}

  public async uploadPdfToLead(
    leadId: number,
    pdf: Buffer,
    filename: string
  ): Promise<void> {
    // Passo 1: descobrir o drive da conta.
    const { drive_url } = await this.client.get<KommoAccountDrive>("/account", {
      with: "drive_url",
    });

    // Passo 2: criar a sessão de upload.
    const session = await this.client.drivePost<KommoUploadSession>(
      `${drive_url}/v1.0/sessions`,
      {
        file_name: filename,
        file_size: pdf.length,
        content_type: PDF_CONTENT_TYPE,
      }
    );

    // Passo 3: enviar o binário (uma ou várias partes) e obter o arquivo final.
    const uploaded = await this.uploadParts(pdf, session);
    if (uploaded.uuid === undefined) {
      throw new Error("Kommo Files API: upload sem uuid na parte final");
    }

    // Passo 4: preencher o custom field do tipo `file` com a referência do arquivo.
    await this.client.patch(`/leads/${leadId}`, {
      custom_fields_values: [
        {
          field_id: kommoConfig.fields.pdf_orcamento,
          values: [
            {
              value: {
                file_uuid: uploaded.uuid,
                version_uuid: uploaded.version_uuid,
                file_name: filename,
                file_size: uploaded.size ?? pdf.length,
              },
            },
          ],
        },
      ],
    });
  }

  /**
   * Envia o buffer em partes de no máximo `max_part_size` bytes, seguindo o
   * `next_url` de cada resposta intermediária. Retorna o arquivo da parte final
   * (`uuid`/`version_uuid`/`size`).
   */
  private async uploadParts(
    pdf: Buffer,
    session: KommoUploadSession
  ): Promise<KommoUploadedFile> {
    const headers = { "Content-Type": BINARY_CONTENT_TYPE };
    // `max_part_size` deveria ser sempre > 0; protege contra divisão por zero.
    const partSize =
      session.max_part_size > 0 ? session.max_part_size : pdf.length || 1;

    let nextUrl = session.upload_url;
    let finalFile: KommoUploadedFile | undefined;

    for (let offset = 0; offset < pdf.length || offset === 0; offset += partSize) {
      const part = pdf.subarray(offset, offset + partSize);
      const response = await this.client.drivePost<KommoUploadedFile>(
        nextUrl,
        part,
        headers
      );

      if (response.uuid !== undefined) {
        finalFile = response;
      }
      if (response.next_url !== undefined) {
        nextUrl = response.next_url;
      }

      // Buffer vazio: um único POST já é a parte final; evita laço infinito.
      if (pdf.length === 0) {
        break;
      }
    }

    if (finalFile === undefined) {
      // A API não retornou uuid na parte final: upload incompleto/inesperado.
      throw new Error("Kommo Files API: upload sem uuid na parte final");
    }
    return finalFile;
  }
}

/**
 * Fábrica do serviço de arquivos. Por padrão usa o `KommoClient` real
 * (`createKommoClient()`); aceita um cliente injetado para testes.
 */
export function createFilesService(
  client: KommoClient = createKommoClient()
): FilesService {
  return new KommoFilesService(client);
}
