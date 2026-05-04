import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NotFound.module.scss';

const NotFound = () => {
  const navigate = useNavigate();

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
            <h3 className={styles.subtitle}>Look like you're lost</h3>
            <p className={styles.description}>
              The page you are looking for is not available!
            </p>

            <button
              onClick={() => navigate('/')}
              className={styles.homeBtn}
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
