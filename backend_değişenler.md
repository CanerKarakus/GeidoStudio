**backend/src/routes/ai-chat.js**
```javascript
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

    let systemInstruction = SYSTEM_PROMPT;
    if (userContext && userContext.name) {
      systemInstruction += `\nŞu an konuştuğun müşterinin adı: ${userContext.name}. Ona adıyla hitap edebilirsin.`;
    }

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

router.post('/end-session', async (req, res) => {
  try {
    const { messages, userContext, wantsEmail } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Mesaj listesi geçersiz.' });
    }

    let transcriptText = `Geido Studio Canlı Destek Dökümü\n\n`;
    let transcriptHtml = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #b30000; text-align: center;">Geido Studio Canlı Destek Dökümü</h2>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee;">`;

    if (userContext?.name && userContext?.email) {
      transcriptText += `Kullanıcı: ${userContext.name} (${userContext.email})\n\n`;
      transcriptHtml += `<p><strong>Kullanıcı:</strong> ${userContext.name} (${userContext.email})</p><hr/>`;
    }

    messages.forEach(msg => {
      const senderName = msg.sender === 'user' ? (userContext?.name || 'Kullanıcı') : 'Geido AI';
      transcriptText += `[${senderName}]: ${msg.text}\n\n`;
      
      const bgColor = msg.sender === 'user' ? '#e6f2ff' : '#ffffff';
      transcriptHtml += `<div style="margin-bottom: 12px; padding: 10px; background-color: ${bgColor}; border-radius: 6px; border: 1px solid #ddd;">
        <strong>${senderName}:</strong><br/>
        <span style="white-space: pre-wrap;">${msg.text}</span>
      </div>`;
    });

    transcriptHtml += `</div></div>`;

    const subject = `Canlı Destek Geçmişi - ${userContext?.name || 'Ziyaretçi'}`;

    sendEmail(
      process.env.SMTP_USER,
      `[YENİ SOHBET] ${subject}`,
      transcriptText,
      transcriptHtml,
      userContext?.email
    ).catch(e => console.error('[Email Error] Admin:', e.message));

    if (wantsEmail && userContext?.email) {
      sendEmail(
        userContext.email,
        subject,
        `Merhaba ${userContext.name},\n\nCanlı destek sohbet geçmişiniz aşağıda yer almaktadır:\n\n${transcriptText}\n\nİyi günler dileriz,\nGeido Studio Ekibi`,
        transcriptHtml,
        process.env.SMTP_USER
      ).catch(e => console.error('[Email Error] User:', e.message));
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[End Session Error]', error);
    res.status(500).json({ error: 'Sohbet dökümü gönderilemedi.' });
  }
});

module.exports = router;
```

**backend/src/server.js**
```javascript
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const required = ['JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD_HASH'];
for (const key of required) {
  if (!process.env[key] || process.env[key].startsWith('CHANGE_THIS')) {
    console.error(`\n❌ Missing or unconfigured env variable: ${key}`);
    console.error('   Run: npm run setup\n');
    process.exit(1);
  }
}

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', 'https:', 'http://localhost:*', 'http://127.0.0.1:*'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
}));

const FRONTEND_URLS = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(s => s.trim()) : [];

