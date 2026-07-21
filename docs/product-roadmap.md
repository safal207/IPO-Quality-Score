# Product Roadmap

## Product thesis

IPO Quality Score should not compete as another news feed. Its value is a trusted research layer that converts filings, amendments, financial data, and market context into reviewable evidence, explicit uncertainty, and consistent scoring.

The commercial product can combine:

- a free IPO calendar and public examples;
- paid evidence-linked reports;
- filing-change alerts;
- watchlists and post-IPO tracking;
- research exports and B2B access;
- human-reviewed AI assistance.

## Open-core boundary

### Public repository

- methodology and score dimensions;
- public schema and templates;
- example reports;
- deterministic validation rules;
- contribution and correction process;
- selected open extraction utilities.

### Commercial layer

- premium and licensed datasets;
- production ingestion pipelines;
- proprietary prompts and agent orchestration;
- calibrated sub-weights and benchmark history;
- customer accounts, billing, and alert delivery;
- unpublished reports and watchlists;
- B2B API and white-label products.

## Phase 0 — Foundation

**Goal:** Define a trustworthy research contract.

- [x] Score v0.1 dimensions and weights
- [x] Evidence policy
- [x] Legal and product boundary
- [x] JSON report schema
- [x] Markdown report template
- [x] Fictional example report
- [x] JSON Schema and cross-field validation in CI
- [x] Contribution and correction policy
- [x] First real filing-based draft with all ten dimensions scored
- [x] Reproducible valuation, leverage, control, lock-up, and dilution calculations

Exit condition:

A reviewer can produce the same report structure without inventing fields or hiding unknowns, and CI independently verifies the report contract and arithmetic summary.

## Phase 1 — Manual concierge MVP

**Goal:** Validate whether readers will pay for better filtering before building a large platform.

Current progress:

- [x] First filing-based draft report: ITG, Inc.
- [x] Complete filing-based valuation and legal/regulatory dimensions for ITG
- [x] Correct the continuing-owner control interpretation from 62.45% to 83.90%
- [x] Raise machine-readable evidence coverage to 100%
- [ ] Independent human review of ITG evidence and scoring
- [ ] Independent peer-company benchmark for ITG
- [ ] External litigation and regulatory database review
- [ ] Four additional human-reviewed IPO reports
- [ ] Public weekly digest
- [ ] Paid research tier
- [ ] Telegram or email delivery
- [ ] Reader feedback and correction workflow

Suggested validation targets:

- 100 free subscribers;
- 20 early-access requests;
- 5–10 paying customers;
- at least three users reporting that a report revealed a material risk they had missed.

## Phase 2 — Deterministic research pipeline

**Goal:** Make reports reproducible before adding autonomous AI behavior.

```text
source registry
  -> filing snapshot
  -> structured extraction
  -> deterministic calculations
  -> schema validation
  -> contradiction checks
  -> reviewer queue
  -> publication artifact
```

Next deliverables:

- reusable calculation library;
- duplicate and stale-evidence detection;
- amendment supersession workflow;
- correction and audit history;
- generated HTML or PDF publication artifact.

## Phase 3 — AI-assisted analysis

AI may locate sections, propose extracted facts, compare filing versions, classify risk language, draft summaries, and identify possible contradictions.

AI may not independently publish a report, invent missing data, hide contradictions, alter methodology, personalize allocations, or claim that a score predicts returns.

Required controls:

- extraction confidence;
- reviewer acceptance or rejection;
- prompt and model version tracking;
- source-grounded output tests;
- hallucination and omission benchmarks.

## Phase 4 — Historical calibration

Track filing-time score, evidence coverage, amendments, first-day and 30/90/365-day performance, earnings revisions, lock-up events, dilution, restatements, litigation, and regulatory events.

Calibration must distinguish business quality, valuation quality, disclosure quality, market regime, and realized price return. A good company can still be a poor offering at an excessive valuation.

## Phase 5 — Subscription product

### Free

IPO calendar, short profiles, selected public reports, and delayed alerts.

### Pro

Full evidence-linked reports, score history, filing-change alerts, watchlists, weekly digest, and exports.

### Expert

Deeper scenarios, post-IPO monitoring, group research sessions, and advanced evidence views.

### B2B

API access, white-label reports, workflow tools, structured feeds, and custom monitoring.

Pricing should be tested with real customers rather than fixed from assumptions.

## North-star metrics

- publication cycle time;
- primary-evidence coverage;
- reviewer rejection rate for AI extractions;
- correction rate and severity;
- score coverage and confidence distribution;
- free-to-paid conversion and retention;
- report and alert engagement;
- user-reported risks discovered.

## Immediate next milestone

Select four additional IPOs across different structures: one profitable operating company, one pre-profit issuer, one sponsor-controlled issuer, and one founder-controlled issuer. Produce comparable drafts while ITG receives independent human and external legal review.