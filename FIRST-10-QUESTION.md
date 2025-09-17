# Yield Farming Aggregator – 10 Kilit Soru & Cevaplar

## 1. Hedef Zincirler & Protokoller

**Soru:** Stacks üzerine mi odaklanıyoruz yoksa multichain mi?
**Cevabın:** İlk etapta hackathon için **Stacks odaklı** (ALEX, Arkadiko gibi).
Hackathon sonrası süreçte proje **multichain yapıya** (EVM/Solana + Stacks) evrilecek.

---

## 2. Güven Modeli ve Fon Akışı

**Soru:** MVP’de güven modelimiz ne olacak? (Advisor / Router / Vault)
**Cevabın:** **A → B → C kademeli plan.**

* Hackathon’da **Router kontratı (B)** yazılacak (tek tık deneyimi + strong selling point).
* Önce A özellikleri ile başlanacak, sonra router’a geçilecek, en sonunda Vault’a (C) evrilecek.

---

## 3. MVP Kullanıcı Akışı

**Soru:** Minimum hangi ekranlar olmalı?
**Cevabın:** **Gelişmiş senaryo** seçilmeli (göz boyamak için).

* Wallet connect
* Opportunities list
* Opportunity detail
* Deposit flow
* Portfolio/Dashboard (yatırımlar + tahmini getiri)

---

## 4. Veri Beslemeleri & Tazelik

**Soru:** Verileri nasıl sağlayacağız? (Hazır API / Kendi indexer / Hibrit)
**Cevabın:** Hackathon için **hazır API/SDK (A)** kullanılacak.
Ama sunumda roadmap olarak mutlaka **hibrit model (C)** ve ileride kendi indexer’ımızı anlatacağız.

---

## 5. Getiri Standardizasyonu & Risk

**Soru:** APR/APY ve risk skorlarını nasıl göstereceğiz?
**Cevabın:** Hackathon’da **A (normalize APR/APY + basit risk etiketi)** kesin olacak.
Ama plan: **B (gas & net kazanç)** ve **C (risk scoring)** özellikleri de eklenebilir veya roadmap’te sunulacak.

---

## 6. Sözleşme Mimarisi

**Soru:** Hackathon’da kontrat hedefimiz ne olmalı?
**Cevabın:** **Router kontratı (B)** mutlaka yazılmalı.
“**Kendi kontratımızı yazdık**” demek jüri için çok güçlü selling point olacak.

---

## 7. Zincirler Arası Yürütme

**Soru:** Hackathon’da multichain vizyonunu nasıl göstermeliyiz?
**Cevabın:** **B seçeneği** → Stacks çalışacak, ama Ethereum/Solana fırsatlarını **disabled preview** olarak listeye sokacağız.
Sunumda “ileride bridge + multichain router” vizyonunu anlatacağız.

---

## 8. Güvenlik & Test Planı

**Soru:** Router kontratında minimum hangi güvenlik önlemleri ve testler olmalı?
**Cevabın:**

* Kontrat: **Allowlist + Pausable + ReentrancyGuard + per-tx cap + MinOut**.
* Unit tests: happy path, pause, allowlist dışı, minOut, amount=0, per-tx cap, event assert.
* Testnet canary tx + explorer link demo’da gösterilecek.
* Frontend: chainId check, read-only fallback, lastUpdated badge, NFA/BETA disclaimer.

---

## 9. Monetizasyon & Ücretler

**Soru:** Gelir modeli nasıl olacak?
**Cevabın:** **(A + C) kombinasyonu**.

* Başlangıçta router üzerinden **routing fee** (%0.5–1) + referral anlaşmaları.
* Vault geldiğinde **performance fee** (%10–15).
* İleride Pro subscription (alert, auto-rebalance, gelişmiş risk).

---

## 10. 5 Günlük Teslim Planı

**Soru:** Hackathon’da 5 gün için net yol haritası ne olmalı?
**Cevabın:**

* **Gün 1:** Router kontrat skeleton + FE skeleton + mock adapter.
* **Gün 2:** Gerçek API (ALEX/Arkadiko) + normalize APR/APY + risk etiketi + unit tests.
* **Gün 3:** Router entegrasyonu (tek tık deposit) + portfolio dashboard + testnet canary tx.
* **Gün 4:** Multichain preview (disabled) + SECURITY.md + per-tx cap test.
* **Gün 5:** Demo polish + mobil vitrin + sunum slaytları.

---

# 📌 Sonuç

* Hackathon’da **Stacks + Router kontratı** ile çalışan MVP çıkacak.
* UX: **6 ana ekran + deposit flow modal**.
* Veri: **API/SDK**, roadmap’te indexer.
* Monetizasyon: **routing fee + referral**, roadmap’te vault + performance fee.
* Sunum: “**A’dan C’ye** kademeli gelişim” + **multichain vizyonu** + **güvenlik hikayesi**.

---

Cengo, istersen bu dokümanı ben sana Markdown formatında **repo’nun `docs/10-questions.md`** dosyası gibi direkt kullanılacak hale de uyarlayayım. Bunu ister misin?
