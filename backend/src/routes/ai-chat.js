const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

// Initialize Groq client
// It will automatically use process.env.GROQ_API_KEY if available
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

// System prompt instructing the AI how to behave
const SYSTEM_PROMPT = `Sen Geido Studio adlı kreatif ajansın canlı destek asistanısın. 
Adın Geido AI. 
Müşterilere kibar, profesyonel, yaratıcı ve samimi bir dille (Türkçe) yanıt vermelisin. 
Geido Studio, modern web tasarımı, UI/UX tasarımı, sosyal medya yönetimi ve kurumsal kimlik hizmetleri sunmaktadır. 
Müşteriler hizmetler hakkında bilgi isteyebilir, fiyat sorabilir veya proje detaylarını konuşmak isteyebilirler.
Fiyatlarla ilgili doğrudan net bir rakam vermekten kaçın (çünkü projelere göre değişir), bunun yerine onları projenin detaylarını konuşmak için iletişim formunu doldurmaya veya ekibe yönlendirmeye teşvik et. 
Yanıtlarını kısa, okunaklı ve mobil uyumlu tut. Paragrafları böl.`;

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
      model: 'llama3-70b-8192',
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

module.exports = router;
