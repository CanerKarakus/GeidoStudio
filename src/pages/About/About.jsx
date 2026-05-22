import React, { useState } from 'react';
import useCmsStore from '../../store/cmsStore';
import { m, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import styles from './About.module.scss';
import { Palette, Code2, X, Mail } from 'lucide-react';
import SEO from '../../components/SEO/SEO';

const memberDetails = {
  yasarhan: {
    name: 'Yaşarhan Pekergin',
    roleKey: 'yasarhan_role',
    email: 'yasarhanpekergin@geidostudio.com',
    icon: <Palette size={48} />,
    bioKey: 'yasarhan_desc',
    focusKeys: ['gd_1', 'sm_1', 'sm_2']
  },
  caner: {
    name: 'Caner Karakuş',
    roleKey: 'caner_role',
    email: 'canerkarakus@geidostudio.com',
    icon: <Code2 size={48} />,
    bioKey: 'caner_desc',
    focusKeys: ['dev_2', 'sys_3', 'sys_2']
  }
};

const About = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const [selectedMember, setSelectedMember] = useState(null);
  const cms = useCmsStore(state => state.cms);

  const closeModal = () => setSelectedMember(null);

  return (
    <div className={styles.aboutPage}>
      <SEO 
        title={t('about.seo_title')} 
        description={t('about.seo_desc')}
        keywords="hakkımızda, geido studio kimdir, kreatif ajans ekibi, vizyonumuz"
      />
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.subtitle}>{t('about.subtitle')}</span>
          <h1 className={styles.title}>{!isEn && cms?.aboutTitle ? cms.aboutTitle : t('about.default_title')}</h1>
        </div>

        <m.div 
          className={styles.introSection}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className={styles.aboutText}>
            <p>{!isEn && cms?.aboutText ? cms.aboutText : t('about.default_text')}</p>
          </div>
        </m.div>

        <div className={styles.teamSection}>
          {/* Team Member 1 */}
          <m.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={styles.memberCard}
          >
            <div className={styles.memberVisual}>
              <div 
                className={`${styles.avatarPlaceholder} ${styles.yasarhan}`}
                style={cms?.aboutTeamYasarhanImage ? { backgroundImage: `url(${cms.aboutTeamYasarhanImage})` } : {}}
              ></div>
              <div 
                className={styles.floatingIcon} 
                onClick={() => setSelectedMember('yasarhan')}
                role="button"
                tabIndex={0}
              >
                <Palette size={32} />
              </div>
            </div>
            <div className={styles.memberInfo}>
              <h2>Yaşarhan Pekergin</h2>
              <h3 className={styles.role}>{t('about.yasarhan_role')}</h3>
              <a href="mailto:yasarhanpekergin@geidostudio.com" className={styles.memberEmail}>
                <Mail size={16} /> yasarhanpekergin@geidostudio.com
              </a>
              <p>{t('about.yasarhan_desc')}</p>
              
              <div className={styles.skills}>
                <div className={styles.skillGroup}>
                  <h4>{t('about.graphic_design')}</h4>
                  <ul>
                    <li>{t('about.gd_1')}</li>
                    <li>{t('about.gd_2')}</li>
                    <li>{t('about.gd_3')}</li>
                    <li>{t('about.gd_4')}</li>
                  </ul>
                </div>
                <div className={styles.skillGroup}>
                  <h4>{t('about.social_media')}</h4>
                  <ul>
                    <li>{t('about.sm_1')}</li>
                    <li>{t('about.sm_2')}</li>
                    <li>{t('about.sm_3')}</li>
                    <li>{t('about.sm_4')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </m.div>

          {/* Team Member 2 */}
          <m.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`${styles.memberCard} ${styles.reverse}`}
          >
            <div className={styles.memberVisual}>
              <div 
                className={`${styles.avatarPlaceholder} ${styles.caner}`}
                style={cms?.aboutTeamCanerImage ? { backgroundImage: `url(${cms.aboutTeamCanerImage})` } : {}}
              ></div>
              <div 
                className={styles.floatingIcon}
                onClick={() => setSelectedMember('caner')}
                role="button"
                tabIndex={0}
              >
                <Code2 size={32} />
              </div>
            </div>
            <div className={styles.memberInfo}>
              <h2>Caner Karakuş</h2>
              <h3 className={styles.role}>{t('about.caner_role')}</h3>
              <a href="mailto:canerkarakus@geidostudio.com" className={styles.memberEmail}>
                <Mail size={16} /> canerkarakus@geidostudio.com
              </a>
              <p>{t('about.caner_desc')}</p>
              
              <div className={styles.skills}>
                <div className={styles.skillGroup}>
                  <h4>{t('about.development')}</h4>
                  <ul>
                    <li>{t('about.dev_1')}</li>
                    <li>{t('about.dev_2')}</li>
                    <li>{t('about.dev_3')}</li>
                  </ul>
                </div>
                <div className={styles.skillGroup}>
                  <h4>{t('about.system')}</h4>
                  <ul>
                    <li>{t('about.sys_1')}</li>
                    <li>{t('about.sys_2')}</li>
                    <li>{t('about.sys_3')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </m.div>
        </div>
      </div>

      {/* Modal Popup */}
      <AnimatePresence>
        {selectedMember && (
          <m.div 
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <m.div 
              className={styles.modalContent}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className={styles.closeBtn} onClick={closeModal}>
                <X size={24} />
              </button>
              
              <div className={styles.modalHeader}>
                <div className={styles.modalIcon}>
                  {memberDetails[selectedMember].icon}
                </div>
                <div>
                  <h2>{memberDetails[selectedMember].name}</h2>
                  <span className={styles.modalRole}>{t(`about.${memberDetails[selectedMember].roleKey}`)}</span>
                </div>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.modalEmail}>
                  <Mail size={18} />
                  <a href={`mailto:${memberDetails[selectedMember].email}`}>{memberDetails[selectedMember].email}</a>
                </div>
                <p>{t(`about.${memberDetails[selectedMember].bioKey}`)}</p>
                
                <div className={styles.focusArea}>
                  <h4>{t('about.expertise')}</h4>
                  <div className={styles.tags}>
                    {memberDetails[selectedMember].focusKeys.map((item, index) => (
                      <span key={index} className={styles.tag}>{t(`about.${item}`)}</span>
                    ))}
                  </div>
                </div>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default About;
