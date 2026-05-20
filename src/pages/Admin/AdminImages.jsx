import { motion, AnimatePresence } from 'framer-motion';
import styles from './AdminDashboard.module.scss';
import { useCmsForm } from './useCmsForm';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader/ImageUploader';

const AdminImages = () => {
  const { formData, updateAndSave, isSaving, toast } = useCmsForm();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {isSaving && (
        <div className={styles.saveBar}>
          <span className={styles.saveBarText}>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Kaydediliyor...
          </span>
        </div>
      )}

      <div className={styles.formCard}>
        <div className={styles.formCardHeader}>
          <h3>Projelerimiz Görseli</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
            Görsel seçilince otomatik kaydedilir
          </span>
        </div>
        <div className={styles.formCardBody}>
          <ImageUploader
            value={formData.projectsHeroImage}
            onChange={url => updateAndSave('projectsHeroImage', url)}
            label="Projelerimiz Sayfası Hero Görseli"
          />
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
          >
            {toast.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminImages;
