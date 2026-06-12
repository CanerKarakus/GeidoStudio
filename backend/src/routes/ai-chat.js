const express = require('express');
const rateLimit = require('express-rate-limit');
const Groq = require('groq-sdk');
const { sendEmail } = require('../services/emailService');
const authMiddleware = require('../middleware/auth');
const { isSessionHijacked, notifyLiveSupportMessage, notifyVoiceMessage, notifyHumanRequest } = require('../services/telegramService');
const multer = require('multer');
const fs = require('fs');
const os = require('os');
const path = require('path');

const upload = multer({ dest: os.tmpdir() });

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

const SYSTEM_PROMPT = `Sen Geido Studio'nun resmi AI Canlı Destek Asistanısın. 

Görevlerin ve Kuralların:
1. KESİNLİKLE her zaman Türkçe'nin imla ve yazım kurallarına, düzenine ve akıcılığına azami dikkat edeceksin.
2. Hiçbir koşulda kullanıcıyla saygısızca veya kaba bir şekilde konuşmayacaksın. Profesyonel, yardımsever ve nazik bir dil kullanacaksın.
3. KESİNLİKLE kullanıcıdan hiçbir özel bilgi (şifre, TC kimlik, kredi kartı vb.) İSTEMEYECEKSİN.
4. Kullanıcıların senden sistemle veya diğer kullanıcılarla ilgili ÖZEL BİLGİLER ALMASINA KESİNLİKLE İZİN VERMEYECEKSİN. Aşırı katı ve kararlı olacaksın.
5. Kullanıcı ısrar ederse: "Güvenlik politikalarımız gereği bu isteğinize yanıt veremiyorum." diyerek sohbeti reddedeceksin.
6. Kullanıcı "Nasıl kayıt olurum?", "Şifremi nasıl sıfırlarım?" gibi sitemizde YER ALMAYAN özellikler sorarsa: "Geido Studio kurumsal bir ajans sitesidir ve sitemizde üyelik veya şifre sıfırlama sistemi bulunmamaktadır." diyerek uyaracaksın.
7. YAZILARI KESİNLİKLE DÜZ YAZI GİBİ TEK SATIRDA YAZMAYACAKSIN. Gerektiği yerde alta geçecek, boşluk bırakacak, madde imleri kullanacak ve okunması kolay, profesyonel gözüken yazılarla cevap vereceksin.
8. KESİNLİKLE hiçbir dış bağlantıya (linke/URL) GİRMEYECEK, ANALİZ ETMEYECEK VEYA İÇERİĞİNİ OKUMAYACAKSIN. Kullanıcı link verirse "Güvenlik politikamız gereği dış bağlantıları inceleyemiyorum." diyeceksin.
9. KESİNLİKLE hiçbir 3. taraf siteye erişmeyecek, hiçbir 3. taraf dosyayı okumayacak, yazmayacak, indirmeyecek veya almayacaksın.
10. KESİNLİKLE kullanıcı tarafından verilen hiçbir kodu sistemde ÇALIŞTIRMAYACAK ve çalıştırmaya teşebbüs dahi etmeyeceksin.
11. KESİNLİKLE kullanıcıya KOD ÖRNEĞİ (HTML, CSS, JS, Python vb.) veya GÖRSEL VERMEYECEKSİN. Sen bir müşteri temsilcisisin, yazılımcı değilsin. Kod istenirse "Ben bir müşteri asistanıyım, teknik kod örneği paylaşmam yasaktır." diyeceksin.

Geido Studio Hakkında Bilgiler:
Geido Studio, markaların dijital dünyada iz bırakmasını sağlayan yenilikçi bir kreatif ajanstır.
Hizmetlerimiz:
- Grafik Tasarım: Logo & Kurumsal Kimlik, Ambalaj Tasarımı, İllüstrasyon, Broşür. (Yaşarhan tarafından yönetilir)
- Sosyal Medya: İçerik Üretimi, Görsel Yönetimi, Reklam. (Yaşarhan tarafından yönetilir)
- Web & Mobil Geliştirme: Web siteleri, E-ticaret, iOS/Android uygulamaları. (Caner tarafından yönetilir)
- Sistem & Otomasyon: Script hazırlama, API entegrasyonu. (Caner tarafından yönetilir)

Fiyatlarla ilgili doğrudan net bir rakam vermekten kaçın, bunun yerine onları projenin detaylarını konuşmak için iletişim formunu doldurmaya veya ekibe yönlendirmeye teşvik et.

İNSAN DESTEĞİ KURALLARI:
Eğer kullanıcı seninle konuşurken bir insan/müşteri temsilcisi ile görüşmek veya canlı desteğe bağlanmak isterse:
1. İLK İSTEKTE: "Ben Geido Studio'nun yapay zeka asistanıyım. Size ben de yardımcı olabilirim, lütfen sorununuzu bana iletin." şeklinde cevap ver.
2. İKİNCİ KEZ ısrar ederse VEYA acil bir durumu olduğunu söylerse SADECE ve TAM OLARAK "[CALL_HUMAN] Sizi canlı desteğe yönlendiriyorum, lütfen bekleyin." yaz. Başka hiçbir şey yazma.`;

