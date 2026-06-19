import express, { Request, Response } from "express";
import request from "supertest";
import { uploadPdf } from "../uploadPdf";

const buildApp = () => {
  const app = express();

  app.post("/upload", uploadPdf, (req: Request, res: Response) => {
    res.json({
      bufferLength: req.file?.buffer.length ?? 0,
      originalname: req.file?.originalname ?? null,
      leadId: req.body.leadId ?? null,
    });
  });

  return app;
};

describe("uploadPdf middleware", () => {
  it("expõe o arquivo enviado no campo 'pdf' como buffer em memória e mantém os campos do body", async () => {
    const app = buildApp();
    const fakePdf = Buffer.from("%PDF-1.4 test");

    const response = await request(app)
      .post("/upload")
      .field("leadId", "42")
      .attach("pdf", fakePdf, "orc.pdf");

    expect(response.status).toBe(200);
    expect(response.body.bufferLength).toBeGreaterThan(0);
    expect(response.body.bufferLength).toBe(fakePdf.length);
    expect(response.body.originalname).toBe("orc.pdf");
    expect(response.body.leadId).toBe("42");
  });

  it("permite requisições sem arquivo sem lançar erro (campo opcional)", async () => {
    const app = buildApp();

    const response = await request(app).post("/upload").field("leadId", "7");

    expect(response.status).toBe(200);
    expect(response.body.bufferLength).toBe(0);
    expect(response.body.leadId).toBe("7");
  });
});
