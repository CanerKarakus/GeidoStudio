import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import useCmsStore from '../../store/cmsStore';
import { socket, API_URL } from '../../api/db';
import styles from './AdminLogin.module.scss';
import { motion, AnimatePresence } from 'framer-motion';
import loadingSvg from '../../assets/loading/admin-loading.svg';
import { Turnstile } from '@marsidev/react-turnstile';

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
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [cfToken, setCfToken] = useState(null);
  const navigate = useNavigate();
  const { isAdmin, isLoading, telegramLogin } = useCmsStore();

  useEffect(() => {
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
    const screenRes = `${window.screen.width}x${window.screen.height}`;
    const language = navigator.language || "Bilinmiyor";
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Bilinmiyor";

    setDeviceInfo({
      browserStr, osStr, screenRes, language, timeZone, userAgent: ua,
      ip: 'Yükleniyor...', isp: 'Yükleniyor...'
    });

    fetch(`${API_URL}/api/ip`)
      .then(res => res.json())
      .then(apiData => {
        const trueIp = apiData.ip;
        
        fetch(`https://ipapi.co/${trueIp}/json/`)
          .then(res => res.json())
          .then(geoData => {
            setDeviceInfo(prev => ({
              ...prev,
              ip: trueIp,
              isp: geoData.org || 'Bilinmiyor'
            }));
          })
          .catch(() => {
            setDeviceInfo(prev => ({ ...prev, ip: trueIp, isp: 'Bilinmiyor' }));
          });
      })
      .catch(() => {
        fetch('https://api64.ipify.org?format=json')
          .then(res => res.json())
          .then(data => setDeviceInfo(prev => ({ ...prev, ip: data.ip || 'Bilinmiyor', isp: 'Bilinmiyor' })))
          .catch(() => setDeviceInfo(prev => ({ ...prev, ip: 'Bilinmiyor', isp: 'Bilinmiyor' })));
      });
  }, []);

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
    if (!cfToken) {
      setError('Lütfen güvenlik doğrulamasını (Captcha) tamamlayın.');
      return;
    }
    
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
      userAgent: ua,
      cfToken
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
                  onClick={() => { window.location.replace('/'); }}
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
              
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', width: '100%', overflow: 'hidden' }}>
                <Turnstile 
                  siteKey="0x4AAAAAADn0mdpFaEPE5aOT" 
                  onSuccess={(token) => {
                    setCfToken(token);
                    setError('');
                  }}
                  onError={() => setError('Güvenlik doğrulaması başarısız oldu.')}
                  onExpire={() => setCfToken(null)}
                  options={{ theme: 'dark' }}
                />
              </div>

              <button 
                type="button" 
                className={styles.telegramBtn}
                onClick={handleTelegramLogin}
                disabled={!cfToken}
                style={{ opacity: cfToken ? 1 : 0.5, cursor: cfToken ? 'pointer' : 'not-allowed' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/>
                </svg>
                Telegram ile Şifresiz Giriş Yap
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem',
          borderRadius: '8px',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          textAlign: 'center', 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '4px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Güvenlik Protokolü Devrede</span>
          </div>
          
          {deviceInfo && (
            <div style={{ width: '100%', textAlign: 'left', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', margin: '8px 0', padding: '12px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.02)' }}>
              <div style={{ marginBottom: '4px' }}><span style={{ color: '#fff', opacity: 0.8 }}>💻 Cihaz:</span> {deviceInfo.osStr} - {deviceInfo.browserStr}</div>
              <div style={{ marginBottom: '4px' }}><span style={{ color: '#fff', opacity: 0.8 }}>🖥 Çözünürlük:</span> {deviceInfo.screenRes}</div>
              <div style={{ marginBottom: '4px' }}><span style={{ color: '#fff', opacity: 0.8 }}>🌍 Dil/Bölge:</span> {deviceInfo.language} ({deviceInfo.timeZone})</div>
              <div style={{ marginBottom: '4px' }}><span style={{ color: '#ef4444', opacity: 0.8 }}>🌐 IP Adresi:</span> {deviceInfo.ip}</div>
              <div><span style={{ color: '#fff', opacity: 0.8 }}>🏢 ISP:</span> {deviceInfo.isp}</div>
            </div>
          )}

          <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.4' }}>
            Bu sayfadaki işlemler yüksek güvenlik protokolleri ile izlenmektedir.<br/>Giriş denemeleriniz ve yukarıdaki cihaz bilgileriniz, güvenlik ihlali veya yetkisiz erişim durumunda adli mercilerle paylaşılabilir.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
