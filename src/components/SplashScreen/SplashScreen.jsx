import React from 'react';
import { m } from 'framer-motion';
import styles from './SplashScreen.module.scss';
import loadingVideoWebm from '../../assets/loading/geido_loading.webm';
import loadingVideoMov from '../../assets/loading/geido_loading.mov';

const SplashScreen = ({ onComplete }) => {
  const videoRef = React.useRef(null);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 2.0;
    }
  }, []);

  return (
    <m.div
      className={styles.splashContainer}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] } }}
    >
      <video
        ref={videoRef}
        className={styles.splashVideo}
        autoPlay
        muted
        playsInline
        onEnded={onComplete}
      >
        <source src={loadingVideoWebm} type="video/webm" />
        <source src={loadingVideoMov} type="video/quicktime" />
        Your browser does not support the video tag.
      </video>
    </m.div>
  );
};

export default SplashScreen;
