import React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import styles from './LoadingScreen.module.scss';
import loadingVideoWebm from '../../assets/loading/geido_loading.webm';
import loadingVideoMov from '../../assets/loading/geido_loading.mov';

const LoadingScreen = () => {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const videoRef = React.useRef(null);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 2.0;
    }
  }, []);

  return (
    <m.div
      className={styles.loadingContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {isSafari ? (
        <div className={styles.safariLoaderWrapper}>
          {[...Array(7)].map((_, index) => (
            <m.div
              key={index}
              className={styles.safariLoaderBar}
              animate={{
                scaleY: [0.5, 1.5, 0.5],
                scaleX: [1, 0.8, 1],
                translateY: ['0%', '-15%', '0%'],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.1,
              }}
            />
          ))}
        </div>
      ) : (
        <video
          ref={videoRef}
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
      )}
    </m.div>
  );
};

export default LoadingScreen;
