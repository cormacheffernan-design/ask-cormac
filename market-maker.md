# FintureAI market maker (liquidity fund) — settled design

- FintureAI originates credit deals; the market maker (a dedicated liquidity sub-fund, ring-fenced from the at-call Cash Pool) underwrites the whole facility.
- Opening print = 98% of origination expected market value (EMV). The 2% is the market maker's bid-offer spread, not a fixed buffer — earned on turnover.
- Distribution: sold down to wholesale clients in clips. Large when demand is firm at value (to hold par and clear fast); small only to discover a soft level. A premium on freshly underwritten paper signals under-distribution.
- Underwrite size is a function of available cash and the manager's view on sell-down speed. Capped endogenously by capacity starvation — no hard percentage.
- Target tempo: ~80% of an underwritten holding sold down within 6 months so cash recycles into the next deal. A portfolio / origination-quality signal, NOT a deal-level forced sale.
- Aftermarket: firm to bid, free on price — a bid is always available, struck at the prevailing market level, never a guaranteed value. No free put: the discount is real and the seller crystallises the loss. Capacity-gated to available liquidity.
- Price is discovered from order flow (lifted -> raise; hit -> lower). Origination EMV is only the opening quote.
- Credit deterioration is a hit to the portfolio, borne by the fund. The bid reprices to a large discount; firm-to-bid never lifts. Impaired paper is bought where the risk-weighted return is attractive again. A market in price, not in credit quality.
- Daily three-price NAV: NAV, bid, offer, all transparent. NAV = cash + inventory at last traded price (or live-quote mid when a name is quiet); income received and distributed; capital is equity-at-risk.
- The manager targets par by managing the cash ratio (weighted-average ~33% cash, broad band). Discount/premium arise only at the band's edges.
- Funding: wholesale & institutional capital, notably FundEQ rolling capital. Tenor-matched by the roll; run-proofed by the honest mark.
- Discipline is self-enforcing via capacity starvation: mispricing ties up finite underwriting capital and blocks the next deal. The construct sits within existing Finplex Fund documentation; no further legal advice required.
