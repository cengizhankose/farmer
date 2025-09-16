## 📌 Özet

Stacks odaklı başlayıp, sonrasında multichain’e genişleyecek bir **Yield Farming Aggregator** geliştiriyoruz.

Amacımız: Kullanıcılara **en iyi yield fırsatlarını** göstermek, tek tıkla yönlendirmek (router kontratı), basit risk skorlarıyla güven yaratmak, ve multichain vizyonunu “preview” olarak göstermek.

5 günlük hackathon boyunca **MVP**:

- Stacks odaklı fırsatlar (ALEX, Arkadiko).
- Router kontratı (non-custodial).
- Normalize APR/APY + basit risk etiketi.
- Portfolio ekranı.
- Multichain “disabled preview”.

---

## 🎯 Hedefler

- **Kısa vadeli (Hackathon)**: Çalışan bir Stacks-based aggregator + kendi router kontratı.
- **Orta vadeli (Sonraki aşama)**: Multichain destek (EVM, Solana), kendi indexer.
- **Uzun vadeli**: Vault yapısı, auto-compounding, performance fee, Pro alert/rebalance sistemi.

---

## 👥 Takım

- **Dev-1**: Frontend + Mobile (React, Expo, Wallet integration, UI/UX).
- **Dev-2**: Backend + Contract (Router contract, adapters, tests, deployment).

---

## 🛠️ Ana Özellikler

1. **Wallet Connect** (Stacks: Leather/Hiro).
2. **Opportunity List** – Normalize APR/APY, risk etiketi, lastUpdated timestamp.
3. **Opportunity Detail** – Breakdown, ödül token bilgisi, gas/net-getiri (beta).
4. **Deposit Flow**
   - A: Orijinal protokole yönlendirme.
   - B: Router kontratı (tek tx).
5. **Portfolio/Dashboard** – Kullanıcı yatırımları + tahmini getiri.
6. **Multichain Preview** – Ethereum/Solana fırsatları **disabled kartlar**.

---

## 🔐 Güvenlik

- **Kontrat seviyesinde**:
  - Allowlist protokol adresleri.
  - Pausable.
  - ReentrancyGuard.
  - Per-tx cap.
  - MinOut/SlippageGuard.
  - Event logging.
- **Testler**: Unit tests (happy path, pause, allowlist, minOut, per-tx cap).
- **Frontend seviyesinde**:
  - ChainId check.
  - Read-only fallback.
  - Data source & lastUpdated etiketi.
  - Risk etiketi + “BETA – not financial advice”.

---

## 💰 Monetizasyon

- **Başlangıç (Hackathon + kısa vadeli)**
  - Router üzerinden %0.5–1 routing fee.
  - Referral/Affiliate anlaşmaları.
- **Sonraki aşama**
  - Vault: performance fee (%10–15).
- **Uzun vadeli**
  - Pro subscription: alert + auto-rebalance + gelişmiş risk skoru.

---

## 📊 Veri Stratejisi

- **Hackathon için**: Hazır protokol API/SDK (ALEX, Arkadiko).
- **Sonrası**: Hibrit model → API + kendi lightweight indexer.
- **Uzun vadeli**: Kendi multichain indexer (TVL, APR sanity, rewards valuation).

---

## 📅 5 Günlük Plan

### Gün 1

- Router kontrat skeleton (Allowlist, Pause, Events).
- FE skeleton: Opportunities list/detail/portfolio.
- Mock adapter.

### Gün 2

- Gerçek veri (ALEX/Arkadiko).
- Normalize APR/APY + risk etiketi.
- Unit tests (pause, allowlist, amount=0).

### Gün 3

- Router entegrasyonu (Stacks testnet).
- Portfolio ekranı (transaction state + tahmini getiri).
- Canary tx → Explorer link.

### Gün 4

- Multichain preview (Ethereum, Solana disabled).
- Güvenlik dokümantasyonu (SECURITY.md).
- Unit test ekleri (per-tx cap, events).

### Gün 5

- Demo hazırlığı (Wallet connect → Opportunity → Router deposit → Portfolio → Multichain preview).
- Sunum slaytları (6–8 slide).
- Mobil vitrin (Expo web & mobile).

