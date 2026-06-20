import React, { useState, useEffect } from 'react';
import { m, AnimatePresence, useScroll } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import styles from './Projects.module.scss';
import useCmsStore from '../../store/cmsStore';
import useAiStore from '../../store/aiStore';
import { ArrowUpRight, Webcam, Eye, EyeOff, Box } from 'lucide-react';
import projectsHeroImg from '../../assets/images/projects_hero.png';
import SEO from '../../components/SEO/SEO';
import WebcamTracker from '../../components/AILogo/WebcamTracker';
import AILogo from '../../components/AILogo/AILogo';
import ARViewer from '../../components/ARViewer/ARViewer';

const Projects = () => {
  const { t } = useTranslation();
  
  const categories = [
    { key: 'Hepsi', label: t('projects.filter_all') },
    { key: 'Grafik', label: t('projects.filter_graphic') },
    { key: 'Mobil', label: t('projects.filter_mobile') },
    { key: 'Web', label: t('projects.filter_web') },
    { key: 'Sosyal Medya', label: t('projects.filter_social') },
    { key: 'Web ve Script', label: t('projects.filter_script') }
  ];

  const [activeCategory, setActiveCategory] = useState('Hepsi');
  const cms = useCmsStore((state) => state.cms);
  const { isAiModeEnabled, setAiMode } = useAiStore();
  const projectsData = cms?.projects || [];
  const heroImage = cms?.projectsHeroImage || projectsHeroImg;

  const [isAROpen, setIsAROpen] = useState(false);

  // Track scroll for dynamic button positioning
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 400);
    });
  }, [scrollY]);

  // Turn off AI mode when leaving the page
  useEffect(() => {
    return () => setAiMode(false);
  }, [setAiMode]);

  const filteredProjects = activeCategory === 'Hepsi' 
    ? projectsData 
    : projectsData.filter(p => p.category === activeCategory);

  return (
    <div className={styles.projectsPage}>
      <SEO 
        title={t('projects.seo_title')} 
        description={t('projects.seo_desc')}
        keywords="projeler, portfolyo, web tasarım referansları, grafik tasarım çalışmaları"
      />
      <div className={styles.header}>
        <div className={styles.heroBackground} style={{ backgroundImage: `url(${heroImage})` }}></div>
        <div className={styles.heroOverlay}></div>
        <div className={styles.container}>
          <h1 className={styles.title}>{t('projects.subtitle')}</h1>
          <p className={styles.description} dangerouslySetInnerHTML={{ __html: t('projects.title') }}></p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.filterBar}>
          {categories.map(cat => (
            <button 
              key={cat.key}
              className={`${styles.filterBtn} ${activeCategory === cat.key ? styles.active : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <m.div layout className={styles.projectsGrid}>
          <AnimatePresence>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <m.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={project.slug || project.id}
                  className={styles.projectCard}
                  onClick={() => project.externalLink && window.open(project.externalLink, '_blank')}
                  style={{ cursor: project.externalLink ? 'pointer' : 'default' }}
                >
                  <div className={styles.imageWrapper}>
                    <img src={project.image} alt={project.title} loading="lazy" />
                    <div className={styles.overlay}>
                      <button className={styles.viewBtn}>
                        {t('projects.view_project')} <ArrowUpRight size={20} />
                      </button>
                    </div>
                  </div>
                  <div className={styles.info}>
                    <span className={styles.category}>{project.category}</span>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                  </div>
                </m.div>
              ))
            ) : (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 0' }}>
                {t('projects.no_projects')}
              </p>
            )}
          </AnimatePresence>
        </m.div>
      </div>

      <WebcamTracker />
      <AILogo />
      <ARViewer isOpen={isAROpen} onClose={() => setIsAROpen(false)} />
      
      {/* Floating Action Buttons Container */}
      <div style={{
        position: 'fixed',
        right: '20px',
        bottom: isScrolled ? '80px' : '20px',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'bottom 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        {/* AR View Toggle Button */}
        <m.button
          onClick={() => setIsAROpen(true)}
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid #60a5fa',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)',
            fontFamily: 'system-ui, sans-serif',
            fontWeight: '500',
            fontSize: '0.9rem'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Box size={18} />
          Odamda Gör (AR)
        </m.button>

        {/* AI Eye Contact Toggle Button */}
        <m.button
          animate={{ 
            scale: isAiModeEnabled ? 1.05 : 1
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={() => setAiMode(!isAiModeEnabled)}
          style={{
            background: isAiModeEnabled ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'rgba(20, 20, 25, 0.8)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${isAiModeEnabled ? '#f87171' : 'rgba(255,255,255,0.1)'}`,
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            boxShadow: isAiModeEnabled ? '0 0 20px rgba(239, 68, 68, 0.4)' : '0 10px 30px rgba(0,0,0,0.5)',
            fontFamily: 'system-ui, sans-serif',
            fontWeight: '500',
            fontSize: '0.9rem'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isAiModeEnabled ? <Eye size={18} /> : <EyeOff size={18} />}
          {isAiModeEnabled ? 'AI Takibi Kapat' : 'AI Göz Teması Aç'}
        </m.button>
      </div>
    </div>
  );
};

export default Projects;
