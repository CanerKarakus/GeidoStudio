import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../api/db';
import styles from './Unsubscribe.module.scss';
import { MailX, Loader2, CheckCircle } from 'lucide-react';

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!email) {
      setStatus('error');
      setMessage('Geçersiz veya eksik e-posta adresi.');
    }
  }, [email]);

  const handleUnsubscribe = async () => {
    if (!email) return;
    setStatus('loading');
    try {
      const res = await api.unsubscribeFromNewsletter(email);
      setStatus('success');
      setMessage(res.message || 'Abonelikten başarıyla çıkıldı.');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'İşlem başarısız oldu, lütfen daha sonra tekrar deneyin.');
    }
  };

  const handleContinue = () => {
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {status === 'idle' && email && (
          <>
            <div className={styles.iconWrapper}>
              <MailX size={48} />
            </div>
            <h2>Abonelikten Çık</h2>
            <p><strong>{email}</strong> adresini bülten listemizden çıkarmak istediğinize emin misiniz?</p>
            <div className={styles.buttonGroup}>
              <button className={styles.cancelBtn} onClick={handleContinue}>
                Vazgeç ve Devam Et
              </button>
              <button className={styles.confirmBtn} onClick={handleUnsubscribe}>
                Abonelikten Çık
              </button>
            </div>
          </>
        )}

        {status === 'loading' && (
          <div className={styles.centerContent}>
            <Loader2 size={48} className={styles.spinner} />
            <p>İşleminiz gerçekleştiriliyor...</p>
          </div>
        )}

        {status === 'success' && (
          <div className={styles.centerContent}>
            <CheckCircle size={48} className={styles.successIcon} />
            <h2>İşlem Başarılı</h2>
            <p>{message}</p>
            <button className={styles.continueBtn} onClick={handleContinue}>
              Ana Sayfaya Dön
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className={styles.centerContent}>
            <MailX size={48} className={styles.errorIcon} />
            <h2>Hata Oluştu</h2>
            <p>{message}</p>
            <button className={styles.continueBtn} onClick={handleContinue}>
              Ana Sayfaya Dön
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Unsubscribe;
