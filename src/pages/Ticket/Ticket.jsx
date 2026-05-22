import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, socket } from '../../api/db';
import styles from './Ticket.module.scss';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, MessageSquare, User } from 'lucide-react';

const Ticket = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await api.getTicket(id);
        setTicket(data);
      } catch (err) {
        setError(err.message || 'Bilet bulunamadı veya silinmiş olabilir.');
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();

    // Socket io real-time updates for ticket
    socket.connect();
    const handleNewReply = (data) => {
      if (data.threadId === id) {
        setTicket(prev => {
          if (!prev) return prev;
          const exists = prev.replies?.some(r => r.id === data.reply.id);
          if (exists) return prev;
          return { ...prev, replies: [...(prev.replies || []), data.reply] };
        });
      }
    };
    
    socket.on('new_reply', handleNewReply);
    return () => {
      socket.off('new_reply', handleNewReply);
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket]);

  // Auto resize textarea
  const handleInput = (e) => {
    setReplyText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReply(e);
    }
  };

  const handleReply = async (e) => {
    e?.preventDefault();
    if (!replyText.trim()) return;

    const text = replyText;
    setReplyText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    try {
      const res = await api.replyToTicket(id, text);
      setTicket(prev => {
        if (!prev) return prev;
        const exists = prev.replies?.some(r => r.id === res.reply.id);
        if (exists) return prev;
        return { ...prev, replies: [...(prev.replies || []), res.reply] };
      });
    } catch (err) {
      alert(err.message || 'Yanıt gönderilemedi. Lütfen tekrar deneyin.');
      setReplyText(text);
    }
  };

  if (loading) return <div className={styles.loading}>Sohbet yükleniyor...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.ticketPage}>
      <div className={styles.ticketContainer}>
        
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={16} /> Ana Sayfaya Dön
        </Link>

        <motion.div 
          className={styles.chatBox}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <header className={styles.header}>
            <div className={styles.headerInfo}>
              <h2><MessageSquare size={20} color="var(--accent-primary)" /> {ticket.subject || 'Destek Talebi'}</h2>
              <span className={styles.ticketId}>Bilet No: #{ticket.id}</span>
            </div>
            <div className={styles.statusBadge}>
              Aktif
            </div>
          </header>

          <div className={styles.messagesList}>
            {/* İlk mesaj (Kullanıcının gönderdiği ilk mesaj) */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${styles.messageWrapper} ${styles.user}`}
            >
              <div className={`${styles.avatar} ${styles.userAvatar}`}>
                <User size={20} />
              </div>
              <div className={styles.messageContent}>
                <div className={styles.meta}>
                  <span className={styles.name}>Siz</span>
                  <span>{new Date(ticket.date).toLocaleString('tr-TR', { hour: '2-digit', minute:'2-digit', day:'numeric', month:'short' })}</span>
                </div>
                <div className={`${styles.bubble} ${styles.userBubble}`}>
                  {ticket.message}
                </div>
              </div>
            </motion.div>

            {/* Yanıtlar */}
            {ticket.replies?.map((reply, index) => {
              const isUser = reply.sender === 'user';
              return (
                <motion.div 
                  initial={{ opacity: 0, x: isUser ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={reply.id} 
                  className={`${styles.messageWrapper} ${isUser ? styles.user : styles.admin}`}
                >
                  <div className={`${styles.avatar} ${isUser ? styles.userAvatar : styles.adminAvatar}`}>
                    {isUser ? <User size={20} /> : 'G'}
                  </div>
                  <div className={styles.messageContent}>
                    <div className={styles.meta}>
                      <span className={styles.name}>{isUser ? 'Siz' : 'Geido Studio'}</span>
                      <span>{new Date(reply.date).toLocaleString('tr-TR', { hour: '2-digit', minute:'2-digit', day:'numeric', month:'short' })}</span>
                    </div>
                    <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.adminBubble}`}>
                      {reply.text}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleReply} className={styles.replyForm}>
            <div className={styles.inputWrapper}>
              <textarea 
                ref={textareaRef}
                placeholder="Mesajınızı buraya yazın... (Göndermek için Enter)" 
                value={replyText}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                rows={1}
              />
            </div>
            <button type="submit" disabled={!replyText.trim()}>
              <Send size={18} /> <span>Gönder</span>
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Ticket;
