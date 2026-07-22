# Analyst comprehension study v0.1

## Purpose

This study tests whether the IPO Quality Score interface helps target users understand a comparison faster and more accurately than their normal raw-filing workflow.

It does **not** test investment performance, forecast accuracy, willingness to invest, or regulatory suitability.

## Participants

Recruit 5–7 people who regularly inspect companies, offerings, or financial disclosures:

- equity or investment analysts;
- QA or product specialists working with brokerage data;
- financial advisers or research editors;
- experienced self-directed investors who read primary filings.

Record the participant category, not their name, employer, account, portfolio, or contact details in the study sheet.

## Session setup

- 20–30 minutes per participant;
- one facilitator and, when possible, one silent note-taker;
- use the same exact application SHA and the same two IPO reports for every participant;
- begin with a fresh browser tab and cleared local research trail;
- do not explain Score, Coverage, Confidence, or the dimension table before the first task;
- do not record audio or video unless the participant gives explicit consent.

## Tasks

1. Select one IPO and explain the headline Score in the participant's own words.
2. Identify one material strength and one material risk.
3. Open the filing timeline and explain what changed over time.
4. Compare the two IPOs and identify the dimension with the widest scored gap.
5. Open at least one source and explain what claim it supports.
6. Complete the three-question comprehension check.
7. State what the interface does **not** prove.
8. Describe the next action they would take in a real research workflow.

The facilitator must not correct an answer until the participant has completed the task.

## Measures

Capture only aggregate or de-identified observations:

| Measure | Definition |
| --- | --- |
| Time to first correct Score explanation | Seconds from page load until the participant distinguishes Score from Coverage and Confidence |
| Time to source verification | Seconds until the participant opens a relevant primary source and states what it supports |
| Timeline comprehension | Correctly identifies current versus superseded filing state |
| Dimension comprehension | Correctly identifies the widest normalized dimension gap |
| Boundary comprehension | Explicitly states that the comparison does not predict returns or recommend allocation |
| Assistance count | Number of facilitator prompts needed after the task begins |
| Workflow preference | Prefers this flow, raw filings, or a hybrid process |
| Return trigger | Names a concrete reason to return, such as an amendment, score movement, alert, or committee review |

Do not treat clicks, dwell time, or self-check completion alone as comprehension.

## Success thresholds

### Proceed

Use **Proceed** only when at least 5 participants complete the study and:

- at least 80% correctly separate Score, Coverage, and Confidence without explanation;
- at least 80% identify the widest dimension gap;
- at least 80% state the non-predictive boundary;
- median time to a relevant source is no more than 90 seconds;
- at least 60% prefer the interface or a hybrid workflow over raw filings alone;
- no participant interprets the table as an allocation recommendation after completing the flow.

### Revise

Use **Revise** when the core workflow is useful but one or more thresholds fail, especially when:

- users confuse high coverage with high quality;
- dimension percentages are understood as absolute probabilities;
- the timeline does not make supersession clear;
- users need repeated facilitator explanation;
- the comparison lacks a dimension or evidence view required for their real workflow.

### Stop

Use **Stop** for this experiment when:

- fewer than half of participants can explain the Score after using the complete flow;
- the interface consistently increases verification time versus raw filings;
- users repeatedly infer return forecasts or allocation advice despite the boundaries;
- the target workflow is actually alerts, export, or committee collaboration rather than interactive comparison.

## Observation sheet

For each participant, store only:

```text
Participant category:
Exact application SHA:
Task completion: 1–8
Time to Score explanation:
Time to source verification:
Facilitator prompts:
Self-check result:
Observed misunderstandings:
Preferred workflow:
Return trigger:
One direct paraphrase, not identifying:
```

## Analysis boundary

A 3/3 self-check result proves only that the participant selected the expected answers on that screen. It does not prove durable understanding, investment competence, product-market fit, saved research cost, or willingness to pay.

The study result becomes product evidence only after the de-identified sessions are completed and summarized against the thresholds above.
