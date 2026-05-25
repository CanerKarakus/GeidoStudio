import React, { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import useChatStore from '../../store/chatStore';
import styles from './LiveSupport.module.scss';

const LiveSupport = () => {
  const { isOpen, setIsOpen, userContext, setUserContext, messages, addMessage } = useChatStore();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setUserContext({ name: formData.name, email: formData.email });
    
    // Add initial user message
    addMessage({ text: formData.message, sender: 'user' });
    
    // Call AI API
    await sendToAI([{ text: formData.message, sender: 'user' }], { name: formData.name, email: formData.email });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = inputValue.trim();
    setInputValue('');
    
    addMessage({ text: userMsg, sender: 'user' });
    
    // Send updated history to AI
    await sendToAI([...messages, { text: userMsg, sender: 'user' }], userContext);
  };

  const sendToAI = async (history, context) => {
    setIsTyping(true);
    try {
      // In production, point to the actual backend URL
      // If the backend runs on port 3001, we use localhost:3001
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const res = await fetch(`${API_URL}/api/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, userContext: context })
      });

      const data = await res.json();
      
      if (res.ok && data.reply) {
        addMessage({ text: data.reply, sender: 'ai' });
      } else {
        addMessage({ text: 'Üzgünüm, şu an bağlantı sorunu yaşıyorum. Lütfen daha sonra tekrar deneyin.', sender: 'ai' });
      }
    } catch (err) {
      addMessage({ text: 'Üzgünüm, teknik bir hata oluştu.', sender: 'ai' });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            className={styles.chatWindow}
            initial={{ opacity: 0, y: 50, scale: 0.9, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            style={{ transformOrigin: "bottom right" }}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerInfo}>
                <div className={styles.avatar}>
                  <img src="/logo_icon.png" alt="Geido AI" />
                </div>
                <div>
                  <h3>Geido Asistan</h3>
                  <p>Çevrimiçi</p>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                <ChevronDown size={24} />
              </button>
            </div>

            {/* Content Area */}
            <div className={styles.content}>
              {!userContext ? (
                // Initial Form
                <div className={styles.formContainer}>
                  <p className={styles.welcomeText}>Merhaba! Size nasıl yardımcı olabiliriz? Sohbete başlamak için bilgilerinizi giriniz.</p>
                  <form onSubmit={handleFormSubmit}>
                    <input
                      type="text"
                      placeholder="Adınız Soyadınız"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      required
                    />
                    <input
                      type="email"
                      placeholder="E-posta Adresiniz"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      required
                    />
                    <textarea
                      placeholder="Mesajınız..."
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      required
                      rows={3}
                    />
                    <button type="submit" className={styles.startBtn}>
                      Sohbete Başla
                    </button>
                  </form>
                </div>
              ) : (
                // Chat Interface
                <div className={styles.chatContainer}>
                  <div className={styles.messagesList}>
                    {messages.map((msg, idx) => (
                      <div key={msg.id || idx} className={clsx(styles.messageWrapper, styles[msg.sender])}>
                        {msg.sender === 'ai' && (
                          <div className={styles.msgAvatar}>
                            <img src="/logo_icon.png" alt="AI" />
                          </div>
                        )}
                        <div className={styles.messageBubble}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className={clsx(styles.messageWrapper, styles.ai)}>
                        <div className={styles.msgAvatar}>
                          <img src="/logo_icon.png" alt="AI" />
                        </div>
                        <div className={clsx(styles.messageBubble, styles.typingIndicator)}>
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Input Area */}
                  <form className={styles.inputArea} onSubmit={handleSendMessage}>
                    <input
                      type="text"
                      placeholder="Mesajınızı yazın..."
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                    />
                    <button type="submit" disabled={!inputValue.trim()}>
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveSupport;
