import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Github, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import xIcon from '../../assets/social_icons/x.png';
import behanceIcon from '../../assets/social_icons/behance.png';
import Button from '../Button/Button';
import styles from './Footer.module.scss';
import logoImg from '../../assets/logo/geido_logo.png';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        {/* Big CTA Section */}
        <div className={styles.ctaSection}>
          <h2 className={styles.hugeTitle} dangerouslySetInnerHTML={{ __html: t('footer.cta_title') }}></h2>
          <Button to="/iletisim#contact-form" variant="primary" className={styles.ctaBtn}>
            {t('footer.contact_us')}
          </Button>
        </div>

        {/* Main Footer Content */}
        <div className={styles.mainContent}>
          <div className={styles.brandCol}>
            <Link to="/" className={styles.logo}>
              <img src={logoImg} alt="Geido Studio" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
            </Link>
            <p className={styles.brandDesc}>
              {t('footer.brand_desc')}
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
            <h3>{t('footer.quick_links')}</h3>
            <ul>
              <li><Link to="/">{t('footer.home')}</Link></li>
              <li><Link to="/projeler">{t('footer.projects')}</Link></li>
              <li><Link to="/hakkinda">{t('footer.about')}</Link></li>
              <li><Link to="/iletisim">{t('footer.contact')}</Link></li>
            </ul>
          </div>

          <div className={styles.contactCol}>
            <h3>{t('footer.contact')}</h3>
            <a href="mailto:info@geidostudio.com" className={styles.contactLink}>info@geidostudio.com</a>
            <a href="tel:+905530037403" className={styles.contactLink}>+90 (553) 003 74 03</a>
          </div>


        </div>

        {/* Bottom Section */}
        <div className={styles.bottomSection}>
          <p>© {new Date().getFullYear()} {t('footer.rights')}</p>
          <div className={styles.legalLinks}>
            <Link to="/kvkk">{t('footer.kvkk')}</Link>
            <Link to="/gizlilik-politikasi">{t('footer.privacy')}</Link>
            <Link to="/cerez-politikasi">{t('footer.cookie')}</Link>
            <Link to="/kullanim-kosullari">{t('footer.terms')}</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
