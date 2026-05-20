import { motion, AnimatePresence } from 'framer-motion';
import styles from './AdminDashboard.module.scss';
import { useCmsForm } from './useCmsForm';
import { Save, Check, AlertCircle, User } from 'lucide-react';

const AdminAbout = () => {
  const { formData, handleChange, handleSave, isDirty, isSaving, toast } = useCmsForm();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {isDirty && (
        <div className={styles.saveBar}>
          <span className={styles.saveBarText}><AlertCircle size={16} /> Kaydedilmemiş değişiklikleriniz var</span>
          <button className={styles.saveBarBtn} onClick={handleSave} disabled={isSaving}>
            {isSaving ? <><span className={styles.spinner} /> Kaydediliyor...</> : <><Check size={16} /> Kaydet</>}
          </button>
        </div>
      )}

      <div className={styles.formGrid}>
        {/* Team Member 1: Yasarhan */}
        <div className={styles.formCard}>
          <div className={styles.formCardHeader}>
            <User size={18} />
            <h3>Yaşarhan Pekergin — Görsel Alan</h3>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Profil Görseli (URL)</label>
            <input 
              className={styles.input} 
              type="text"
              placeholder="https://example.com/yasarhan.jpg"
              value={formData.aboutTeamYasarhanImage || ''} 
              onChange={e => handleChange('aboutTeamYasarhanImage', e.target.value)} 
            />
          </div>
          {formData.aboutTeamYasarhanImage && (
            <div className={styles.previewContainer}>
              <img src={formData.aboutTeamYasarhanImage} alt="Yaşarhan Önizleme" className={styles.imagePreview} />
            </div>
          )}
        </div>

        {/* Team Member 2: Caner */}
        <div className={styles.formCard}>
          <div className={styles.formCardHeader}>
            <User size={18} />
            <h3>Caner Karakuş — Görsel Alan</h3>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Profil Görseli (URL)</label>
            <input 
              className={styles.input} 
              type="text"
              placeholder="https://example.com/caner.jpg"
              value={formData.aboutTeamCanerImage || ''} 
              onChange={e => handleChange('aboutTeamCanerImage', e.target.value)} 
            />
          </div>
          {formData.aboutTeamCanerImage && (
            <div className={styles.previewContainer}>
              <img src={formData.aboutTeamCanerImage} alt="Caner Önizleme" className={styles.imagePreview} />
            </div>
          )}
        </div>
      </div>

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

export default AdminAbout;