---

## 📂 Repo Yapısı

```
/contracts
  Router.clar
  /test
/apps/web
  pages: opportunities, [id], portfolio
  lib/adapters/{alex, arkadiko}.ts
  lib/normalize/{apr, risk}.ts
  components/{OpportunityCard, DepositPanel, PortfolioTable}
/packages/shared
  types/, utils/
SECURITY.md, README.md, ROADMAP.md

```

---

## 📌 Demo Script

1. Wallet bağlanır.
2. Fırsat listesi → normalize APR/APY, risk etiketi.
3. Bir fırsat detayına girilir.
4. Router kontratı ile testnet deposit yapılır (explorer link).
5. Portfolio ekranında işlem görünür.
6. Multichain preview kartları gösterilir.
7. Yol haritası: Vault + Indexer + Multichain + Pro subscription.

---

## 🚀 Roadmap (Hackathon sonrası)

- **Indexer**: kendi lightweight indexer.
- **Vault**: auto-compounding + rebalancing + performance fee.
- **Multichain**: Ethereum + Solana router entegrasyonu.
- **Pro features**: alert, rebalancing sim, gas optimizasyon.

- [x] **Kontrat (Router) – iskelet**
  - `routeDeposit(token, amount, protocolId, minOut)`; **Allowlist**, **ReentrancyGuard**, **Pausable**, **perTxCap**.
  - **Event’ler**: `Deposited(...)`.
  - **Kabul:** Compile + temel unit test “happy path” geçer.
- [x] **Frontend/Web (Next.js)**
  - Sayfalar: `/opportunities`, `/opportunities/[id]`, `/portfolio`.
  - **Wallet connect (Stacks)** + **chain check** + read-only fallback.
  - **Kabul:** Wallet bağlanıyor, listede mock fırsat görünüyor.
- [x] **Data katmanı**
  - **A-planı**: Protokol API/SDK adapter interface’i; ALEX/Arkadiko mock adapter.
  - **Kabul:** Adapter arayüzü hazır; mock APR döner.
- [x] **Adapters (A-planı)**
  - ALEX/Arkadiko’dan **APR, TVL, reward token** çek; **normalize APR/APY**.
  - **Risk etiketi (Low/Med/High)**: basit kural seti (örn. stablecoin = Low, yeni havuz = High).
  - **Kabul:** Listede gerçek APR + risk etiketi + “kaynak/lastUpdated TS”.
- [x] **Kontrat testleri**
  - Unit: allowlist dışı protokol revert, `pause()` sırasında revert, `minOut` sağlanmadığında revert, `amount=0` revert.
  - **Kabul:** Tüm testler yeşil; coverage raporu temel seviyede.
- [x] **UI**
  - Fırsat detayı: **APR/APY breakdown**, ödül token bilgisi.
  - **Deposit CTA (A modeli)**: Şimdilik **orijinal protokole yönlendirme** + “(B: tek-tık yakında)” etiketi.
  - **Kabul:** Detay sayfası tamam; yönlendirme çalışır.
- [x] **Kontrat (Router) → Frontend entegrasyon**
  - Allowance flow; `routeDeposit(...)` çağrısı.
  - **Kabul:** Testnet’te küçük tutarlı **canary tx**; explorer linki demo için hazır.
- [x] **Portfolio/Dashboard**
  - Basit state: Kullanıcının **son yönlendirdiği fırsatlar** + tahmini getiri (APR*principal*days/365).
  - **Kabul:** Portfolio ekranında en az 1 gerçek işlem görünür.
- [x] **UX**
  - **Gas/fee tahmini (B’ye hazırlık)**: Basit proje/en düşük gas yaklaşımı—“beta” etiketi.
  - **Kabul:** Detay sayfasında net getiri “beta” hesap satırı görünür.
- [x] **Multichain önizleme (B seçeneği)**
  - Ethereum/Solana’dan **API-only** fırsatlar: listede **disabled** (tooltip: “Coming soon”).
  - **Kabul:** Liste filtreleri “Stacks | Ethereum | Solana” çalışır; non-Stacks item’lar tıklanınca modal/tooltip.
