export type InterestSignal =
  | "comparison_opened"
  | "comprehension_completed"
  | "dimension_compared"
  | "evidence_opened"
  | "history_inspected"
  | "report_selected"
  | "search_used";

export type InterestSignalCounts = Record<InterestSignal, number>;

export const INTEREST_SIGNAL_EVENT = "ipo-quality-score:interest-signals";
const STORAGE_KEY = "ipo-quality-score.interest-signals.v2";

const EMPTY_COUNTS: InterestSignalCounts = {
  comparison_opened: 0,
  comprehension_completed: 0,
  dimension_compared: 0,
  evidence_opened: 0,
  history_inspected: 0,
  report_selected: 0,
  search_used: 0,
};

function sessionStore(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function publish(counts: InterestSignalCounts): void {
  window.dispatchEvent(new CustomEvent<InterestSignalCounts>(INTEREST_SIGNAL_EVENT, { detail: counts }));
}

export function readInterestSignals(): InterestSignalCounts {
  const storage = sessionStore();
  if (!storage) {
    return { ...EMPTY_COUNTS };
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return { ...EMPTY_COUNTS };
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { ...EMPTY_COUNTS };
    }
    const source = parsed as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(EMPTY_COUNTS).map(([key]) => {
        const value = source[key];
        return [key, typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : 0];
      }),
    ) as InterestSignalCounts;
  } catch {
    return { ...EMPTY_COUNTS };
  }
}

export function recordInterestSignal(signal: InterestSignal): InterestSignalCounts {
  const next = readInterestSignals();
  next[signal] += 1;
  sessionStore()?.setItem(STORAGE_KEY, JSON.stringify(next));
  publish(next);
  return next;
}

export function clearInterestSignals(): InterestSignalCounts {
  sessionStore()?.removeItem(STORAGE_KEY);
  const next = { ...EMPTY_COUNTS };
  publish(next);
  return next;
}
