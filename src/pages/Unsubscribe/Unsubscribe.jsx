import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/db';
import styles from './Unsubscribe.module.scss';
import { MailX, Loader2, CheckCircle } from 'lucide-react';

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!email) {
      setStatus('error');
      setMessage(t('unsubscribe.invalid_email'));
    }
  }, [email]);

  const handleUnsubscribe = async () => {
    if (!email) return;
    setStatus('loading');
    try {
      const res = await api.unsubscribeFromNewsletter(email);
      setStatus('success');
      setMessage(res.message || t('unsubscribe.success'));
    } catch (err) {
      setStatus('error');
      setMessage(err.message || t('unsubscribe.error'));
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
            <h2>{t('unsubscribe.title')}</h2>
            <p><strong>{email}</strong> {t('unsubscribe.desc')}</p>
            <div className={styles.buttonGroup}>
              <button className={styles.cancelBtn} onClick={handleContinue}>
                {t('unsubscribe.cancel')}
              </button>
              <button className={styles.confirmBtn} onClick={handleUnsubscribe}>
                {t('unsubscribe.button')}
              </button>
            </div>
          </>
        )}

        {status === 'loading' && (
          <div className={styles.centerContent}>
            <Loader2 size={48} className={styles.spinner} />
            <p>{t('unsubscribe.processing')}</p>
          </div>
        )}

        {status === 'success' && (
          <div className={styles.centerContent}>
            <CheckCircle size={48} className={styles.successIcon} />
            <h2>{t('unsubscribe.success_title')}</h2>
            <p>{message}</p>
            <button className={styles.continueBtn} onClick={handleContinue}>
              {t('unsubscribe.back_home')}
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className={styles.centerContent}>
            <MailX size={48} className={styles.errorIcon} />
            <h2>{t('unsubscribe.error_title')}</h2>
            <p>{message}</p>
            <button className={styles.continueBtn} onClick={handleContinue}>
              {t('unsubscribe.back_home')}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Unsubscribe;
