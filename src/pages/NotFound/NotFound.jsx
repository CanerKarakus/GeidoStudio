import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-hooks-i18next';
import styles from './NotFound.module.scss';

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className={styles.notFoundSection}>
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <div
            className={styles.gifWrapper}
            aria-hidden="true"
          >
            <h1 className={styles.title404}>404</h1>
          </div>

          <div className={styles.textWrapper}>
            <h3 className={styles.subtitle}>{t('notfound.subtitle')}</h3>
            <p className={styles.description}>
              {t('notfound.desc')}
            </p>

            <button
              onClick={() => navigate('/')}
              className={styles.homeBtn}
            >
              {t('notfound.back_home')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
