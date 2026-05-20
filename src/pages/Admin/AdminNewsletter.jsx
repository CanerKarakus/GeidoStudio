import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useCmsStore from '../../store/cmsStore';
import styles from './AdminDashboard.module.scss';
import { Trash2, RefreshCw, Mail, Send, Loader2 } from 'lucide-react';
import { api } from '../../api/db';

const AdminNewsletter = () => {
  const { subscribers, refreshSubscribers, deleteSubscriber } = useCmsStore();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

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

  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    if (!window.confirm(`Bu bülten ${subscribers.length} aboneye gönderilecek. Onaylıyor musunuz?`)) return;

    setIsSending(true);
    setSendResult(null);

    try {
      const res = await api.sendNewsletter(subject, message);
      setSendResult({ type: 'success', text: res.message || 'Bülten başarıyla gönderildi.' });
      setSubject('');
      setMessage('');
    } catch (err) {
      setSendResult({ type: 'error', text: err.message || 'Gönderim başarısız.' });
    } finally {
      setIsSending(false);
      setTimeout(() => setSendResult(null), 5000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* 1. Bülten Gönderim Formu */}
      <div className={styles.formCard}>
        <div className={styles.formCardHeader}>
          <h3>Yeni Bülten Gönder</h3>
        </div>
        <div className={styles.formCardBody} style={{ padding: '1.5rem' }}>
          {sendResult && (
            <div style={{ padding: '1rem', borderRadius: '8px', marginBottom: '1rem', background: sendResult.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: sendResult.type === 'success' ? '#4ade80' : '#f87171' }}>
              {sendResult.text}
            </div>
          )}
          <form onSubmit={handleSendNewsletter} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className={styles.inputGroup} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: '#ccc' }}>Konu</label>
              <input
                type="text"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem', borderRadius: '8px' }}
                placeholder="Örn: Yeni Kampanyamız Başladı!"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
              />
            </div>
            <div className={styles.inputGroup} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: '#ccc' }}>Mesaj</label>
              <textarea
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem', borderRadius: '8px', minHeight: '150px', resize: 'vertical' }}
                placeholder="Abonelerinize iletmek istediğiniz mesajı buraya yazın..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSending || subscribers.length === 0}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#b30000', color: '#fff', padding: '1rem', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: isSending || subscribers.length === 0 ? 'not-allowed' : 'pointer', opacity: isSending || subscribers.length === 0 ? 0.7 : 1, transition: 'all 0.2s', marginTop: '0.5rem' }}
            >
              {isSending ? <Loader2 size={18} className={styles.spinner} /> : <Send size={18} />}
              {isSending ? 'Gönderiliyor...' : `Abonelere Gönder (${subscribers.length})`}
            </button>
          </form>
        </div>
      </div>

      {/* 2. Aboneler Listesi */}
      <div>
        <div className={styles.messagesHeader} style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff' }}>Aboneler Listesi</h3>
          <button
            onClick={refreshSubscribers}
            style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 1)', color: '#fff', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
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
      </div>
    </motion.div>
  );
};

export default AdminNewsletter;
