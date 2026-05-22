const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const TRACKING_FILE = path.join(__dirname, '../../data/tracking.json');

const readTracking = () => {
  try {
    if (!fs.existsSync(TRACKING_FILE)) return [];
    return JSON.parse(fs.readFileSync(TRACKING_FILE, 'utf8'));
  } catch {
    return [];
  }
};

const writeTracking = (data) => {
  fs.writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// Public endpoint: get project tracking by slug or name
router.get('/public/:slug', (req, res) => {
  try {
    const trackings = readTracking();
    const searchParam = decodeURIComponent(req.params.slug).split('?')[0].toLowerCase().trim(); // Strip query params if any
    
    const project = trackings.find(t => {
      const slugMatch = t.slug && t.slug.toLowerCase() === searchParam;
      const nameMatch = t.name && (t.name.toLowerCase() === searchParam || t.name.toLowerCase().includes(searchParam));
      return slugMatch || nameMatch;
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Proje bulunamadı.' });
    }
    return res.json(project);
  } catch (err) {
    console.error('Tracking API Error:', err);
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// Admin endpoints
router.get('/', authMiddleware, (req, res) => {
  return res.json(readTracking());
});

router.post('/', authMiddleware, (req, res) => {
  const { name, slug, category, status, url } = req.body;
  if (!name || !slug) {
    return res.status(400).json({ error: 'Proje adı ve slug zorunludur.' });
  }

  const trackings = readTracking();
  
  if (trackings.some(t => t.slug === slug)) {
    return res.status(400).json({ error: 'Bu slug zaten kullanımda.' });
  }

  const newProject = {
    id: uuidv4(),
    name,
    slug,
    category: category || 'Web Tasarım',
    status: status || 1, // 1: Değerlendiriliyor, 2: Hazırlanıyor, 3: Teslim Edildi
    url: url || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  trackings.push(newProject);
  writeTracking(trackings);
  
  return res.status(201).json(newProject);
});

router.put('/:id', authMiddleware, (req, res) => {
  const { name, slug, category, status, url } = req.body;
  const trackings = readTracking();
  const index = trackings.findIndex(t => t.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Proje bulunamadı.' });
  }

  if (slug && slug !== trackings[index].slug && trackings.some(t => t.slug === slug)) {
    return res.status(400).json({ error: 'Bu slug zaten kullanımda.' });
  }

  trackings[index] = {
    ...trackings[index],
    name: name || trackings[index].name,
    slug: slug || trackings[index].slug,
    category: category || trackings[index].category,
    status: status !== undefined ? status : trackings[index].status,
    url: url !== undefined ? url : trackings[index].url,
    updatedAt: new Date().toISOString()
  };

  writeTracking(trackings);
  return res.json(trackings[index]);
});

router.delete('/:id', authMiddleware, (req, res) => {
  const trackings = readTracking();
  const filtered = trackings.filter(t => t.id !== req.params.id);
  
  if (trackings.length === filtered.length) {
    return res.status(404).json({ error: 'Proje bulunamadı.' });
  }

  writeTracking(filtered);
  return res.json({ success: true });
});

module.exports = router;
