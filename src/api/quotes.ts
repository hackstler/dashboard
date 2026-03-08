import { apiRequest } from "./http";
import type { QuoteSummary } from "../types";

export async function listQuotes(): Promise<QuoteSummary[]> {
  const json = await apiRequest<{ items: QuoteSummary[] }>("/quotes");
  return json.items;
}

export async function downloadQuotePdf(
  id: string
): Promise<{ pdfBase64: string; filename: string }> {
  return apiRequest<{ pdfBase64: string; filename: string }>(
    `/quotes/${encodeURIComponent(id)}/pdf`
  );
}
