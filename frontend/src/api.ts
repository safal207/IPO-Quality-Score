import type {
  ReportDetail,
  ReportListResponse,
  ReportProvenance,
} from "./types";

const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const init: RequestInit = {
    headers: {
      Accept: "application/json",
    },
  };
  if (signal) {
    init.signal = signal;
  }

  const response = await fetch(`${apiBase}${path}`, init);
  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) {
        detail = body.detail;
      }
    } catch {
      // Preserve the status-based message when the response is not JSON.
    }
    throw new ApiError(detail, response.status);
  }
  return (await response.json()) as T;
}

export interface ReportFilters {
  minScore: number;
  limit?: number;
  ticker?: string;
}

export function getReports(
  filters: ReportFilters,
  signal?: AbortSignal,
): Promise<ReportListResponse> {
  const params = new URLSearchParams({
    min_score: String(filters.minScore),
    limit: String(filters.limit ?? 100),
  });
  if (filters.ticker?.trim()) {
    params.set("ticker", filters.ticker.trim().toUpperCase());
  }
  return fetchJson<ReportListResponse>(`/api/v1/reports?${params.toString()}`, signal);
}

export function getReport(
  reportId: string,
  signal?: AbortSignal,
): Promise<ReportDetail> {
  return fetchJson<ReportDetail>(
    `/api/v1/reports/${encodeURIComponent(reportId)}`,
    signal,
  );
}

export function getReportProvenance(
  reportId: string,
  signal?: AbortSignal,
): Promise<ReportProvenance> {
  return fetchJson<ReportProvenance>(
    `/api/v1/reports/${encodeURIComponent(reportId)}/provenance`,
    signal,
  );
}
