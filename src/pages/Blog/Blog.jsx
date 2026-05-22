import React from 'react';
import { Link } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useCmsStore from '../../store/cmsStore';
import styles from './Blog.module.scss';
import SEO from '../../components/SEO/SEO';

const Blog = () => {
  const { t } = useTranslation();
  const { cms } = useCmsStore();
  const blogs = cms?.blogs || [];

  return (
    <div className={styles.blogPage}>
      <SEO 
        title={t('blog.seo_title')} 
        description={t('blog.seo_desc')}
        keywords="blog, web tasarım trendleri, teknoloji makaleleri, grafik tasarım blogu"
      />
      <div className={styles.header}>
        <div className={styles.heroBackground}></div>
        <div className={styles.heroOverlay}></div>
        <div className={styles.container}>
          <h1 style={{ textAlign: 'center' }} className={styles.title}>{t('blog.subtitle')}</h1>
          <p style={{ textAlign: 'center' }} className={styles.description} dangerouslySetInnerHTML={{ __html: t('blog.title') }}></p>
        </div>
      </div>

      <div className={styles.container}>
        <m.div layout className={styles.blogGrid}>
          <AnimatePresence>
            {blogs.length === 0 ? (
              <p className={styles.emptyText}>{t('blog.no_blogs')}</p>
            ) : (
              blogs.map((blog, index) => (
                <m.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  key={blog.slug}
                  className={styles.blogCard}
                >
                  <Link to={`/blog/${blog.slug}`} className={styles.cardLink}>
                    <div className={styles.imageWrapper}>
                      <div
                        className={styles.blogImg}
                        style={{ backgroundImage: `url(${blog.image || 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=800'})` }}
                      ></div>
                      <div className={styles.overlay}>
                        <div className={styles.viewBtn}>
                          {t('blog.read_more')} <ArrowUpRight size={20} />
                        </div>
                      </div>
                    </div>
                    <div className={styles.info}>
                      <div className={styles.meta}>
                        <span>{blog.author || 'Geido Studio'}</span>
                        <span className={styles.dot}>•</span>
                        <span>{blog.date}</span>
                      </div>
                      <h3>{blog.title}</h3>
                      <p className={styles.excerpt}>
                        {blog.content.replace(/<[^>]+>/g, '').substring(0, 120)}...
                      </p>
                    </div>
                  </Link>
                </m.div>
              ))
            )}
          </AnimatePresence>
        </m.div>
      </div>
    </div>
  );
};

export default Blog;
