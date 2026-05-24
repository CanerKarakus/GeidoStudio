import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import styles from './MaintenanceScreen.module.scss';
import SEO from '../SEO/SEO';

const MaintenanceScreen = () => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className={styles.container}>
      <SEO title="Bakım Modu" description="Şu anda bakım çalışması yapıyoruz." />
      
      <div className={styles.content}>
        <motion.div 
          className={styles.iconContainer}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Settings size={80} className={styles.icon} />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Bakım Molası
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Sitemizde şu anda planlı bir bakım çalışması yürütüyoruz.
          Size daha iyi hizmet verebilmek için yakında tekrar buradayız!
        </motion.p>
      </div>
    </div>
  );
};

export default MaintenanceScreen;
