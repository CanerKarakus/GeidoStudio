import React, { useState, useEffect, useRef } from 'react';
import styles from './Home.module.scss';
import { ArrowUpRight } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import Button from '../../components/Button/Button';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useCmsStore from '../../store/cmsStore';
import CookieBanner from '../../components/CookieBanner/CookieBanner';
import geidoHeroFallback from '../../assets/images/geido_hero.png';

import SEO from '../../components/SEO/SEO';

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } },
  exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } }),
};

const Home = () => {
  const { t } = useTranslation();
  const cms = useCmsStore((state) => state.cms);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const heroImages = cms?.heroImages?.length > 0 ? cms.heroImages : [geidoHeroFallback];

  const goToSlide = (idx) => {
    const dir = idx > currentSlide ? 1 : idx < currentSlide ? -1 : 1;
    setDirection(dir);
    setCurrentSlide(idx);
  };

  // Auto-advance — always slides forward
  useEffect(() => {
    if (heroImages.length <= 1) return;
    
    const duration = (cms?.heroSliderDuration || 15) * 1000;
    
    timerRef.current = setTimeout(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, duration);
    return () => clearTimeout(timerRef.current);
  }, [heroImages, currentSlide, cms?.heroSliderDuration]);

  const articles = cms?.blogs || [];

  const getHeroImageUrl = (heroItem) => {
    if (!heroItem) return geidoHeroFallback;
    if (typeof heroItem === 'string') return heroItem;
    if (typeof heroItem === 'object') {
      if (isMobile && heroItem.mobile) {
        return heroItem.mobile;
      }
      return heroItem.desktop || geidoHeroFallback;
    }
    return geidoHeroFallback;
  };

  return (
    <div className={styles.home}>
      <SEO 
        title={t('home.seo_title')} 
        description={t('home.seo_desc')}
        keywords="web tasarım, grafik tasarım, ui ux, geido studio, sosyal medya"
      />
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: '0' }}>
        Geido Studio - Modern Web Tasarım ve Kreatif Ajans
      </h1>
      <CookieBanner />
      {/* HERO SECTION */}
      <section className={styles.hero}>
        {/* Sliding background images */}
        <div className={styles.heroSliderWrapper}>
          <AnimatePresence initial={false} custom={direction} mode="sync">
            <m.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className={styles.heroBackgroundImg}
              style={{ backgroundImage: `url(${getHeroImageUrl(heroImages[currentSlide])})` }}
            />
          </AnimatePresence>
        </div>

        {/* HERO CONTENT OVERLAY */}
        <div className={styles.heroContent} />

        {/* SLIDER DOTS */}
        {heroImages.length > 1 && (
          <div className={styles.sliderDots}>
            {heroImages.map((_, idx) => (
              <button
                key={idx}
                className={`${styles.dot} ${idx === currentSlide ? styles.activeDot : ''}`}
                onClick={() => goToSlide(idx)}
              />
            ))}
          </div>
        )}

        <div className={styles.tickerBanner}>
          <div className={styles.tickerTrack}>
            <div className={styles.tickerContent}>
              <span>{t('home.service_2_title')}</span>
              <span>UI/UX Tasarım</span>
              <span>{t('home.service_3_title')}</span>
              <span>{t('home.service_4_title')}</span>
              <span>{t('about.graphic_design')}</span>
              <span>{t('about.gd_1')}</span>
            </div>
            <div className={styles.tickerContent}>
              <span>{t('home.service_2_title')}</span>
              <span>UI/UX Tasarım</span>
              <span>{t('home.service_3_title')}</span>
              <span>{t('home.service_4_title')}</span>
              <span>{t('about.graphic_design')}</span>
              <span>{t('about.gd_1')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className={styles.services}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.subtitle}>{t('home.services_subtitle')}</span>
              <h2 className={styles.title} dangerouslySetInnerHTML={{ __html: t('home.services_title') }}></h2>
            </div>
            <Button to="/iletisim" variant="outline">{t('home.learn_more')}</Button>
          </div>

          <div className={styles.servicesGrid}>
            {[
              { title: t('home.service_1_title'), desc: t('home.service_1_desc'), highlight: true },
              { title: t('home.service_2_title'), desc: t('home.service_2_desc'), highlight: true },
              { title: t('home.service_3_title'), desc: t('home.service_3_desc'), highlight: true },
              { title: t('home.service_4_title'), desc: t('home.service_4_desc'), highlight: true }
            ].map((s, i) => (
              <div key={i} className={`${styles.serviceCard} ${s.highlight ? styles.highlight : ''}`}>
                <div className={styles.cardIcon}></div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {s.highlight && <div className={styles.arrowIcon}><ArrowUpRight size={20} /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>




      {/* ARTICLES SECTION */}
      <section className={styles.articles}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.subtitle}>{t('home.blog_subtitle')}</span>
              <h2 className={styles.title} dangerouslySetInnerHTML={{ __html: t('home.blog_title') }}></h2>
            </div>
            <Button to="/blog" variant="outline">{t('home.see_all')}</Button>
          </div>

          <div className={styles.articleGrid}>
            {articles.length > 0 ? (
              articles.slice(0, 3).map((a, i) => (
                <Link to={`/blog/${a.slug}`} key={i} className={styles.articleCard}>
                  <div className={styles.articleImgWrapper}>
                    <div className={styles.articleImg} style={{ backgroundImage: `url(${a.image})` }}></div>
                  </div>
                  <div className={styles.articleInfo}>
                    <div className={styles.articleMeta}>
                      <span>{a.author || 'Geido Studio'}</span>
                      <span className={styles.dot}>•</span>
                      <span>{a.date}</span>
                    </div>
                    <h3>{a.title}</h3>
                    <p className={styles.articleExcerpt}>
                      {a.content?.replace(/<[^>]+>/g, '').substring(0, 90)}...
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className={styles.emptyText}>{t('home.no_blogs')}</p>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
