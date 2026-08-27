# Current Site Interest Vector

Status: **Experiment**

This document applies the Interest Time Vector to the current TypeScript frontend and filing-provenance backend.

## 1. Idea space

### Customer

Potential customers include:

- investment research teams;
- brokers and trading platforms;
- professional investors;
- financial advisers;
- research publishers;
- compliance or investment-committee workflows that require traceable evidence.

### Consumer

Potential consumers include:

- individual investors;
- analysts;
- researchers;
- advisers preparing an IPO view;
- platform clients comparing newly listed companies.

The customer and consumer may be the same person in a self-directed research workflow.

### Consumer problem

IPO information is fragmented, promotional narratives are easier to consume than filing evidence, and a single headline score can hide uncertainty or change over time.

### Value relationship

```text
Consumer receives a faster, evidence-linked view of an IPO
        ↓
Consumer spends less time locating and reconciling filing facts
        ↓
Customer gains faster screening, more auditable decisions, and lower research cost
```

The last two steps are product hypotheses until observed with real users or customers.

### Interest trigger

The strongest likely triggers are:

- a newly filed or amended IPO;
- a large difference between market narrative and filing evidence;
- an unexplained score change;
- a need to compare several IPO candidates quickly;
- a research or investment-committee deadline.

### Trust condition

A consumer should be able to see:

- the score separately from evidence coverage and confidence;
- the source behind a material claim;
- the filing version used;
- whether a report or filing is current or superseded;
- what remains unknown;
- why a score changed after an amendment.

## 2. Thought space

### Main hypothesis

Showing a structured score together with evidence, uncertainty, and filing provenance will produce more useful and trusted IPO screening than showing either raw filing documents or an unexplained score alone.

### Causal model

```text
Clear landing proposition
        ↓
User selects an IPO
        ↓
User understands score, coverage, and confidence as separate concepts
        ↓
User inspects evidence or provenance
        ↓
User can verify the judgment
        ↓
User returns for another IPO or filing update
        ↓
Repeated research value may justify payment or institutional adoption
```

### Proven implementation links

Exact-head automated evidence currently proves that:

- the frontend loads a report list;
- search and selection remain synchronized;
- detail and provenance data are rendered only after runtime validation;
- unsafe evidence URLs are rejected;
- list and detail failures remain separated;
- Chromium can complete the primary read-only flow;
- backend history retains filing and report supersession rather than overwriting it.

### Hypothesized value links

The project has not yet proven that:

- users understand the methodology faster;
- evidence visibility increases trust;
- users return after a filing amendment;
- analysts save meaningful research time;
- customers will pay for screening, monitoring, or workflow integration;
- the score improves investment outcomes.

### Alternative explanations

A user may open evidence because:

- the score is confusing rather than trusted;
- the interface is unfamiliar;
- they are checking for an error;
- they would have opened the filing anyway.

Therefore evidence clicks alone do not prove trust.

### Fastest falsification signals

The current idea should be revised if early target users consistently report that:

- the score does not reduce their research time;
- provenance is too detailed to support a screening decision;
- they cannot explain why one IPO scored differently from another;
- they need comparison and change detection before any individual report page has value;
- the methodology does not match the decisions they actually make.

## 3. Implementation space

### Current artifacts

| Idea claim | Current artifact | State |
|---|---|---|
| IPOs can be screened quickly | Report list, ticker search, minimum-score filter | Proven behavior, value unobserved |
| A score should not hide evidence quality | Separate score, coverage, confidence, unknowns | Proven behavior, comprehension unobserved |
| Claims should be inspectable | Evidence links and source metadata | Proven behavior, trust impact unobserved |
| Filing changes should preserve history | Filing versions and supersession graph | Proven backend behavior |
| Invalid API data should not reach React | Runtime contract decoders | Proven behavior |
| UI state should remain coherent | Separate errors and selection reconciliation | Proven behavior |

### Current product gaps

- no shareable issuer or report URL;
- no side-by-side IPO comparison;
- no visible filing-history timeline despite backend history support;
- no score-change explanation between filing versions;
- no interest or research-efficiency instrumentation;
- no watchlist or amendment notification;
- no customer workspace, export, or investment-committee output;
- list retrieval currently assumes a bounded initial result set rather than a large catalog experience.

