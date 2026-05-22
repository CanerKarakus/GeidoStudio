import { useState, useEffect } from 'react';
import { api } from '../../api/db';
import styles from './AdminTracking.module.scss';
import { Save, Plus, Trash2, Edit2, FolderGit2, Link as LinkIcon, Tag, Activity, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminTracking = () => {
  const [trackings, setTrackings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const initialForm = { id: '', name: '', slug: '', category: 'Web Tasarım', status: 1, url: '' };
  const [form, setForm] = useState(initialForm);

  const fetchTrackings = async () => {
    try {
      const data = await api.getTrackings();
      setTrackings(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTrackings();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await api.updateTracking(form.id, {
          name: form.name,
          slug: form.slug,
          category: form.category,
          status: parseInt(form.status),
          url: form.url
        });
      } else {
        await api.createTracking({
          name: form.name,
          slug: form.slug,
          category: form.category,
          status: parseInt(form.status),
          url: form.url
        });
      }
      setForm(initialForm);
      setIsEditing(false);
      fetchTrackings();
    } catch (err) {
      alert('Hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (t) => {
    setForm({ ...t });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu projeyi silmek istediğinize emin misiniz?')) return;
    try {
      await api.deleteTracking(id);
      fetchTrackings();
    } catch (err) {
      alert('Hata: ' + err.message);
    }
  };

  const statusMap = {
    1: 'Değerlendiriliyor',
    2: 'Hazırlanıyor',
    3: 'Teslim Edildi'
  };

  return (
    <div className={styles.adminPage}>
      <div className={styles.pageHeader}>
        <h2>Müşteri Proje Takibi</h2>
        <p style={{color: '#a8b2d1', marginTop: '0.5rem'}}>Müşterilerinizin projelerinin hangi aşamada olduğunu yönetin.</p>
      </div>
      
      <div className={styles.grid}>
        {/* Form Card */}
        <motion.div 
          className={styles.card}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className={styles.cardTitle}>
            {isEditing ? <><Edit2 size={20}/> Projeyi Düzenle</> : <><Plus size={20}/> Yeni Proje Oluştur</>}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Proje / Müşteri Adı</label>
              <input 
                type="text" name="name" value={form.name} onChange={handleChange} 
                className={styles.input} placeholder="Örn: Geido Studio E-Ticaret" required 
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>URL Slug (Takip Kodu)</label>
              <input 
                type="text" name="slug" value={form.slug} onChange={handleChange} 
                className={styles.input} placeholder="Örn: geido-eticaret" required 
              />
              <span className={styles.hint}>Müşteri `site.com/takip/kod` adresiyle takip edecek.</span>
            </div>
            
            <div className={styles.formGroup}>
              <label>Kategori</label>
              <input 
                type="text" name="category" value={form.category} onChange={handleChange} 
                className={styles.input} placeholder="Örn: Kurumsal Web Sitesi" 
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Canlı Site Linki (İsteğe Bağlı)</label>
              <input 
                type="text" name="url" value={form.url || ''} onChange={handleChange} 
                className={styles.input} placeholder="Örn: geidostudio.com" 
              />
              <span className={styles.hint}>Müşteri projeye gitmek için bir buton görecek.</span>
            </div>
            
            <div className={styles.formGroup}>
              <label>Güncel Durum</label>
              <div className={styles.customSelectWrapper}>
                <div 
                  className={`${styles.customSelectValue} ${dropdownOpen ? styles.isOpen : ''}`}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {statusMap[form.status]}
                  <ChevronDown size={16} />
                </div>
                
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.ul 
                      className={styles.customSelectList}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {[1, 2, 3].map(statusId => (
                        <li 
                          key={statusId}
                          className={`${styles.customSelectOption} ${form.status === statusId ? styles.isSelected : ''}`}
                          onClick={() => {
                            setForm({ ...form, status: statusId });
                            setDropdownOpen(false);
                          }}
                        >
                          {statusMap[statusId]}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {isEditing ? <Save size={18} /> : <Plus size={18} />} 
                {loading ? 'Kaydediliyor...' : isEditing ? 'Güncelle' : 'Oluştur'}
              </button>
              {isEditing && (
                <button type="button" className={styles.cancelBtn} onClick={() => { setIsEditing(false); setForm(initialForm); }}>
                  İptal
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* List Card */}
        <motion.div 
          className={styles.card}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className={styles.cardTitle}><FolderGit2 size={20}/> Mevcut Projeler</h3>
          
          {trackings.length === 0 ? (
            <div className={styles.emptyState}>
              <FolderGit2 size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <p>Henüz proje eklenmemiş.</p>
            </div>
          ) : (
            <div className={styles.projectList}>
              <AnimatePresence>
                {trackings.map(t => (
                  <motion.div 
                    key={t.id} 
                    className={styles.projectItem}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <div className={styles.projectInfo}>
                      <h4>{t.name}</h4>
                      <div className={styles.slug}><LinkIcon size={12} style={{marginRight: '4px', display:'inline'}}/> /takip/{t.slug}</div>
                      
                      <div className={styles.projectMeta}>
                        <div className={styles.metaItem}><Tag size={14}/> {t.category}</div>
                        <div className={`${styles.metaItem} ${styles[`status${t.status}`]}`}>
                          <Activity size={14}/> <strong>{statusMap[t.status]}</strong>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.projectActions}>
                      <button onClick={() => handleEdit(t)} className={styles.editBtn} title="Düzenle">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className={styles.deleteBtn} title="Sil">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminTracking;
