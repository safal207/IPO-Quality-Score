import {
  ContractError,
  parseReportDetail,
  parseReportListResponse,
  parseReportProvenance,
} from "./contracts";
import { parseFilingHistory } from "./history-contract";
import type {
  FilingHistoryResponse,
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

export class ApiContractError extends Error {
  readonly path: string;

  constructor(path: string, cause: ContractError) {
    super(`Backend response did not match the frontend contract: ${cause.message}`);
    this.name = "ApiContractError";
    this.path = path;
    this.cause = cause;
  }
}

async function fetchJson<T>(
  path: string,
  parse: (value: unknown) => T,
  signal?: AbortSignal,
): Promise<T> {
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
      const body: unknown = await response.json();
      if (
        typeof body === "object" &&
        body !== null &&
        "detail" in body &&
        typeof body.detail === "string"
      ) {
        detail = body.detail;
      }
    } catch {
      // Preserve the status-based message when the response is not JSON.
    }
    throw new ApiError(detail, response.status);
  }

  const payload: unknown = await response.json();
  try {
    return parse(payload);
  } catch (error) {
    if (error instanceof ContractError) {
      throw new ApiContractError(path, error);
    }
    throw error;
  }
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
  return fetchJson(
    `/api/v1/reports?${params.toString()}`,
    parseReportListResponse,
    signal,
  );
}

export function getReport(
  reportId: string,
  signal?: AbortSignal,
): Promise<ReportDetail> {
  return fetchJson(
    `/api/v1/reports/${encodeURIComponent(reportId)}`,
    parseReportDetail,
    signal,
  );
}

export function getReportProvenance(
  reportId: string,
  signal?: AbortSignal,
): Promise<ReportProvenance> {
  return fetchJson(
    `/api/v1/reports/${encodeURIComponent(reportId)}/provenance`,
    parseReportProvenance,
    signal,
  );
}

export function getFilingHistory(
  filingId: number,
  signal?: AbortSignal,
): Promise<FilingHistoryResponse> {
  return fetchJson(
    `/api/v1/filings/${encodeURIComponent(String(filingId))}/history`,
    parseFilingHistory,
    signal,
  );
}
