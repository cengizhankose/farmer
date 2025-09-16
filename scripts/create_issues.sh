#!/usr/bin/env bash
set -euo pipefail

REPO="cengizhankose/stacks-yield-agg"

# helper: milestone id bul
ms() {
  gh api -H "Accept: application/vnd.github+json" \
    "/repos/$REPO/milestones?state=open" | jq -r ".[] | select(.title==\"$1\") | .number"
}

MS1=$(ms "Hackathon Day 1")
MS2=$(ms "Hackathon Day 2")
MS3=$(ms "Hackathon Day 3")
MS4=$(ms "Hackathon Day 4")
MS5=$(ms "Hackathon Day 5")

create_issue() {
  local title="$1"
  local body="$2"
  local labels="$3"
  local milestone="$4"
  gh issue create -R "$REPO" --title "$title" --body "$body" --label $labels --milestone "$milestone" >/dev/null
  echo "✓ $title"
}

# -------- FE ISSUES --------

create_issue "[FE] Proje iskeleti ve routing" "$(cat <<'MD'
**Amaç**  
Next.js tabanlı web iskeleti ve sayfa rotaları.

**Kapsam**
- [ ] Next.js init (TS, ESLint/Prettier)
- [ ] Sayfalar: `/opportunities`, `/opportunities/[id]`, `/portfolio`
- [ ] Minimal layout + nav

**Acceptance**
- [ ] Dev/build çalışır
- [ ] Route’lar erişilebilir
MD
)" "area:frontend,type:task,priority:high" "$MS1"

create_issue "[FE] Stacks wallet connect + chain guard + read-only fallback" "$(cat <<'MD'
**Amaç**  
Stacks cüzdan bağlantısı, chain doğrulama ve read-only fallback.

**Kapsam**
- [ ] Leather/Hiro entegrasyonu
- [ ] chainId kontrolü → uyumsuzsa read-only banner
- [ ] Connect/Disconnect stabil state

**Acceptance**
- [ ] Bağlan/Çıkış akışı stabil
- [ ] Yanlış chain → read-only mod
MD
)" "area:frontend,type:task,priority:high" "$MS1"

create_issue "[FE] Opportunity List UI (APR/APY normalize + risk + lastUpdated)" "$(cat <<'MD'
**Amaç**  
Fırsat listesi: normalize APR/APY, risk etiketi, veri kaynağı/timestamp.

**Kapsam**
- [ ] Card/tablo render
- [ ] APR/APY normalize gösterim
- [ ] Risk etiketi (Low/Med/High)
- [ ] Data source & lastUpdated badge
- [ ] Filtre: chain/protocol/risk

**Acceptance**
- [ ] Gerçek adapter verisi listelenir
- [ ] Filtre/arama temel çalışır
MD
)" "area:frontend,type:feature,priority:high" "$MS2"

create_issue "[FE] Opportunity Detail + Net Getiri (beta) gösterimi" "$(cat <<'MD'
**Amaç**  
Detay ekranı ve basit net-getiri projeksiyonu (beta).

**Kapsam**
- [ ] APR/APY breakdown, reward token, TVL
- [ ] Amount input + beta net-getiri satırı

**Acceptance**
- [ ] Detayda tüm alanlar görünür
- [ ] Beta hesaplanmış satır gösterilir
MD
)" "area:frontend,type:feature" "$MS2"

create_issue "[FE] Deposit CTA — A: protokole yönlendirme" "$(cat <<'MD'
**Amaç**  
İlk aşamada orijinal protokole yönlendirme.

**Kapsam**
- [ ] Deposit → dış protokol sayfası/tx flow
- [ ] Tooltip: “B (tek tık router) yakında”

**Acceptance**
- [ ] Dış yönlendirme açık ve hatasız
MD
)" "area:frontend,type:feature" "$MS2"

