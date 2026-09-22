Sunucuya (cPanel/VPS) yüklemen veya eski dosyalarla değiştirmen gereken dosyaların listesi:

**YENİ EKLENECEK DOSYALAR:**
- `backend/src/routes/analyze.js`
- `backend/src/services/nvidia/nvidiaClient.js`
- `backend/src/services/nvidia/parser.js`
- `backend/src/services/nvidia/prompts/technicalVideoAnalysis.js`
- `backend/src/services/video/videoProcessor.js`
- `backend/src/services/video/frameExtractor.js`
- `backend/src/routes/ai-chat.js`

**DEĞİŞTİRİLECEK (ÜZERİNE YAZILACAK) DOSYALAR:**
- `backend/src/server.js`
- `backend/.env.example`
- `backend/.gitignore`

*(Not: Sunucudaki gerçek `.env` dosyanın içerisine `NVIDIA_API_KEY=senin_nvidia_api_anahtarin` satırını eklemeyi ve cPanel Node.js Application Manager üzerinden `Restart Application` yapmayı unutma.)*
