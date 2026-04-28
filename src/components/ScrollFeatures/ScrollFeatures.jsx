import React, { useState, useEffect } from 'react';
import { m, useScroll, useTransform } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import styles from './ScrollFeatures.module.scss';
import clsx from 'clsx';

const ScrollFeatures = () => {
  const { scrollYProgress } = useScroll();
  const [isVisible, setIsVisible] = useState(false);

  // Map scroll progress (0 to 1) to shades of neon green
  const barColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ['#b30000', '#8c0000', '#660000']
  );

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {/* Scroll Progress Bar at the top */}
      <m.div
        className={styles.progressBar}
        style={{ 
          scaleX: scrollYProgress,
          backgroundColor: barColor
        }}
      />

      {/* Scroll To Top Button */}
      <button 
        onClick={scrollToTop} 
        className={clsx(styles.scrollTopBtn, { [styles.visible]: isVisible })}
        aria-label="En üste çık"
      >
        <ArrowUp size={24} />
      </button>
    </>
  );
};

export default ScrollFeatures;
