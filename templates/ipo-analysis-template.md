# IPO Analysis: {{ company_name }}

> **Report status:** Draft  
> **Methodology:** IPO Quality Score v0.1  
> **Filing state:** {{ filing_type }} / {{ filing_version }}  
> **Source published:** {{ filing_published_at }}  
> **Source accessed:** {{ source_accessed_at }}  
> **Reviewer:** {{ reviewer }}

## Research boundary

This report provides general informational and educational research. It is not a personalized investment recommendation and does not predict returns.

## 1. Offering snapshot

| Field | Value |
|---|---|
| Legal issuer name | {{ legal_name }} |
| Brand | {{ brand_name }} |
| Exchange | {{ exchange }} |
| Proposed ticker | {{ ticker }} |
| Expected offering date | {{ expected_offering_date }} |
| Price range | {{ price_range }} |
| Primary shares | {{ primary_shares }} |
| Secondary shares | {{ secondary_shares }} |
| Expected gross proceeds | {{ expected_gross_proceeds }} |
| Filing | {{ filing_url }} |

## 2. Executive research summary

### What the company does

{{ business_summary }}

### Why the offering matters

{{ offering_summary }}

### Main positive signals

- {{ positive_signal_1 }}
- {{ positive_signal_2 }}
- {{ positive_signal_3 }}

### Main red flags

- {{ red_flag_1 }}
- {{ red_flag_2 }}
- {{ red_flag_3 }}

### Material unknowns

- {{ unknown_1 }}
- {{ unknown_2 }}

## 3. Score summary

| Dimension | Earned | Maximum | Status | Confidence |
|---|---:|---:|---|---|
| Revenue growth and durability | {{ revenue_score }} | 15 | {{ revenue_status }} | {{ revenue_confidence }} |
| Profitability and cash flow | {{ profitability_score }} | 15 | {{ profitability_status }} | {{ profitability_confidence }} |
| Market and competitive position | {{ market_score }} | 10 | {{ market_status }} | {{ market_confidence }} |
| Valuation quality | {{ valuation_score }} | 15 | {{ valuation_status }} | {{ valuation_confidence }} |
| Debt and balance-sheet resilience | {{ balance_sheet_score }} | 10 | {{ balance_sheet_status }} | {{ balance_sheet_confidence }} |
| Use of proceeds | {{ proceeds_score }} | 10 | {{ proceeds_status }} | {{ proceeds_confidence }} |
| Insider selling, lock-up, and dilution | {{ dilution_score }} | 10 | {{ dilution_status }} | {{ dilution_confidence }} |
| Governance and shareholder rights | {{ governance_score }} | 5 | {{ governance_status }} | {{ governance_confidence }} |
| Legal and regulatory risk | {{ legal_score }} | 5 | {{ legal_status }} | {{ legal_confidence }} |
| Disclosure quality and consistency | {{ disclosure_score }} | 5 | {{ disclosure_status }} | {{ disclosure_confidence }} |

**Earned points:** {{ earned_points }}  
**Applicable maximum:** {{ applicable_max_points }}  
**Normalized score:** {{ normalized_score }}/100  
**Coverage:** {{ coverage_percent }}%  
**Overall confidence:** {{ overall_confidence }}  
**Interpretation:** {{ interpretation }}

## 4. Dimension analysis

Repeat this section for every dimension.

### {{ dimension_name }}

**Status:** {{ status }}  
**Score:** {{ earned_points }}/{{ max_points }}  
**Confidence:** {{ confidence }}

#### Source facts

- `{{ evidence_id }}` — {{ extracted_fact }}

#### Calculations

```text
{{ reproducible_calculation }}
```

#### Assumptions

- {{ assumption }}

#### Analyst judgment

{{ judgment }}

#### What would change the score

- {{ score_change_condition }}

## 5. Valuation scenarios

| Scenario | Assumptions | Implied value | Evidence quality |
|---|---|---:|---|
| Conservative | {{ conservative_assumptions }} | {{ conservative_value }} | {{ conservative_confidence }} |
| Base | {{ base_assumptions }} | {{ base_value }} | {{ base_confidence }} |
| Optimistic | {{ optimistic_assumptions }} | {{ optimistic_value }} | {{ optimistic_confidence }} |

Scenarios are analytical illustrations, not price targets or promises.

## 6. Proceeds, ownership, and dilution

- Primary capital raised: {{ primary_capital }}
- Secondary proceeds to existing holders: {{ secondary_proceeds }}
- Debt repayment: {{ debt_repayment }}
- Insider ownership before offering: {{ insider_ownership_before }}
- Insider ownership after offering: {{ insider_ownership_after }}
- Lock-up period and exceptions: {{ lockup }}
- Equity-plan, option, and warrant overhang: {{ dilution_overhang }}

## 7. Contradictions and disclosure changes

| Topic | Earlier evidence | Current evidence | Resolution |
|---|---|---|---|
| {{ contradiction_topic }} | {{ earlier_evidence }} | {{ current_evidence }} | {{ resolution }} |

## 8. Evidence register

| ID | Source | Version/date | Location | Extracted fact | Confidence | Review |
|---|---|---|---|---|---|---|
| {{ evidence_id }} | {{ source_title }} | {{ source_version }} | {{ location }} | {{ extracted_fact }} | {{ confidence }} | {{ review_status }} |

## 9. Conflicts of interest

{{ conflicts_of_interest_or_none }}

## 10. Final research interpretation

{{ final_interpretation }}

This conclusion must describe strengths, risks, evidence coverage, and uncertainty. It must not tell a specific reader how much to invest.

## Publication gate

- [ ] Exact issuer and filing state identified
- [ ] Material facts linked to evidence
- [ ] Units and calculations verified
- [ ] Facts, assumptions, and judgments separated
- [ ] Unknowns and contradictions visible
- [ ] Score and coverage recalculated
- [ ] Conflicts disclosed
- [ ] Disclaimer present
- [ ] Human review completed
- [ ] No personalized allocation or guaranteed-return language
