import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api, socket } from '../../api/db';
import styles from './Ticket.module.scss';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

const Ticket = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await api.getTicket(id);
        setTicket(data);
      } catch (err) {
        setError(err.message || 'Bilet bulunamadı.');
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

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const text = replyText;
    setReplyText('');
    
    try {
      const res = await api.replyToTicket(id, text);
      // Update local state if socket doesn't fire fast enough
      setTicket(prev => {
        if (!prev) return prev;
        const exists = prev.replies?.some(r => r.id === res.reply.id);
        if (exists) return prev;
        return { ...prev, replies: [...(prev.replies || []), res.reply] };
      });
    } catch (err) {
      alert(err.message || 'Yanıt gönderilemedi.');
      setReplyText(text);
    }
  };

  if (loading) return <div className={styles.loading}>Yükleniyor...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.ticketContainer}>
      <motion.div 
        className={styles.chatBox}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <header className={styles.header}>
          <h2>Destek Talebi: {ticket.subject || 'İletişim Formu'}</h2>
          <p>Bilet No: {ticket.id}</p>
        </header>

        <div className={styles.messagesList}>
          {/* İlk mesaj */}
          <div className={`${styles.message} ${styles.user}`}>
            <div className={styles.meta}>
              <span>Siz</span> • <span>{new Date(ticket.date).toLocaleString('tr-TR')}</span>
            </div>
            <div className={styles.content}>{ticket.message}</div>
          </div>

          {/* Yanıtlar */}
          {ticket.replies?.map(reply => (
            <div key={reply.id} className={`${styles.message} ${reply.sender === 'user' ? styles.user : styles.admin}`}>
              <div className={styles.meta}>
                <span>{reply.sender === 'user' ? 'Siz' : 'Geido Studio'}</span> • <span>{new Date(reply.date).toLocaleString('tr-TR')}</span>
              </div>
              <div className={styles.content}>{reply.text}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleReply} className={styles.replyForm}>
          <input 
            type="text" 
            placeholder="Yanıtınızı yazın..." 
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
          />
          <button type="submit" disabled={!replyText.trim()}>
            <Send size={18} /> Gönder
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Ticket;
