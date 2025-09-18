Ne Nerede Gösterilmeli? (Net Plan)

A) Sayfa üstü (Above-the-fold) — Mini Summary

Göster:
• Total Portfolio Value
• Net PnL
• 24h Change

Küçük, tek satır “mini KPI bar”. Sadece grafik görünmüyorsa (scroll’da kartın dışına çıkınca) gösterilsin. Grafik görünürken gizli.
→ Böylece tekrarı bitiriyoruz, bağlamı da kaybetmiyoruz.

B) Portfolio Overview (Büyük kart + grafik)

Kalacaklar (header içinde):
• Toggle: Total / Net PnL / 24h Change (seri görünürlüğü)
• KPI şeridi (3 kutu):
• Total Portfolio (son değer)
• Net PnL (son değer, ± renkli)
• 30D % (veya seçilen aralığın yüzdesi)

Grafik: Composed (Area=Total, Line=PnL, Bar=24h).
Tooltip: Hover’da bu üç serinin aynı tarihteki değeri.

Kaldır (buradan):
• Total Principal
• Avg. APR
• Estimated Total Return

Bunlar zaman serisi değil; grafiğin işini bozuyor ve tekrara giriyor.

C) Account Summary (grafiğin ALTINDA ince bant)

Buraya statik/strüktürel metrikleri taşı:
• Total Principal (yatırılan ana para)
• Weighted Avg. APR (pozisyon ağırlıklı)
• Estimated Total Return (projeksiyon, 30/90/365D toggle ile)

“Estimated Total Return” bir Projection kartı olarak da ayrılabilir (Rewards/Projections bölümüne).

D) Rewards Hub (zaten harika)

Aynen kalsın: token dağılımı ve toplam birikim. Projeksiyon istersen buraya “Projected weekly/monthly” alt satırı eklenebilir.

⸻

Etkileşim Kuralları 1. Intersection Observer:
• Portfolio Overview grafiği viewport’taysa: mini summary gizli.
• Grafikten çıkınca: mini summary sticky olarak görünür. 2. Tek zaman aralığı: 24h/7D/30D toggle olsun. KPI’lar ve grafik aynı aralığa bağlı kalsın (tutarlı görünür). 3. Tipografi oranı:
• Başlıklar: Clash Display.
• KPI değeri: text-lg (md’de), label: text-[11px] uppercase.
• Grafikte legend/eksentik yazılar: text-xs.
• Tabular-nums tüm sayılara.

⸻

Hızlı Uygulama Check-list
• Body’deki “Total Portfolio Value / Net PnL / 24h Change” kartlarını kaldır.
• Bu üçlüyü Portfolio Overview içindeki KPI şeridine bırak.
• Total Principal / Avg APR / Estimated Total Return → Account Summary ince bant (grafiğin altında).
• Mini Summary oluştur ve IntersectionObserver ile görünürlüğünü bağla.
• Toggle zaman aralığı → grafiğe ve KPI’lara aynı state’den bağlan.

⸻

Mini Summary (Sticky) — örnek iskelet
// components/MiniSummary.tsx
"use client";
import { useEffect, useRef, useState } from "react";

export default function MiniSummary({ total, pnl, chg24h }: { total:number; pnl:number; chg24h:number }) {
const [show, setShow] = useState(false);
// sayfada grafiğe ref: <section id="overview">
useEffect(() => {
const el = document.getElementById("overview");
if (!el) return;
const io = new IntersectionObserver(
([e]) => setShow(!e.isIntersecting),
{ root: null, threshold: 0.2 }
);
io.observe(el);
return () => io.disconnect();
}, []);
if (!show) return null;
return (

<div className="sticky top-0 z-40 bg-white/80 backdrop-blur">
<div className="mx-auto max-w-6xl px-6 py-2 grid grid-cols-3 gap-3">
<K label="Total">{fmtUsd(total)}</K>
<K label="Net PnL" color={pnl>=0?'text-emerald-600':'text-rose-600'}>
{(pnl>=0?'+$':'-$')+fmtNum(Math.abs(pnl))}
</K>
<K label="24h Change">{(chg24h>=0?'+$':'-$')+fmtNum(Math.abs(chg24h))}</K>
</div>
</div>
);
}
function K({label, children, color}:{label:string; children:any; color?:string}) {
return (
<div>
<div className="text-[11px] uppercase tracking-wide text-neutral-500">{label}</div>
<div className={`tabular-nums font-semibold ${color??'text-neutral-900'}`}>{children}</div>
</div>
);
}
const fmtUsd = (n:number)=>'$'+Intl.NumberFormat().format(n);
const fmtNum = (n:number)=>Intl.NumberFormat().format(n);
Account Summary (grafik altında ince bant)

<section className="mt-4 rounded-2xl bg-white/60 ring-1 ring-black/5 p-4 grid grid-cols-3 gap-3 max-md:grid-cols-1">
  <K label="Total Principal">$100.00</K>
  <K label="Weighted Avg. APR">12.3%</K>
  <K label="Estimated Total Return (30D)">$0.03</K>
</section>
Sonuç (Ne görür kullanıcı?)
	•	Üstte yalın: Total, Net PnL, 24h — grafiğe girince kaybolur (tek görünüm).
	•	Overview kartı: Grafik + KPI’lar (aynı aralığa bağlı).
	•	Statik metrikler (principal, avg apr, est. return) grafiğin altında; bilgi mimarisi temiz.
	•	Aşağıdaki Rewards & Positions akışı bozulmadan, üstte tekrar eden hiçbir şey kalmaz.
