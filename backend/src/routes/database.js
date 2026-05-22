const express = require('express');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const DATA_DIR = path.join(__dirname, '../../data');

// Yardımcı Fonksiyon: Sadece geçerli JSON dosyalarına izin ver
const getSafeFilePath = (filename) => {
  // Basit güvenlik kontrolü: dizin geçişlerini (directory traversal) engelle
  const safeFilename = path.basename(filename);
  if (!safeFilename.endsWith('.json')) {
    return null;
  }
  return path.join(DATA_DIR, safeFilename);
};

// ── GET /api/database/files ──────────────────────────────────────────────────
// Tüm veritabanı (JSON) dosyalarının listesini getir
router.get('/files', authMiddleware, (req, res) => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      return res.json({ files: [] });
    }
    
    const files = fs.readdirSync(DATA_DIR)
      .filter(file => file.endsWith('.json'));
      
    res.json({ files });
  } catch (err) {
    console.error('[Database] List files error:', err.message);
    res.status(500).json({ error: 'Dosyalar listelenemedi.' });
  }
});

// ── GET /api/database/file/:filename ─────────────────────────────────────────
// Belirli bir JSON dosyasının içeriğini getir
router.get('/file/:filename', authMiddleware, (req, res) => {
  try {
    const filePath = getSafeFilePath(req.params.filename);
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Dosya bulunamadı.' });
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    // İçeriği text (string) olarak döndürüyoruz ki frontend'de textarea'da gösterelim
    res.json({ content });
  } catch (err) {
    console.error('[Database] Read file error:', err.message);
    res.status(500).json({ error: 'Dosya okunamadı.' });
  }
});

// ── PUT /api/database/file/:filename ─────────────────────────────────────────
// Belirli bir JSON dosyasının içeriğini güncelle
router.put('/file/:filename', authMiddleware, (req, res) => {
  try {
    const filePath = getSafeFilePath(req.params.filename);
    if (!filePath) {
      return res.status(400).json({ error: 'Geçersiz dosya adı.' });
    }
    
    const newContent = req.body.content;
    if (typeof newContent !== 'string') {
      return res.status(400).json({ error: 'İçerik metin formatında olmalıdır.' });
    }
    
    // JSON geçerliliğini kontrol et
    try {
      JSON.parse(newContent);
    } catch (e) {
      return res.status(400).json({ error: 'Geçersiz JSON formatı. Lütfen sözdizimini (syntax) kontrol edin.' });
    }
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    res.json({ success: true, message: 'Veritabanı dosyası başarıyla güncellendi.' });
    
  } catch (err) {
    console.error('[Database] Write file error:', err.message);
    res.status(500).json({ error: 'Dosya kaydedilemedi.' });
  }
});

module.exports = router;
