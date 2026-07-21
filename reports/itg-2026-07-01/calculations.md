# ITG IPO valuation and dilution calculations

> **Offering state:** final prospectus dated June 30, 2026, filed July 1, 2026  
> **Base IPO price:** $16.00  
> **Purpose:** reproduce the valuation, leverage, control, and dilution inputs used by report v0.2.

## 1. Exchange-adjusted economic units

The Up-C structure requires more than the visible Class A public float.

```text
Class A shares outstanding after the base offering       45,517,704
Exchangeable Class B / LLC units                         75,712,686
                                                        -----------
Exchange-adjusted economic units                        121,230,390
```

Cross-check:

```text
IPO purchaser units                                     19,512,196
Continuing-owner economic interests                    101,718,194
                                                        -----------
Total                                                   121,230,390
```

The 62.45% figure in the prospectus describes the Class B/direct LLC-interest slice excluding Oaktree Blocked Fund's Class A position. The complete continuing-owner voting and economic position is **83.90%**.

## 2. IPO equity value

```text
121,230,390 economic units × $16.00 = $1,939,686,240
```

This base value excludes awards not yet granted from the incentive-plan reserve.

## 3. Enterprise value

The prospectus shows pro forma, as-adjusted balances after applying IPO proceeds:

```text
Implied equity value                                  $1,939,686,240
Plus: total indebtedness                                $528,323,000
Less: cash and cash equivalents                          $1,870,000
                                                       --------------
Implied enterprise value                              $2,466,139,240
```

## 4. Filing-based valuation multiples

Using 2025 revenue of $1,154.857 million and company-defined Adjusted EBITDA of approximately $148.3 million:

```text
EV / revenue        = $2,466.139m / $1,154.857m = 2.14x
EV / Adjusted EBITDA = $2,466.139m / $148.3m     = 16.63x
```

Adjusted EBITDA is a non-GAAP management-defined metric. The prospectus warns that other companies may calculate similar metrics differently. No independent public-company peer set is included in report v0.2, so valuation confidence remains medium and the score is penalized.

## 5. Post-IPO leverage

```text
Pro forma debt       = $528.323m
Pro forma cash       =   $1.870m
Net debt             = $526.453m

Gross debt / 2025 Adjusted EBITDA = $528.323m / $148.3m = 3.56x
Net debt / 2025 Adjusted EBITDA   = $526.453m / $148.3m = 3.55x
```

## 6. Public ownership and control

```text
IPO purchaser economic/voting interest = 19,512,196 / 121,230,390 = 16.10%
Continuing-owner interest                = 101,718,194 / 121,230,390 = 83.90%
```

Oaktree may nominate six directors while its group holds at least 40% of voting power.

## 7. Lock-up and future-sale overhang

The lock-up lasts 180 days, subject to exceptions and potential early release by specified underwriters. The prospectus identifies **101,718,194** continuing-owner shares or exchangeable LLC interests as potentially sale-eligible after the lock-up when securities-law conditions permit.

```text
Potential continuing-owner overhang / economic units
= 101,718,194 / 121,230,390
= 83.90%
```

This does not mean all units will be sold at once. It measures the scale of securities that can eventually enter the public market.

## 8. Incentive-plan overhang

```text
Initial share reserve = 12,123,039
Reserve / exchange-adjusted economic units
= 12,123,039 / 121,230,390
= 10.00%
```

The reserve may increase annually from 2027 through 2036 by the lesser of 5% of outstanding Class A and Class B shares or a lower amount selected by the board.

Reserve-inclusive sensitivity, assuming every initial reserved share were eventually issued:

```text
121,230,390 + 12,123,039 = 133,353,429 units
```

This sensitivity is **not** used as the base IPO share count because the reserve is not the same as granted and vested awards.

## 9. Tangible book dilution

The prospectus reports:

```text
IPO price per share                           $16.00
Pro forma net tangible book value per share   ($2.26)
Immediate tangible-book dilution              $18.26
```

The dilution exceeds the IPO price because pro forma net tangible book value is negative.

## 10. Reproducibility boundary

These calculations are derived only from the final prospectus. They do not include:

- an independent peer-multiple benchmark;
- market-price performance after listing;
- the eventual number and timing of incentive awards;
- future LLC-interest exchanges;
- future Tax Receivable Agreement payments;
- independent litigation or regulatory-database findings.

Those items remain explicit follow-up work rather than hidden assumptions.