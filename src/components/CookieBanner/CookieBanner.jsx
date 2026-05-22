import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from './CookieBanner.module.scss';

const STORAGE_KEY = 'geido_cookie_consent';
const SHOW_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

const CATEGORIES = [
  {
    id: 'necessary',
    titleKey: 'cookieBanner.necessary_title',
    descKey: 'cookieBanner.necessary_desc',
    locked: true,
    default: true,
  },
  {
    id: 'analytics',
    titleKey: 'cookieBanner.analytics_title',
    descKey: 'cookieBanner.analytics_desc',
    locked: false,
    default: false,
  },
  {
    id: 'marketing',
    titleKey: 'cookieBanner.marketing_title',
    descKey: 'cookieBanner.marketing_desc',
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
  const { t } = useTranslation();
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
              <span className={styles.title}>{t('cookieBanner.title')}</span>
            </div>
            <button className={styles.closeBtn} onClick={() => save('dismissed')} aria-label={t('cookieBanner.close')}>
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <p className={styles.desc}>
            {t('cookieBanner.desc')}{' '}
            <Link to="/gizlilik-politikasi" className={styles.link}>{t('cookieBanner.privacy_link')}</Link>
            {' '}ve{' '}
            <Link to="/kullanim-kosullari" className={styles.link}>{t('cookieBanner.terms_link')}</Link>
            {' '}{t('cookieBanner.desc_suffix')}
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
                        {t(cat.titleKey)}
                        {cat.locked && <span className={styles.lockedBadge}>{t('cookieBanner.necessary_badge')}</span>}
                      </span>
                      <span className={styles.prefDesc}>{t(cat.descKey)}</span>
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
              {expanded ? t('cookieBanner.hide') : t('cookieBanner.customize')}
            </button>

            <div className={styles.rightBtns}>
              {expanded && (
                <button className={styles.saveBtn} onClick={handleSaveCustom}>
                  {t('cookieBanner.save')}
                </button>
              )}
              <button className={styles.acceptBtn} onClick={handleAcceptAll}>
                {t('cookieBanner.accept_all')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
