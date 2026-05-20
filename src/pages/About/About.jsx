import React, { useState } from 'react';
import useCmsStore from '../../store/cmsStore';
import { m, AnimatePresence } from 'framer-motion';
import styles from './About.module.scss';
import { Palette, Code2, X, Mail } from 'lucide-react';

const memberDetails = {
  yasarhan: {
    name: 'Yaşarhan Pekergin',
    role: 'Grafik Tasarım & Sosyal Medya Yönetimi',
    email: 'yasarhanpekergin@geidostudio.com',
    icon: <Palette size={48} />,
    bio: 'Görsel iletişimin gücüne inanarak markaların hikayelerini estetik ve akılda kalıcı tasarımlarla anlatıyoruz. Sanat ve dijital dünyanın kesiştiği noktada markanıza eşsiz bir kimlik kazandırmak için buradayım. Detaylara olan tutkumla projelerinizi hayata geçiriyorum.',
    focus: ['Marka Kimliği', 'Kullanıcı Deneyimi (UX)', 'Yaratıcı Yönetim']
  },
  caner: {
    name: 'Caner Karakuş',
    role: 'Yazılım & Teknoloji',
    email: 'canerkarakus@geidostudio.com',
    icon: <Code2 size={48} />,
    bio: 'Modern teknolojileri kullanarak performanslı, güvenli ve ölçeklenebilir dijital çözümler üretiyoruz. Kullanıcı deneyimini kodun gücüyle birleştirerek sadece çalışan değil, aynı zamanda fark yaratan web ve mobil uygulamalar geliştiriyorum.',
    focus: ['Full-Stack Geliştirme', 'Sistem Mimarisi', 'Performans Optimizasyonu']
  }
};

const About = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  const cms = useCmsStore(state => state.cms);

  const closeModal = () => setSelectedMember(null);

  return (
    <div className={styles.aboutPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.subtitle}>Hakkımızda</span>
          <h1 className={styles.title}>{cms?.aboutTitle || 'Gelenekten İlham Alan, Geleceğe Yön Veren Tasarımlar'}</h1>
        </div>

        <m.div 
          className={styles.introSection}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className={styles.aboutText}>
            <p>{cms?.aboutText || 'Geido Studio, dijital dünyada markalarınızın potansiyelini en üst düzeye çıkarmak için yenilikçi, modern ve etkili çözümler sunar.'}</p>
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
              <h3 className={styles.role}>Grafik Tasarım & Sosyal Medya Yönetimi</h3>
              <a href="mailto:yasarhanpekergin@geidostudio.com" className={styles.memberEmail}>
                <Mail size={16} /> yasarhanpekergin@geidostudio.com
              </a>
              <p>Görsel iletişimin gücüne inanarak markaların hikayelerini estetik ve akılda kalıcı tasarımlarla anlatıyoruz.</p>
              
              <div className={styles.skills}>
                <div className={styles.skillGroup}>
                  <h4>Grafik Tasarım</h4>
                  <ul>
                    <li>Logo & Kurumsal Kimlik</li>
                    <li>Ambalaj Tasarımı</li>
                    <li>İllüstrasyon & Tipografi</li>
                    <li>Poster, Broşür & İnfografik</li>
                  </ul>
                </div>
                <div className={styles.skillGroup}>
                  <h4>Sosyal Medya</h4>
                  <ul>
                    <li>İçerik Üretimi & Strateji</li>
                    <li>Görsel & Topluluk Yönetimi</li>
                    <li>Analiz & Raporlama</li>
                    <li>Reklam Görselleri</li>
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
              <h3 className={styles.role}>Yazılım & Teknoloji</h3>
              <a href="mailto:canerkarakus@geidostudio.com" className={styles.memberEmail}>
                <Mail size={16} /> canerkarakus@geidostudio.com
              </a>
              <p>Modern teknolojileri kullanarak performanslı, güvenli ve ölçeklenebilir dijital çözümler üretiyoruz.</p>
              
              <div className={styles.skills}>
                <div className={styles.skillGroup}>
                  <h4>Geliştirme</h4>
                  <ul>
                    <li>Web & Mobil Tasarım</li>
                    <li>Web & Mobil Geliştirme</li>
                    <li>E-ticaret Çözümleri</li>
                  </ul>
                </div>
                <div className={styles.skillGroup}>
                  <h4>Sistem</h4>
                  <ul>
                    <li>Script Hazırlama</li>
                    <li>Otomasyon</li>
                    <li>API Entegrasyonu</li>
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
                  <span className={styles.modalRole}>{memberDetails[selectedMember].role}</span>
                </div>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.modalEmail}>
                  <Mail size={18} />
                  <a href={`mailto:${memberDetails[selectedMember].email}`}>{memberDetails[selectedMember].email}</a>
                </div>
                <p>{memberDetails[selectedMember].bio}</p>
                
                <div className={styles.focusArea}>
                  <h4>Uzmanlık Alanları</h4>
                  <div className={styles.tags}>
                    {memberDetails[selectedMember].focus.map((item, index) => (
                      <span key={index} className={styles.tag}>{item}</span>
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
