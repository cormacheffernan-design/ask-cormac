# FundEQ

**Scope of this file.** This captures what has been established about FundEQ from
the Finplex / FintureAI side — principally its role as the funding layer behind
the FintureAI market maker. It is a starting point to be enriched from FundEQ's
own project documents and a proper interview. The "Open / to confirm" section at
the end is the agenda for that.

---

## What FundEQ is
- FundEQ is an active fund-management platform product within the Finplex / FintureAI world.

## Established role — funding the market maker
- FundEQ is the rolling wholesale & institutional capital that funds the FintureAI
  market maker's liquidity sub-fund. It provides the dry powder for underwriting
  credit deals and for the aftermarket bid.
- As a constantly rolling fund, its capital tenor is matched to the asset tenor by
  design: rolling capital continuously replenishes dry powder, and staggered rolls
  mean redemptions trickle rather than spike. This roll tempo mirrors the market
  maker's ~6-month deal recycle horizon (target ~80% of an underwritten holding
  sold down within 6 months).
- The honest, instantly-impairing daily mark on the liquidity fund is what makes
  this rolling structure run-proof: there is no stale NAV to run ahead of, so a
  departing investor wears their share of any hit in the price they roll out at.

## Established economics
- Capital in the fund is **equity-at-risk**: it earns the spread in good times and
  wears credit losses in bad. It is not deposit-like and not capital-protected.
- Valuation is a **daily NAV** = cash + inventory at last traded price (or the mid
  of the live quote when a name is quiet); income is received and distributed.

## Surrounding structure it depends on (context)
- Finplex Fund: an unregistered umbrella MIS, wholesale/sophisticated only, trustee
  Finplex Nominees Pty Ltd, manager Finplex Pty Ltd, both CARs of Sapien Capital
  Partners Ltd (AFSL 238128).
- FintureAI: origination / distribution brand (CAR under Sapien). Originates the
  credit deals the market maker underwrites and FundEQ capital funds.

---

## Open / to confirm (the interview agenda)
These are not yet established and should be filled from FundEQ's own documents:
- What FundEQ *is* as a standalone product beyond the funding role — its own
  proposition, target clients, and how it is marketed.
- Legal/structural form: is FundEQ a sub-trust of the Finplex Fund, a separate
  vehicle, or a platform wrapping several vehicles?
- Roll mechanics in detail: roll tenor, whether rolls are staggered per-investor
  or common-dated, notice periods, and any minimums.
- Investor eligibility and minimums; relationship (if any) to the at-call Cash Pool.
- Fees and economics to investors (vs the spread earned by the liquidity book).
- Reporting, administration and registry (Cache Investment Management?).
- How FundEQ relates to other Finplex products (FundEQ vs Cash Pool vs the deal
  sub-funds) and where its capital can and cannot be deployed.
- Any technology dependence (Finplex Nerve Centre) specific to FundEQ.
