import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import useCmsStore from '../../store/cmsStore';
import { socket } from '../../api/db';
import styles from './AdminLogin.module.scss';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Telegram Login States
  const [isWaitingTelegram, setIsWaitingTelegram] = useState(false);
  
  const { login, telegramLogin, isAdmin, isLoading } = useCmsStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isWaitingTelegram) {
      const onTelegramApproved = async (data) => {
        try {
          await telegramLogin(data.socketId);
          navigate('/admin');
        } catch (err) {
          setError('Telegram girişi başarısız oldu.');
          setIsWaitingTelegram(false);
        }
      };

      socket.on('telegram_login_approved', onTelegramApproved);
      return () => {
        socket.off('telegram_login_approved', onTelegramApproved);
      };
    }
  }, [isWaitingTelegram, telegramLogin, navigate]);

  if (isAdmin && !isLoading) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleTelegramLogin = () => {
    if (!socket.connected) {
      socket.connect();
    }
    
    setError('');
    setIsWaitingTelegram(true);

    // Get browser/os info from user agent
    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";
    else if (ua.includes("Edge")) browser = "Edge";

    let os = "Unknown OS";
    if (ua.includes("Win")) os = "Windows";
    else if (ua.includes("Mac")) os = "MacOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("like Mac")) os = "iOS";

    socket.emit('request_telegram_login', {
      browser,
      os,
      userAgent: ua
    });
  };

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.loginCard}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.header}>
          <h2>Geido Studio</h2>
          <p>Yönetici Paneli</p>
        </div>
        
        <AnimatePresence mode="wait">
          {isWaitingTelegram ? (
            <motion.div 
              key="waiting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={styles.telegramWaiting}
            >
              <div className={styles.pulseRing}></div>
              <h3>Telegram'dan Onay Bekleniyor</h3>
              <p>Lütfen yöneticinin Telegram üzerinden girişinize izin vermesini bekleyin...</p>
              <button 
                type="button" 
                onClick={() => setIsWaitingTelegram(false)}
                className={styles.cancelBtn}
              >
                İptal Et
              </button>
            </motion.div>
          ) : (
            <motion.form 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit} 
              className={styles.form}
            >
              {error && <div className={styles.error}>{error}</div>}
              
              <div className={styles.inputGroup}>
                <label>E-posta</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@geidostudio.com"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Şifre</label>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </button>

              <div className={styles.divider}>veya</div>

              <button 
                type="button" 
                className={styles.telegramBtn}
                onClick={handleTelegramLogin}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/>
                </svg>
                Telegram ile Şifresiz Giriş Yap
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
