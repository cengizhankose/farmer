https://phantom.com ' da yer alan css js ve kutuphane ozelliklerinden calcaz.
Bu animasyonların genel ismi
• Scroll-trigger animations
• Reveal on scroll
• Daha teknik: IntersectionObserver + animation timeline ya da kütüphane bazlı isimler:
• GSAP ScrollTrigger
• Locomotive Scroll
• Framer Motion + useInView
• ScrollMagic (daha eski)

Phantom özelinde, elementler aşağı indikçe opacity/transform ile içeri kayıyor, bazen spring easing veriliyor → bu yüzden “bubble/zıplama” gibi görünüyor. Bu efektin adı genelde spring easing veya elastic/bounce easing.

Yani: Phantom’daki olayın adı scroll-triggered spring animations.
CSS reset dosyanda göremiyorsun çünkü kodlar JS animation kütüphanesinde.

bunu bizim nextjs kodlarina lutfen uygun sekilde yap dene.
