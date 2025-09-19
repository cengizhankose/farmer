layout / CSS kaynaklı hata aliyouz.
footer'in hemen uzerinde section backgroundu kaliyor fakat section gorunmuyor.

1. Sebep: Section Yüksekliği

Son section (Live Opportunities) ekranın tamamını doldurmuyor ama altına otomatik min-height verilmiş gibi davranıyor. Yani <section> veya container’ına min-height: 100vh ya da büyük padding-bottom uygulanmış olabilir. Bu yüzden footer’la arasında gereksiz boş alan kalıyor.

⸻

2. Background Renk Kapanmaması

Son section’un arka plan gradient’i aşağıya kadar uzuyor, ama içerik kısa olduğu için içerik bittiğinde “boş gradient alanı” görünüyor. Bu boşluk footer’ın üstünde kocaman bir boş alan gibi duruyor.

⸻

3. Scroll & Görünürlük Problemi

Live Opportunities kısmı margin-top / padding-top ile yukarıya fazla itilmiş olabilir. Bu durumda sayfayı tam aşağı kaydırmadan o bölümün üst kısmı gözükmüyor. Yani footer erken geliyor, section geç başlıyor → arada boşluk kalıyor.

⸻

Çözüm Önerileri

A. Section Yüksekliği
section.live-opportunities {
min-height: auto; /_ 100vh değil _/
padding-bottom: 4rem; /_ sadece makul boşluk _/
}
B. Margin / Padding Düzeltme
section.live-opportunities {
margin-top: 0; /_ fazla itilmiş olabilir _/
padding-top: 2rem;
}
C. Footer’a Oturtma

Footer’ın hemen üstünde boşluk bırakmak istemiyoruz:

main {
display: flex;
flex-direction: column;
min-height: 100vh;
}
main > section:last-of-type {
flex-grow: 1; /_ içerik az olsa bile sayfayı doldurur _/
}
