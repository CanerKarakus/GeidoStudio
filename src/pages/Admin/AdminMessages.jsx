import { motion } from 'framer-motion';
import useCmsStore from '../../store/cmsStore';
import styles from './AdminDashboard.module.scss';
import { MessageSquare, Trash2, Phone } from 'lucide-react';

const AdminMessages = () => {
  const { messages, deleteMessage } = useCmsStore();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.messagesHeader}>
        <span className={styles.msgCount}>{messages.length} mesaj</span>
      </div>

      {messages.length === 0 ? (
        <div className={styles.emptyState}>
          <MessageSquare size={48} />
          <h3>Henüz mesaj bulunmuyor</h3>
          <p>İletişim formundan gelen mesajlar burada görünecek.</p>
        </div>
      ) : (
        <div className={styles.messagesList}>
          {messages.map((msg, i) => (
            <motion.div key={msg.id} className={styles.messageCard}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}>
              <div className={styles.msgAvatar}>{msg.name?.[0]?.toUpperCase()}</div>
              <div className={styles.msgContent}>
                <div className={styles.msgTopRow}>
                  <div>
                    <span className={styles.msgName}>{msg.name}</span>
                    <span className={styles.msgEmail}>{msg.email}</span>
                  </div>
                  <span className={styles.msgDate}>{new Date(msg.date).toLocaleString('tr-TR')}</span>
                </div>
                {msg.subject && <div className={styles.msgSubject}>{msg.subject}</div>}
                <p className={styles.msgText}>{msg.message}</p>
                {msg.phone && <div className={styles.msgPhone}><Phone size={12} /> {msg.phone}</div>}
              </div>
              <button className={styles.msgDeleteBtn} onClick={() => deleteMessage(msg.id)} title="Sil">
                <Trash2 size={15} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AdminMessages;
