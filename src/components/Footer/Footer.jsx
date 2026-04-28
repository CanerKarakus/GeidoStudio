import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Facebook, Dribbble, Instagram, ArrowUpRight } from 'lucide-react';
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
              <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
              <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
              <a href="#" aria-label="Dribbble"><Dribbble size={20} /></a>
              <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
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

          <div className={styles.storeCol}>
             <h3>Uygulamalarımız</h3>
             <div className={styles.storeLogos}>
                <a href="#" className={styles.storeBtn} aria-label="Download on the App Store">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" />
                </a>
                <a href="#" className={styles.storeBtn} aria-label="Get it on Google Play">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" />
                </a>
             </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={styles.bottomSection}>
          <p>© {new Date().getFullYear()} Geido Studio. Tüm hakları saklıdır.</p>
          <div className={styles.legalLinks}>
            <Link to="/">Gizlilik Politikası</Link>
            <Link to="/">Kullanım Koşulları</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
