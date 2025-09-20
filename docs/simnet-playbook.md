# Simnet Playbook — Router + Mock Stack (Clarinet Console)

Bu rehber, `packages/contracts/yield-router` altındaki **router**, **mock-adapter**, **mock-token** ve örnek **mock-stacking adapter** ile, simnet üzerinde uçtan uca test akışlarını nasıl çalıştıracağını anlatır. Router; SIP-010 (sBTC gibi) token’ları allowlist’teki adapter’lara yönlendirir, `min-out` ve güvenlik anahtarlarıyla (owner/paused/per-tx-cap) korunur.&#x20;

## 0) Ön Koşullar

```bash
cd packages/contracts/yield-router
clarinet check
clarinet console
```

> Bu repo’da simnet planı, router + mock adapter + mock stacking + mock token’ı birlikte yayınlar; böylece console, testler ve Vitest aynı varsayımlar ile çalışır.&#x20;

---

## 1) Hızlı Özet: Kim Kimdir?

* **router.clar**
  Amaç: SIP-010 varlıkları allowlist’teki adapter’lara güvenlik kontrolleriyle yönlendirmek; `route-deposit` akışı: config doğrula → token `transfer` → `adapter.deposit` → `min-out` kontrol → `route-deposit`/`adapter-error` event.&#x20;

* **mock-adapter.clar**
  Test adapter’ı: `set-failure` ve `set-skim-ratio` ile hata ve slippage simüle eder; `out = amount - amount*skim/100`. Hata modunda `(err u900)` döner.&#x20;

* **mock-token.clar**
  Minimal SIP-010 yüzeyi (mint/transfer) ile sBTC benzeri davranır; testte bakiyeleri mint edersin.&#x20;

* **adapters/mock-stacking.clar**
  Sabit %5 kesintiyle örnek adapter; gerçek adapter yazarken şablon.&#x20;

---

## 2) Happy Path — Tek İşlemle Yatırım

> Console içindeyken, adresleri kendi simnet adreslerinle değiştir.

### 2.1 Protokolü Allowlist’e Ekle

```clarity
(contract-call? .router allow-protocol u1 'ST...TARGET 'ST...mock-adapter 'ST...mock-token)
```

Owner-only bir ayardır; protokol kaydı yapılır ve ilgili event basılır. &#x20;

### 2.2 Cüzdana Test Token’ı Mint Et

```clarity
(contract-call? .mock-token mint 'ST...WALLET u100000)
```

Mock token, testlerde bakiyeyi doldurmak için kullanılır. &#x20;

### 2.3 Yatırımı Gerçekleştir (route-deposit)

```clarity
(contract-call? .router route-deposit 'ST...mock-token u10000 u1 u0 'ST...mock-adapter)
```

Beklenen: `(ok u<out>)` döner; akış sırasında token transferi, `adapter.deposit` ve `min-out` doğrulaması yapılır; başarılıysa `route-deposit` event’i, aksi halde `adapter-error` event’i gelir.&#x20;

---

## 3) Slippage & Min-Out Senaryoları

### 3.1 Slippage Aç — `min-out` Aşırı Yüksek (Fail Beklenir)

```clarity
(contract-call? .mock-adapter set-skim-ratio u5)
(contract-call? .router route-deposit 'ST...mock-token u10000 u1 u9900 'ST...mock-adapter)
```

`set-skim-ratio` ile çıktıyı düşürürsün; `min-out` yüksek tutulursa router min-out assert’i ile hata döndürür.&#x20;

### 3.2 Slippage Aç — Uygun `min-out` (Pass Beklenir)

```clarity
(contract-call? .router route-deposit 'ST...mock-token u10000 u1 u9400 'ST...mock-adapter)
```

---

## 4) Adapter Hatası (Downstream Failure)

```clarity
(contract-call? .mock-adapter set-failure true)
(contract-call? .router route-deposit 'ST...mock-token u5000 u1 u0 'ST...mock-adapter)
```

`set-failure` açıkken adapter `(err u900)` döndürür; router bunu `adapter-error` yoluna sokar. Reset için:

```clarity
(contract-call? .mock-adapter set-failure false)
(contract-call? .mock-adapter set-skim-ratio u0)
```

&#x20;

---

## 5) Güvenlik Anahtarları — `pause`, `per-tx-cap`, `allowlist`

### 5.1 Pause: Tüm Yatırımları Durdur

