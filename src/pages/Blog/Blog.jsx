import React from 'react';
import { Link } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import useCmsStore from '../../store/cmsStore';
import styles from './Blog.module.scss';

const Blog = () => {
  const { cms } = useCmsStore();
  const blogs = cms?.blogs || [];

  return (
    <div className={styles.blogPage}>
      <div className={styles.header}>
        <div className={styles.heroBackground}></div>
        <div className={styles.heroOverlay}></div>
        <div className={styles.container}>
          <h1 style={{ textAlign: 'center' }} className={styles.title}>Blog</h1>
          <p style={{ textAlign: 'center' }} className={styles.description}>
            Dijital dünyadaki en son trendler, yenilikler ve Geido Studio'dan içgörüler.
          </p>
        </div>
      </div>

      <div className={styles.container}>
        <m.div layout className={styles.blogGrid}>
          <AnimatePresence>
            {blogs.length === 0 ? (
              <p className={styles.emptyText}>Henüz blog yazısı eklenmemiş.</p>
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
                          Oku <ArrowUpRight size={20} />
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
