const express = require('express');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const ANALYTICS_FILE = path.join(__dirname, '../../data/analytics.json');

const readAnalytics = () => {
  try {
    if (!fs.existsSync(ANALYTICS_FILE)) return {};
    return JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8'));
  } catch {
    return {};
  }
};

const writeAnalytics = (data) => {
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2), 'utf8');
};

const HEATMAP_FILE = path.join(__dirname, '../../data/heatmaps.json');

const readHeatmaps = () => {
  try {
    if (!fs.existsSync(HEATMAP_FILE)) return {};
    return JSON.parse(fs.readFileSync(HEATMAP_FILE, 'utf8'));
  } catch {
    return {};
  }
};

const writeHeatmaps = (data) => {
  fs.writeFileSync(HEATMAP_FILE, JSON.stringify(data), 'utf8');
};

// ── POST /api/analytics/hit ──────────────────────────────────────────────────
// Public endpoint - called by frontend on page load
router.post('/hit', (req, res) => {
  try {
    const { path } = req.body;
    if (!path || typeof path !== 'string') {
      return res.status(400).json({ error: 'Geçersiz yol (path).' });
    }

    // Format today's date as YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    const data = readAnalytics();

    // Ensure date object exists
    if (!data[today]) {
      data[today] = { total: 0, paths: {} };
    }

    // Increment counters
    data[today].total += 1;
    data[today].paths[path] = (data[today].paths[path] || 0) + 1;

    // Optional: Limit history to last 30 days to prevent huge JSON file
    const days = Object.keys(data).sort((a, b) => new Date(b) - new Date(a));
    if (days.length > 30) {
      const daysToRemove = days.slice(30);
      for (const day of daysToRemove) {
        delete data[day];
      }
    }

    writeAnalytics(data);
    res.json({ success: true });
  } catch (err) {
    console.error('[Analytics] Hit error:', err.message);
    res.status(500).json({ error: 'Hata oluştu.' });
  }
});

// ── GET /api/analytics/stats ─────────────────────────────────────────────────
// Admin only - get analytics summary
router.get('/stats', authMiddleware, (req, res) => {
  try {
    const data = readAnalytics();
    
    // Calculate total visits all time (within recorded history)
    let totalVisits = 0;
    
    // Calculate top pages overall
    const allPaths = {};
    
    // Process today
    const today = new Date().toISOString().split('T')[0];
    const todayVisits = data[today]?.total || 0;
    
    // Process past 7 days
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      past7Days.push({
        date: dateStr,
        visits: data[dateStr]?.total || 0
      });
    }

    for (const [date, info] of Object.entries(data)) {
      totalVisits += info.total || 0;
      for (const [p, count] of Object.entries(info.paths || {})) {
        allPaths[p] = (allPaths[p] || 0) + count;
      }
    }
    
    const topPages = Object.entries(allPaths)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));

    res.json({
      todayVisits,
      totalVisits,
      past7Days,
      topPages
    });
  } catch (err) {
    console.error('[Analytics] Stats error:', err.message);
    res.status(500).json({ error: 'İstatistikler alınamadı.' });
  }
});

// ── POST /api/analytics/heatmap ─────────────────────────────────────────────
router.post('/heatmap', (req, res) => {
  try {
    const { path: pagePath, points } = req.body;
    if (!pagePath || !Array.isArray(points)) {
      return res.status(400).json({ error: 'Geçersiz veri.' });
    }

    const data = readHeatmaps();
    if (!data[pagePath]) {
      data[pagePath] = [];
    }

    // Gruplama ve saklama (Çözünürlüğü 10px ızgaraya düşürerek saklayalım)
    // Böylece 1920x1080 ekranda bile çok fazla nokta olsa da dosya boyutu çok artmaz.
    const pathData = data[pagePath];
    
    for (const pt of points) {
      if (typeof pt.x !== 'number' || typeof pt.y !== 'number') continue;
      
      const gridX = Math.round(pt.x / 10) * 10;
      const gridY = Math.round(pt.y / 10) * 10;
      
      // Aynı griddeki noktayı bul
      const existing = pathData.find(p => p.x === gridX && p.y === gridY);
      if (existing) {
        existing.value += 1;
      } else {
        pathData.push({ x: gridX, y: gridY, value: 1 });
      }
    }

    // Maksimum veri sınırı (her sayfa için en fazla 5000 nokta gridi)
    // Eğer çok dolarsa düşük değerlileri temizleyebiliriz ama 10px grid genelde yeterlidir.
    if (pathData.length > 8000) {
      // Değeri en düşük olanları sil (veya rastgele sil)
      pathData.sort((a, b) => b.value - a.value);
      data[pagePath] = pathData.slice(0, 5000);
    }

    writeHeatmaps(data);
    res.json({ success: true });
  } catch (err) {
    console.error('[Analytics] Heatmap POST error:', err.message);
    res.status(500).json({ error: 'Hata oluştu.' });
  }
});

// ── GET /api/analytics/heatmap ──────────────────────────────────────────────
router.get('/heatmap', authMiddleware, (req, res) => {
  try {
    const { path: pagePath } = req.query;
    if (!pagePath) {
      return res.status(400).json({ error: 'Sayfa yolu belirtilmeli.' });
    }
    const data = readHeatmaps();
    res.json({ points: data[pagePath] || [] });
  } catch (err) {
    console.error('[Analytics] Heatmap GET error:', err.message);
    res.status(500).json({ error: 'Alınamadı.' });
  }
});

// Clear heatmap data
router.delete('/heatmap', async (req, res) => {
  try {
    writeHeatmaps({}); // Reset entirely
    res.json({ success: true, message: 'Heatmap data cleared' });
  } catch (error) {
    console.error('Error clearing heatmap data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
