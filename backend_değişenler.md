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
Yapay zeka ile konuşmayı sağlayacak olan ve prompt yönergelerini içeren `ai-chat.js` adında yeni bir backend dosyası oluşturulmuştur. Sonrasında Sistem Promptu detaylı şirket verisi ile güncellenmiş ve konuşmayı sonlandırıp mail atan `/end-session` rotası eklenmiştir.
- **Dosya:** `backend/src/routes/ai-chat.js`
- **İşlevi:** Frontend tarafından gelen sohbet geçmişini alır, asistan promptu ile birleştirerek Groq modeline (llama-3.3-70b-versatile) iletir ve yanıtı döner. `/end-session` rotası e-posta bildirimleri atar.

## 4. E-posta Servisi
- **Dosya:** `backend/src/services/emailService.js`
- **Kullanım:** Yeni eklenen `/end-session` rotası içerisinde, konuşma dökümlerinin (`admin@geidostudio.com` ve kullanıcı mailine) gönderilmesi için kullanıldı.

## 5. Ana Sunucuya (Server.js) Yeni Rotanın Eklenmesi
Oluşturulan `ai-chat.js` rotasının aktif edilebilmesi için `server.js` içerisine yönlendirme eklenmiştir.
- **Dosya:** `backend/src/server.js`
- **Eklenen Kod:** `app.use('/api/ai-chat', require('./routes/ai-chat'));`

> Bu değişiklikler sonrası sunucu baştan başlatıldığında (`npm start` veya PM2 restart) yeni AI Chat endpoint'i tam fonksiyonlu bir şekilde kullanıma hazır olacaktır.
