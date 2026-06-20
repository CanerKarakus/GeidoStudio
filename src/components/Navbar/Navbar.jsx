import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe as GlobeIcon } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import Button from '../Button/Button';
import styles from './Navbar.module.scss';
import logoImg from '../../assets/logo/geido_logo.png';
import useChatStore from '../../store/chatStore';
import useAiStore from '../../store/aiStore';
import AILogo from '../AILogo/AILogo';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = React.useRef(0);
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { setIsOpen: setChatOpen, setIsMinimized: setChatMinimized } = useChatStore();
  const { isAiModeEnabled } = useAiStore();

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('tr') ? 'en' : 'tr';
    i18n.changeLanguage(nextLang);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Lock body scroll when sidebar open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.projects'), path: '/projeler' },
    { name: t('nav.about'), path: '/hakkinda' },
    { name: t('nav.blog'), path: '/blog' },
    { name: t('nav.contact'), path: '/iletisim' }
  ];

  return (
    <>
      <header className={clsx(styles.header, {
        [styles.scrolled]: scrolled,
        [styles.hidden]: hidden
      })}>
        <div className={styles.container}>
          {isAiModeEnabled ? (
            <AILogo />
          ) : (
            <Link to="/" className={styles.logo} onClick={closeMenu}>
              <img src={logoImg} alt="Geido Studio" style={{ height: '36px', filter: 'brightness(0) invert(1)', marginLeft: '16px' }} />
            </Link>
          )}

          {/* Desktop nav */}
          <nav className={styles.nav}>
            <ul className={styles.navList}>
              {navLinks.map((link) => (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) => clsx(styles.navLink, { [styles.active]: isActive })}
                  >
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.actions}>
            <button className={styles.langToggle} onClick={toggleLanguage} aria-label="Dil Değiştir">
              <GlobeIcon size={18} /> {i18n.language.startsWith('tr') ? 'EN' : 'TR'}
            </button>
            <Button as="button" variant="primary" className={styles.contactBtn} onClick={() => { setChatOpen(true); setChatMinimized(false); }}>
              {i18n.language.startsWith('tr') ? 'Canlı Destek' : 'Live Support'}
            </Button>
            <button className={styles.mobileToggle} onClick={toggleMenu} aria-label="Toggle Menu">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <m.div
              className={styles.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={closeMenu}
            />

            {/* Sidebar panel */}
            <m.aside
              className={styles.sidebar}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className={styles.sidebarHeader}>
                <Link to="/" className={styles.logo} onClick={closeMenu}>
                  <img src={logoImg} alt="Geido Studio" style={{ height: '36px', filter: 'brightness(0) invert(1)', marginLeft: '16px' }} />
                </Link>
                <button className={styles.closeBtn} onClick={closeMenu} aria-label="Close Menu">
                  <X size={22} />
                </button>
              </div>

              <nav className={styles.sidebarNav}>
                <ul className={styles.sidebarList}>
                  {navLinks.map((link, i) => (
                    <m.li
                      key={link.path}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 + 0.1 }}
                    >
                      <NavLink
                        to={link.path}
                        className={({ isActive }) => clsx(styles.sidebarLink, { [styles.sidebarActive]: isActive })}
                        onClick={closeMenu}
                      >
                        {link.name}
                      </NavLink>
                    </m.li>
                  ))}
                </ul>
              </nav>

              <div className={styles.sidebarFooter}>
                <button onClick={toggleLanguage} style={{background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '8px', marginBottom: '15px', width: '100%', fontWeight: 'bold'}}>
                  <GlobeIcon size={18} /> {i18n.language.startsWith('tr') ? 'Switch to English' : 'Türkçe\'ye Geç'}
                </button>
                <Button as="button" variant="primary" onClick={() => { closeMenu(); setChatOpen(true); setChatMinimized(false); }}>
                  {i18n.language.startsWith('tr') ? 'Canlı Destek' : 'Live Support'}
                </Button>
              </div>
            </m.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