- [x] **Güvenlik hikayesi**
  - Readme’de: **threat model (short)**, **CEI pattern**, **event log**, **operational limits** (per-tx cap).
  - **Kabul:** Repo’da SECURITY.md + README’de “upgrade path” ve uyarılar.
- [x] **Unit test ekleri**
  - Per-tx cap ihlali revert; event assert.
  - **Kabul:** Yeşil.

## Gün 5 — Demo Hazırlığı + Polisaj

- **Sunum akışı (2–3 dk canlı demo)**
  1. Wallet bağla → **opportunities** (gerçek APR, risk, lastUpdated).
  2. Bir fırsat → **Router ile tek tık deposit** (testnet canary).
  3. **Portfolio**’da işlem görünümü.
  4. **Disabled multichain** kartları göster.
  5. Yol haritası: **Vault (C)** + **Performance fee** + **kendi indexer**.
  - **Kabul:** Tek seferde akıcı demo provası (2 kez ardışık).
- **Pitch slaytı**
  - “(A→B→C) Mimari”, “A-planı data”, “Güvenlik quick-wins”, “Monetizasyon (A+C, sonra C’de perf fee, ileride Pro)”.
  - **Kabul:** 6–8 slayt, görsel temizlik.
- **Mobil vitrin**
  - Expo web/mobil aynı kod tabanı; mobilde portfolio screenshot.
  - **Kabul:** En az 2 gerçek ekran mobilde düzgün.

---

## Görev Dağılımı

- **Dev-2 (Contract/BE)**
  - Router kontratı + unit tests + deploy scripts + explorer linkleri.
  - Protocol adapter arayüzü + 1 gerçek adapter (ALEX) + mock’lar.
- **Dev-1 (FE)**
  - Wallet connect, route UI, list/detail/portfolio sayfaları.
  - Normalize APR, risk etiketi, lastUpdated, disabled multichain UI.

---

## Repo Yapısı (kısa)

```
/contracts
  Router.clar (veya uygun dil)
  /test (unit)
/apps/web (Next/Expo Router web)
  pages: opportunities, [id], portfolio
  lib/adapters/{alex, arkadiko}.ts
  lib/normalize/apr.ts, risk.ts
  components/{OpportunityCard, DepositPanel, PortfolioTable}
/packages/shared
  types/, utils/
SECURITY.md, README.md, ROADMAP.md

```

## Minimum API/SDK Arayüzü

```tsx
type Opportunity = {
  id: string;
  chain: "stacks" | "ethereum" | "solana";
  protocol: string;
  pool: string;
  tokens: string[];
  apr: number;
  apy: number;
  rewardToken?: string;
  tvlUsd?: number;
  risk: "low" | "med" | "high";
  source: "api" | "indexer";
  lastUpdated: number;
  disabled?: boolean;
};
interface Adapter {
  list(): Promise<Opportunity[]>;
  detail(id: string): Promise<Opportunity>;
}
```

## Demo Script (kısa hafıza kartı)

- “Non-custodial router, **tek tık yönlendirme**; **per-tx cap**, **pause**, **reentrancy guard**.”
- “APR/APY normalize + **risk etiketi**; **lastUpdated** ile şeffaflık.”
- “**Disabled multichain preview** ile vizyon: kendi indexer + bridge + vault (performance fee).”

## Riskler & Çözümler

- **Protokol API dalgalanması:** Adapter fallback + stale badge.
- **Cüzdan/chain sorunları:** Read-only mod; disabled deposit; net uyarı.
- **Zaman sıkışması:** Önce A (yönlendirme), sonra B (router entegrasyon); C sadece roadmap.

---

# Yol Haritası (hackathon sonrası, kısa)

- **Indexleme (C-hibrit)**: kendi lightweight indexer (APR sanity checks, rewards token valuation).
- **Vault (C)**: auto-compound + rebalancing; **performance fee**.
- **Pro (B)**: alert sistemi, net-getiri simülasyonu, gas/MEV farkındalığı.
- **Gerçek multichain**: EVM/Solana adapter’larına **router** eşlemeleri; bridge/AA araştırması.
