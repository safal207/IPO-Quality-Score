# Interest Time Vector

## Purpose

The Interest Time Vector is a pre-review reasoning protocol for compressing product learning into small, testable cycles.

It does not treat a feature as only code. Every change is examined across three connected spaces:

1. **Idea space** — the value relationship between customer and consumer.
2. **Thought space** — assumptions, causal links, contradictions, and possible futures.
3. **Implementation space** — contracts, code, interface behavior, tests, and operational evidence.

The protocol is intended to shorten the distance between an idea, a user signal, and a justified correction without hiding uncertainty or pretending that simulation is real-world evidence.

---

## Core vector

```text
Interest
   ↓
Comprehension
   ↓
Trust
   ↓
Action
   ↓
Return
   ↓
Value
   ↓
Payment or continued sponsorship
```

A feature is not complete merely because it runs. It should either move this vector forward or explicitly explain why it is infrastructure required for a later step.

---

## The three spaces

### 1. Idea space

Idea space defines why the product should exist and for whom.

For every meaningful change, identify:

- **Customer** — who funds, commissions, purchases, or sponsors the outcome.
- **Consumer** — who directly experiences the product or decision support.
- **Problem** — what costly uncertainty, friction, or risk exists today.
- **Value transfer** — how helping the consumer creates value for the customer.
- **Interest trigger** — why the consumer pays attention now.
- **Trust condition** — what must be visible for the consumer to believe the result.
- **Payment condition** — what repeated value could justify payment, retention, or institutional adoption.

#### IPO Quality Score relationship

```text
Customer
analyst, investment team, broker, research platform, professional investor

        ↓ funds reliable decision support

Consumer
investor, researcher, adviser, platform client

        ↓ receives

score + evidence + uncertainty + filing history + change explanation

        ↓ creates customer value through

faster screening, lower research cost, auditable decisions, reduced weak-IPO exposure
```

The customer and consumer may be the same person. When they differ, the product must not optimize customer economics by misleading or reducing the agency of the consumer.

---

### 2. Thought space

Thought space models the causal structure before implementation is accepted.

For each change, record:

- the main hypothesis;
- the causal chain from change to user outcome;
- assumptions that have not yet been observed;
- alternative explanations;
- contradictions and unknowns;
- the most likely failure mode;
- the fastest falsification signal;
- the decision that follows each possible signal.

Example:

```text
Only a score is shown
        ↓
consumer cannot inspect why it exists
        ↓
trust remains weak

Score + evidence + filing provenance are shown
        ↓
consumer can verify the judgment
        ↓
trust may increase
        ↓
return usage may increase
```

The last two arrows remain hypotheses until measured. Passing tests proves implementation behavior, not market demand or user trust.

---

### 3. Implementation space

Implementation space maps each idea and causal claim to an observable product artifact.

| Intended value | Implementation artifact | Evidence |
|---|---|---|
| The score can be verified | Evidence and provenance APIs | Contract tests and source hashes |
| Filing changes remain visible | Version and supersession model | Migration and amendment tests |
| Invalid backend data is not rendered | Runtime response decoders | Malformed-payload tests |
| Search never contradicts detail state | Selection reconciliation | Component and Chromium tests |
| CI cannot write during normal validation | Read-only token and disabled credential persistence | Workflow inspection |

Every implementation claim should have one of these states:

- **Proven** — supported by exact-head automated or reproducible evidence.
- **Observed** — supported by real user or operational data.
- **Hypothesized** — plausible but not yet observed.
- **Unknown** — insufficient evidence to classify.

Do not promote a hypothesis to an observation because the implementation is elegant or tests are green.

---

## Time compression slices

Before review, inspect the change at multiple future slices.

### T0 — exact current state

- What exact commit, schema, source version, and configuration are being reviewed?
- What does the user see now?
- What is known, hypothesized, or unknown?

### T+1 click

- What happens after the next user action?
- Can loading, error, empty, and cancellation states contradict one another?
- Does the user retain control and context?

### T+1 session

- Why would the consumer continue exploring?
- What creates understanding rather than visual activity?
- Can the consumer verify the result without trusting the interface blindly?

### T+1 filing or data update

- Does new evidence overwrite history or create a new version?
- Can a user understand why the result changed?
- Are previous claims marked stale or superseded?

### T+100 issuers

- Does the model still work when the dataset grows?
- Which list, filter, API, database, and rendering assumptions become expensive?
- Are identifiers, pagination, and provenance still deterministic?

### T+1 paying customer

- Which repeatable outcome is valuable enough to fund?
- What would the customer measure: time saved, risk reduced, coverage increased, or audit cost lowered?
- Could monetization distort the evidence presented to the consumer?

---

## Pre-review protocol

A reviewer should be able to answer the following before approving a meaningful change.

### Idea

1. Who is the customer?
2. Who is the consumer?
3. What problem or uncertainty is reduced?
4. How does consumer value create customer value?

### Thought

5. What causal chain is claimed?
6. Which links are observed, proven, hypothesized, or unknown?
7. What is the fastest signal that would falsify the idea?
8. What future state could make the current design misleading or unsafe?

### Implementation

9. Which code, schema, UI, or documentation artifact realizes each claim?
10. What exact-head evidence proves implementation behavior?
11. What remains outside the test boundary?
12. Is the change reversible, versioned, and honest about uncertainty?

A review is incomplete when the implementation passes but the idea-to-consumer relationship is unspecified.

---

## Interest signal map for the current site

The first frontend should be evaluated through the following signal sequence:

```text
Landing comprehension
    ↓
Report selection
    ↓
Score interpretation
    ↓
Evidence inspection
    ↓
Provenance inspection
    ↓
Comparison or return visit
```

Initial product signals to instrument later:

- report-card selection rate;
- percentage of sessions opening evidence;
- percentage opening filing provenance;
- search usage and zero-result rate;
- report comparison attempts;
- repeat visits after a filing update;
- time from landing to first evidence inspection;
- customer-reported research time saved.

These signals should be treated as measurements of behavior, not automatic proof of trust, investment quality, or willingness to pay.

---

## Decision rule

For each change, finish with one explicit decision:

- **Proceed** — evidence is sufficient for the bounded next step.
- **Experiment** — implementation is safe, but the value hypothesis requires observation.
- **Revise** — causal or implementation contradictions are already visible.
- **Stop** — the idea does not create enough consumer or customer value to justify further work.

The goal of time compression is not to move faster in every direction. It is to discover the wrong direction earlier and preserve evidence when the direction changes.
