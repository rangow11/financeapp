# Finance Management — PWA

نسخه پایه Mobile-first اپ مدیریت مالی.

## اجرا
فایل‌ها را روی یک static server اجرا کنید (برای Service Worker، `file://` مناسب نیست).

مثلاً:
`python -m http.server 8080`

سپس:
`http://localhost:8080`

## ساختار
- index.html — Shell و صفحات
- styles.css — Theme و UI
- app.js — Navigation، Swipe و Theme
- manifest.webmanifest — PWA
- sw.js — Offline cache

## مرحله بعد
جزئیات داشبورد، سپس تقویم، خودرو، وام و تنظیمات به‌صورت ماژولار اضافه شوند.
