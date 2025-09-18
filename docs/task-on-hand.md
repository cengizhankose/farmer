analyze the risk calculation for opportunities deeply also analyze the data's for whole adapter. ultrathink and generate a plan for implementing given risk analysis logic into adapters with the data on hand.

RISK ANALYSIS LOGIC:

How do we break down risk?

We generate the following five independent sub-scores. Each sub-score ranges from 0 to 100 (higher = riskier).

1. Liquidity Risk (LQ)
   How easy is it to enter and exit the pool?
   • TVL (higher → lower risk)
   • 24h Volume / TVL (higher → lower risk)
   • Participants (many users → lower risk)
2. Stability Risk (ST)
   How has TVL/Volume fluctuated over the last 7/30/90 days? Are there any crashes/drawdowns?
   • TVL 30D and 90D maximum drawdowns
   • Volume 30D volatility (stdev)
   • TVL 7D trend slope (negative → higher risk)
3. Yield Sustainability Risk (YS)
   Is APR/APY realistic or is it an emission boost?
   • Penalty if the APR level is too high (may be unsustainable)
   • APR 7/30/90D volatility and declines are penalized
   • APR→APY difference (compounding assumption): unusual differences → risk
4. Concentration Risk (CN)
   Is there a low user/whale effect?
   • If Participants are low, and Volume/Participant is very high (whale effect), risk ↑
   • (Later, if the true "top N address" share arrives, we reinforce it with HHI)
5. Momentum/Flight Risk (MO)
   Is money flowing in or out?
   • TVL 7D and 30D net flow (last value – average)
   • Persistent negative flow → risk ↑

Why 5 pieces? Because we can give the user a one-sentence answer to the question "Why this risk?": "Because liquidity is weak and TVL has fallen by 18% in 30 days."

How do we extract features?

The following formulas generate raw data → features. We will normalize between 0 and 1 with min–max (1–x for reverse-scores), and sum for each subscore.

Auxiliary notation
• TVL_t: TVL t days ago
• APR_t: APR t days ago
• VOL_t: Volume t days ago
• Arrays: TVL_7, TVL_30, TVL_90, etc.

2.1 Liquidity
• Depth: depth = clamp01( log10(TVL_now) / log10(TVL_ref_high) )
(large TVL is good → 1 for risk contribution - depth)
• Turnover: turn = clamp01( (VOL_24h / TVL_now) / turn_ref )
(large turnover is good → 1 for risk - turn)
• Participation: part = clamp01( Participants / part_ref_high )
(multiple participants are good → 1 for risk - part)

LQ_raw = w1(1-depth) + w2(1-turn) + w3\*(1-part)\*\*
Recommendation: w1=0.5, w2=0.3, w3=0.2

2.2 Stability
• TVL 30D Max Drawdown:
dd30 = max( (peak - trough) / peak ) → 0..1 (large dd → risk ↑)
• TVL 90D Max Drawdown: dd90 (longer view)
• VOL 30D Volatility: vol_stdev = stdev( VOL_30 / mean(VOL_30) ) (normalized to 0..1)
• TVL 7D Trend (linear regression slope): trend7 = slope(TVL_7) → if negative, neg7 = clamp01( -trend7 / slope_ref ) otherwise 0

ST_raw = v1dd30 + v2dd90 + v3vol_stdev + v4neg7
Recommendation: v1=0.35, v2=0.25, v3=0.25, v4=0.15

2.3 Return Sustainability
• APR Level Penalty: apr_lvl = clamp01( APR_now / apr_ref_high )
(very high APR risk → direct apr_lvl is added)
• APR Vol 30D/90D: apr_vol30, apr_vol90 = stdev(APR_30/mean), stdev(APR_90/mean)
• APR Decay 30D: apr_decay = clamp01( (mean(APR_7) - mean(APR_30)) / mean(APR_30) ) (negative/collapse → positive penalty)
• APR↔APY Gap: gap = clamp01( (APY_now - APR_now) / max(1, APR_now) ) (extraordinary difference adds risk)

YS_raw = a1apr_lvl + a2apr_vol30 + a3apr_vol90 + a4apr_decay + a5\*gap
Recommendation: a1=0.35, a2=0.2, a3=0.15, a4=0.2, a5=0.1

