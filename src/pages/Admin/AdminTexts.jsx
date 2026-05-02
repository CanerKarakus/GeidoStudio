import { motion, AnimatePresence } from 'framer-motion';
import styles from './AdminDashboard.module.scss';
import { useCmsForm } from './useCmsForm';
import { Save, Check, AlertCircle } from 'lucide-react';

const AdminTexts = () => {
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
        <div className={styles.formCardHeader}><h3>Hakkımızda Sayfası</h3></div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Sayfa Başlığı</label>
          <input className={styles.input} type="text"
            value={formData.aboutTitle || ''} onChange={e => handleChange('aboutTitle', e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Sayfa İçeriği</label>
          <textarea className={styles.textarea} rows={6}
            value={formData.aboutText || ''} onChange={e => handleChange('aboutText', e.target.value)} />
          <span className={styles.charCount}>{formData.aboutText?.length || 0} karakter</span>
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

export default AdminTexts;
