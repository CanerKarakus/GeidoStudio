import React, { useState } from 'react';
import { m } from 'framer-motion';
import { 
  ShieldCheck, 
  Gamepad2, 
  Trophy, 
  Coins, 
  QrCode, 
  Camera, 
  UserCheck, 
  Server, 
  Flame, 
  Lock, 
  Baby, 
  Trash2, 
  Mail, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowLeft,
  Calendar,
  Sparkles,
  Zap,
  Globe2,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO/SEO';
import styles from './FutbolMeydaniPrivacy.module.scss';

const FutbolMeydaniPrivacy = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('fm@geidostudio.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navItems = [
    { id: 'toplanan-veriler', label: '1. Toplanan Veriler', icon: Trophy },
    { id: 'kullanim-amaci', label: '2. Kullanım Amacı', icon: Zap },
    { id: 'ucuncu-taraf', label: '3. 3. Taraf Hizmetler', icon: Server },
    { id: 'veri-guvenligi', label: '4. Veri Güvenliği', icon: Lock },
    { id: 'cocuk-gizliligi', label: '5. Çocuk Gizliliği', icon: Baby },
    { id: 'hesap-silme', label: '6. Hesap Silme', icon: Trash2 },
    { id: 'iletisim', label: '7. İletişim', icon: Mail },
  ];

  return (
    <div className={styles.pageWrapper}>
      <SEO 
        title="Futbol Meydanı – Gizlilik Politikası"
        description="Futbol Meydanı mobil oyununun resmi gizlilik politikası ve veri güvenliği bildirimi. Kullanıcı verilerinin nasıl toplandığını, saklandığını ve korunduğunu öğrenin."
        keywords="Futbol Meydanı, gizlilik politikası, privacy policy, mobil futbol oyunu, Geido Studio, veri güvenliği, KVKK"
        url="https://geidostudio.com/futbolmeydani-privacy"
        themeColor="#08140e"
      />

      {/* TACTICAL STADIUM BACKGROUND EFFECT */}
      <div className={styles.stadiumGlow}></div>
      <div className={styles.pitchLines}>
        <svg viewBox="0 0 1000 600" preserveAspectRatio="none" className={styles.pitchSvg}>
          <rect x="20" y="20" width="960" height="560" rx="12" fill="none" stroke="rgba(34, 197, 94, 0.12)" strokeWidth="2" />
          <line x1="500" y1="20" x2="500" y2="580" stroke="rgba(34, 197, 94, 0.12)" strokeWidth="2" />
          <circle cx="500" cy="300" r="100" fill="none" stroke="rgba(34, 197, 94, 0.15)" strokeWidth="2" />
          <circle cx="500" cy="300" r="4" fill="rgba(34, 197, 94, 0.4)" />
          {/* Left Penalty Area */}
          <rect x="20" y="150" width="160" height="300" fill="none" stroke="rgba(34, 197, 94, 0.1)" strokeWidth="2" />
          <rect x="20" y="210" width="70" height="180" fill="none" stroke="rgba(34, 197, 94, 0.1)" strokeWidth="2" />
          {/* Right Penalty Area */}
          <rect x="820" y="150" width="160" height="300" fill="none" stroke="rgba(34, 197, 94, 0.1)" strokeWidth="2" />
          <rect x="910" y="210" width="70" height="180" fill="none" stroke="rgba(34, 197, 94, 0.1)" strokeWidth="2" />
        </svg>
      </div>

      <div className={styles.container}>
        
        {/* TOP BREADCRUMB / BACK LINK */}
        <div className={styles.topBar}>
          <Link to="/" className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Geido Studio</span>
          </Link>
          <div className={styles.gameBadge}>
            <Gamepad2 size={15} />
            <span>Resmi Oyun Politikası</span>
          </div>
        </div>

        {/* HERO SECTION */}
        <m.header 
          className={styles.hero}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.shieldWrapper}>
            <div className={styles.shieldGlow}></div>
            <div className={styles.shieldIconBox}>
              <ShieldCheck className={styles.shieldIcon} size={42} />
            </div>
          </div>

          <div className={styles.gameTitlePill}>
            <Sparkles size={14} />
            <span>Futbol Meydanı</span>
          </div>

          <h1 className={styles.mainHeading}>
            Futbol Meydanı <br className={styles.mobileBreak} />
            <span className={styles.gradientText}>Gizlilik Politikası</span>
          </h1>

          <div className={styles.metaRow}>
            <div className={styles.metaBadge}>
              <Calendar size={14} />
              <span>Son güncelleme: <strong>25 Ağustos 2026</strong></span>
            </div>
            <div className={styles.metaBadge}>
              <Lock size={14} />
              <span>KVKK & Veri Güvenliği Standardı</span>
            </div>
          </div>

          <div className={styles.introCard}>
            <p>
              Bu gizlilik politikası, <strong>Futbol Meydanı</strong> uygulamasının (&quot;Uygulama&quot;) 
              kullanıcı verilerini nasıl topladığını, kullandığını ve koruduğunu açıklar.
            </p>
          </div>

          {/* QUICK JUMP NAV */}
          <div className={styles.quickNav}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={styles.quickNavBtn}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </m.header>

        {/* POLICY CONTENT SECTIONS */}
        <div className={styles.contentGrid}>
          
          {/* 1. TOPLANAN VERİLER */}
          <m.section 
            id="toplanan-veriler" 
            className={styles.sectionCard}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.sectionHeader}>
              <div className={styles.sectionNumber}>01</div>
              <div className={styles.sectionTitleBlock}>
                <h2>1. Toplanan Veriler</h2>
                <p className={styles.sectionSubtitle}>Uygulama, aşağıdaki verileri toplayabilir:</p>
              </div>
            </div>

            <div className={styles.cardsSubGrid}>
              
              {/* Hesap Bilgileri */}
              <div className={styles.featureBox}>
                <div className={`${styles.iconBox} ${styles.blueGlow}`}>
                  <UserCheck size={22} />
                </div>
                <div className={styles.featureContent}>
                  <h3>Hesap bilgileri</h3>
                  <p>
                    Çevrimiçi giriş tercih eden kullanıcılardan <strong>e-posta adresi</strong> ve 
                    <strong> kullanıcı adı (takma ad)</strong> alınır.
                  </p>
                </div>
              </div>

              {/* Oyun Verileri */}
              <div className={styles.featureBox}>
                <div className={`${styles.iconBox} ${styles.goldGlow}`}>
                  <Trophy size={22} />
                </div>
                <div className={styles.featureContent}>
                  <h3>Oyun verileri</h3>
                  <p>
                    <strong>Kupa sayısı</strong>, <strong>Meydan Parası</strong>, <strong>seviye</strong>, 
                    günlük ödül geçmişi ve oyun tercihleri cihazda ve/veya sunucuda saklanır.
                  </p>
                </div>
              </div>

              {/* Çökme Raporları */}
              <div className={styles.featureBox}>
                <div className={`${styles.iconBox} ${styles.orangeGlow}`}>
                  <Flame size={22} />
                </div>
                <div className={styles.featureContent}>
                  <h3>Çökme raporları</h3>
                  <p>
                    Uygulama kararlılığını artırmak amacıyla anonim çökme ve hata raporları 
                    <strong> Firebase Crashlytics</strong> aracılığıyla toplanır. Bu veriler kişisel kimlik içermez.
                  </p>
                </div>
              </div>

              {/* Kamera & QR */}
              <div className={styles.featureBox}>
                <div className={`${styles.iconBox} ${styles.greenGlow}`}>
                  <QrCode size={22} />
                </div>
                <div className={styles.featureContent}>
                  <h3>Kamera</h3>
                  <p>
                    Oda davet QR kodlarını taramak için kamera izni istenir. 
                    <strong> Kamera görüntüleri kaydedilmez, saklanmaz veya paylaşılmaz.</strong>
                  </p>
                </div>
              </div>

            </div>
          </m.section>

          {/* 2. VERİLERİN KULLANIM AMACI */}
          <m.section 
            id="kullanim-amaci" 
            className={styles.sectionCard}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.sectionHeader}>
              <div className={styles.sectionNumber}>02</div>
              <div className={styles.sectionTitleBlock}>
                <h2>2. Verilerin Kullanım Amacı</h2>
                <p className={styles.sectionSubtitle}>Toplanan veriler yalnızca şu amaçlarla kullanılır:</p>
              </div>
            </div>

            <div className={styles.purposeGrid}>
              <div className={styles.purposeItem}>
                <div className={styles.checkIconBox}>
                  <CheckCircle2 size={20} />
                </div>
                <div className={styles.purposeText}>
                  <h4>Kullanıcı Hesabı Yönetimi</h4>
                  <p>Kullanıcı hesabının oluşturulması ve yönetilmesi</p>
                </div>
              </div>

              <div className={styles.purposeItem}>
                <div className={styles.checkIconBox}>
                  <CheckCircle2 size={20} />
                </div>
                <div className={styles.purposeText}>
                  <h4>Oyun İlerlemesi ve Senkronizasyon</h4>
                  <p>Oyun ilerlemesinin kaydedilmesi ve senkronize edilmesi</p>
                </div>
              </div>

              <div className={styles.purposeItem}>
                <div className={styles.checkIconBox}>
                  <CheckCircle2 size={20} />
                </div>
                <div className={styles.purposeText}>
                  <h4>Eşleştirme ve Oda Sistemi</h4>
                  <p>Çevrimiçi maçlarda rakip eşleştirme ve oda sistemi</p>
                </div>
              </div>

              <div className={styles.purposeItem}>
                <div className={styles.checkIconBox}>
                  <CheckCircle2 size={20} />
                </div>
                <div className={styles.purposeText}>
                  <h4>Hata Tespiti ve Giderme</h4>
                  <p>Uygulamadaki hataların tespit edilip giderilmesi</p>
                </div>
              </div>
            </div>
          </m.section>

          {/* 3. ÜÇÜNCÜ TARAF HİZMETLER */}
          <m.section 
            id="ucuncu-taraf" 
            className={styles.sectionCard}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.sectionHeader}>
              <div className={styles.sectionNumber}>03</div>
              <div className={styles.sectionTitleBlock}>
                <h2>3. Üçüncü Taraf Hizmetler</h2>
                <p className={styles.sectionSubtitle}>Uygulama aşağıdaki üçüncü taraf hizmetlerini kullanır:</p>
              </div>
            </div>

            <div className={styles.thirdPartyList}>
              
              {/* Supabase */}
              <div className={styles.thirdPartyCard}>
                <div className={styles.tpHeader}>
                  <div className={styles.tpBadge}>
                    <Server size={18} />
                    <span>Supabase</span>
                  </div>
                  <a 
                    href="https://supabase.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.tpLink}
                  >
                    <span>supabase.com/privacy</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
                <p className={styles.tpDesc}>
                  Kullanıcı kimlik doğrulama ve oyun verilerinin sunucu tarafında saklanması için kullanılır.
                </p>
              </div>

              {/* Firebase Crashlytics */}
              <div className={styles.thirdPartyCard}>
                <div className={styles.tpHeader}>
                  <div className={styles.tpBadge}>
                    <Flame size={18} />
                    <span>Firebase Crashlytics (Google)</span>
                  </div>
                  <a 
                    href="https://firebase.google.com/support/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.tpLink}
                  >
                    <span>firebase.google.com/support/privacy</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
                <p className={styles.tpDesc}>
                  Anonim çökme raporu için kullanılır. Hata analizleri kullanıcı kimliğiyle ilişkilendirilmez.
                </p>
              </div>

              {/* Google & Apple Sign-In */}
              <div className={styles.thirdPartyCard}>
                <div className={styles.tpHeader}>
                  <div className={styles.tpBadge}>
                    <Globe2 size={18} />
                    <span>Google Sign-In / Apple Sign-In</span>
                  </div>
                  <span className={styles.tpTag}>OAuth 2.0</span>
                </div>
                <p className={styles.tpDesc}>
                  İsteğe bağlı sosyal giriş seçenekleri. <strong>Yalnızca kimlik doğrulama amacıyla kullanılır.</strong>
                </p>
              </div>

            </div>
          </m.section>

          {/* 4. VERİ GÜVENLİĞİ */}
          <m.section 
            id="veri-guvenligi" 
            className={styles.sectionCard}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.sectionHeader}>
              <div className={styles.sectionNumber}>04</div>
              <div className={styles.sectionTitleBlock}>
                <h2>4. Veri Güvenliği</h2>
                <p className={styles.sectionSubtitle}>Endüstriyel standartlarda tam koruma</p>
              </div>
            </div>

            <div className={styles.securityBox}>
              <div className={styles.securityIconBox}>
                <Lock size={32} />
              </div>
              <div className={styles.securityText}>
                <p>
                  Kullanıcı verileri endüstri standardı şifreleme yöntemleriyle korunur. 
                </p>
                <div className={styles.highlightBadge}>
                  <ShieldCheck size={16} />
                  <span>Verileriniz asla üçüncü taraflarla pazarlama amacıyla paylaşılmaz veya satılmaz.</span>
                </div>
              </div>
            </div>
          </m.section>

          {/* 5. ÇOCUKLARIN GİZLİLİĞİ */}
          <m.section 
            id="cocuk-gizliligi" 
            className={styles.sectionCard}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.sectionHeader}>
              <div className={styles.sectionNumber}>05</div>
              <div className={styles.sectionTitleBlock}>
                <h2>5. Çocukların Gizliliği</h2>
                <p className={styles.sectionSubtitle}>13 yaş altı kullanıcı güvenliği ve COPPA uyumluluğu</p>
              </div>
            </div>

            <div className={styles.kidsBox}>
              <div className={styles.kidsIconBox}>
                <Baby size={28} />
              </div>
              <p>
                Uygulama <strong>13 yaş altı çocuklara yönelik değildir</strong> ve bu yaş grubundan bilerek veri toplanmaz.
              </p>
            </div>
          </m.section>

          {/* 6. HESAP SİLME */}
          <m.section 
            id="hesap-silme" 
            className={`${styles.sectionCard} ${styles.deletionCard}`}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.sectionHeader}>
              <div className={styles.sectionNumber}>06</div>
              <div className={styles.sectionTitleBlock}>
                <h2>6. Hesap Silme</h2>
                <p className={styles.sectionSubtitle}>Verilerinizi dilediğiniz an tamamen silme hakkı</p>
              </div>
            </div>

            <div className={styles.deletionFlow}>
              <div className={styles.deletionInfo}>
                <div className={styles.trashIconBox}>
                  <Trash2 size={24} />
                </div>
                <p>
                  Hesabınızı ve ilgili tüm verilerinizi silmek için <strong>uygulama içi ayarlar bölümünden hesap silme işlemini gerçekleştirebilirsiniz</strong>.
                </p>
              </div>

              <div className={styles.stepGuide}>
                <div className={styles.stepItem}>
                  <span className={styles.stepNum}>1</span>
                  <span>Uygulamayı Açın</span>
                </div>
                <div className={styles.stepArrow}>→</div>
                <div className={styles.stepItem}>
                  <span className={styles.stepNum}>2</span>
                  <span>Ayarlar Menüsü</span>
                </div>
                <div className={styles.stepArrow}>→</div>
                <div className={styles.stepItem}>
                  <span className={styles.stepNum}>3</span>
                  <span>Hesabımı Sil</span>
                </div>
              </div>
            </div>
          </m.section>

          {/* 7. İLETİŞİM */}
          <m.section 
            id="iletisim" 
            className={`${styles.sectionCard} ${styles.contactCard}`}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.sectionHeader}>
              <div className={styles.sectionNumber}>07</div>
              <div className={styles.sectionTitleBlock}>
                <h2>7. İletişim</h2>
                <p className={styles.sectionSubtitle}>Gizlilikle ilgili tüm sorularınız için bize ulaşın</p>
              </div>
            </div>

            <div className={styles.contactActionBox}>
              <div className={styles.contactEmailWrapper}>
                <div className={styles.mailIconCircle}>
                  <Mail size={24} />
                </div>
                <div className={styles.contactDetails}>
                  <span className={styles.contactLabel}>Gizlilik ve Destek E-Postası</span>
                  <a href="mailto:fm@geidostudio.com" className={styles.emailText}>
                    fm@geidostudio.com
                  </a>
                </div>
              </div>

              <div className={styles.contactBtns}>
                <button 
                  onClick={handleCopyEmail} 
                  className={styles.copyBtn}
                  title="E-posta Adresini Kopyala"
                >
                  {copied ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
                  <span>{copied ? 'Kopyalandı!' : 'Kopyala'}</span>
                </button>
                <a 
                  href="mailto:fm@geidostudio.com?subject=Futbol%20Meydanı%20-%20Gizlilik%20Politikası%20Hakkında" 
                  className={styles.sendMailBtn}
                >
                  <span>E-posta Gönder</span>
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </m.section>

        </div>

        {/* BOTTOM BRAND FOOTNOTE */}
        <div className={styles.bottomBrand}>
          <p>© {new Date().getFullYear()} Futbol Meydanı — Geido Studio tarafından geliştirilmektedir.</p>
          <div className={styles.bottomLinks}>
            <Link to="/gizlilik-politikasi">Geido Studio Gizlilik Politikası</Link>
            <span>•</span>
            <Link to="/kullanim-kosullari">Kullanım Koşulları</Link>
            <span>•</span>
            <Link to="/iletisim">İletişim</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FutbolMeydaniPrivacy;
