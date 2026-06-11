import os

file_path = 'src/services/telegramService.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    "yöneticisinin/patronunun": "yöneticisinin",
    "GÜNAYDIN PATRON!": "GÜNAYDIN!",
    "patronunun sana gönderdiği dikte": "sana gönderilen dikte",
    "Patronun gündelik ağzını": "Gündelik ağzı",
    "Patronun Diktesi": "Gönderilen Dikte",
    "patronunun bu taslakla": "yöneticinin bu taslakla",
    "Patronun Düzeltme Talimatı": "Düzeltme Talimatı",
    "Patron, eğer site WordPress": "Eğer site WordPress",
    "Merhaba Patron! 🤖": "Merhaba! 🤖",
    "patronuna ": "yöneticiye ",
    "patronun ": "yöneticinin "
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Strings replaced successfully.")
