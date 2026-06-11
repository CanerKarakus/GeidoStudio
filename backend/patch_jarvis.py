import re

file_path = 'src/services/telegramService.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

jarvis_code = """    if (!groqClient) {
      bot.sendMessage(chatId, `❌ Groq AI yapılandırılmamış. Lütfen .env dosyasına GROQ_API_KEY ekleyin.`);
      return;
    }

    // JARVIS MODU (Sesli CMS)
    if (msg.voice) {
      try {
        bot.sendMessage(chatId, `🧠 <b>Jarvis Modu Aktif</b>\\nSesiniz deşifre ediliyor, CMS güncellenecek...`, { parse_mode: 'HTML' });
        bot.sendChatAction(chatId, 'typing');
        
        const rawText = await transcribeVoiceMsg(bot, groqClient, msg.voice.file_id);
        const cms = readCMS();
        
        const prompt = `Geido Studio CMS veritabanını güncelleyen Jarvis yapay zekasısın.
Aşağıda yöneticinin sana verdiği sesli komut ve şu anki CMS JSON verisi var.
SADECE güncellenmesi gereken kısmı değiştirilmiş GÜNCEL VE TAM CMS JSON objesini döndür. 
Asla JSON harici hiçbir açıklama metni yazma. Markdown block kullanma, sadece saf JSON ver!

Yönetici Komutu: "${rawText}"

Mevcut CMS:
${JSON.stringify(cms, null, 2)}
`;

        const chatCompletion = await groqClient.chat.completions.create({
          messages: [{ role: 'system', content: prompt }],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.1,
        });

        let aiResponse = chatCompletion.choices[0]?.message?.content || '{}';
        aiResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const newCms = JSON.parse(aiResponse);
        
        // Backup
        const backupPath = path.join(__dirname, '../../data/cms_backup_' + Date.now() + '.json');
        fs.writeFileSync(backupPath, JSON.stringify(cms, null, 2), 'utf8');
        
        writeCMS(newCms);
        
        bot.sendMessage(chatId, `✅ <b>Jarvis CMS'i Güncelledi!</b>\\n\\nDeşifre edilen komutunuz: <i>"${rawText}"</i>\\n\\nSistem yayına alınıyor...`, { parse_mode: 'HTML' });
        triggerNetlifyBuild(chatId, `🚀 <b>Güncellemeler Yayında!</b>`);

      } catch (e) {
        bot.sendMessage(chatId, `❌ Jarvis Hatası: ${e.message}`);
      }
      return;
    }

    if (!msg.text || msg.text.startsWith('/')) return;
"""

old_code = r"""    if \(\!groqClient\) \{
      bot\.sendMessage\(chatId, `❌ Groq AI yapılandırılmamış\. Lütfen \.env dosyasına GROQ_API_KEY ekleyin\.`\);
      return;
    \}

    try \{"""

# Replace
content = re.sub(old_code, jarvis_code + "\n    try {", content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Jarvis code injected")