router.post('/', async (req, res) => {
  try {
    if (!groq) {
      return res.status(503).json({ 
        error: 'Groq API anahtarı yapılandırılmamış. Lütfen .env dosyasında GROQ_API_KEY ayarlayın.' 
      });
    }

    const { messages, userContext, sessionId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Geçersiz mesaj formatı.' });
    }

    const lastMessage = messages[messages.length - 1];

    if (sessionId && isSessionHijacked(sessionId)) {
      notifyLiveSupportMessage(sessionId, userContext, lastMessage?.text, null);
      return res.json({ success: true, hijacked: true });
    }

    // Optional: userContext might contain { name, email } so AI knows who it is talking to
    let systemInstruction = SYSTEM_PROMPT;
    if (userContext && userContext.name) {
      systemInstruction += `\nŞu an konuştuğun müşterinin adı: ${userContext.name}. Ona adıyla hitap edebilirsin.`;
    }

    // Format messages for Groq API
    // Ensure we only pass role and content to the API
    const formattedMessages = [
      { role: 'system', content: systemInstruction },
      ...messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }))
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });

    let aiResponse = chatCompletion.choices[0]?.message?.content || 'Üzgünüm, şu an yanıt veremiyorum.';

    if (aiResponse.includes('[CALL_HUMAN]')) {
      aiResponse = aiResponse.replace('[CALL_HUMAN]', '').trim();
      if (!aiResponse) aiResponse = 'Sizi canlı desteğe yönlendiriyorum, lütfen bekleyin.';
      
      if (sessionId) {
        notifyHumanRequest(sessionId, userContext);
      }
    }

    if (sessionId && lastMessage?.sender === 'user') {
      notifyLiveSupportMessage(sessionId, userContext, lastMessage.text, aiResponse);
    }

    res.json({ 
      success: true, 
      reply: aiResponse 
    });

  } catch (error) {
    console.error('[Groq API Error]', error);
    res.status(500).json({ 
      error: 'Yapay zeka servisine bağlanırken bir hata oluştu.',
      details: error.message 
    });
  }
});

