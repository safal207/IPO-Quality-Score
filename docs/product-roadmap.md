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

Deliverables:

- [x] Score v0.1 dimensions and weights
- [x] Evidence policy
- [x] Legal and product boundary
- [x] JSON report schema
- [x] Markdown report template
- [x] Fictional example report
- [ ] JSON Schema validation in CI
- [ ] Contribution and correction policy

Exit condition:

A reviewer can produce the same report structure without inventing fields or hiding unknowns.

## Phase 1 — Manual concierge MVP

**Goal:** Validate whether investors will pay for better filtering before building a large platform.

Deliverables:

- 5 human-reviewed IPO reports;
- one public weekly digest;
- one paid research tier;
- Telegram or email delivery;
- reader feedback form;
- correction log;
- conversion and retention tracking.

Suggested validation targets:

- 100 free subscribers;
- 20 early-access requests;
- 5–10 paying customers;
- at least three users reporting that a report revealed a material risk they had missed.

## Phase 2 — Deterministic research pipeline

**Goal:** Make reports reproducible before adding autonomous AI behavior.

Pipeline:

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

Deliverables:

- source snapshot identifiers;
- calculation library;
- report linter;
- score and coverage validator;
- duplicate and stale-evidence detection;
- amendment supersession workflow;
- correction and audit history.

## Phase 3 — AI-assisted analysis

**Goal:** Reduce analyst time without lowering evidence quality.

AI may:

- locate relevant sections;
- propose extracted facts;
- compare filing versions;
- classify risk language;
- draft dimension summaries;
- identify possible contradictions.

AI may not independently:

- publish a report;
- invent missing data;
- resolve material contradictions silently;
- alter scoring methodology;
- create personalized allocation advice;
- claim that a score predicts returns.

Deliverables:

- extraction confidence;
- reviewer acceptance or rejection;
- prompt and model version tracking;
- source-grounded output tests;
- hallucination and omission benchmarks.

## Phase 4 — Historical calibration

**Goal:** Test whether score dimensions are stable and useful, without overfitting to share-price outcomes.

Track:

- filing-time score;
- evidence coverage;
- score revisions after amendments;
- first-day, 30-day, 90-day, and 365-day performance;
- earnings revisions;
- lock-up events;
- dilution and secondary offerings;
- delistings, restatements, litigation, and regulatory events.

Calibration must distinguish:

- business quality;
- valuation quality;
- disclosure quality;
- market regime;
- realized share-price return.

A good company can be a poor offering at an excessive valuation. A weak company can rise temporarily. The methodology must not collapse these concepts into one hindsight label.

## Phase 5 — Subscription product

Possible tiers:

### Free

- IPO calendar;
- short issuer profiles;
- selected public reports;
- delayed alerts.

### Pro

- full evidence-linked reports;
- score and confidence history;
- filing-change alerts;
- watchlists;
- weekly research digest;
- exports.

### Expert

- deeper scenario analysis;
- post-IPO 30/90/180-day monitoring;
- group research sessions;
- portfolio-independent comparison tools;
- advanced evidence and contradiction views.

### B2B

- API access;
- white-label reports;
- analyst workflow tools;
- structured data feeds;
- custom monitoring and exports.

Pricing should be tested with real customers rather than fixed from assumptions.

## North-star metrics

- report publication cycle time;
- percentage of material claims with primary evidence;
- reviewer rejection rate for AI extractions;
- correction rate and correction severity;
- score coverage and confidence distribution;
- free-to-paid conversion;
- paid retention;
- report usage and alert engagement;
- user-reported decisions improved or risks discovered.

## Immediate next milestone

Create the first real, human-reviewed report from a current public filing. Keep it in draft until every material score has evidence, the offering state is exact, and the publication gate passes.