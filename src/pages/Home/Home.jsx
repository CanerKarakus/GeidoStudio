import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Home.module.scss';
import { ArrowUpRight } from 'lucide-react';
import { m } from 'framer-motion';
import Button from '../../components/Button/Button';
import { projectsData } from '../../data/projectsData';
import { Link } from 'react-router-dom';
import useCmsStore from '../../store/cmsStore';
import CookieBanner from '../../components/CookieBanner/CookieBanner';
import geidoHeroFallback from '../../assets/images/geido_hero.png';

const Home = () => {
  const cms = useCmsStore((state) => state.cms);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadedImage, setLoadedImage] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef(null);

  const heroImages = cms?.heroImages?.length > 0 ? cms.heroImages : [geidoHeroFallback];

  // Preload an image and return a promise
  const preloadImage = useCallback((src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => resolve(src); // Show even if broken
      img.src = src;
    });
  }, []);

  // Preload current slide image
  useEffect(() => {
    const src = heroImages[currentSlide] || geidoHeroFallback;
    setIsTransitioning(true);
    preloadImage(src).then((loaded) => {
      setLoadedImage(loaded);
      // Small delay so CSS transition triggers properly
      requestAnimationFrame(() => setIsTransitioning(false));
    });
  }, [currentSlide, heroImages, preloadImage]);

  // Auto-advance timer — only runs after image is loaded
  useEffect(() => {
    if (heroImages.length <= 1 || isTransitioning) return;

    timerRef.current = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 15000);

    return () => clearTimeout(timerRef.current);
  }, [heroImages, isTransitioning, currentSlide]);

  return (
    <div className={styles.home}>
      <CookieBanner />
      {/* HERO SECTION */}
      <section className={styles.hero}>
        {/* Background — crossfade via opacity */}
        <div
          className={`${styles.heroBackgroundImg} ${!isTransitioning && loadedImage ? styles.heroImgLoaded : ''}`}
          style={{ backgroundImage: loadedImage ? `url(${loadedImage})` : 'none' }}
        ></div>

        {/* Loading spinner overlay */}
        {isTransitioning && heroImages.length > 1 && (
          <div className={styles.heroLoader}>
            <div className={styles.heroSpinner}></div>
          </div>
        )}
        
        {/* HERO CONTENT OVERLAY */}
        <div className={styles.heroContent}>
        </div>

        {/* SLIDER DOTS — bottom of hero */}
        {heroImages.length > 1 && (
          <div className={styles.sliderDots}>
            {heroImages.map((_, idx) => (
              <button 
                key={idx} 
                className={`${styles.dot} ${idx === currentSlide ? styles.activeDot : ''}`}
                onClick={() => setCurrentSlide(idx)}
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
              { title: 'Grafik Tasarım & Branding', desc: 'Markanızın ruhunu yansıtan, yaratıcı ve akılda kalıcı görsel dünyalar ve kurumsal kimlikler inşa ediyoruz.' },
              { title: 'Web Geliştirme', desc: 'Hızlı, güvenli ve ölçeklenebilir altyapılar ile hayalinizdeki projeleri hayata geçiriyoruz.' },
              { title: 'Mobil Uygulama', desc: 'Hem iOS hem Android için kullanıcı dostu ve yenilikçi mobil uygulama çözümleri sunuyoruz.', highlight: true },
              { title: 'Sosyal Medya Yönetimi', desc: 'Markanızın dijital kimliğini stratejik içeriklerle hedef kitlenize en iyi şekilde yansıtıyoruz.' }
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
            {projectsData.slice(0, 3).map((p, i) => (
              <div key={p.id} className={styles.projectCard}>
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
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className={styles.testimonials}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.subtitleDark}>Müşteri Yorumları</span>
            <h2 className={styles.titleLight}>Müşterilerimiz Bizim İçin<br/>Ne Söylüyor?</h2>
          </div>
          
          <div className={styles.testimonialGrid}>
             {[
               { name: "Ahmet Y.", role: "CEO, StartUp Inc", img: "https://randomuser.me/api/portraits/men/45.jpg", quote: "Geido Studio ile çalışmak harika bir deneyimdi. Vizyonumuzu anladılar ve mükemmel bir web sitesi teslim ettiler." },
               { name: "Ayşe K.", role: "Pazarlama Müdürü", img: "https://randomuser.me/api/portraits/women/65.jpg", quote: "Sosyal medya tasarımlarımız sayesinde etkileşimlerimiz %200 arttı. Kesinlikle tavsiye ederim." },
               { name: "Mehmet D.", role: "E-ticaret Sahibi", img: "https://randomuser.me/api/portraits/men/22.jpg", quote: "Mobil uygulamamızın UI/UX tasarımı kullanıcılarımızdan tam not aldı. Profesyonel ve yenilikçi bir ekip." },
               { name: "Zeynep S.", role: "Kurucu, Moda Markası", img: "https://randomuser.me/api/portraits/women/33.jpg", quote: "Marka kimliğimizi baştan yarattılar. Tasarımları sayesinde sektörde öne çıkmayı başardık." }
             ].map((t, i) => (
               <div key={i} className={styles.testimonialCard}>
                  <div className={styles.quoteIcon}>"</div>
                  <p className={styles.quoteText}>{t.quote}</p>
                  <div className={styles.rating}>★★★★★</div>
                  <div className={styles.author}>
                    <div className={styles.authorAvatar} style={{ backgroundImage: `url(${t.img})` }}></div>
                    <div>
                      <h4>{t.name}</h4>
                      <span>{t.role}</span>
                    </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* ARTICLES SECTION */}
      <section className={styles.articles}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.subtitle}>Makale & Kaynaklar</span>
            <h2 className={styles.title}>Blog Yazılarımıza<br/>Göz Atın</h2>
          </div>
          
          <div className={styles.articleGrid}>
             {[
               { title: "2024 UI/UX Tasarım Trendleri", cat: "UI/UX Tasarım", date: "12 Mayıs 2024", img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=600" },
               { title: "Sosyal Medyada Etkileşimi Artırmanın 5 Yolu", cat: "Sosyal Medya", date: "05 Mayıs 2024", img: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80&w=600" },
               { title: "Yeni Başlayanlar İçin React.js Rehberi", cat: "Web Geliştirme", date: "28 Nisan 2024", img: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=600" }
             ].map((a, i) => (
               <div key={i} className={styles.articleCard}>
                 <div className={styles.articleImgWrapper}>
                   <div className={styles.articleImg} style={{ backgroundImage: `url(${a.img})` }}></div>
                 </div>
                 <div className={styles.articleInfo}>
                   <span className={styles.articleCat}>{a.cat}</span>
                   <h3>{a.title}</h3>
                   <div className={styles.articleMeta}>
                     <span>🕒 {a.date}</span>
                   </div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
