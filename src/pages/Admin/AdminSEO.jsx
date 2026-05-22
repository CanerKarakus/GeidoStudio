import { useState } from 'react';
import useCmsStore from '../../store/cmsStore';
import styles from './AdminDashboard.module.scss';
import { Save } from 'lucide-react';
import { color } from 'framer-motion';

const AdminSEO = () => {
  const { cms, updateCMS } = useCmsStore();
  const [loading, setLoading] = useState(false);

  // Local state initialized with CMS data or defaults
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
      await updateCMS({
        ...cms,
        seoDefaults: seo
      });
      alert('SEO ayarları başarıyla güncellendi!');
    } catch (err) {
      alert('Hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminPage}>
      <div className={styles.pageHeader}>
        <h2 style={{ color: "#fff" }}>SEO ve Meta Ayarları</h2>
        <br />
        <button className={styles.saveBtn} onClick={handleSave} disabled={loading}>
          <Save size={18} /> {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
      <br />

      <div className={styles.formGroup}>
        <label>Sitenin Varsayılan Başlığı (Title)</label>
        <input
          type="text"
          name="title"
          value={seo.title}
          onChange={handleChange}
          placeholder="Örn: Geido Studio — Gelenekten İlham Alan, Geleceğe Yön Veren Tasarımlar"
          className={styles.input}
        />
        <small>Bu başlık, özel başlık girilmemiş olan tüm sayfalarda ve arama motorlarında görünür.</small>
      </div>

      <div className={styles.formGroup}>
        <label>Sitenin Varsayılan Açıklaması (Description)</label>
        <textarea
          name="description"
          value={seo.description}
          onChange={handleChange}
          placeholder="Sitenizi anlatan 150-160 karakterlik kısa bir açıklama girin..."
          className={styles.textarea}
          rows="3"
        />
        <small>Google aramalarında başlığın hemen altında yer alan metindir.</small>
      </div>

      <div className={styles.formGroup}>
        <label>Anahtar Kelimeler (Keywords)</label>
        <input
          type="text"
          name="keywords"
          value={seo.keywords}
          onChange={handleChange}
          placeholder="Örn: web tasarım, grafik tasarım, seo, yazılım ajansı"
          className={styles.input}
        />
        <small>Kelimeleri virgül (,) ile ayırarak yazınız.</small>
      </div>

      <div className={styles.formGroup}>
        <label>Varsayılan Paylaşım Görseli (OpenGraph Image URL)</label>
        <input
          type="text"
          name="image"
          value={seo.image}
          onChange={handleChange}
          placeholder="Örn: https://geidostudio.com/logo_icon.png"
          className={styles.input}
        />
        <small>Sitenizin linki WhatsApp, Twitter, Facebook gibi yerlerde paylaşıldığında otomatik çıkacak resimdir. Resmin tam URL adresini girmelisiniz.</small>
      </div>
    </div>
  );
};

export default AdminSEO;
