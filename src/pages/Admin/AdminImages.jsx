import { motion, AnimatePresence } from 'framer-motion';
import styles from './AdminDashboard.module.scss';
import { useCmsForm } from './useCmsForm';
import { Image as ImageIcon, Check, AlertCircle } from 'lucide-react';

const AdminImages = () => {
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

      <div className={styles.formCard}>
        <div className={styles.formCardHeader}><h3>Hakkımızda Görseli</h3></div>
        <div className={styles.imageItem}>
          <div className={styles.imagePreviewLg}
            style={{ backgroundImage: `url(${formData.aboutImage || ''})` }}>
            {!formData.aboutImage && <ImageIcon size={24} className={styles.imgPlaceholderIcon} />}
          </div>
          <div className={styles.imageItemRight}>
            <label className={styles.fieldLabel}>Görsel URL</label>
            <input className={styles.input} type="text" placeholder="https://example.com/image.jpg"
              value={formData.aboutImage || ''} onChange={e => handleChange('aboutImage', e.target.value)} />
          </div>
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

export default AdminImages;
