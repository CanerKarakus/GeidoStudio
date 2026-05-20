import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import Button from '../Button/Button';
import styles from './Navbar.module.scss';
import logoImg from '../../assets/logo/geido_logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = React.useRef(0);
  const location = useLocation();

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
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Projeler', path: '/projeler' },
    { name: 'Hakkında', path: '/hakkinda' },
    { name: 'Blog', path: '/blog' },
    { name: 'İletişim', path: '/iletisim' }
  ];

  return (
    <>
      <header className={clsx(styles.header, {
        [styles.scrolled]: scrolled,
        [styles.hidden]: hidden
      })}>
        <div className={styles.container}>
          <Link to="/" className={styles.logo} onClick={closeMenu}>
            <img src={logoImg} alt="Geido Studio" style={{ height: '36px', filter: 'brightness(0) invert(1)', marginLeft: '16px' }} />
          </Link>

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
            <Button to="/iletisim#contact-form" variant="primary" className={styles.contactBtn}>
              Bize Ulaşın
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
                <Button to="/iletisim#contact-form" variant="primary" onClick={closeMenu}>
                  Bize Ulaşın
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
