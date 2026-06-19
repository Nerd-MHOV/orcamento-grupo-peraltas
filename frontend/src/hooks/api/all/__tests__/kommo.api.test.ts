import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AxiosInstance } from "axios";
import { kommo, BudgetLeadInput, LeadPrefill } from "../kommo.api";

const makeFakeApi = () => {
  const post = vi.fn().mockResolvedValue({ data: { ok: true } });
  return { api: { post } as unknown as AxiosInstance, post };
};

describe("kommo.api", () => {
  let post: ReturnType<typeof vi.fn>;
  let client: ReturnType<typeof kommo>;

  beforeEach(() => {
    const fake = makeFakeApi();
    post = fake.post;
    client = kommo(fake.api);
  });

  describe("getLead", () => {
    it("faz POST em /kommo/lead com { leadId } e retorna o LeadPrefill", async () => {
      const prefill: LeadPrefill = {
        id: 42,
        name: "Cliente Teste",
        checkIn: "2026-03-01",
        checkOut: "2026-03-03",
        adt: 2,
        chdAges: [5],
        petSizes: ["P"],
      };
      post.mockResolvedValueOnce({ data: prefill });

      const result = await client.getLead(42);

      expect(post).toHaveBeenCalledTimes(1);
      expect(post).toHaveBeenCalledWith("/kommo/lead", { leadId: 42 });
      expect(result).toEqual(prefill);
    });
  });

  describe("saveBudgetToLead", () => {
    it("faz POST em /kommo/lead/budget com { leadId, budget }", async () => {
      const budget: BudgetLeadInput = {
        checkIn: "2026-03-01",
        checkOut: "2026-03-03",
        adt: 2,
        chdAges: [5, 7],
        petSizes: ["P", "G"],
        price: 1234.5,
        tariffs: ["balada", "feriado"],
      };

      await client.saveBudgetToLead(99, budget);

      expect(post).toHaveBeenCalledTimes(1);
      expect(post).toHaveBeenCalledWith("/kommo/lead/budget", {
        leadId: 99,
        budget,
      });
    });
  });

  describe("uploadBudgetPdf", () => {
    it("faz POST em /kommo/lead/pdf com FormData contendo leadId e pdf", async () => {
      const blob = new Blob(["%PDF-1.4 conteudo"], { type: "application/pdf" });

      await client.uploadBudgetPdf(7, blob, "orcamento.pdf");

      expect(post).toHaveBeenCalledTimes(1);

      const [path, body, config] = post.mock.calls[0];
      expect(path).toBe("/kommo/lead/pdf");
      expect(body).toBeInstanceOf(FormData);

      const form = body as FormData;
      expect(form.get("leadId")).toBe("7");
      const pdf = form.get("pdf");
      expect(pdf).toBeInstanceOf(File);
      expect((pdf as File).name).toBe("orcamento.pdf");

      expect(config?.headers?.["Content-Type"]).toBe("multipart/form-data");
    });
  });
});