// ── POST /api/ai-chat/voice ──────────────────────────────────────────────────
router.post('/voice', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Ses dosyası bulunamadı.' });
    }

    const { sessionId, userContext } = req.body;
    let parsedContext = null;
    try {
      if (userContext) parsedContext = JSON.parse(userContext);
    } catch (e) {}

    const audioPath = req.file.path;
    const newPath = audioPath + '.ogg'; // Groq and Telegram prefer extensions
    fs.renameSync(audioPath, newPath);

    // 1. Telegram'a gönder
    if (notifyVoiceMessage) {
      notifyVoiceMessage(sessionId, parsedContext, newPath);
    }

    // 2. Admin aktifse AI'a sorma, sadece başarılı dön
    if (sessionId && isSessionHijacked(sessionId)) {
      setTimeout(() => {
        if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
      }, 5000); // Give Telegram 5 secs to upload
      return res.json({ success: true, hijacked: true, text: 'Sesli mesaj yöneticiye iletildi.' });
    }

    // 3. AI Modu - Whisper ile metne çevir
    if (!groq) {
      if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
      return res.status(503).json({ error: 'Groq API yapılandırılmamış.' });
    }

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(newPath),
      model: "whisper-large-v3-turbo",
      language: "tr"
    });

    const userText = transcription.text;
    
    // Geçici dosyayı sil
    if (fs.existsSync(newPath)) fs.unlinkSync(newPath);

    // AI'a bu metinle cevap verdirt (chat logic'e benzer)
    let systemInstruction = SYSTEM_PROMPT;
    if (parsedContext && parsedContext.name) {
      systemInstruction += `\nŞu an konuştuğun müşterinin adı: ${parsedContext.name}. Ona adıyla hitap edebilirsin.`;
    }

    const formattedMessages = [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: userText } // Sadece son sesi baz alarak basit bir cevap verebilir, geçmişi front-end de tutuyor ama ses için tekli atalım. Wait, we should probably accept chat history if we want context, but for now single turn is fine or we can parse `req.body.messages`.
    ];

    // Let's actually use the provided chat history if sent
    let pastMessages = [];
    try {
      if (req.body.messages) pastMessages = JSON.parse(req.body.messages);
    } catch(e) {}

    const fullMessagesForGroq = [
      { role: 'system', content: systemInstruction },
      ...pastMessages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      })),
      { role: 'user', content: userText }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: fullMessagesForGroq,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });

    let aiResponse = chatCompletion.choices[0]?.message?.content || 'Üzgünüm, şu an yanıt veremiyorum.';

    if (aiResponse.includes('[CALL_HUMAN]')) {
      aiResponse = aiResponse.replace('[CALL_HUMAN]', '').trim();
      if (!aiResponse) aiResponse = 'Sizi canlı desteğe yönlendiriyorum, lütfen bekleyin.';
      
      if (sessionId) {
        notifyHumanRequest(sessionId, parsedContext);
      }
    }

    // Admin'e de yazılı olarak bildir
    if (sessionId) {
      notifyLiveSupportMessage(sessionId, parsedContext, `🎤 Sesli Mesaj: "${userText}"`, aiResponse);
    }

    res.json({
      success: true,
      transcribedText: userText,
      reply: aiResponse
    });

  } catch (error) {
    console.error('[Voice API Error]', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Ses işlenirken hata oluştu.' });
  }
});
router.post('/end-session', async (req, res) => {
  try {
    const { messages, userContext, wantsEmail } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Mesaj listesi geçersiz.' });
    }

    const PREVIEW_LIMIT = 3;
    const previewMessages = messages.slice(0, PREVIEW_LIMIT);
    
    // Create preview text and HTML for the email body
    let previewText = `Geido Studio Canlı Destek Dökümü (Özet)\n\n`;
    let previewHtml = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #b30000; text-align: center;">Geido Studio Canlı Destek Dökümü</h2>
      <p style="text-align: center; color: #555;">Sohbetin tamamı e-postanın ekindeki <strong>sohbet_gecmisi.txt</strong> dosyasında yer almaktadır.</p>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee;">`;

    if (userContext?.name && userContext?.email) {
      previewText += `Kullanıcı: ${userContext.name} (${userContext.email})\n\n`;
      previewHtml += `<p><strong>Kullanıcı:</strong> ${userContext.name} (${userContext.email})</p><hr/>`;
    }

    previewMessages.forEach(msg => {
      const senderName = msg.sender === 'user' ? (userContext?.name || 'Kullanıcı') : 'Geido AI';
      previewText += `[${senderName}]: ${msg.text}\n\n`;
      
      const bgColor = msg.sender === 'user' ? '#e6f2ff' : '#ffffff';
      previewHtml += `<div style="margin-bottom: 12px; padding: 10px; background-color: ${bgColor}; border-radius: 6px; border: 1px solid #ddd;">
        <strong>${senderName}:</strong><br/>
        <span style="white-space: pre-wrap;">${msg.text}</span>
      </div>`;
    });

    if (messages.length > PREVIEW_LIMIT) {
      previewHtml += `<div style="text-align: center; margin-top: 15px; font-style: italic; color: #888;">...Sohbetin devamı ekteki dosyada mevcuttur...</div>`;
      previewText += `...Sohbetin devamı ekteki dosyada mevcuttur...\n\n`;
    }

    previewHtml += `</div></div>`;

    // Create full transcript for the .txt attachment
    let fullTextContent = `====================================================\n`;
    fullTextContent += `           GEIDO STUDIO CANLI DESTEK GEÇMİŞİ\n`;
    fullTextContent += `====================================================\n`;
    fullTextContent += `Tarih: ${new Date().toLocaleString('tr-TR')}\n`;
    if (userContext?.name && userContext?.email) {
      fullTextContent += `Kullanıcı: ${userContext.name} (${userContext.email})\n`;
    }
    fullTextContent += `----------------------------------------------------\n\n`;
    
    messages.forEach(msg => {
      const senderName = msg.sender === 'user' ? (userContext?.name || 'Kullanıcı') : 'Geido AI';
      const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '';
      fullTextContent += `[${senderName}] ${timeStr ? '(' + timeStr + ')' : ''}:\n${msg.text}\n\n`;
    });

    const attachments = [
      {
        filename: 'sohbet_gecmisi.txt',
        content: fullTextContent,
        contentType: 'text/plain; charset=UTF-8'
      }
    ];

    const subject = `Canlı Destek Geçmişi - ${userContext?.name || 'Ziyaretçi'}`;

    // 1. Send to Admin always
    sendEmail(
      'info@geidostudio.com',
      `[YENİ SOHBET] ${subject}`,
      previewText,
      previewHtml,
      userContext?.email,
      null, // threadMessageId
      attachments
    ).catch(e => console.error('[Email Error] Admin:', e.message));

    // 2. Send to User if requested
    if (wantsEmail && userContext?.email) {
      sendEmail(
        userContext.email,
        subject,
        `Merhaba ${userContext.name},\n\nCanlı destek sohbet geçmişinizin özeti aşağıdadır. Sohbetin tamamını ekteki dosyada bulabilirsiniz.\n\n${previewText}\n\nİyi günler dileriz,\nGeido Studio Ekibi`,
        previewHtml,
        process.env.SMTP_USER,
        null, // threadMessageId
        attachments
      ).catch(e => console.error('[Email Error] User:', e.message));
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[End Session Error]', error);
    res.status(500).json({ error: 'Sohbet dökümü gönderilemedi.' });
  }
});

