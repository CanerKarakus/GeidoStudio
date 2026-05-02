import { motion, AnimatePresence } from 'framer-motion';
import styles from './AdminDashboard.module.scss';
import { useCmsForm } from './useCmsForm';
import { Mail, Phone, MapPin, Check, AlertCircle } from 'lucide-react';

const AdminContact = () => {
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
        <div className={styles.formCardHeader}><h3>İletişim Bilgileri</h3></div>
        <div className={styles.contactFieldsGrid}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}><Mail size={14} /> E-posta Adresi</label>
            <input className={styles.input} type="email"
              value={formData.contactEmail || ''} onChange={e => handleChange('contactEmail', e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}><Phone size={14} /> Telefon Numarası</label>
            <input className={styles.input} type="text"
              value={formData.contactPhone || ''} onChange={e => handleChange('contactPhone', e.target.value)} />
          </div>
          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label className={styles.fieldLabel}><MapPin size={14} /> Adres</label>
            <textarea className={styles.textarea} rows={2}
              value={formData.contactAddress || ''} onChange={e => handleChange('contactAddress', e.target.value)} />
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

export default AdminContact;
