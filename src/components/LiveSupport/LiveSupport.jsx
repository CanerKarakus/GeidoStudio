import React, { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, ChevronDown, Minus, Square } from 'lucide-react';
import clsx from 'clsx';
import useChatStore from '../../store/chatStore';
import styles from './LiveSupport.module.scss';

const Typewriter = ({ text, onComplete, onTyping, forceStop }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const onCompleteRef = useRef(onComplete);
  const onTypingRef = useRef(onTyping);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onTypingRef.current = onTyping;
  }, [onComplete, onTyping]);

  useEffect(() => {
    if (forceStop) {
      if (onCompleteRef.current) onCompleteRef.current(displayedText);
      return;
    }
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        if (onTypingRef.current) onTypingRef.current();
      }, 15);
      return () => clearTimeout(timeout);
    } else {
      if (onCompleteRef.current) onCompleteRef.current(text);
    }
  }, [currentIndex, text, forceStop]);

  return <span dangerouslySetInnerHTML={{ __html: displayedText.replace(/\n/g, '<br/>') }} />;
};

const LiveSupport = () => {
  const { 
    isOpen, setIsOpen, 
    isMinimized, setIsMinimized,
    isEnding, setIsEnding,
    userContext, setUserContext, 
    messages, addMessage, clearChat 
  } = useChatStore();
  
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isWaitingForAPI, setIsWaitingForAPI] = useState(false);
  const [activeTypingId, setActiveTypingId] = useState(null);
  const [forceStopTyping, setForceStopTyping] = useState(false);
  const abortControllerRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [endStep, setEndStep] = useState(0); // 0: no, 1: confirm close, 2: ask email
  const [showToast, setShowToast] = useState(false);
  const [sendEmailCopy, setSendEmailCopy] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isWaitingForAPI, endStep, isMinimized, isOpen]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setUserContext({ name: formData.name, email: formData.email });
    
    addMessage({ id: Date.now().toString(), text: formData.message, sender: 'user', isNew: false });
    
    await sendToAI([{ text: formData.message, sender: 'user' }], { name: formData.name, email: formData.email });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isWaitingForAPI || activeTypingId) return;

    const userMsg = inputValue.trim();
    setInputValue('');
    
    addMessage({ id: Date.now().toString(), text: userMsg, sender: 'user', isNew: false });
    
    await sendToAI([...messages, { text: userMsg, sender: 'user' }], userContext);
  };

  const sendToAI = async (history, context) => {
    setIsWaitingForAPI(true);
    abortControllerRef.current = new AbortController();
    try {
      // In production, point to the actual backend URL
      // If the backend runs on port 3001, we use localhost:3001
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const res = await fetch(`${API_URL}/api/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, userContext: context }),
        signal: abortControllerRef.current.signal
      });

      const data = await res.json();
      
      if (res.ok && data.reply) {
        const aiMsgId = Date.now().toString() + '-ai';
        addMessage({ id: aiMsgId, text: data.reply, sender: 'ai', isNew: true });
        setActiveTypingId(aiMsgId);
      } else {
        const aiMsgId = Date.now().toString() + '-ai';
        addMessage({ id: aiMsgId, text: 'Üzgünüm, şu an bağlantı sorunu yaşıyorum. Lütfen daha sonra tekrar deneyin.', sender: 'ai', isNew: true });
        setActiveTypingId(aiMsgId);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        const aiMsgId = Date.now().toString() + '-ai';
        addMessage({ id: aiMsgId, text: 'Yanıt durduruldu.', sender: 'ai', isNew: false });
      } else {
        const aiMsgId = Date.now().toString() + '-ai';
        addMessage({ id: aiMsgId, text: 'Üzgünüm, teknik bir hata oluştu.', sender: 'ai', isNew: true });
        setActiveTypingId(aiMsgId);
      }
    } finally {
      setIsWaitingForAPI(false);
    }
  };

  const handleStop = () => {
    if (isWaitingForAPI) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setIsWaitingForAPI(false);
    } else if (activeTypingId) {
      setForceStopTyping(true);
    }
  };

  const handleCloseRequest = () => {
    if (!userContext) {
      setIsOpen(false);
      setIsMinimized(false);
      return;
    }
    if (endStep === 2) {
      handleFinalEnd(false);
      return;
    }
    setIsEnding(true);
    setEndStep(1);
  };

  const handleConfirmClose = (confirm) => {
    if (confirm) {
      setEndStep(2); // ask for email
    } else {
      setIsEnding(false);
      setEndStep(0);
    }
  };

  const handleFinalEnd = (wantsEmail) => {
    // Send to backend to email transcript
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      fetch(`${API_URL}/api/ai-chat/end-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages, 
          userContext,
          wantsEmail 
        })
      });
      
      if (wantsEmail) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
      }
    } catch (e) {
      console.error('Failed to send transcript', e);
    }
    
    clearChat();
    setIsEnding(false);
    setEndStep(0);
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleTypingComplete = (id, finalDisplayedText) => {
    useChatStore.setState(state => ({
      messages: state.messages.map(m => m.id === id ? { ...m, text: finalDisplayedText, isNew: false } : m)
    }));
    setActiveTypingId(null);
    setForceStopTyping(false);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {isMinimized && (
          <m.button
            className={styles.floatingButton}
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageSquare size={24} />
          </m.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {(isOpen && !isMinimized) && (
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
                  <img src="/logo.svg" alt="Geido AI" />
                </div>
                <div>
                  <h3>Geido AI Asistan</h3>
                  <p>Çevrimiçi</p>
                </div>
              </div>
              <div className={styles.headerControls}>
                <button className={styles.iconBtn} onClick={() => setIsMinimized(true)}>
                  <Minus size={20} />
                </button>
                <button className={styles.iconBtn} onClick={handleCloseRequest}>
                  <X size={20} />
                </button>
              </div>
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
              ) : endStep === 2 ? (
                // Email Request Screen
                <div className={styles.emailRequestContainer}>
                  <div className={styles.emailIconWrapper}>
                    <MessageSquare size={48} className={styles.emailIcon} />
                  </div>
                  <h3>Sohbet Geçmişi</h3>
                  <p>Bu sohbetin bir kopyasını <strong>{userContext.email}</strong> adresine göndermemizi ister misiniz?</p>
                  <div className={styles.emailBtns}>
                    <button className={styles.sendBtn} onClick={() => handleFinalEnd(true)}>
                      Evet, Gönder
                    </button>
                    <button className={styles.skipBtn} onClick={() => handleFinalEnd(false)}>
                      Hayır, İstemiyorum
                    </button>
                  </div>
                </div>
              ) : (
                // Chat Interface
                <div className={styles.chatContainer}>
                  <div className={styles.messagesList}>
                    {messages.map((msg, idx) => (
                      <div key={msg.id || idx} className={clsx(styles.messageWrapper, styles[msg.sender])}>
                        {msg.sender === 'ai' && (
                          <div className={styles.msgAvatar}>
                            <img src="/logo.svg" alt="AI" />
                          </div>
                        )}
                        <div className={styles.messageBubble}>
                          {(msg.sender === 'ai' && msg.isNew) ? (
                            <Typewriter 
                              text={msg.text} 
                              forceStop={forceStopTyping && activeTypingId === msg.id}
                              onComplete={(finalText) => handleTypingComplete(msg.id, finalText)} 
                              onTyping={scrollToBottom} 
                            />
                          ) : (
                            <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {isWaitingForAPI && (
                      <div className={clsx(styles.messageWrapper, styles.ai)}>
                        <div className={styles.msgAvatar}>
                          <img src="/logo.svg" alt="AI" />
                        </div>
                        <div className={clsx(styles.messageBubble, styles.typingIndicator)}>
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Overlay for Ending Session */}
                  <AnimatePresence>
                    {(isEnding && endStep === 1) && (
                      <m.div 
                        className={styles.endOverlay}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      >
                        <div className={styles.endDialog}>
                          <p>Sohbeti bitirmek istediğinize emin misiniz?</p>
                          <div className={styles.dialogBtns}>
                            <button className={styles.noBtn} onClick={() => handleConfirmClose(false)}>Hayır, Devam Et</button>
                            <button className={styles.yesBtn} onClick={() => handleConfirmClose(true)}>Evet, Bitir</button>
                          </div>
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>

                  {/* Input Area */}
                  <form className={styles.inputArea} onSubmit={handleSendMessage}>
                    <input
                      type="text"
                      placeholder="Mesajınızı yazın..."
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      disabled={isWaitingForAPI || activeTypingId}
                    />
                    {(isWaitingForAPI || activeTypingId) ? (
                      <button type="button" onClick={handleStop} className={styles.stopBtn} aria-label="Durdur">
                        <Square size={18} fill="currentColor" />
                      </button>
                    ) : (
                      <button type="submit" disabled={!inputValue.trim()}>
                        <Send size={18} />
                      </button>
                    )}
                  </form>
                </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <m.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={styles.toast}
          >
            Sohbet geçmişi e-posta adresinize gönderildi!
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveSupport;
