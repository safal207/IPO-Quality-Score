import type { CSSProperties } from "react";

interface ScoreBadgeProps {
  score: number;
  coverage: number;
  size?: "small" | "large";
}

export function ScoreBadge({ score, coverage, size = "small" }: ScoreBadgeProps) {
  const boundedScore = Math.max(0, Math.min(100, score));
  const style = {
    "--score-angle": `${boundedScore * 3.6}deg`,
  } as CSSProperties;

  return (
    <div
      className={`score-badge score-badge--${size}`}
      style={style}
      aria-label={`IPO quality score ${boundedScore} out of 100`}
    >
      <div className="score-badge__inner">
        <strong>{Math.round(boundedScore)}</strong>
        <span>/100</span>
        {size === "large" ? <small>{Math.round(coverage)}% evidence</small> : null}
      </div>
    </div>
  );
}
