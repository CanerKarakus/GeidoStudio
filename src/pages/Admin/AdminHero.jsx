import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AdminDashboard.module.scss';
import { useCmsForm } from './useCmsForm';
import {
  Image as ImageIcon, Plus, Trash2, GripVertical, Pencil,
  Layers, Save, Check, AlertCircle, Upload
} from 'lucide-react';
import { api } from '../../api/db';

const AdminHero = () => {
  const { formData, handleChange, handleSave, updateAndSave, isDirty, isSaving, toast } = useCmsForm();
  const [dragIndex, setDragIndex] = useState(null);
  const [editingUrl, setEditingUrl] = useState(null);
  const listEndRef = useRef(null);

  const handleAdd = () => {
    const newImages = [...(formData.heroImages || []), ''];
    updateAndSave('heroImages', newImages);
    setTimeout(() => {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleImgChange = (i, val) => {
    const imgs = [...(formData.heroImages || [])];
    imgs[i] = val;
    handleChange('heroImages', imgs);
  };

  const handleRemove = (i) => {
    const imgs = [...(formData.heroImages || [])];
    imgs.splice(i, 1);
    updateAndSave('heroImages', imgs);
  };

  const handleUpload = async (index, file) => {
    if (!file) return;
    try {
      // Optional: add a temporary loading state or just wait
      const url = await api.uploadImage(file);
      const imgs = [...(formData.heroImages || [])];
      imgs[index] = url;
      updateAndSave('heroImages', imgs);
    } catch (err) {
      toast({ type: 'error', msg: err.message || 'Yükleme başarısız.' });
    }
  };

  const onDragStart = (i) => setDragIndex(i);
  const onDragOver = (e, i) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === i) return;
    const imgs = [...(formData.heroImages || [])];
    const d = imgs[dragIndex];
    imgs.splice(dragIndex, 1);
    imgs.splice(i, 0, d);
    handleChange('heroImages', imgs);
    setDragIndex(i);
  };
  const onDragEnd = () => {
    setDragIndex(null);
    updateAndSave('heroImages', formData.heroImages);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.sectionDesc}>
        <Layers size={18} />
        <span>Görselleri <strong>sürükleyerek sıralayabilirsiniz.</strong> Sol taraftaki kutucuktan <strong>kayma süresini ayarlayabilirsiniz.</strong></span>
      </div>

      {isDirty && (
        <div className={styles.saveBar}>
          <span className={styles.saveBarText}><AlertCircle size={16} /> Kaydedilmemiş değişiklikleriniz var</span>
          <button className={styles.saveBarBtn} onClick={handleSave} disabled={isSaving}>
            {isSaving ? <><span className={styles.spinner} /> Kaydediliyor...</> : <><Check size={16} /> Kaydet</>}
          </button>
        </div>
      )}

      <div className={styles.heroBannerHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <h3>{formData.heroImages?.length || 0} Görsel</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#a0a0a0', fontWeight: '500' }}>Süre (Saniye):</label>
            <input 
              type="number" 
              min="1"
              value={formData.heroSliderDuration !== undefined ? formData.heroSliderDuration : 15}
              onChange={(e) => {
                const val = e.target.value;
                handleChange('heroSliderDuration', val === '' ? '' : Number(val));
              }}
              onBlur={(e) => {
                const val = e.target.value;
                const num = val === '' || Number(val) < 1 ? 15 : Number(val);
                updateAndSave('heroSliderDuration', num);
              }}
              onKeyDown={(e) => { 
                if (e.key === 'Enter') {
                  const val = e.target.value;
                  const num = val === '' || Number(val) < 1 ? 15 : Number(val);
                  updateAndSave('heroSliderDuration', num);
                } 
              }}
              style={{ width: '60px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.4rem 0.5rem', borderRadius: '6px', fontSize: '0.9rem' }}
            />
          </div>
        </div>
        <button className={styles.addBtn} onClick={handleAdd}><Plus size={16} /> Yeni Görsel Ekle</button>
      </div>

      <div className={styles.heroBannerList}>
        {(formData.heroImages || []).map((img, index) => (
          <motion.div
            key={`hero-${index}`}
            className={`${styles.heroBannerCard} ${dragIndex === index ? styles.heroBannerDragging : ''}`}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            draggable onDragStart={() => onDragStart(index)}
            onDragOver={(e) => onDragOver(e, index)} onDragEnd={onDragEnd}
          >
            <div className={styles.heroDragHandle} title="Sıralamak için sürükleyin"><GripVertical size={18} /></div>
            <div className={styles.heroBannerOrder}>
              <span>{index + 1}</span>
              {index === 0 && <div className={styles.heroPrimaryTag}>Birincil</div>}
            </div>
            <div className={styles.heroBannerPreview} style={{ backgroundImage: img ? `url(${img})` : 'none' }}>
              {!img && <div className={styles.heroBannerEmpty}><ImageIcon size={32} /><span>URL giriniz</span></div>}
            </div>
            <div className={styles.heroBannerFooter}>
              <div className={styles.heroBannerUrlWrap}>
                {editingUrl === index ? (
                  <input className={styles.heroBannerUrlInput} type="text" autoFocus
                    placeholder="https://example.com/hero.jpg" value={img}
                    onChange={e => handleImgChange(index, e.target.value)}
                    onBlur={() => { setEditingUrl(null); handleSave(); }}
                    onKeyDown={e => { if (e.key === 'Enter') { setEditingUrl(null); handleSave(); } }} />
                ) : (
                  <>
                    <div className={styles.heroBannerUrl} onClick={() => setEditingUrl(index)} style={{ flex: 1 }}>
                      <span className={styles.urlText}>{img || 'URL girilmedi — tıklayın'}</span>
                      <Pencil size={13} />
                    </div>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.4rem', color: '#a0a0a0', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginLeft: '0.5rem' }} title="Cihazdan Yükle">
                      <Upload size={14} />
                      <input type="file" style={{ display: 'none' }} accept="image/*" onChange={e => handleUpload(index, e.target.files[0])} />
                    </label>
                  </>
                )}
              </div>
              <button className={styles.heroBannerDeleteBtn} onClick={() => handleRemove(index)} title="Görseli Sil"><Trash2 size={15} /></button>
            </div>
          </motion.div>
        ))}
        {(formData.heroImages || []).length === 0 && (
          <div className={styles.emptyImageSlot}><ImageIcon size={40} /><p>Henüz hero görseli eklenmedi.<br /><strong>"Yeni Görsel Ekle"</strong> butonuna tıklayın.</p></div>
        )}
        <div ref={listEndRef} style={{ height: '1px' }} />
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}>
            {toast.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}{toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminHero;