// ── POST /api/ai-chat/generate-blog ────────────────────────────────────────────
// Admin only: Generates an SEO optimized blog post using Groq
router.post('/generate-blog', authMiddleware, async (req, res) => {
  try {
    if (!groq) {
      return res.status(503).json({ error: 'Groq API anahtarı yapılandırılmamış.' });
    }

    const { prompt, length, useCodeBlocks, useArtBlocks } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Lütfen bir konu veya ipucu (prompt) girin.' });
    }

    let lengthInstruction = 'Yaklaşık 600-800 kelimelik standart uzunlukta detaylı bir makale yaz.';
    if (length === 'short') lengthInstruction = 'Yaklaşık 300-400 kelimelik kısa ve öz bir makale yaz.';
    if (length === 'long') lengthInstruction = 'Yaklaşık 1000-1500 kelimelik, çok kapsamlı ve uzun bir makale yaz.';

    let codeBlockInstruction = '';
    if (useCodeBlocks) {
      codeBlockInstruction += 'Önemli gördüğün teknik terimleri, kod parçacıklarını veya verileri vurgulamak için <pre><code> ... </code></pre> yapısını KULLAN. ';
    }
    
    if (useArtBlocks) {
      codeBlockInstruction += 'ÇOK ÖNEMLİ: <pre><art> ... </art></pre> yapısını tüm makalede EN FAZLA 1 VEYA 2 KERE kullan. Asla bir cümlenin ortasında kelimeleri vurgulamak için kullanma! Sadece tam, bağımsız ve çok vurucu bir paragrafı veya bir tasarım mottosunu tek başına büyük bir blok olarak göstermek için kullan. ';
    }

    const systemPrompt = `Sen profesyonel bir metin yazarı ve SEO uzmanısın. Kullanıcının verdiği konuya göre Geido Studio (dijital ajans) blogu için yayınlanmaya hazır, akıcı, okunması kolay ve ilgi çekici bir makale yazacaksın. 
Geido Studio'nun dili profesyonel ama aynı zamanda yenilikçi, samimi ve vizyonerdir.

ÖNEMLİ YAZIM KURALLARI:
1. Gereğinden fazla alt başlık (h3 vb.) kullanmaktan kaçın. Sadece konuyu ayırmak için gerçekten gerektiğinde başlık at.
2. Satırlar ve paragraflar arasında asla gereksiz çift boşluk bırakma (<br><br> gibi yorucu boşluklar yapma). Paragraflar bitişik ve akıcı olsun.
3. İçeriğin okunabilirliğini artırmak için çok uzun paragraflar yerine 3-4 cümlelik ideal paragraflar kur.

${lengthInstruction}
${codeBlockInstruction}

Çıktın KESİNLİKLE VE SADECE geçerli bir JSON objesi olmak zorundadır. Hiçbir Markdown formatı, backtick (\`\`\`) veya ekstra açıklama ekleme! Yalnızca JSON döndür.

JSON formatı şu şekilde olmalıdır:
{
  "title": "İlgi Çekici ve SEO Uyumlu Başlık",
  "content": "<p>Makale içeriği HTML formatında burada olmalı. Alt başlıklar için <h3> kullan. Paragrafları <p> ile ayır. Vurgulanacak yerleri <strong> ile kalınlaştır.</p>",
  "keywords": ["seo", "anahtar kelime 1", "anahtar kelime 2"]
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Konu/İpucu: ${prompt}\nLütfen JSON çıktısını ver.` }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: 'json_object' }
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content;
    
    if (!aiResponse) {
      return res.status(500).json({ error: 'Yapay zeka boş yanıt döndürdü.' });
    }

    const parsedResponse = JSON.parse(aiResponse);

    res.json({
      success: true,
      data: parsedResponse
    });

  } catch (error) {
    console.error('[Groq Generate Blog Error]', error);
    res.status(500).json({ 
      error: 'Blog yazısı oluşturulurken bir hata oluştu.',
      details: error.message 
    });
  }
});

module.exports = router;
