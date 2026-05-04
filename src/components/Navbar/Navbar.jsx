import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { m } from 'framer-motion';
import clsx from 'clsx';
import Button from '../Button/Button';
import styles from './Navbar.module.scss';
import useUIStore, { splashHasShown } from '../../store/uiStore';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = React.useRef(0);
  const splashReady = useUIStore((state) => state.splashReady);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setScrolled(currentScrollY > 50);

      // Hide if scrolling down and past the header, show if scrolling up
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

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navLinks = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Projeler', path: '/projeler' },
    { name: 'Hakkında', path: '/hakkinda' },
    { name: 'İletişim', path: '/iletisim' }
  ];

  // If splash hasn't played yet, start hidden and animate in when ready
  const needsSplashAnim = !splashHasShown;

  return (
    <m.header
      className={clsx(styles.header, {
        [styles.scrolled]: scrolled,
        [styles.hidden]: hidden
      })}
      initial={needsSplashAnim ? { opacity: 0, y: -50 } : false}
      animate={needsSplashAnim ? (splashReady ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }) : undefined}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.05 }}
    >
      <div className={styles.container}>
        <Link to="/" className={styles.logo} onClick={closeMenu}>
          <div className={styles.logoIcon}>
            <span className={styles.greenTriangle}></span>
            <span className={styles.blackTriangle}></span>
          </div>
          <span className={styles.logoText}>geidostudio</span>
        </Link>

        <nav className={clsx(styles.nav, { [styles.open]: isOpen })}>
          <ul className={styles.navList}>
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) => clsx(styles.navLink, { [styles.active]: isActive })}
                  onClick={closeMenu}
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <Button to="/iletisim" variant="primary" className={styles.contactBtn}>
            Bize Ulaşın
          </Button>
          <button className={styles.mobileToggle} onClick={toggleMenu} aria-label="Toggle Menu">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
    </m.header>
  );
};

export default Navbar;