const ALLOWED_ORIGINS = [
  ...FRONTEND_URLS,
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    callback(null, origin || true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.set('trust proxy', 1);

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/cms',        require('./routes/cms'));
app.use('/api/database',   require('./routes/database'));
app.use('/api/analytics',  require('./routes/analytics'));
app.use('/api/messages',   require('./routes/messages'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/upload',     require('./routes/upload'));
app.use('/api/tracking',   require('./routes/tracking'));
app.use('/api/ai-chat',    require('./routes/ai-chat'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı.' });
});

app.use((err, req, res, next) => {
  if (err.message && err.message.startsWith('CORS')) {
    return res.status(403).json({ error: 'CORS: Erişim reddedildi.' });
  }
  console.error('[Server Error]', err.message);
  res.status(500).json({ error: 'Sunucu hatası.' });
});

const PORT = process.env.PORT || 3001;
const http = require('http');
const { Server } = require('socket.io');
const { initImap } = require('./services/emailService');
const { readMessages, writeMessages } = require('./models/messageModel');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    credentials: true
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('Admin connected to socket:', socket.id);
});

initImap((newMsg) => {
  const messages = readMessages();

  let targetIndex = -1;

  if (newMsg.inReplyTo) {
    targetIndex = messages.findIndex(m =>
      m.threadMessageId && m.threadMessageId === newMsg.inReplyTo
    );
    if (targetIndex === -1 && newMsg.references) {
      const refIds = newMsg.references.split(/\s+/);
      targetIndex = messages.findIndex(m =>
        m.threadMessageId && refIds.includes(m.threadMessageId)
      );
    }
  }

  if (targetIndex === -1) {
    const matchingByEmail = messages
      .map((m, i) => ({ m, i }))
      .filter(({ m }) => m.email.toLowerCase() === newMsg.from.toLowerCase());
    if (matchingByEmail.length === 1) {
      targetIndex = matchingByEmail[0].i;
    }
  }

  if (targetIndex >= 0) {
    const thread = messages[targetIndex];
    thread.replies = thread.replies || [];

    const isDuplicate = thread.replies.some(r => r.messageId === newMsg.messageId);
    if (!isDuplicate) {
      const newReply = {
        id: require('uuid').v4(),
        sender: 'user',
        text: newMsg.text,
        date: newMsg.date,
        messageId: newMsg.messageId
      };
      thread.replies.push(newReply);

      messages.splice(targetIndex, 1);
      messages.unshift(thread);
      writeMessages(messages);

      console.log(`[IMAP] Reply matched to thread "${thread.subject}" (${thread.email})`);
      io.emit('new_reply', { threadId: thread.id, reply: newReply });
      io.emit('messages_updated', messages);
    } else {
      console.log('[IMAP] Duplicate message ignored.');
    }
  } else {
    console.log(`[IMAP] No matching thread found for message from: ${newMsg.from} (In-Reply-To: ${newMsg.inReplyTo})`);
  }
}).catch(err => console.error('IMAP Init error:', err));

server.listen(PORT, () => {
  console.log(`\n🚀 Geido Studio Backend`);
  console.log(`   Port:    ${PORT}`);
  console.log(`   CORS:    ${ALLOWED_ORIGINS.join(', ')}`);
  console.log(`   Mode:    ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = server;
```

**backend/package.json**
```json
{
  "name": "geido-studio-backend",
  "version": "1.0.0",
  "description": "Geido Studio CMS & Auth API",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "setup": "node src/setup.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^17.4.2",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "groq-sdk": "^1.1.2",
    "helmet": "^7.1.0",
    "imapflow": "^1.3.3",
    "jsonwebtoken": "^9.0.2",
    "mailparser": "^3.9.8",
    "multer": "^2.1.1",
    "nodemailer": "^8.0.7",
    "socket.io": "^4.8.3",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**backend/.env.example**
```env
# Environment Variables - NEVER commit this file to git!

# JWT Secret Key - Change this to a long random string in production!
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=CHANGE_THIS_TO_A_RANDOM_64_CHARACTER_SECRET_KEY_IN_PRODUCTION

# Admin Credentials (password stored as bcrypt hash - run `npm run setup` to generate)
ADMIN_EMAIL=admin@geidostudio.com
ADMIN_PASSWORD_HASH=WILL_BE_GENERATED_BY_SETUP_SCRIPT

# Frontend URL for CORS (your Netlify domain)
FRONTEND_URL=https://geidostudio.netlify.app

# Server Port
PORT=3001

# --- AI CANLI DESTEK ---
# Groq API Key (https://console.groq.com)
GROQ_API_KEY=gsk_your_api_key_here

# Environment
NODE_ENV=production
```
