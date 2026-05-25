Sunucuya (cPanel/VPS) yüklemen veya eski dosyalarla değiştirmen gereken dosyaların listesi:

**YENİ EKLENECEK DOSYALAR:**
- `backend/src/routes/ai-chat.js`

**DEĞİŞTİRİLECEK (ÜZERİNE YAZILACAK) DOSYALAR:**
- `backend/src/server.js`
- `backend/package.json`
- `backend/.env.example`

*(Not: Sunucudaki gerçek `.env` dosyanın içerisine `GROQ_API_KEY=senin_groq_api_anahtarin` satırını eklemeyi ve `package.json` değiştiği için sunucuda `npm install` (veya modülleri manuel yüklemeyi) unutma.)*
