import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../../api/db';
import './EasterEggTerminal.css';

const EasterEggTerminal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { type: 'system', text: 'GEIDO OS v1.0.4 - YETKISIZ GIRIS TESPIT EDILDI.' },
    { type: 'system', text: 'Terminal baslatiliyor...' },
    { type: 'system', text: 'Baglanti kuruldu. Lutfen kendinizi tanitin.' }
  ]);
  const endOfHistoryRef = useRef(null);
  const inputRef = useRef(null);
  
  // Secret code sequence: G E I D O
  const secretCode = ['g', 'e', 'i', 'd', 'o'];
  const [keySequence, setKeySequence] = useState([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isOpen) return; // Don't track if already open

      const key = e.key.toLowerCase();
      
      setKeySequence(prev => {
        const newSeq = [...prev, key];
        if (newSeq.length > secretCode.length) {
          newSeq.shift();
        }
        
        // Check if sequence matches
        if (newSeq.join('') === secretCode.join('')) {
          setIsOpen(true);
          return [];
        }
        
        return newSeq;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 100);

      // Listen for admin responses
      socket.on('easter_egg_response', (data) => {
        setHistory(prev => [...prev, { type: 'system', text: data.text, isTypewriter: true }]);
      });
    } else {
      document.body.style.overflow = 'auto';
      socket.off('easter_egg_response');
    }
  }, [isOpen]);

  useEffect(() => {
    // Scroll to bottom when history changes
    endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to history
    setHistory(prev => [...prev, { type: 'user', text: input }]);
    
    // Send to backend via socket
    socket.emit('easter_egg_message', { text: input });

    setInput('');
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="easter-egg-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <button className="terminal-close" onClick={handleClose}>×</button>
        <motion.div 
          className="easter-egg-terminal"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="terminal-header">
            GEIDO TERMINAL // [SECURE CONNECTION]
          </div>
          
          <div className="terminal-history">
            {history.map((line, index) => (
              <div key={index} className={`terminal-line ${line.type}`}>
                {line.type === 'user' ? (
                  `> ${line.text}`
                ) : (
                  line.isTypewriter ? (
                    <span className="typewriter-text">{line.text}</span>
                  ) : (
                    line.text
                  )
                )}
              </div>
            ))}
            <div ref={endOfHistoryRef} />
          </div>

          <form onSubmit={handleSubmit} className="terminal-input-wrapper">
            <span className="terminal-prompt">{'>'}</span>
            <input
              ref={inputRef}
              type="text"
              className="terminal-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoComplete="off"
              spellCheck="false"
              autoFocus
            />
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EasterEggTerminal;
