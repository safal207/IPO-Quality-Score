# IPO Quality Score

**IPO Quality Score is an evidence-first framework for evaluating IPO quality, business strength, valuation risk, governance, dilution, and disclosure integrity.**

The project turns complex offering documents into transparent, reviewable research artifacts. It does **not** predict short-term price performance and it does **not** replace professional financial, legal, or tax advice.

## Why this project exists

IPO research is fragmented across regulatory filings, financial statements, market data, investor materials, and management claims. A growth headline can hide weak cash conversion, debt repair, insider control, dilution, or inconsistent evidence.

IPO Quality Score asks five questions:

1. Is the underlying business economically strong?
2. Is the offered valuation supported by evidence?
3. Who benefits from the offering and how will proceeds be used?
4. What governance, dilution, legal, and disclosure risks exist?
5. How confident can a reviewer be in each conclusion?

## Core principles

- **Evidence before score.** Every scored claim links to a source and extracted fact.
- **Facts and judgment stay separate.** Facts, calculations, assumptions, and conclusions are independently visible.
- **Unknown is not zero.** Missing evidence is explicit rather than silently scored.
- **Exact source state matters.** Filing version, publication date, and access date are recorded.
- **Conflicts are visible.** Contradictory values remain reviewable.
- **No guaranteed outcomes.** A score is not a promise of return.
- **Human-reviewable AI.** Automation can assist extraction; humans retain publication authority.

## Score v0.1

| Dimension | Maximum points |
|---|---:|
| Revenue growth and durability | 15 |
| Profitability and cash flow | 15 |
| Market and competitive position | 10 |
| Valuation quality | 15 |
| Debt and balance-sheet resilience | 10 |
| Use of proceeds | 10 |
| Insider selling, lock-up, and dilution | 10 |
| Governance and shareholder rights | 5 |
| Legal and regulatory risk | 5 |
| Disclosure quality and consistency | 5 |
| **Total** | **100** |

```text
normalized_score = earned_points / applicable_max_points * 100
```

The report always publishes score, evidence coverage, and confidence separately.

## Interpretation bands

| Score | Research interpretation |
|---|---|
| 80–100 | Strong candidate for further due diligence |
| 60–79 | Material strengths with meaningful risks |
| 40–59 | Speculative or evidence-limited |
| 0–39 | Severe quality, valuation, governance, or disclosure concerns |

These bands describe research findings, not expected market returns.

## Real benchmark reports

| Issuer | Score | Coverage | Confidence | State |
|---|---:|---:|---|---|
| [ITG, Inc.](reports/itg-2026-07-01/README.md) | 55/100 | 100% | Medium | Draft |
| [Ethos Technologies](reports/ethos-2026-01-30/README.md) | 61/100 | 100% | Medium | Draft |

ITG tests leverage, debt-repair proceeds, Up-C control, TRA obligations, lock-up, and sponsor governance. Ethos tests profitable growth, secondary selling, persistency-estimate revenue, carrier concentration, dual-class voting, and internal-control quality.

The comparison demonstrates that operating strength and IPO quality are not the same thing. Ethos has the stronger operating profile, but its offering alignment, voting structure, concentration, cash conversion, and disclosure risks prevent a high score.

See [`research/benchmark-status.md`](research/benchmark-status.md) for the benchmark matrix and next research target.

## Repository structure

```text
docs/          methodology, evidence policy, architecture, legal boundary, roadmap
schema/        machine-readable report contract
scripts/       deterministic report validation
reports/       real filing-based research drafts
research/      benchmark queue and status
examples/      fictional examples
templates/     reusable report templates
```

## Validation

GitHub Actions validates every report JSON against the schema and checks:

- canonical dimension weights;
- unique dimension and evidence IDs;
- evidence references;
- earned-point bounds;
- score and coverage recomputation;
- interpretation band;
- publication-gate requirements.

## Open-core boundary

Public components include methodology, schemas, examples, validation, and selected utilities. Premium datasets, production ingestion, proprietary orchestration, calibrated sub-weights, customer accounts, alerts, and commercial reports may remain separate.

## Disclaimer

This project provides general research and educational information. It does not provide personalized investment advice, portfolio allocation, trade execution, or guarantees of performance. See [`docs/legal-boundary.md`](docs/legal-boundary.md).

## License

Apache License 2.0.
