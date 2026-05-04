import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import clsx from 'clsx';
import Button from '../Button/Button';
import styles from './Navbar.module.scss';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = React.useRef(0);

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

  return (
    <header className={clsx(styles.header, {
      [styles.scrolled]: scrolled,
      [styles.hidden]: hidden
    })}>
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
    </header>
  );
};

export default Navbar;
