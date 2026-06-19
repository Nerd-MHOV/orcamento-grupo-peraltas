import { RequestHandler } from "express";
import multer from "multer";

const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

/**
 * Parser multipart/form-data reutilizável para upload de um único arquivo.
 *
 * O arquivo é mantido em memória (memoryStorage), ficando disponível em
 * `req.file.buffer` para o handler ler o conteúdo sem tocar o disco.
 * Espera o arquivo no campo `pdf`; demais campos de texto ficam em `req.body`.
 *
 * Genérico e sem regra de CRM — a montagem na rota fica a cargo da task 2.4.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_PDF_SIZE_BYTES,
    files: 1,
  },
});

export const uploadPdf: RequestHandler = upload.single("pdf");
