# Research Architecture v0.1

```text
Regulatory filing / exchange notice / audited statements
                    ↓
             Source snapshot
                    ↓
        Structured evidence records
                    ↓
      Deterministic calculations
                    ↓
 Contradiction and stale-state checks
                    ↓
          Dimension judgments
                    ↓
 Score + coverage + confidence
                    ↓
           Human review gate
                    ↓
       Versioned publication artifact
```

## Layer responsibilities

### Source snapshot

Identifies the exact document state used by a report. An amended filing creates a new source state and triggers dependent evidence review.

### Evidence records

Store source facts with location, units, timestamps, confidence, and review status. Evidence records do not contain investment instructions.

### Deterministic calculations

Compute growth, margins, concentration, valuation multiples, primary-versus-secondary ratios, dilution, and normalized scores from explicit inputs.

### Contradiction checks

Surface inconsistent values, unexplained metric changes, missing periods, and claims that differ across source versions. They must not resolve uncertainty silently.

### Dimension judgments

Map verified evidence and reproducible calculations to the published scoring anchors. Facts and analyst judgment remain separate.

### Human review gate

Confirms source state, evidence, arithmetic, conflicts, legal language, and uncertainty before publication. AI-generated drafts cannot bypass this gate.

### Publication artifact

Produces a versioned report with score, coverage, confidence, evidence register, contradictions, unknowns, conflicts, and supersession history.

## Authority boundary

- The extractor proposes evidence.
- Deterministic code calculates metrics.
- The methodology defines score boundaries.
- The reviewer approves publication.
- The report informs research.
- The system does not execute trades or choose a portfolio for the reader.
