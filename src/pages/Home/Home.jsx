import React, { useState, useEffect, useRef } from 'react';
import styles from './Home.module.scss';
import { ArrowUpRight } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import Button from '../../components/Button/Button';
import { Link } from 'react-router-dom';
import useCmsStore from '../../store/cmsStore';
import CookieBanner from '../../components/CookieBanner/CookieBanner';
import geidoHeroFallback from '../../assets/images/geido_hero.png';

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } },
  exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } }),
};

const Home = () => {
  const cms = useCmsStore((state) => state.cms);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef(null);

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
  const projects = cms?.projects || [];

  return (
    <div className={styles.home}>
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
              style={{ backgroundImage: `url(${heroImages[currentSlide] || geidoHeroFallback})` }}
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
              <span>Web Geliştirme</span>
              <span>UI/UX Tasarım</span>
              <span>Mobil Uygulama</span>
              <span>Sosyal Medya</span>
              <span>Grafik Tasarım</span>
              <span>Kurumsal Kimlik</span>
            </div>
            <div className={styles.tickerContent}>
              <span>Web Geliştirme</span>
              <span>UI/UX Tasarım</span>
              <span>Mobil Uygulama</span>
              <span>Sosyal Medya</span>
              <span>Grafik Tasarım</span>
              <span>Kurumsal Kimlik</span>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className={styles.services}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.subtitle}>Hizmetlerimiz</span>
              <h2 className={styles.title}>Markanızı geleceğe taşıyan<br/>yaratıcı süreçler.</h2>
            </div>
            <Button to="/iletisim" variant="outline">Detaylı Bilgi</Button>
          </div>

          <div className={styles.servicesGrid}>
            {[
              { title: 'Grafik Tasarım & Branding', desc: 'Markanızın ruhunu yansıtan, yaratıcı ve akılda kalıcı görsel dünyalar ve kurumsal kimlikler inşa ediyoruz.', highlight: true },
              { title: 'Web Geliştirme', desc: 'Hızlı, güvenli ve ölçeklenebilir altyapılar ile hayalinizdeki projeleri hayata geçiriyoruz.', highlight: true },
              { title: 'Mobil Uygulama', desc: 'Hem iOS hem Android için kullanıcı dostu ve yenilikçi mobil uygulama çözümleri sunuyoruz.', highlight: true },
              { title: 'Sosyal Medya Yönetimi', desc: 'Markanızın dijital kimliğini stratejik içeriklerle hedef kitlenize en iyi şekilde yansıtıyoruz.', highlight: true }
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


      {/* PROJECTS SECTION */}
      <section className={styles.projects}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.subtitle}>Projelerimiz</span>
              <h2 className={styles.title}>Fark Yaratan Tasarımlar<br/>Üretiyoruz</h2>
            </div>
            <Button to="/projeler" variant="primary">Daha Fazla Proje Gör</Button>
          </div>

          <div className={styles.projectsGrid}>
            {projects.length > 0 ? (
              projects.slice(0, 4).map((p, i) => (
                <div key={p.id || p.slug} className={styles.projectCard}>
                  <div className={styles.projectImageWrapper}>
                    <div className={styles.projectImage} style={{ backgroundImage: `url(${p.image})` }}></div>
                  </div>
                  <div className={`${styles.projectInfo} ${i === 1 ? styles.highlightInfo : ''}`}>
                    <div>
                      <h3>{p.title}</h3>
                      <span>{p.category}</span>
                    </div>
                    <div className={styles.arrowIcon}><ArrowUpRight size={24} strokeWidth={1.5} /></div>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.emptyText} style={{ gridColumn: '1 / -1' }}>Şimdilik içerik yok.</p>
            )}
          </div>
        </div>
      </section>

      {/* ARTICLES SECTION */}
      <section className={styles.articles}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.subtitle}>Blog</span>
              <h2 className={styles.title}>En Son Haberler &<br/>İçgörüler</h2>
            </div>
            <Button to="/blog" variant="outline">Tümünü Gör</Button>
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
              <p className={styles.emptyText}>Henüz blog yazısı eklenmemiş.</p>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
