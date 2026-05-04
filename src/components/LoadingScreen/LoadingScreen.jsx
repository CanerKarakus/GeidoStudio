import React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import styles from './LoadingScreen.module.scss';
import loadingVideoWebm from '../../assets/loading/geido_loading.webm';
import loadingVideoMov from '../../assets/loading/geido_loading.mov';

const LoadingScreen = () => {
  return (
    <m.div 
      className={styles.loadingContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <video 
        className={styles.loadingVideo}
        autoPlay 
        loop 
        muted 
        playsInline
      >
        <source src={loadingVideoWebm} type="video/webm" />
        <source src={loadingVideoMov} type="video/quicktime" />
        Your browser does not support the video tag.
      </video>
    </m.div>
  );
};

export default LoadingScreen;
