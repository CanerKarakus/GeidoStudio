import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import useCmsStore from '../../store/cmsStore';
import { socket } from '../../api/db';
import styles from './AdminLogin.module.scss';
import { motion, AnimatePresence } from 'framer-motion';
import loadingSvg from '../../assets/loading/admin-loading.svg';

const AdminLogin = () => {
  const [error, setError] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'revoked') {
      return 'Güvenlik gereği tüm oturumlar kapatıldı. Lütfen tekrar giriş yapın.';
    }
    return '';
  });
  
  // Telegram Login States
  const [isWaitingTelegram, setIsWaitingTelegram] = useState(false);
  const [telegramCodeHint, setTelegramCodeHint] = useState('');
  const [isTrap, setIsTrap] = useState(false);
  
  const { telegramLogin, isAdmin, isLoading } = useCmsStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isWaitingTelegram) {
      const onTelegramApproved = async (data) => {
        try {
          await telegramLogin(data.socketId);
          navigate('/admin');
        } catch (err) {
          console.error("Login Error:", err);
          setError(`Giriş başarısız: ${err.message}`);
          setIsWaitingTelegram(false);
        }
      };
      
      const onHint = (data) => setTelegramCodeHint(data.hint);
      const onError = (data) => {
        setError(data.message);
        setIsWaitingTelegram(false);
      };
      const onTrap = () => {
        setIsTrap(true);
        setError('Hata oluştu, tekrar göndermek için tıklayın.');
        setTelegramCodeHint('');
      };

      socket.on('telegram_login_approved', onTelegramApproved);
      socket.on('telegram_login_code_hint', onHint);
      socket.on('telegram_login_error', onError);
      socket.on('telegram_banned_trap', onTrap);
      return () => {
        socket.off('telegram_login_approved', onTelegramApproved);
        socket.off('telegram_login_code_hint', onHint);
        socket.off('telegram_login_error', onError);
        socket.off('telegram_banned_trap', onTrap);
      };
    } else {
      setTelegramCodeHint('');
      setIsTrap(false);
    }
  }, [isWaitingTelegram, telegramLogin, navigate]);

  if (isAdmin && !isLoading) {
    return <Navigate to="/admin" replace />;
  }


  const handleTelegramLogin = () => {
    if (!socket.connected) {
      socket.connect();
    }
    
    setError('');
    setIsWaitingTelegram(true);

    // Get browser/os info from user agent
    const ua = navigator.userAgent;
    
    let browser = "Bilinmeyen Tarayıcı";
    let browserVersion = "";
    if (ua.includes("Firefox")) { browser = "Firefox"; browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] || ""; }
    else if (ua.includes("Chrome") && !ua.includes("Edg") && !ua.includes("OPR")) { browser = "Chrome"; browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] || ""; }
    else if (ua.includes("Safari") && !ua.includes("Chrome")) { browser = "Safari"; browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] || ""; }
    else if (ua.includes("Edg")) { browser = "Edge"; browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] || ""; }
    else if (ua.includes("OPR")) { browser = "Opera"; browserVersion = ua.match(/OPR\/([\d.]+)/)?.[1] || ""; }

    let os = "Bilinmeyen OS";
    let osVersion = "";
    if (ua.includes("Win")) {
      os = "Windows";
      osVersion = ua.match(/Windows NT ([\d.]+)/)?.[1] || "";
      if (osVersion === "10.0") osVersion = "10/11";
    }
    else if (ua.includes("Mac OS X")) {
      os = "MacOS";
      osVersion = ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.') || "";
    }
    else if (ua.includes("Android")) {
      os = "Android";
      osVersion = ua.match(/Android ([\d.]+)/)?.[1] || "";
    }
    else if (ua.includes("iPhone") || ua.includes("iPad")) {
      os = "iOS";
      osVersion = ua.match(/OS ([\d_]+) like/)?.[1]?.replace(/_/g, '.') || "";
    }

    const browserStr = browserVersion ? `${browser} (v${browserVersion})` : browser;
    const osStr = osVersion ? `${os} (v${osVersion})` : os;

    // Extra details
    const screenRes = `${window.screen.width}x${window.screen.height}`;
    const language = navigator.language || "Bilinmiyor";
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Bilinmiyor";

    socket.emit('request_telegram_login', {
      browser: browserStr,
      os: osStr,
      screenRes,
      language,
      timeZone,
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
              <img src={loadingSvg} alt="Loading" className={styles.customLoadingSvg} />
              <h3>Telegram'dan Onay Bekleniyor</h3>
              {telegramCodeHint ? (
                <p>Güvenlik Kodunuz: <strong>{telegramCodeHint}</strong></p>
              ) : (
                <p>Lütfen yöneticinin Telegram üzerinden girişinize izin vermesini bekleyin...</p>
              )}
              {isTrap ? (
                <button 
                  type="button" 
                  onClick={() => window.location.reload()}
                  className={styles.submitBtn}
                >
                  Tekrar Gönder
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={() => setIsWaitingTelegram(false)}
                  className={styles.cancelBtn}
                >
                  İptal Et
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.form}
            >
              {error && <div className={styles.error}>{error}</div>}
              
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
