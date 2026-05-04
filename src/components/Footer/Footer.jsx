import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Github, X, ArrowUpRight } from 'lucide-react';
import Button from '../Button/Button';
import styles from './Footer.module.scss';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        {/* Big CTA Section */}
        <div className={styles.ctaSection}>
          <h2 className={styles.hugeTitle}>Projenizi Hayata<br/>Geçirelim.</h2>
          <Button to="/iletisim" variant="primary" className={styles.ctaBtn}>
            Bize Ulaşın
          </Button>
        </div>

        {/* Main Footer Content */}
        <div className={styles.mainContent}>
          <div className={styles.brandCol}>
            <Link to="/" className={styles.logo}>
              <div className={styles.logoIcon}>
                <span className={styles.greenTriangle}></span>
                <span className={styles.whiteTriangle}></span>
              </div>
              <span className={styles.logoText}>geidostudio</span>
            </Link>
            <p className={styles.brandDesc}>
              Dijital dünyada iz bırakan, yaratıcı ve yenilikçi çözümler üretiyoruz. Markanızı geleceğe taşıyoruz.
            </p>
            <div className={styles.socials}>
              <a href="https://www.instagram.com/geido.studio/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={20} /></a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X"><X size={18} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={20} /></a>
              <a href="https://www.behance.net/YasarhanPekergin" target="_blank" rel="noopener noreferrer" aria-label="Behance">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12h2a2 2 0 0 1 0 4h-2v-4z"/><path d="M9 6h2a2 2 0 0 1 0 4h-2V6z"/><path d="M12 20H5V4h7a4 4 0 0 1 0 8 4 4 0 0 1 0 8z"/><path d="M18 12h4"/><path d="M21 15c0 1.1-.9 2-2 2s-2-.9-2-2v-1c0-1.1.9-2 2-2s2 .9 2 2v1z"/>
                </svg>
              </a>
              <a href="https://github.com/CanerKarakus" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github size={20} /></a>
            </div>
          </div>

          <div className={styles.linksCol}>
            <h3>Hızlı Menü</h3>
            <ul>
              <li><Link to="/">Ana Sayfa</Link></li>
              <li><Link to="/projeler">Projeler</Link></li>
              <li><Link to="/hakkinda">Hakkımızda</Link></li>
              <li><Link to="/iletisim">İletişim</Link></li>
            </ul>
          </div>

          <div className={styles.contactCol}>
            <h3>İletişim</h3>
            <a href="mailto:hello@geidostudio.com" className={styles.contactLink}>hello@geidostudio.com</a>
            <a href="tel:+905551234567" className={styles.contactLink}>+90 (555) 123 45 67</a>
            <p className={styles.address}>Levent, Beşiktaş<br/>İstanbul, Türkiye</p>
          </div>


        </div>

        {/* Bottom Section */}
        <div className={styles.bottomSection}>
          <p>© {new Date().getFullYear()} Geido Studio. Tüm hakları saklıdır.</p>
          <div className={styles.legalLinks}>
            <Link to="/gizlilik-politikasi">Gizlilik Politikası</Link>
            <Link to="/kullanim-kosullari">Kullanım Koşulları</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
