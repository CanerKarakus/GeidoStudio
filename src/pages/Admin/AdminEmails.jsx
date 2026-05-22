import { useState } from 'react';
import useCmsStore from '../../store/cmsStore';
import styles from './AdminDashboard.module.scss';
import { Save } from 'lucide-react';

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
      await updateCMS({
        ...cms,
        emailTemplates: emails
      });
      alert('E-Posta şablonları başarıyla güncellendi!');
    } catch (err) {
      alert('Hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminPage}>
      <div className={styles.pageHeader}>
        <h2 style={{ color: "#fff" }}>E-Posta Şablonları</h2>
        <br />
        <button className={styles.saveBtn} onClick={handleSave} disabled={loading}>
          <Save size={18} /> {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
        <br />
      </div>

      <p style={{ marginBottom: '2rem', color: '#666', fontSize: '14px' }}>
        Bu sayfadan, sitenize mesaj bırakanlara veya bültene abone olanlara giden otomatik mesajların içeriklerini düzenleyebilirsiniz.
      </p>

      <div className={styles.cardSection}>
        <h3 style={{ marginBottom: '1rem', color: '#fff' }}>İletişim Formu Otomatik Yanıt (Auto-Reply)</h3>
        <br />
        <div className={styles.formGroup}>
          <label>Konu (Subject)</label>
          <input
            type="text"
            name="contactAutoReplySubject"
            value={emails.contactAutoReplySubject}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Mesaj İçeriği</label>
          <textarea
            name="contactAutoReplyBody"
            value={emails.contactAutoReplyBody}
            onChange={handleChange}
            className={styles.textarea}
            rows="5"
          />
          <small>Not: İçerikte `{"{username}"}` yazdığınız yerler, formu dolduran kişinin adıyla otomatik değiştirilir.</small>
        </div>
      </div>

      <div className={styles.cardSection} style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Bülten Aboneliği (Hoşgeldin Mesajı)</h3>

        <div className={styles.formGroup}>
          <label>Konu (Subject)</label>
          <input
            type="text"
            name="newsletterWelcomeSubject"
            value={emails.newsletterWelcomeSubject}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Mesaj İçeriği</label>
          <textarea
            name="newsletterWelcomeBody"
            value={emails.newsletterWelcomeBody}
            onChange={handleChange}
            className={styles.textarea}
            rows="5"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminEmails;
