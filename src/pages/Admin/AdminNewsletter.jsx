import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useCmsStore from '../../store/cmsStore';
import styles from './AdminDashboard.module.scss';
import { Trash2, RefreshCw, Mail } from 'lucide-react';

const AdminNewsletter = () => {
  const { subscribers, refreshSubscribers, deleteSubscriber } = useCmsStore();

  useEffect(() => {
    refreshSubscribers();
  }, [refreshSubscribers]);

  const handleDelete = async (id) => {
    if (!window.confirm('Bu aboneyi silmek istediğinize emin misiniz?')) return;
    
    try {
      await deleteSubscriber(id);
      alert('Abone başarıyla silindi.');
    } catch (err) {
      alert('Silme işlemi başarısız oldu.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.messagesHeader}>
        <span className={styles.msgCount}>{subscribers.length} abone</span>
        <button 
          onClick={refreshSubscribers} 
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} /> Yenile
        </button>
      </div>

      {subscribers.length === 0 ? (
        <div className={styles.emptyState}>
          <Mail size={48} />
          <h3>Henüz abone bulunmuyor</h3>
          <p>Bülten formundan kayıt olan kullanıcılar burada görünecek.</p>
        </div>
      ) : (
        <div className={styles.messagesList}>
          <AnimatePresence>
            {subscribers.map((sub, i) => (
              <motion.div key={sub.id} className={styles.messageCard}
                layout
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}>
                <div className={styles.msgAvatar}><Mail size={16} /></div>
                <div className={styles.msgContent} style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                  <div className={styles.msgTopRow}>
                    <div>
                      <span className={styles.msgName}>{sub.email}</span>
                    </div>
                    <span className={styles.msgDate}>{new Date(sub.date).toLocaleString('tr-TR')}</span>
                  </div>
                </div>
                <button className={styles.msgDeleteBtn} onClick={() => handleDelete(sub.id)} title="Sil">
                  <Trash2 size={15} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default AdminNewsletter;
