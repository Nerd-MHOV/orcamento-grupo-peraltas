import { AxiosInstance } from "axios";

export interface BudgetLeadInput {
  checkIn: string;
  checkOut: string;
  adt: number;
  chdAges: number[];
  petSizes: string[];
  price: number;
  tariffs: string[];
}

export interface LeadPrefill {
  id: number;
  name: string;
  checkIn?: string;
  checkOut?: string;
  adt?: number;
  chdAges?: number[];
  petSizes?: string[];
}

export const kommo = (api: AxiosInstance) => ({
  getLead: async (leadId: number): Promise<LeadPrefill> => {
    const response = await api.post("/kommo/lead", { leadId });
    return response.data;
  },
  saveBudgetToLead: async (
    leadId: number,
    budget: BudgetLeadInput
  ): Promise<void> => {
    await api.post("/kommo/lead/budget", { leadId, budget });
  },
  uploadBudgetPdf: async (
    leadId: number,
    pdf: Blob,
    filename: string
  ): Promise<void> => {
    const form = new FormData();
    form.append("leadId", String(leadId));
    form.append("pdf", pdf, filename);
    await api.post("/kommo/lead/pdf", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
});
