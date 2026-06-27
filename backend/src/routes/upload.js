/**
 * Upload Route
 * POST /api/upload - Admin only: upload a file and return its URL
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece görsel dosyalarına izin verilir.'));
    }
  }
});

router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Lütfen bir görsel seçin.' });
    }

    let protocol = req.headers['x-forwarded-proto'] || req.protocol;
    if (protocol && protocol.includes(',')) {
      protocol = protocol.split(',')[0].trim();
    }
    const host = req.get('host');
    const url = `${protocol}://${host}/uploads/${req.file.filename}`;

    return res.json({ success: true, url });
  } catch (err) {
    console.error('[Upload Error]', err);
    return res.status(500).json({ error: 'Görsel yüklenirken bir hata oluştu.' });
  }
});

module.exports = router;