create_issue "[FE] Deposit CTA — B: Router ile tek tık (testnet)" "$(cat <<'MD'
**Amaç**  
Router kontratı ile tek tık deposit (testnet).

**Kapsam**
- [ ] `routeDeposit(token, amount, protocolId, minOut)`
- [ ] Allowance UI flow (approve → route)
- [ ] Tx state: pending/success/error + explorer link

**Acceptance**
- [ ] Canary tx başarıyla tamamlanır
- [ ] Explorer linki UI’da görünür
MD
)" "area:frontend,type:feature,priority:high" "$MS3"

create_issue "[FE] Portfolio/Dashboard (temel)" "$(cat <<'MD'
**Amaç**  
Portföy görünümü: son yönlendirmeler + tahmini getiri.

**Kapsam**
- [ ] Son yönlendirmeler listesi
- [ ] Tahmini getiri (APR * principal * days/365)
- [ ] Empty/error state

**Acceptance**
- [ ] En az 1 gerçek işlem görüntülenir
MD
)" "area:frontend,type:feature" "$MS3"

create_issue "[FE] Multichain “disabled preview” (ETH/SOL)" "$(cat <<'MD'
**Amaç**  
Diğer zincir fırsatlarını disabled kartlar olarak göstermek.

**Kapsam**
- [ ] Filtreler: Stacks | Ethereum | Solana
- [ ] Non-Stacks kartları disabled + tooltip

**Acceptance**
- [ ] Disabled UX net ve açıklayıcı
MD
)" "area:frontend,type:feature" "$MS4"

create_issue "[FE] Güvenlik/Şeffaflık UI (NFA, stale, error boundaries)" "$(cat <<'MD'
**Amaç**  
Uyarı ve şeffaflık bileşenleri.

**Kapsam**
- [ ] NFA/BETA banner
- [ ] Stale data badge (>X dk)
- [ ] Error boundaries + retry

**Acceptance**
- [ ] Uyarılar tetiklenir ve görünür
MD
)" "area:frontend,type:task" "$MS4"

create_issue "[FE] Demo Polish (typography, onboarding tooltip’ler)" "$(cat <<'MD'
**Amaç**  
Sunum öncesi görsel ve akış polisajı.

**Kapsam**
- [ ] Tipografi/spacing/ikon düzeni
- [ ] Kısa onboarding tooltip’ler

**Acceptance**
- [ ] Demo akışı tek seferde akıcı
MD
)" "area:frontend,type:chore" "$MS5"

# -------- BE ISSUES --------

create_issue "[BE] Router Contract Skeleton (Allowlist/Pausable/Reentrancy/Events/perTxCap)" "$(cat <<'MD'
**Amaç**  
Non-custodial router kontrat iskeleti.

**Kapsam**
- [ ] `routeDeposit(token, amount, protocolId, minOut)`
- [ ] Allowlist mapping (`protocolId -> target`)
- [ ] Pausable, ReentrancyGuard, per-tx cap
- [ ] Events: `Deposited(user, token, amount, protocolId, txRef)`

**Acceptance**
- [ ] Compile ok
- [ ] Happy path unit testi yeşil
MD
)" "area:backend,area:contracts,type:feature,priority:high" "$MS1"

create_issue "[BE] Router Unit Tests (pause, allowlist, minOut, amount=0)" "$(cat <<'MD'
**Amaç**  
Router için temel güvenlik testleri.

**Kapsam**
- [ ] pause sırasında revert
- [ ] allowlist dışı protokol revert
- [ ] minOut sağlanmazsa revert
- [ ] amount=0 revert

**Acceptance**
- [ ] Tüm testler yeşil + coverage raporu
MD
)" "area:backend,type:test,priority:high" "$MS2"

create_issue "[BE] Per-tx Cap testi + Event assertion" "$(cat <<'MD'
**Amaç**  
Operasyonel limit ve event doğrulaması.

**Kapsam**
- [ ] per-tx cap ihlal revert
- [ ] Event alanları assert

