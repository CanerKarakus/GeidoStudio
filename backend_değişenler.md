# Backend Değişiklikleri - AI Canlı Destek Entegrasyonu

Groq AI API kullanılarak canlı destek sisteminin kurulabilmesi için backend tarafında yapılan değişikliklerin özeti:

## 1. Yeni Paketin Kurulumu
Groq API ile iletişim kurabilmek için `groq-sdk` kütüphanesi backend klasörüne kurulmuştur.
- **Dosya:** `backend/package.json`, `backend/package-lock.json`
- **Eklenen:** `"groq-sdk"`

## 2. Ortam Değişkenleri (Environment Variables)
Groq API anahtarının güvenli bir şekilde saklanabilmesi için `.env.example` dosyası güncellenmiştir.
- **Dosya:** `backend/.env.example`
- **Eklenen:** `GROQ_API_KEY=gsk_your_api_key_here`
- **Yapmanız Gereken:** Gerçek backend sunucunuzun (cPanel/VPS) içindeki `.env` dosyasına Groq API anahtarınızı `GROQ_API_KEY=...` şeklinde eklemelisiniz.

## 3. Yeni Route (API Endpoint) Oluşturuldu
Yapay zeka ile konuşmayı sağlayacak olan ve prompt yönergelerini içeren `ai-chat.js` adında yeni bir backend dosyası oluşturulmuştur.
- **Dosya:** `backend/src/routes/ai-chat.js`
- **İşlevi:** Frontend tarafından gelen sohbet geçmişini alır, asistan promptu ile birleştirerek Groq (Llama3-70b-8192) modeline iletir ve yanıtı döner.

## 4. Ana Sunucuya (Server.js) Yeni Rotanın Eklenmesi
Oluşturulan `ai-chat.js` rotasının aktif edilebilmesi için `server.js` içerisine yönlendirme eklenmiştir.
- **Dosya:** `backend/src/server.js`
- **Eklenen Kod:** `app.use('/api/ai-chat', require('./routes/ai-chat'));`

> Bu değişiklikler sonrası sunucu baştan başlatıldığında (`npm start` veya PM2 restart) yeni AI Chat endpoint'i kullanıma hazır olacaktır.
