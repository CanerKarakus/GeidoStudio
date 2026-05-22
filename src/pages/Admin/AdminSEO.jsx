import { useState } from 'react';
import useCmsStore from '../../store/cmsStore';
import styles from './AdminDashboard.module.scss';
import { Save, Globe, Search, Image as ImageIcon, Hash, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminSEO = () => {
  const { cms, updateCMS } = useCmsStore();
  const [loading, setLoading] = useState(false);

  const [seo, setSeo] = useState({
    title: cms?.seoDefaults?.title || '',
    description: cms?.seoDefaults?.description || '',
    keywords: cms?.seoDefaults?.keywords || '',
    image: cms?.seoDefaults?.image || ''
  });

  const handleChange = (e) => {
    setSeo({ ...seo, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateCMS({ ...cms, seoDefaults: seo });
      alert('SEO ayarları başarıyla güncellendi!');
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
          <h1 className={styles.pageTitle}>SEO & Meta Ayarları</h1>
          <p className={styles.pageGreeting}>Sitenizin Google ve sosyal medya görünümlerini özelleştirin.</p>
        </div>
        <div className={styles.topBarActions}>
          <button className={styles.saveBtn} onClick={handleSave} disabled={loading}>
            <Save size={18} /> {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </div>

      <div className={styles.mainContent}>
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          className={styles.heroEditorGrid}
        >
          {/* Card 1: Search Engine Info */}
          <div className={styles.formCard}>
            <div className={styles.formCardHeader}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Search size={18} style={{ color: 'var(--accent)' }} /> 
                Arama Motoru (Google) Ayarları
              </h3>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                <Globe size={14} /> Varsayılan Site Başlığı (Title)
              </label>
              <input
                type="text"
                name="title"
                value={seo.title}
                onChange={handleChange}
                placeholder="Örn: Geido Studio — Gelenekten İlham Alan Tasarımlar"
                className={styles.input}
              />
              <span className={styles.charCount}>Bu başlık, arama motoru sonuçlarında en üstte mavi renkle görünür.</span>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                <Layout size={14} /> Varsayılan Site Açıklaması (Description)
              </label>
              <textarea
                name="description"
                value={seo.description}
                onChange={handleChange}
                placeholder="Sitenizi anlatan 150-160 karakterlik dikkat çekici bir açıklama girin..."
                className={styles.textarea}
                rows="3"
              />
              <span className={styles.charCount}>Google aramalarında başlığın hemen altında yer alan özet metnidir. {seo.description.length}/160 karakter.</span>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                <Hash size={14} /> Anahtar Kelimeler (Keywords)
              </label>
              <input
                type="text"
                name="keywords"
                value={seo.keywords}
                onChange={handleChange}
                placeholder="Örn: web tasarım, yazılım ajansı, kurumsal kimlik..."
                className={styles.input}
              />
              <span className={styles.charCount}>Hedef kitlenizin sizi bulabileceği kelimeleri virgülle ayırarak yazın.</span>
            </div>
          </div>

          {/* Card 2: Social Media Info */}
          <div className={styles.formCard}>
            <div className={styles.formCardHeader}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ImageIcon size={18} style={{ color: '#6366f1' }} /> 
                Sosyal Medya (OpenGraph) Ayarları
              </h3>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                <ImageIcon size={14} /> Varsayılan Paylaşım Görseli URL'si
              </label>
              <input
                type="text"
                name="image"
                value={seo.image}
                onChange={handleChange}
                placeholder="Örn: https://siteniz.com/og-image.jpg"
                className={styles.input}
              />
              <span className={styles.charCount}>
                WhatsApp, Instagram, Twitter gibi platformlarda sitenizin linkini paylaştığınızda otomatik çıkacak kapak resmidir. (1200x630px önerilir)
              </span>
            </div>
            
            {seo.image && (
              <div style={{ marginTop: '1rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <img src={seo.image} alt="SEO Preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSEO;