## 4. Time slices

### T0 — current exact state

The site is a tested, read-only frontend connected to versioned IPO reports and filing provenance. It is implementation-ready for a bounded demonstration but has no observed market-interest evidence.

### T+1 click

The primary interaction path is protected by component and Chromium tests. Remaining product risk is not state correctness but whether the first selected report provides enough immediate meaning.

### T+1 session

The site can support exploration of one report. It does not yet support a strong continuation loop such as comparison, saved research, shareable URLs, or a visible amendment timeline.

### T+1 filing update

The backend can preserve new filing versions and supersede previous reports. The frontend does not yet make the change itself easy to understand, so the return-visit value is incomplete.

### T+100 issuers

Likely risks:

- list pagination and server-side search;
- stable sorting and filtering;
- repeated detail/provenance requests;
- rendering density;
- duplicate or ambiguous issuer identities;
- showing current versus historical reports without clutter.

These risks require measured data volumes and performance tests before they are classified as defects.

### T+1 paying customer

The strongest initial paid value is more likely to be workflow value than the score alone:

- faster screening;
- amendment monitoring;
- explainable score changes;
- comparison and export;
- an auditable research trail.

Customer incentives must not suppress negative evidence, hide uncertainty, or turn the score into promotional allocation language.

## 5. Smallest useful interest experiment

### Goal

Determine whether target consumers gain enough value from evidence-first IPO screening to continue beyond the first report.

### Target participants

Use two explicit cohorts and do not combine their outcomes:

- **Consumer comprehension cohort (8 participants):** 4 active IPO/equity researchers and 4 experienced self-directed investors or advisers.
- **Customer workflow cohort (4 participants):** research-team leads or financial-platform product managers who influence tooling or purchasing.

A participant may not count in both cohorts. Record the segment, recruitment source, and exclusions before analysis.

### Tasks

Ask each participant to:

1. complete the same bounded screening task with raw filings or their normal tool as a timed baseline;
2. choose one of two IPO reports in this interface;
3. explain Score, Coverage, and Confidence as separate concepts;
4. identify one material risk, its source, and one unknown;
5. compare the report with the baseline workflow;
6. return for a second session involving a different filing or amendment within 30 days;
7. for the customer cohort only, describe the workflow integration, approval path, and purchasing evidence required for a pilot.

### Measurements

Capture:

- baseline and interface task-completion time, using (baseline - interface) / baseline for the time-saving rate;
- task accuracy in both conditions;
- whether Score, Coverage, and Confidence are all explained correctly;
- whether the participant finds the specified material source without assistance;
- consumer comprehension and customer workflow/purchasing outcomes as separate measures;
- a repeat-use event, defined as completing the second distinct filing or amendment task within 30 days;
- accepted or rejected pilot terms; stated interest alone is not willingness-to-pay evidence.

### Decision thresholds

- **Proceed to a repeat-use pilot:** all 8 consumer sessions are complete, at least 6 of 8 participants correctly explain Score, Coverage, and Confidence, at least 6 of 8 find the required source without assistance, median screening time improves by at least 20% versus the counterbalanced baseline, and task accuracy does not fall.
- **Proceed to a customer pilot:** the consumer threshold passes, all 4 customer-workflow sessions are complete, at least 3 of 4 identify a concrete integration and approval path, and at least one customer accepts a bounded paid-pilot offer. Do not infer willingness to pay from feature interest.
- **Experiment further:** comprehension passes but the time, repeat-use, or customer-pilot threshold is not yet measured.
- **Revise:** fewer than 6 of 8 consumers separate Score from Coverage and Confidence, median time improves by less than 20%, accuracy falls, or fewer than half complete the defined return event.
- **Stop:** fewer than 4 of 8 consumers complete the core task correctly, the interface increases median correct-task time, or no customer participant identifies a real workflow after the bounded revision cycle.

## 6. Next bounded product slice

Before adding broad account or payment functionality, the most coherent next slice is:

```text
Filing history timeline
        +
Score-change explanation
        +
Two-report comparison intent
        +
Minimal privacy-respecting interest signals
```

This slice connects the existing provenance infrastructure to a reason for consumers to return and gives potential customers a measurable research-efficiency story.
