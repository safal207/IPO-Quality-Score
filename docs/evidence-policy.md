# Evidence Policy v0.1

## Goal

The score is only as trustworthy as the evidence behind it. This policy defines the minimum evidence contract for IPO Quality Score reports.

## Source priority

Use sources in this order whenever available:

1. regulatory filings and exchange notices;
2. audited financial statements;
3. official issuer disclosures and investor materials;
4. recognized market-data providers;
5. reputable independent reporting;
6. other secondary sources, clearly labeled.

A secondary source must not override a conflicting primary filing without explicit explanation.

## Required evidence record

Every material fact should include:

```yaml
claim_id: revenue_growth_fy2025
source_type: regulatory_filing
source_title: Registration statement
source_url: https://example.test/filing
source_version: amendment-2
published_at: 2026-01-10T00:00:00Z
accessed_at: 2026-01-12T09:30:00Z
location: "Financial Statements, page 84"
extracted_fact: "Revenue increased from 100 to 130."
unit: USD_millions
confidence: high
review_status: verified
```

## Separation of layers

A report must keep four layers distinct:

1. **Source fact** — what the source explicitly states.
2. **Derived calculation** — arithmetic performed from sourced values.
3. **Assumption** — an input not established as fact.
4. **Analyst judgment** — the interpretation used in scoring.

Example:

```yaml
source_fact: "Revenue was 130 in FY2025."
derived_calculation: "Growth was 30%."
assumption: "Peer growth remains unchanged."
analyst_judgment: "Growth is strong but concentration reduces durability."
```

## Exact-state rule

Evidence is valid only for the source state it was extracted from. When an amended filing or updated price range appears:

- mark the prior report as superseded;
- identify affected claims and calculations;
- revalidate dependent scores;
- preserve the prior state for audit history;
- publish the exact source version used by the new report.

An access timestamp proves when a source was read. It does not prove when the underlying fact became true.

## Contradictions

When two sources disagree:

- preserve both claims;
- identify source priority and publication time;
- do not silently choose the more favorable value;
- mark dependent dimensions `blocked` or lower confidence;
- record the reviewer resolution.

## Missing information

Missing information must be explicit:

- `unknown`: relevant but insufficient evidence;
- `not_applicable`: genuinely irrelevant to the issuer or offering;
- `withheld`: the issuer acknowledges information but does not disclose it;
- `not_yet_available`: offering terms or amendments are pending.

Missing data must never be fabricated, inferred as zero, or converted into a positive signal.

## AI-assisted extraction

AI may help locate, summarize, or structure evidence. It must not be treated as a source.

Every AI-extracted material fact requires:

- a source link;
- an exact location or quoted fragment within reasonable copyright limits;
- structured values with units;
- a confidence label;
- human verification before publication.

## Evidence quality flags

Use one or more flags when needed:

- `secondary_source_only`;
- `stale_source`;
- `conflicting_values`;
- `unit_ambiguity`;
- `management_defined_metric`;
- `calculation_assumption`;
- `missing_comparison_period`;
- `unverified_translation`;
- `material_amendment_pending`.

## Publication gate

A report cannot be marked `published` when:

- issuer identity or filing version is ambiguous;
- a material score has no evidence;
- calculations cannot be reproduced;
- contradictions are hidden;
- overall confidence is omitted;
- the report contains a personalized trade instruction or performance guarantee.

## Retention

Published reports should preserve:

- report version;
- exact source references;
- scoring-method version;
- calculations;
- reviewer and timestamp;
- supersession history;
- corrections and their rationale.