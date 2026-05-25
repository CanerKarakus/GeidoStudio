const express = require('express');
const rateLimit = require('express-rate-limit');
const Groq = require('groq-sdk');
const { sendEmail } = require('../services/emailService');

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

Fiyatlarla ilgili doğrudan net bir rakam vermekten kaçın, bunun yerine onları projenin detaylarını konuşmak için iletişim formunu doldurmaya veya ekibe yönlendirmeye teşvik et.`;

router.post('/', async (req, res) => {
  try {
    if (!groq) {
      return res.status(503).json({ 
        error: 'Groq API anahtarı yapılandırılmamış. Lütfen .env dosyasında GROQ_API_KEY ayarlayın.' 
      });
    }

    const { messages, userContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Geçersiz mesaj formatı.' });
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

    const aiResponse = chatCompletion.choices[0]?.message?.content || 'Üzgünüm, şu an yanıt veremiyorum.';

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

// ── POST /api/ai-chat/end-session ──────────────────────────────────────────────
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

module.exports = router;
