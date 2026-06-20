import React, { useState, useEffect } from 'react';
import { m, AnimatePresence, useScroll } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import styles from './Projects.module.scss';
import useCmsStore from '../../store/cmsStore';
import { ArrowUpRight } from 'lucide-react';
import projectsHeroImg from '../../assets/images/projects_hero.png';
import SEO from '../../components/SEO/SEO';

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
  const projectsData = cms?.projects || [];
  const heroImage = cms?.projectsHeroImage || projectsHeroImg;

  // Track scroll for dynamic button positioning
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 400);
    });
  }, [scrollY]);

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
    </div>
  );
};

export default Projects;
