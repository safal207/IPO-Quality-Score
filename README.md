# IPO Quality Score

**IPO Quality Score is an evidence-first framework for evaluating IPO quality, business strength, valuation risk, governance, dilution, and disclosure integrity.**

The project is designed to turn large and complex IPO disclosures into transparent, reviewable research artifacts. It does **not** predict short-term price performance and it does **not** replace professional financial, legal, or tax advice.

## Why this project exists

IPO research is often fragmented across regulatory filings, investor presentations, market data, media coverage, and management claims. A single headline or growth chart can hide material risks.

IPO Quality Score provides a repeatable structure for answering five questions:

1. Is the underlying business economically strong?
2. Is the offered valuation supported by evidence?
3. Who benefits from the offering and how will proceeds be used?
4. What governance, dilution, legal, and disclosure risks exist?
5. How confident can a reviewer be in each conclusion?

## Core principles

- **Evidence before score.** Every scored claim must link to a source and an extracted fact.
- **Facts and judgment stay separate.** Source facts, calculations, assumptions, and analyst conclusions are recorded independently.
- **Unknown is not zero.** Missing evidence is marked as `unknown` or `not_applicable`; it is never silently converted into a negative fact.
- **Exact source state matters.** Reports should identify the filing version, publication date, and access date used.
- **Conflicts are visible.** Contradictory disclosures or metrics are preserved and escalated for review.
- **No guaranteed outcomes.** A high quality score is not a promise of investment return.
- **Human-reviewable AI.** Automation may extract and organize evidence, but final publication requires review.

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

The normalized score is calculated only from applicable dimensions:

```text
normalized_score = earned_points / applicable_max_points * 100
```

`not_applicable` dimensions do not reduce the score. `unknown` dimensions remain visible and reduce confidence in the result.

## Interpretation bands

| Score | Research interpretation |
|---|---|
| 80–100 | Strong candidate for further due diligence |
| 60–79 | Material strengths with meaningful risks |
| 40–59 | Speculative or evidence-limited |
| 0–39 | Severe quality, valuation, governance, or disclosure concerns |

These bands describe research quality and risk signals, not expected market returns.

## Repository structure

```text
docs/
  methodology.md
  evidence-policy.md
  legal-boundary.md
  product-roadmap.md
schema/
  ipo-report.schema.json
templates/
  ipo-analysis-template.md
examples/
  sample-ipo-report.md
```

## Minimal report artifact

Each published assessment should contain:

- company, exchange, ticker, and expected offering date;
- exact filing or source version;
- dimension scores and applicable maximums;
- confidence level;
- source-linked evidence;
- calculations and assumptions;
- contradictions and missing information;
- red flags and positive signals;
- final research interpretation;
- reviewer identity and review timestamp.

## Project status

This repository currently defines the **v0.1 research contract**. The next phase will add deterministic validation, report generation, historical calibration, and post-IPO outcome tracking.

## Disclaimer

This project provides general research and educational information. It does not provide personalized investment advice, portfolio allocation, trade execution, or guarantees of performance. See [`docs/legal-boundary.md`](docs/legal-boundary.md).

## License

Apache License 2.0. Public documentation and open components may be reused under the license. Proprietary data pipelines, premium datasets, production prompts, calibrated weights, and commercial reports may be maintained separately.