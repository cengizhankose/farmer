# Leather Wallet Entegrasyonu — En Hızlı Yol (Hackathon Sürümü)

Bu doküman, minimum adım ve bağımlılıkla Leather Wallet’ı Next.js (apps/web) içine bağlamak için hazırlanmıştır. Mevcut proje zaten temel entegrasyonu içerir; aşağıdaki adımlar sadece hızlı kullanım ve kontrol listesidir.

## 1) Gerekli Bilgi (Özet)
- Ek paket yok: Doğrudan `window.LeatherProvider` üzerinden çalışıyoruz.
- Tek çağrı: Adresleri almak için `getAddresses` (mevcut bağlan butonu bunu kullanır).
- Ağ tespiti: STX adres prefix’inden (SP=mainnet, ST=testnet) otomatik belirlenir.
- Ağ uyuşmazlığı uyarısı: Header altındaki banner’da gösterilir.

## 2) Projedeki Hazır Altyapı
- Dosya: `apps/web/contexts/WalletContext.tsx`
  - Sağladıkları:
    - `installed`: Leather kurulu mu?
    - `connecting`: Bağlantı işlemi sürüyor mu?
    - `stxAddress` / `btcAddress`: Cüzdan adresleri
    - `connect()` / `disconnect()`
    - `network`: `mainnet` | `testnet` (STX adresinden türetilir)
    - `expected`: Beklenen ağ (`testnet` varsayılan)
    - `networkMismatch`: Ağ uyumsuzluğu var mı?
- Kullanım: `useWallet()` ile bu değerlere erişebilirsiniz.

## 3) Hızlı Kullanım Örneği
Aşağıdaki örnek, herhangi bir sayfada bağlan/çıkış ve durum göstermek için yeterlidir.

```tsx
"use client";
import { useWallet } from "@/contexts/WalletContext";

export function ConnectBox() {
  const { installed, connecting, stxAddress, connect, disconnect, networkMismatch, expected } = useWallet();

  if (!installed) {
    return (
      <button onClick={() => window.open("https://leather.io", "_blank")}>Install Leather</button>
    );
  }

  return (
    <div>
      {networkMismatch && (
        <div>Network mismatch. Expected: {expected}</div>
      )}

      {stxAddress ? (
        <>
          <div>Connected: {stxAddress}</div>
          <button onClick={disconnect}>Disconnect</button>
        </>
      ) : (
        <button onClick={() => void connect()} disabled={connecting}>
          {connecting ? "Connecting…" : "Connect Leather"}
        </button>
      )}
    </div>
  );
}
```

Bu bileşen, proje içindeki `Header` ile aynı davranışı gösterir; isterseniz başka bir sayfaya da kolayca ekleyebilirsiniz.

## 4) Çalışma Mantığı (Kısaca)
- Bağlan: `window.LeatherProvider.request("getAddresses", {})` çağrılır, dönen adresler localStorage’a yazılır.
- Ağ Tespiti: STX adres prefix’i SP → `mainnet`, ST → `testnet`.
- Çıkış: Local storage temizlenir (basit seans sıfırlama).

## 5) Hızlı Kontrol Listesi
- Leather yüklü mü? (kurulu değilse install linki açılır)
- Bağlanınca STX adresi geliyor mu?
- `networkMismatch` uyarısı doğru anda çıkıyor mu?
- Yenilemeden sonra adresler (localStorage) geri yükleniyor mu?

## 6) Sık Karşılaşılan Sorunlar
- “Leather not found”: Tarayıcıda Leather kurulu değil → `https://leather.io`
- Adres dönmüyor: Extension izinleri/oturumu kapalı olabilir → Extension’ı açıp tekrar deneyin.
- Ağ uyumsuzluğu: Leather içinde ağınızı `Settings → Network` üzerinden değiştirin, sayfayı yenileyin.

## 7) İleri Aksiyonlar (İsteğe Bağlı)
Hackathon’da hız için pas geçtik; sonrası için öneriler:
- İşlem akışları (deposit/withdraw) için uygun `request(...)` metodları ekleyin.
- UI’de IBM Plex Mono (teknik), Clash Display (başlıklar), Inter (gövde) tipografisini sürdürün.
- Test eklemek isterseniz basit smoke testlerle başlayın (butonların state geçişleri vs.).

---
Kısa özet: Bu proje, Leather’ı en hızlı şekilde bağlamak için gerekli tüm temel parçaları içerir. `useWallet()` ile bağlan/çıkış, adres ve ağ bilgisini tek hamlede yönetebilirsiniz.

