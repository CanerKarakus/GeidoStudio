# Değiştirilen Dosyalar Takip Listesi

Bu dosya, yapılan geliştirmeler sonrasında hangi dosyaların değiştiğini veya yeni eklendiğini takip etmek için oluşturulmuştur. Canlı sunucuya (cPanel vb.) veya Github'a aktarım yaparken bu listeyi referans alabilirsiniz.

---

### Son Geliştirmeler (Toplu ve Güncel Liste)
**Özellikler:** Veri Tabanı Düzenleyici, SEO & Analitik, E-Posta Şablonları, Çoklu Dil Desteği, Proje Takibi, Bakım Modu ve Tasarım/Hata Çözümleri

**Frontend (Github/Netlify):**
- `[Değişti]` package.json
- `[Değişti]` src/main.jsx
- `[Değişti]` src/App.jsx
- `[Değişti]` src/api/db.js
- `[Değişti]` src/store/cmsStore.js
- `[Değişti]` src/components/AdminLayout/AdminLayout.jsx
- `[Değişti]` src/pages/Admin/AdminDashboard.jsx
- `[Değişti]` src/components/SEO/SEO.jsx
- `[Değişti]` src/components/Navbar/Navbar.jsx
- `[Yeni]` src/pages/Admin/AdminSEO.jsx
- `[Yeni]` src/pages/Admin/AdminEmails.jsx
- `[Yeni]` src/i18n.js
- `[Yeni]` src/locales/tr/translation.json
- `[Yeni]` src/locales/en/translation.json
- `[Yeni]` src/pages/Tracking/Tracking.jsx
- `[Yeni]` src/pages/Tracking/Tracking.module.scss
- `[Yeni]` src/pages/Admin/AdminTracking.jsx
- `[Yeni]` src/components/MaintenanceScreen/MaintenanceScreen.jsx
- `[Yeni]` src/components/MaintenanceScreen/MaintenanceScreen.module.scss

**Backend (cPanel):**
- `[Değişti]` backend/src/server.js
- `[Değişti]` backend/src/routes/cms.js
- `[Değişti]` backend/src/routes/messages.js
- `[Değişti]` backend/src/routes/newsletter.js
- `[Yeni]` backend/src/routes/analytics.js
- `[Yeni]` backend/src/routes/tracking.js
- `[Yeni]` backend/nodemon.json
