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

module.exports = router;
