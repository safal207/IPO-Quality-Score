# IPO Quality Score Methodology v0.1

## Purpose

IPO Quality Score is a structured research method for evaluating the quality of an initial public offering. It is intended to support transparent due diligence, not to predict a first-day return or issue a personalized buy or sell instruction.

## Assessment unit

One assessment must refer to one clearly identified offering state:

- issuer legal name;
- exchange and proposed ticker;
- filing type and filing identifier;
- filing publication date;
- source URL;
- source access timestamp;
- expected price range and share count, when available;
- report version and reviewer.

A material filing amendment creates a new assessment state. Prior evidence may remain historically useful, but it must not be presented as current without revalidation.

## Scoring dimensions

### 1. Revenue growth and durability — 15 points

Evaluate:

- multi-period growth rate;
- organic versus acquisition-driven growth;
- customer concentration;
- recurring versus transactional revenue;
- sensitivity to one product, geography, or channel;
- evidence that growth is durable rather than temporary.

### 2. Profitability and cash flow — 15 points

Evaluate:

- gross-margin direction;
- operating leverage;
- operating and free cash flow;
- stock-based compensation;
- working-capital effects;
- reconciliation between adjusted and reported metrics.

### 3. Market and competitive position — 10 points

Evaluate:

- addressable-market evidence;
- market growth;
- differentiation;
- switching costs and network effects;
- competitive intensity;
- dependency on regulated or platform-controlled distribution.

### 4. Valuation quality — 15 points

Evaluate:

- implied market capitalization and enterprise value;
- revenue, earnings, and cash-flow multiples;
- peer selection quality;
- growth-adjusted valuation;
- sensitivity to offering price;
- assumptions required to justify the valuation.

A valuation dimension must remain `unknown` until enough offering terms exist to calculate it.

### 5. Debt and balance-sheet resilience — 10 points

Evaluate:

- debt maturity profile;
- liquidity;
- interest burden;
- covenant or refinancing risk;
- contingent liabilities;
- post-offering balance-sheet improvement.

### 6. Use of proceeds — 10 points

Evaluate:

- primary capital raised for the issuer;
- secondary shares sold by existing holders;
- debt repayment;
- acquisitions or general corporate purposes;
- specificity and measurability of stated uses;
- whether the offering primarily funds growth or provides liquidity to insiders.

### 7. Insider selling, lock-up, and dilution — 10 points

Evaluate:

- pre- and post-offering ownership;
- insider selling;
- lock-up duration and exceptions;
- option, warrant, and equity-plan overhang;
- dual-class structures;
- future dilution risk.

### 8. Governance and shareholder rights — 5 points

Evaluate:

- board independence;
- voting structure;
- related-party transactions;
- founder or sponsor control;
- minority-shareholder protections;
- takeover defenses.

### 9. Legal and regulatory risk — 5 points

Evaluate:

- active litigation;
- regulatory investigations;
- licensing dependencies;
- privacy, competition, sanctions, or sector-specific exposure;
- country and listing-jurisdiction risk.

### 10. Disclosure quality and consistency — 5 points

Evaluate:

- consistency across filing sections and versions;
- clarity of non-GAAP metrics;
- completeness of risk disclosures;
- traceability of claims to evidence;
- unexplained changes or omissions.

## Status values

Each dimension uses one status:

- `scored`: sufficient evidence exists to assign points;
- `unknown`: the dimension is relevant but evidence is insufficient;
- `not_applicable`: the dimension genuinely does not apply;
- `blocked`: contradictory or unreliable evidence prevents a responsible score.

`unknown` and `blocked` are never silently scored as zero.

## Score calculation

For all dimensions with status `scored`:

```text
raw_points = sum(earned_points)
applicable_max_points = sum(max_points for scored dimensions)
normalized_score = raw_points / applicable_max_points * 100
coverage = applicable_max_points / 100 * 100
```

A report must publish both `normalized_score` and `coverage`. A high score with low coverage must not be described as high-confidence research.

## Confidence

Confidence is assigned independently from score:

- `high`: primary evidence is complete, current, internally consistent, and calculation-ready;
- `medium`: evidence is mostly complete but includes assumptions, secondary sources, or limited uncertainty;
- `low`: material evidence is missing, conflicting, stale, or dependent on unverified claims.

The overall confidence cannot exceed the weakest material dimension without an explicit reviewer justification.

## Research interpretation

- **80–100:** strong candidate for further due diligence;
- **60–79:** material strengths with meaningful risks;
- **40–59:** speculative or evidence-limited;
- **0–39:** severe quality, valuation, governance, or disclosure concerns.

Interpretation bands do not predict future price performance.

## Review protocol

Before publication, a reviewer must confirm:

1. the exact filing state;
2. all source links and extracted facts;
3. calculations and units;
4. separation of facts, assumptions, and judgments;
5. visible contradictions and unknowns;
6. score normalization and coverage;
7. legal and disclosure language;
8. no personalized recommendation or guaranteed outcome.

## Change policy

Any change to dimensions, weights, thresholds, or interpretation bands requires:

- a new methodology version;
- a rationale;
- a migration note;
- recalculation of benchmark reports;
- preservation of prior report versions for auditability.