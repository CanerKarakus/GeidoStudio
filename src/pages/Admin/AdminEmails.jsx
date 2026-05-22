import { useState } from 'react';
import useCmsStore from '../../store/cmsStore';
import styles from './AdminDashboard.module.scss';
import { Save, Mail, Send, UserPlus, Type, AlignLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminEmails = () => {
  const { cms, updateCMS } = useCmsStore();
  const [loading, setLoading] = useState(false);

  const [emails, setEmails] = useState({
    contactAutoReplySubject: cms?.emailTemplates?.contactAutoReplySubject || '',
    contactAutoReplyBody: cms?.emailTemplates?.contactAutoReplyBody || '',
    newsletterWelcomeSubject: cms?.emailTemplates?.newsletterWelcomeSubject || '',
    newsletterWelcomeBody: cms?.emailTemplates?.newsletterWelcomeBody || '',
  });

  const handleChange = (e) => {
    setEmails({ ...emails, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateCMS({ ...cms, emailTemplates: emails });
      alert('E-Posta şablonları başarıyla güncellendi!');
    } catch (err) {
      alert('Hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.mainWrapper}>
      {/* Sticky Top Bar */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.pageTitle}>E-Posta Şablonları</h1>
          <p className={styles.pageGreeting}>Sistemden gönderilen otomatik e-postaların içeriklerini yönetin.</p>
        </div>
        <div className={styles.topBarActions}>
          <button className={styles.saveBtn} onClick={handleSave} disabled={loading}>
            <Save size={18} /> {loading ? 'Kaydediliyor...' : 'Şablonları Kaydet'}
          </button>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.sectionDesc}>
          <Mail size={16} /> 
          Buradaki şablonlar, müşterileriniz form doldurduğunda veya bültene abone olduğunda onlara anında giden profesyonel şirket e-postalarıdır.
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          className={styles.heroEditorGrid}
        >
          {/* Card 1: Contact Auto-Reply */}
          <div className={styles.formCard}>
            <div className={styles.formCardHeader}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Send size={18} style={{ color: 'var(--accent)' }} /> 
                İletişim Formu Otomatik Yanıt (Auto-Reply)
              </h3>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                <Type size={14} /> E-Posta Konusu (Subject)
              </label>
              <input
                type="text"
                name="contactAutoReplySubject"
                value={emails.contactAutoReplySubject}
                onChange={handleChange}
                placeholder="Örn: Mesajınızı Aldık - Geido Studio"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                <AlignLeft size={14} /> Mesaj İçeriği
              </label>
              <textarea
                name="contactAutoReplyBody"
                value={emails.contactAutoReplyBody}
                onChange={handleChange}
                placeholder="Müşterinize iletilecek sıcak bir teşekkür mesajı yazın..."
                className={styles.textarea}
                rows="6"
              />
              <span className={styles.charCount}>
                İpucu: İçerikte <strong>{"{username}"}</strong> yazdığınız yerler, formu dolduran müşterinin adıyla otomatik olarak değiştirilir. (Örn: Merhaba {"{username}"}, mesajını aldık!)
              </span>
            </div>
          </div>

          {/* Card 2: Newsletter Welcome */}
          <div className={styles.formCard}>
            <div className={styles.formCardHeader}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <UserPlus size={18} style={{ color: '#10b981' }} /> 
                Bülten Aboneliği (Hoş Geldin Mesajı)
              </h3>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                <Type size={14} /> E-Posta Konusu (Subject)
              </label>
              <input
                type="text"
                name="newsletterWelcomeSubject"
                value={emails.newsletterWelcomeSubject}
                onChange={handleChange}
                placeholder="Örn: Geido Studio Ailesine Hoş Geldiniz!"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                <AlignLeft size={14} /> Mesaj İçeriği
              </label>
              <textarea
                name="newsletterWelcomeBody"
                value={emails.newsletterWelcomeBody}
                onChange={handleChange}
                placeholder="Abone olan kullanıcılara gönderilecek karşılama mesajını yazın..."
                className={styles.textarea}
                rows="6"
              />
              <span className={styles.charCount}>Bu e-posta sadece yeni bülten abonelerine bir defaya mahsus otomatik olarak gönderilir.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminEmails;