2.4 Concentration
• Low Participants: lowp = clamp01( part_ref_low / max(1,Participants) ) (↑ if few participants)
• Whale Proxy: whale = clamp01( (VOL_24h / max(1,Participants)) / whale_ref )

CN_raw = c1lowp + c2whale
Recommendation: c1=0.6, c2=0.4

2.5 Momentum / Escape
• TVL Net Inflow 7D: inf7 = clamp01( (TVL_now - mean(TVL_7)) / mean(TVL_7) ) → if negative, risk: out7 = clamp01( -inf7 ), if positive, 0
• TVL Net Inflow 30D: same logic: out30

MO_raw = m1out7 + m2out30
Recommendation: m1=0.6, m2=0.4

clamp01(x) = min(1, max(0, x))
Choose \*\_ref values dynamically based on the data: median/upper quartile, or constants (e.g., TVL_ref_high=10M, turn_ref=0.2, part_ref_high=1000, part_ref_low=50, apr_ref_high=0.5 (50%), whale_ref=10k).

Converting subscores to 0–100 and weighting

Subscores from 0–1 to 0–100: score = round(raw \* 100)

Total Risk Score (0–100, high = risky)

RISK =
0.30 _ LQ + // Likidite en kritik
0.25 _ ST + // Stabilite (çöküş/oynaklık)
0.20 _ YS + // Getiri sürdürülebilirliği
0.15 _ CN + // Konsantrasyon
0.10 \* MO // Son akış/momentum

Bu ağırlıklar A hedefi için güvenli defaults. B/C seviyesinde TF.js veya daha gelişmiş öğrenme (LightGBM/GLM) ile optimize edilebilir.

Label (rozet) eşikleri
• 0–30 → Low (yeşil)
• 31–60 → Medium (amber)
• 61–100 → High (rose)

Açıklama cümlesi (insan okunur)
• “Risk çoğunlukla düşük TVL ve 30 gün TVL düşüşü %18 olduğu için yükseldi. APR istikrarlı.”
• Bunu üretmek için en yüksek 2 alt bileşeni ve o bileşenin içinde etkili 1–2 özelliği seçip kısa metin hazırla.

⸻

4.  Eksik veri / outlier politikası
    • Veri yoksa o bileşenin ağırlığını diğerlerine oransal dağıt.
    • Aykırı değerleri winsorize (ör. 1. ve 99. persentile kırp).
    • Çok küçük TVL (< 10k) ise minimum taban riski (örn. +10 puan) ekle.

        Flowchart (ASCII)
        [Input Data]

    APR, APY, TVL_now, VOL_24h, Participants,
    TVL_7/30/90, APR_30/90, VOL_30
    |
    v
    [Feature Engineering]

- depth, turnover, participation
- TVL drawdown, VOL stdev, trend7
- APR level/vol/decay, APR↔APY gap
- low participants, whale proxy
- inflow 7d/30d
  |
  v
  [Sub-scores (0..100)]
  LQ ST YS CN MO
  | | | | |
  +---- weighted sum (0.30/0.25/0.20/0.15/0.10)
  |
  v
  [Total Risk Score 0..100]
  |
  +--> Label: Low / Medium / High
  |
  +--> Explanation (top drivers)

################################# PROMPT #######################
risk_model:

