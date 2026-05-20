import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Github, ArrowUpRight } from 'lucide-react';
import xIcon from '../../assets/social_icons/x.png';
import behanceIcon from '../../assets/social_icons/behance.png';
import Button from '../Button/Button';
import styles from './Footer.module.scss';
import logoImg from '../../assets/logo/geido_logo.png';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        {/* Big CTA Section */}
        <div className={styles.ctaSection}>
          <h2 className={styles.hugeTitle}>Projenizi Hayata<br />Geçirelim.</h2>
          <Button to="/iletisim#contact-form" variant="primary" className={styles.ctaBtn}>
            Bize Ulaşın
          </Button>
        </div>

        {/* Main Footer Content */}
        <div className={styles.mainContent}>
          <div className={styles.brandCol}>
            <Link to="/" className={styles.logo}>
              <img src={logoImg} alt="Geido Studio" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
            </Link>
            <p className={styles.brandDesc}>
              Dijital dünyada iz bırakan, yaratıcı ve yenilikçi çözümler üretiyoruz. Markanızı geleceğe taşıyoruz.
            </p>
            <div className={styles.socials}>
              <a href="https://www.instagram.com/geido.studio/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={20} /></a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X">
                <img src={xIcon} alt="X" style={{ width: '22px', height: '22px' }} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={20} /></a>
              <a href="https://www.behance.net/YasarhanPekergin" target="_blank" rel="noopener noreferrer" aria-label="Behance">
                <img src={behanceIcon} alt="Behance" style={{ width: '20px', height: '20px', filter: 'brightness(0) invert(1)' }} />
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
            <a href="mailto:info@geidostudio.com" className={styles.contactLink}>hello@geidostudio.com</a>
            <a href="tel:+905530037403" className={styles.contactLink}>+90 (553) 003 74 03</a>
          </div>


        </div>

        {/* Bottom Section */}
        <div className={styles.bottomSection}>
          <p>© {new Date().getFullYear()} Geido Studio. Tüm hakları saklıdır.</p>
          <div className={styles.legalLinks}>
            <Link to="/kvkk">KVKK Aydınlatma Metni</Link>
            <Link to="/gizlilik-politikasi">Gizlilik Politikası</Link>
            <Link to="/cerez-politikasi">Çerez Politikası</Link>
            <Link to="/kullanim-kosullari">Kullanım Koşulları</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