```clarity
(contract-call? .router set-paused true)
(contract-call? .router route-deposit 'ST...mock-token u10000 u1 u0 'ST...mock-adapter) ;; ERR-PAUSED
```

Router’ın ana güvenlik anahtarlarından biridir.&#x20;

### 5.2 Per-Transaction Cap: Üst Limit Testi

```clarity
(contract-call? .router set-tx-cap u1000)
(contract-call? .router route-deposit 'ST...mock-token u10000 u1 u0 'ST...mock-adapter) ;; cap aşımı
```

Cap, tek işlem üst limitini korur; testlerde kapsanır.&#x20;

### 5.3 Allowlist Dışı / Kimlik Uyuşmazlığı

* Kayıtlı olmayan `protocol-id` ile çağır → allowlist hatası.
* Kayıtlı adapter/token yerine farklı principal ile çağır → adapter/token mismatch testleri yakalar.&#x20;

---

## 6) Helper View’lar (Konfig Doğrulama)

Test kapsamına giren yardımcı view’lar ile kayıtları okuyup doğrulayabilirsin:

```clarity
;; örnek isimler (gerçek fonksiyon adları sende nasılsa onu kullan)
(contract-call? .router get-protocol-config u1)
(contract-call? .router get-protocol-token u1)
```



---

## 7) Toplu “Kopyala-Yapıştır” Senaryosu (Demo)

```clarity
;; 1) allowlist
(contract-call? .router allow-protocol u1 'ST...TARGET 'ST...mock-adapter 'ST...mock-token)

;; 2) mint
(contract-call? .mock-token mint 'ST...WALLET u100000)

;; 3) happy path
(contract-call? .router route-deposit 'ST...mock-token u10000 u1 u0 'ST...mock-adapter)

;; 4) slippage fail (min-out yüksek)
(contract-call? .mock-adapter set-skim-ratio u5)
(contract-call? .router route-deposit 'ST...mock-token u10000 u1 u9900 'ST...mock-adapter)

;; 5) slippage pass
(contract-call? .router route-deposit 'ST...mock-token u10000 u1 u9400 'ST...mock-adapter)

;; 6) adapter failure
(contract-call? .mock-adapter set-failure true)
(contract-call? .router route-deposit 'ST...mock-token u5000 u1 u0 'ST...mock-adapter)

;; 7) reset
(contract-call? .mock-adapter set-failure false)
(contract-call? .mock-adapter set-skim-ratio u0)

;; 8) pause & cap
(contract-call? .router set-paused true)
(contract-call? .router route-deposit 'ST...mock-token u10000 u1 u0 'ST...mock-adapter)
(contract-call? .router set-paused false)
(contract-call? .router set-tx-cap u1000)
(contract-call? .router route-deposit 'ST...mock-token u10000 u1 u0 'ST...mock-adapter)
```

> Console referans örnekleri ve davranışları test dokümantasyonu ile birebir uyumludur.&#x20;

---

## 8) Mock → Production Geçiş (sBTC / Gerçek Adapter’lar)

| Ne?               | Mock                                  | Üretimde Ne Yapılır?                                                                                    |
| ----------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| SIP-010 token     | `mock-token.clar`                     | `allowed-protocols`’ta token’ı gerçek sBTC principal’ı ile değiştir. Mock’u plandan çıkar.              |
| Adapter           | `mock-adapter`, `mock-stacking`       | Gerçek protokol-spesifik adapter’ları deploy et; `yield-adapter` trait’ini sağladığını doğrula.         |
| Target principals | Simnet deployer                       | Deploy’dan sonra `allow-protocol` ile gerçek `{target, adapter, token}` triple’larını yaz.              |
| Test Data         | `set-skim-ratio`, `set-failure`, mint | Prod’da bu setter’ları kaldır/sınırla; mint akışı upstream SIP-010 (sBTC bridge/mint) tarafından gelir. |

Adım adım migration: adapter’ları deploy et → gerçek SIP-010 (sBTC) referansını kullan → router’ı gerçek principal’larla güncelle → mock’ları plan dışı bırak → `.env`/dokümantasyonları güncelle.&#x20;

---

## 9) Hızlı Sağlık Kontrolleri (CI)

* TS/Vitest: `pnpm --filter @contracts/core test` (happy path, guardrails, adapter/token mismatch, min-out; mock bayraklarıyla davranış simülasyonu).&#x20;
* Clarinet Check: `pnpm contracts:clarinet:check` (derleme ve plan tutarlılığı).&#x20;