version: "1.0"
description: "Deterministic Yield Risk Score (0–100, higher = riskier). Uses only pool metrics you already have."
inputs:
required: - APR_now # number (e.g., 0.123 for 12.3%) - APY_now # number - TVL_now # USD number - VOL_24h # USD number - Participants # integer - TVL_7: [number] # last 7 daily TVL points (oldest -> latest) - TVL_30: [number] - TVL_90: [number] - APR_30: [number] # last 30 daily APR points - APR_90: [number] - VOL_30: [number] # last 30 daily volume points
refs: # tune per network once (safe defaults below)
TVL_ref_high: 10000000 # $10M (depth good if near this or above)
turn_ref: 0.20 # 24h volume / tvl considered healthy
part_ref_high: 1000 # many users
part_ref_low: 50 # low user count
apr_ref_high: 0.50 # 50% APR considered very high
whale_ref_usd: 10000 # volume per participant threshold
slope_ref: 0.01 # ~1% of current TVL per 7d as slope norm
math_helpers:
clamp01: "min(1, max(0, x))"
avg: "sum(xs)/len(xs)"
stdev: "sqrt(avg((x-avg(xs))^2)) / max(1e-9, abs(avg(xs)))" # normalized stdev
max_drawdown: |
peak=xs[0]; dd=0;
for x in xs: peak=max(peak,x); dd=max(dd,(peak-x)/max(peak,1e-9));
return dd
slope: | # simple linear regression slope over index 0..n-1
n=len(xs); i=0..n-1;
b = cov(i,xs)/var(i); return b / max(1e-9, xs[-1]) # normalized by last value
sub_scores: # each 0–100 (higher = riskier)
LQ: # Liquidity Risk
formula: |
depth = clamp01( log10(TVL_now) / log10(TVL_ref_high) );
turn = clamp01( (VOL_24h/TVL_now) / turn_ref );
part = clamp01( Participants / part_ref_high );
raw = 0.5*(1-depth) + 0.3*(1-turn) + 0.2*(1-part);
return round(raw*100);
ST: # Stability Risk
formula: |
dd30 = clamp01( max_drawdown(TVL_30) );
dd90 = clamp01( max_drawdown(TVL_90) );
volS = clamp01( stdev( VOL_30 ) );
tr7 = slope(TVL_7); neg7 = clamp01( tr7 < 0 ? -tr7/slope_ref : 0 );
raw = 0.35*dd30 + 0.25*dd90 + 0.25*volS + 0.15*neg7;
return round(raw*100);
YS: # Yield Sustainability Risk
formula: |
apr_lvl = clamp01( APR_now / apr_ref_high );
apr_vol30 = clamp01( stdev(APR_30) );
apr_vol90 = clamp01( stdev(APR_90) );
apr_decay = clamp01( (avg(APR_30[-7:]) - avg(APR_30)) / max(1e-9, avg(APR_30)) );
gap = clamp01( (APY_now - APR_now) / max(1, APR_now) );
raw = 0.35*apr_lvl + 0.20*apr_vol30 + 0.15*apr_vol90 + 0.20*apr_decay + 0.10*gap;
return round(raw*100);
CN: # Concentration Risk
formula: |
lowp = clamp01( part_ref_low / max(1, Participants) );
whale = clamp01( (VOL_24h / max(1,Participants)) / whale_ref_usd );
raw = 0.6*lowp + 0.4*whale;
return round(raw*100);
MO: # Momentum / Outflow Risk
formula: |
inf7 = (TVL_7[-1] - avg(TVL_7)) / max(1e-9, avg(TVL_7));
inf30 = (TVL_30[-1] - avg(TVL_30)) / max(1e-9, avg(TVL_30));
out7 = clamp01( max(0, -inf7) );
out30 = clamp01( max(0, -inf30) );
raw = 0.6*out7 + 0.4*out30;
return round(raw*100);
weights: # final weighted sum
LQ: 0.30w
ST: 0.25
YS: 0.20
CN: 0.15
MO: 0.10
total_score: |
score = 0.30*LQ + 0.25*ST + 0.20*YS + 0.15*CN + 0.10*MO;
return round(score) # 0..100 (higher = riskier)
label_thresholds:
low: [0, 30]
medium: [31, 60]
high: [61, 100]
explanation:
top_k: 2 # include top 2 drivers
templates: - key: LQ
text: "Low liquidity depth and/or low turnover increased risk." - key: ST
text: "Large recent drawdown or high volatility increased risk." - key: YS
text: "Unusually high/unstable APR/APY reduced sustainability." - key: CN
text: "Few participants / whale-dominated activity observed." - key: MO
text: "Net outflows dominate in recent days."
missing_data_policy:
redistribute_weights: true # if a sub-score cannot be computed, re-normalize remaining weights
winsorize_percentiles: [0.01, 0.99] # outlier clamp on series
floor_bonus_small_tvl:
threshold_usd: 10000
add_points: 10
output:
fields: - total_score # 0..100 - label # Low | Medium | High - subscores: { LQ, ST, YS, CN, MO } # each 0..100 - drivers: [ "text_reason_1", "text_reason_2" ] # from templates by top subscores
