import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import styles from './CookieBanner.module.scss';

const STORAGE_KEY = 'geido_cookie_consent';
const SHOW_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

const CATEGORIES = [
  {
    id: 'necessary',
    label: 'Zorunlu Çerezler',
    description: 'Sitenin temel işlevleri için gereklidir. Devre dışı bırakılamaz.',
    locked: true,
    default: true,
  },
  {
    id: 'analytics',
    label: 'Analitik Çerezler',
    description: 'Siteyi nasıl kullandığınızı anlamamıza yardımcı olur.',
    locked: false,
    default: false,
  },
  {
    id: 'marketing',
    label: 'Pazarlama Çerezleri',
    description: 'Size özel reklamlar göstermek için kullanılır.',
    locked: false,
    default: false,
  },
];

const shouldShow = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true; // Never shown
    const { ts, accepted } = JSON.parse(raw);
    if (accepted === 'all' || accepted === 'custom') {
      // Already fully accepted — check 10 min window
      return Date.now() - ts > SHOW_INTERVAL_MS;
    }
    return true;
  } catch {
    return true;
  }
};

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState(() =>
    CATEGORIES.reduce((acc, c) => ({ ...acc, [c.id]: c.default }), {})
  );

  useEffect(() => {
    // Slight delay so it doesn't flash on first render
    const t = setTimeout(() => {
      setVisible(shouldShow());
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  const save = (type) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now(), accepted: type }));
    setVisible(false);
    setExpanded(false);
  };

  const handleAcceptAll = () => {
    setPrefs(CATEGORIES.reduce((acc, c) => ({ ...acc, [c.id]: true }), {}));
    save('all');
  };

  const handleSaveCustom = () => {
    save('custom');
  };

  const handleToggle = (id) => {
    setPrefs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.banner}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.titleRow}>
              <Cookie size={18} className={styles.cookieIcon} />
              <span className={styles.title}>Çerez Tercihleri</span>
            </div>
            <button className={styles.closeBtn} onClick={() => save('dismissed')} aria-label="Kapat">
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <p className={styles.desc}>
            Size daha iyi bir deneyim sunmak için çerezler kullanıyoruz.{' '}
            <a href="#" className={styles.link}>Gizlilik Politikası</a>
            {' '}ve{' '}
            <a href="#" className={styles.link}>Kullanım Koşulları</a>
            {' '}belgelerimizi inceleyebilirsiniz.
          </p>

          {/* Expanded preferences */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                className={styles.preferences}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {CATEGORIES.map((cat) => (
                  <div key={cat.id} className={styles.prefItem}>
                    <div className={styles.prefInfo}>
                      <span className={styles.prefLabel}>
                        {cat.label}
                        {cat.locked && <span className={styles.lockedBadge}>Zorunlu</span>}
                      </span>
                      <span className={styles.prefDesc}>{cat.description}</span>
                    </div>
                    <button
                      className={`${styles.toggle} ${prefs[cat.id] ? styles.toggleOn : ''} ${cat.locked ? styles.toggleLocked : ''}`}
                      onClick={() => !cat.locked && handleToggle(cat.id)}
                      disabled={cat.locked}
                      aria-label={`${cat.label} ${prefs[cat.id] ? 'açık' : 'kapalı'}`}
                    >
                      <span className={styles.toggleThumb}>
                        {prefs[cat.id] && <Check size={9} />}
                      </span>
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              className={styles.customizeBtn}
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {expanded ? 'Gizle' : 'Özelleştir'}
            </button>

            <div className={styles.rightBtns}>
              {expanded && (
                <button className={styles.saveBtn} onClick={handleSaveCustom}>
                  Kaydet
                </button>
              )}
              <button className={styles.acceptBtn} onClick={handleAcceptAll}>
                Tümünü Kabul Et
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
