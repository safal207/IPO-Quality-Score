# Contributing

IPO Quality Score welcomes contributions that improve transparency, reproducibility, and evidence quality.

## Contribution types

- methodology clarifications;
- schema and validation improvements;
- source adapters and deterministic calculations;
- fictional or properly sourced example reports;
- corrections to published research;
- tests for stale evidence, contradictions, units, and score normalization;
- documentation and translations.

## Required boundaries

Contributions must not:

- present fabricated information as evidence;
- include material non-public information;
- promise or imply guaranteed investment returns;
- provide personalized allocation instructions;
- hide sponsorship or conflicts of interest;
- silently change scoring weights or interpretation bands;
- include proprietary datasets without permission.

## Methodology changes

A pull request changing dimensions, weights, thresholds, confidence rules, or interpretation bands must include:

1. the proposed methodology version;
2. a clear rationale;
3. expected benefits and risks;
4. migration notes;
5. recalculation impact on existing benchmark reports;
6. tests or examples showing the new behavior.

## Evidence requirements

Material claims should include:

- source type and title;
- URL or stable source identifier;
- filing or document version;
- publication and access timestamps;
- exact location;
- extracted fact and unit;
- confidence and review status.

AI-generated text is not a source. AI-assisted extraction must remain traceable to the original evidence.

## Corrections

Corrections are first-class contributions. A correction should state:

- the affected report and version;
- the incorrect or incomplete claim;
- the corrected evidence;
- dimensions and calculations affected;
- whether the prior report is corrected, superseded, or withdrawn;
- the reviewer and correction timestamp.

Do not rewrite history silently. Preserve prior versions and explain material changes.

## Pull request checklist

- [ ] Scope is limited and clearly described
- [ ] Evidence and calculations are reproducible
- [ ] Facts, assumptions, and judgments are separated
- [ ] Unknowns and contradictions remain visible
- [ ] No personalized recommendation or performance guarantee is introduced
- [ ] Documentation and examples are updated
- [ ] Relevant validation passes
- [ ] New behavior has tests or a reviewable example

## Security and sensitive information

Do not open a public issue containing credentials, personal data, confidential contracts, material non-public information, or exploitable security details. Use an appropriate private reporting channel when one is published by the project.