**Acceptance**
- [ ] Testler yeşil
MD
)" "area:backend,type:test" "$MS4"

create_issue "[BE] Deploy Scripts + Testnet Canary + Explorer Links" "$(cat <<'MD'
**Amaç**  
Testnet deploy ve canlı canary işlem.

**Kapsam**
- [ ] Deploy script (env/profiles)
- [ ] Testnet deploy
- [ ] Küçük tutarlı canary tx

**Acceptance**
- [ ] Explorer linkleri README’de
- [ ] FE’ye ABI+addr teslim
MD
)" "area:backend,type:release,priority:high" "$MS3"

create_issue "[BE] Adapter Arayüzü (normalize) + Mock" "$(cat <<'MD'
**Amaç**  
Adapter interface ve mock veri sağlayıcı.

**Kapsam**
- [ ] `Adapter` interface: `list()/detail(id)`
- [ ] `Opportunity` type alanları
- [ ] Mock provider (sabit veri)

**Acceptance**
- [ ] FE mock adapter’dan veri çekiyor
MD
)" "area:data,type:feature" "$MS1"

create_issue "[BE] ALEX Adapter — list/detail + normalize APR/APY" "$(cat <<'MD'
**Amaç**  
ALEX API/SDK entegrasyonu ve normalize.

**Kapsam**
- [ ] APR/TVL/ödül token çek
- [ ] Normalize APR/APY
- [ ] Risk etiketi kural seti

**Acceptance**
- [ ] FE list & detail gerçek veri gösteriyor
MD
)" "area:data,type:feature,priority:high" "$MS2"

create_issue "[BE] Arkadiko Adapter — list/detail + normalize" "$(cat <<'MD'
**Amaç**  
Arkadiko entegrasyonu ve normalize.

**Kapsam**
- [ ] API/SDK bağla
- [ ] Normalize + risk etiketi

**Acceptance**
- [ ] FE iki protokol verisini de görebiliyor
MD
)" "area:data,type:feature" "$MS2"

create_issue "[BE] Risk/Normalize Utils + lastUpdated/source" "$(cat <<'MD'
**Amaç**  
APR→APY yardımcıları, risk label helper, meta alanlar.

**Kapsam**
- [ ] APR→APY yardımcıları
- [ ] risk label helper
- [ ] source ve lastUpdated alanları

**Acceptance**
- [ ] FE badge’leri doğru dolduruyor
MD
)" "area:data,type:task" "$MS2"

create_issue "[BE] External Multichain Preview Feed (disabled)" "$(cat <<'MD'
**Amaç**  
ETH/SOL fırsatlarını API-only alıp disabled göstermek.

**Kapsam**
- [ ] Dış API fetch
- [ ] Normalize → `disabled: true`

**Acceptance**
- [ ] FE disabled kartları bu feed ile render eder
MD
)" "area:data,type:feature" "$MS4"

create_issue "[BE] SECURITY.md + Threat Model (kısa) + ROADMAP.md" "$(cat <<'MD'
**Amaç**  
Güvenlik ve roadmap dokümantasyonu.

**Kapsam**
- [ ] CEI pattern, reentrancy notu
- [ ] Per-tx cap & pause stratejisi
- [ ] Upgrade path

**Acceptance**
- [ ] Dosyalar repo’da ve okunaklı
MD
)" "area:backend,type:docs" "$MS4"

create_issue "[BE] README.md (deploy, env, explorer linkleri, demo akışı)" "$(cat <<'MD'
**Amaç**  
Hızlı kurulum ve demo kılavuzu.

**Kapsam**
- [ ] Deploy komutları
- [ ] Env örnekleri
- [ ] Explorer linkleri ve demo adımları

**Acceptance**
- [ ] Yeni geliştirici 10 dk’da ayağa kaldırır
MD
)" "area:backend,type:docs" "$MS5"

echo "All issues created."
