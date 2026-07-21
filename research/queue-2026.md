# 2026 IPO Research Queue

This queue deliberately selects different business and ownership structures so IPO Quality Score is not calibrated to the first sponsor-controlled infrastructure case alone.

## Selection rules

A candidate should have:

- a final public prospectus or equivalent primary filing;
- enough financial and ownership disclosure to score all ten dimensions;
- a structure that tests a different failure mode or judgment boundary;
- no dependency on material non-public information;
- a clear reason why the report would be useful to readers.

## Priority 1 — Ethos Technologies Inc. (`LIFE`)

**Archetype:** profitable, fast-growing technology-enabled insurance platform with founder and venture-capital influence.

**Primary filing:** https://www.sec.gov/Archives/edgar/data/1788451/000119312526029993/d901135d424b4.htm

**Why it belongs in the benchmark set**

- contrasts with ITG by presenting strong reported profitability and asset-light economics;
- combines primary issuance with a slightly larger selling-stockholder component;
- uses a dual-class structure with 20 votes per Class B share;
- co-founders hold meaningful voting power while Accel and Sequoia hold an even larger combined block;
- revenue recognition depends on policy persistency estimates and carrier relationships, creating evidence-quality questions different from infrastructure contracting.

**First-pass questions**

1. How much of the IPO creates new operating capital versus existing-holder liquidity?
2. How sensitive is recognized commission revenue to persistency estimates and later terminations?
3. Does the valuation already price in continued 40%–60% growth?
4. Are carrier concentration and underwriting-administration obligations adequately compensated?
5. How should voting concentration across founders and venture investors affect governance scoring?

## Priority 2 — Generate Biomedicines, Inc. (`GENB`)

**Archetype:** pre-commercial biotechnology platform.

**Primary filing:** https://www.sec.gov/Archives/edgar/data/2100782/000119312526083190/generate_bio_424b4.htm

**Why it belongs in the benchmark set**

- tests whether the methodology can evaluate a company without conventional revenue, earnings, or cash-flow durability;
- requires valuation through cash runway, pipeline stage, probability-adjusted programs, partnerships, and dilution rather than ordinary trading multiples;
- exposes scientific, clinical, regulatory, intellectual-property, manufacturing, and concentration risks;
- forces the framework to use `not_applicable` and evidence-confidence rules responsibly rather than punishing every pre-revenue issuer with arbitrary zeros.

**First-pass questions**

1. What runway does the offering create under the disclosed research plan?
2. Which programs have human clinical evidence versus platform-level promise?
3. What milestones, payments, or obligations exist under collaborations?
4. How concentrated is value in one target or modality?
5. What fully diluted share and option overhang should be included in valuation?

## Priority 3 — EquipmentShare.com Inc. (`EQPT`)

**Archetype:** founder-controlled, capital-intensive equipment and technology platform.

**Primary filing:** https://www.sec.gov/Archives/edgar/data/1693736/000162828026003334/eqpt-424b4.htm

**Why it belongs in the benchmark set**

- the co-founders retain approximately 80.8% of voting power through 20-vote Class B shares;
- large IPO Founder Awards create an unusually important dilution and incentive-alignment test;
- capital intensity, fleet utilization, debt, residual values, and cyclicality require a different balance-sheet model from ITG and Ethos;
- the offering is primary, while the over-allotment may come from selling shareholders;
- the case tests whether growth, software narrative, and physical-asset economics are separated cleanly.

**First-pass questions**

1. How much growth comes from new locations, fleet investment, pricing, and acquisitions?
2. What are normalized returns on fleet assets after depreciation and maintenance?
3. How resilient is liquidity under a construction downturn?
4. What is the fully diluted effect of founder awards and the broader incentive reserve?
5. Does founder voting control have a credible sunset and what events trigger conversion?

## Priority 4 — EagleRock Land, LLC (`EROK`)

**Archetype:** asset-heavy land and natural-resources business with continuing-owner control.

**Primary filing:** https://www.sec.gov/Archives/edgar/data/2104882/000119312526224302/d37594d424b4.htm

**Why it belongs in the benchmark set**

- tests commodity, acreage, reserve, counterparty, environmental, and land-valuation evidence;
- existing owners retain approximately 72.8% of voting power after the base offering;
- the LLC and controlled-company structure creates governance considerations without copying ITG's exact Up-C profile;
- cash-flow quality may depend on commodity prices, leasing activity, and non-recurring transactions;
- valuation requires asset and cash-flow views rather than a single revenue multiple.

**First-pass questions**

1. What portion of reported earnings and cash flow is recurring?
2. How sensitive are results to commodity prices and customer concentration?
3. What environmental, remediation, title, and regulatory obligations attach to the land portfolio?
4. How does the implied market value compare with disclosed acreage, reserves, and cash-flow capacity?
5. What protections do minority Class A holders have under the voting agreements?

## Intended order

```text
Ethos Technologies
    ↓
Generate Biomedicines
    ↓
EquipmentShare
    ↓
EagleRock Land
```

The order alternates between profitable and pre-profit, asset-light and capital-intensive, founder-influenced and owner-controlled structures.

## Benchmark matrix

| Issuer | Profit profile | Business model | Control test | Primary methodology stress |
|---|---|---|---|---|
| ITG | profitable but weakening | infrastructure services | sponsor / Up-C | debt repair, TRA, lock-up, control |
| Ethos | profitable growth | insurance technology | founders + venture blocks | revenue estimates, secondary selling, dual class |
| Generate | pre-commercial | biotechnology | investor concentration to assess | runway, clinical probability, scientific evidence |
| EquipmentShare | operating growth | fleet + software | founder-controlled | capital intensity, founder awards, cyclicality |
| EagleRock | asset and cash-flow based | land / resources | continuing-owner controlled | commodity sensitivity, asset valuation, environmental risk |

## Completion definition for each report

A queue item is complete only when:

- the exact final filing state is identified;
- all ten dimensions are scored or explicitly marked with a justified status;
- valuation and fully diluted ownership are reproducible;
- red flags and positive signals link to evidence IDs;
- legal and regulatory claims receive a dedicated pass;
- CI passes on the exact report head;
- the report remains `draft` until independent human review and conflict confirmation.