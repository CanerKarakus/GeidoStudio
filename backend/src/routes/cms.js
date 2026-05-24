/**
 * CMS Routes — all protected by JWT middleware
 * GET  /api/cms        - Public: get current CMS data
 * PUT  /api/cms        - Admin only: update CMS data
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const CMS_FILE = path.join(__dirname, '../../data/cms.json');

const DEFAULT_CMS = {
  heroImages: [],
  heroSliderDuration: 15,
  heroTitle: 'Hayalinizdeki Dijital Dünyayı İnşa Ediyoruz',
  heroSubtitle: 'Modern, estetik ve işlevsel web çözümleri ile markanızı geleceğe taşıyın. Profesyonel tasarım ve yazılım ajansı.',
  aboutTitle: 'Hakkımızda',
  aboutText: 'Geido Studio, dijital dünyada markalarınızın potansiyelini en üst düzeye çıkarmak için yenilikçi, modern ve etkili çözümler sunar.',
  projectsHeroImage: '',
  aboutTeamYasarhanImage: '',
  aboutTeamCanerImage: '',
  contactEmail: 'hello@geidostudio.com',
  contactPhone: '+90 (555) 123 45 67',
  contactAddress: 'Levent, Büyükdere Cd., 34330 Beşiktaş/İstanbul',
  blogs: [],
  seoDefaults: {
    title: 'Geido Studio — Gelenekten İlham Alan, Geleceğe Yön Veren Tasarımlar',
    description: 'Modern, estetik ve işlevsel web çözümleri ile markanızı geleceğe taşıyın. Profesyonel tasarım ve yazılım ajansı.',
    image: '',
    keywords: 'web tasarım, yazılım ajansı, seo, dijital pazarlama',
  },
  emailTemplates: {
    contactAutoReplySubject: 'Mesajınızı Aldık - Geido Studio',
    contactAutoReplyBody: 'Merhaba,\n\nİletişim formunuz tarafımıza başarıyla ulaşmıştır. Ekibimiz en kısa sürede sizinle iletişime geçecektir.\n\nİyi günler dileriz,\nGeido Studio Ekibi',
    newsletterWelcomeSubject: 'Bültenimize Hoş Geldiniz! - Geido Studio',
    newsletterWelcomeBody: 'Merhaba,\n\nGeido Studio bültenine başarıyla abone oldunuz! Artık en güncel haberler, tasarım trendleri ve özel içeriklerimizden anında haberdar olacaksınız.\n\nAbonelikten çıkmak isterseniz sitemizin alt kısmındaki bağlantıyı kullanabilirsiniz.\n\nİyi günler,\nGeido Studio Ekibi',
  },
  settings: {
    maintenanceMode: false
  }
};

const readCMS = () => {
  try {
    if (!fs.existsSync(CMS_FILE)) return DEFAULT_CMS;
    return JSON.parse(fs.readFileSync(CMS_FILE, 'utf8'));
  } catch {
    return DEFAULT_CMS;
  }
};

const writeCMS = (data) => {
  fs.writeFileSync(CMS_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// Allowed CMS fields — prevent unexpected data injection
const ALLOWED_FIELDS = [
  'heroImages', 'heroSliderDuration', 'heroTitle', 'heroSubtitle',
  'aboutTitle', 'aboutText', 'projectsHeroImage',
  'aboutTeamYasarhanImage', 'aboutTeamCanerImage',
  'contactEmail', 'contactPhone', 'contactAddress',
  'blogs',
  'projects',
  'contact',
  'seoDefaults',
  'emailTemplates',
  'settings'
];

// ── GET /api/cms ─────────────────────────────────────────────────────────────
// Public endpoint — frontend reads this to display content
router.get('/', (req, res) => {
  const cms = readCMS();
  return res.json(cms);
});

// ── PUT /api/cms ─────────────────────────────────────────────────────────────
// Admin only
router.put('/', authMiddleware, (req, res) => {
  try {
    console.log('[CMS PUT] Received body:', req.body);
    const current = readCMS();
    const updated = { ...current };

    // Only allow whitelisted fields
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        updated[field] = req.body[field];
      }
    }

    // Validate heroImages is an array of strings
    if (updated.heroImages && !Array.isArray(updated.heroImages)) {
      return res.status(400).json({ error: 'heroImages bir dizi olmalıdır.' });
    }

    if (updated.heroImages) {
      updated.heroImages = updated.heroImages
        .filter(url => typeof url === 'string')
        .map(url => url.trim())
        .slice(0, 10); // Max 10 images
    }

    writeCMS(updated);
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[CMS] Update error:', err.message);
    return res.status(500).json({ error: 'Kayıt sırasında hata oluştu.' });
  }
});

module.exports = router;
