import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import useCmsStore from '../../store/cmsStore';
import styles from './AdminDashboard.module.scss';
import { MessageSquare, Trash2, Phone, ArrowLeft, Send } from 'lucide-react';

const AdminMessages = () => {
  const { messages, deleteMessage, replyToMessage } = useCmsStore();
  const [selectedMsgId, setSelectedMsgId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef(null);

  const selectedMsg = messages.find(m => m.id === selectedMsgId);

  useEffect(() => {
    if (selectedMsg && !selectedMsg.read) {
      useCmsStore.getState().markMessageAsRead(selectedMsg.id).catch(console.error);
    }
  }, [selectedMsg]);

  useEffect(() => {
    if (selectedMsgId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedMsg?.replies?.length, selectedMsgId]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    const text = replyText;
    setReplyText(''); // optimistic clear
    try {
      await replyToMessage(selectedMsgId, text);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Sunucuya ulaşılamadı. Lütfen tekrar deneyin.');
      setReplyText(text); // revert
    }
  };

  if (selectedMsg) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '600px', backgroundColor: 'rgba(15, 15, 20, 0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '16px', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => setSelectedMsgId(null)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', padding: '0.6rem 1rem', borderRadius: '10px', transition: 'all 0.2s', fontWeight: '500' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
            <ArrowLeft size={18} /> Geri Dön
          </button>
          <div style={{ marginLeft: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#ffffff', fontWeight: '700', letterSpacing: '-0.5px' }}>{selectedMsg.name}</h3>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{selectedMsg.email}</span>
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem 0' }}>
          {/* Initial Message */}
          <div style={{ alignSelf: 'flex-start', maxWidth: '80%', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '20px', borderTopLeftRadius: 4, border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
               <span>{new Date(selectedMsg.date).toLocaleString('tr-TR')}</span>
            </div>
            {selectedMsg.subject && <div style={{ fontWeight: '600', marginBottom: '0.75rem', color: '#e5e7eb', fontSize: '1.1rem' }}>{selectedMsg.subject}</div>}
            <div style={{ whiteSpace: 'pre-wrap', color: '#9ca3af', lineHeight: '1.7', fontSize: '0.95rem' }}>{selectedMsg.message}</div>
          </div>
          
          {/* Replies */}
          {selectedMsg.replies?.map(reply => (
            <div key={reply.id} style={{ 
              alignSelf: reply.sender === 'admin' ? 'flex-end' : 'flex-start', 
              maxWidth: '80%', 
              background: reply.sender === 'admin' ? 'linear-gradient(135deg, #b30000, #7c0000)' : 'rgba(255,255,255,0.03)', 
              color: reply.sender === 'admin' ? '#ffffff' : '#9ca3af',
              padding: '1.5rem', 
              borderRadius: '20px', 
              borderTopRightRadius: reply.sender === 'admin' ? 4 : '20px',
              borderTopLeftRadius: reply.sender === 'admin' ? '20px' : 4,
              border: reply.sender === 'admin' ? 'none' : '1px solid rgba(255,255,255,0.05)',
              boxShadow: reply.sender === 'admin' ? '0 10px 25px rgba(179,0,0,0.3)' : 'none'
            }}>
              <div style={{ fontSize: '0.75rem', color: reply.sender === 'admin' ? 'rgba(255,255,255,0.7)' : '#6b7280', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {reply.sender === 'admin' ? 'Siz' : selectedMsg.name} • {new Date(reply.date).toLocaleString('tr-TR')}
              </div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '0.95rem' }}>{reply.text}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleReply} style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <input 
            type="text" 
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Yanıtınızı buraya yazın..." 
            style={{ flex: 1, padding: '1rem 1.5rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', fontSize: '0.95rem', background: 'rgba(0,0,0,0.4)', color: '#ffffff', transition: 'all 0.3s' }}
            onFocus={(e) => { e.target.style.borderColor = '#b30000'; e.target.style.background = 'rgba(179,0,0,0.05)'; e.target.style.boxShadow = '0 0 0 3px rgba(179,0,0,0.15)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(0,0,0,0.4)'; e.target.style.boxShadow = 'none'; }}
          />
          <button type="submit" disabled={!replyText.trim()} style={{ padding: '0 2rem', background: 'linear-gradient(135deg, #b30000, #7c0000)', color: 'white', border: 'none', borderRadius: '14px', cursor: replyText.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: replyText.trim() ? 1 : 0.5, fontWeight: '600', transition: 'all 0.3s', boxShadow: replyText.trim() ? '0 8px 20px rgba(179,0,0,0.3)' : 'none' }}
            onMouseEnter={(e) => { if(replyText.trim()) e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { if(replyText.trim()) e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <Send size={18} /> Gönder
          </button>
        </form>
      </motion.div>
    );
  }

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
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedMsgId(msg.id)}
              style={{ cursor: 'pointer', border: '1px solid transparent', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
            >
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
                {msg.replies && msg.replies.length > 0 && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#0f172a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MessageSquare size={14} /> {msg.replies.length} yanıt
                  </div>
                )}
              </div>
              <button 
                className={styles.msgDeleteBtn} 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMessage(msg.id);
                }} 
                title="Sil"
              >
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
