import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Clock, User } from 'lucide-react';
import { m } from 'framer-motion';
import { useTranslation } from 'react-hooks-i18next';
import useCmsStore from '../../store/cmsStore';
import Button from '../../components/Button/Button';
import styles from './BlogPost.module.scss';
import SEO from '../../components/SEO/SEO';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { cms, subscribeNewsletter } = useCmsStore();
  const [blog, setBlog] = useState(null);
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState({ state: 'idle', message: '' });

  useEffect(() => {
    const foundBlog = cms?.blogs?.find(b => b.slug === slug);
    if (foundBlog) {
      setBlog(foundBlog);
    } else {
      // If no blog found after cms is loaded (and it's not a loading state), redirect
      if (cms) {
        navigate('/blog', { replace: true });
      }
    }
  }, [slug, cms, navigate]);

  if (!blog) {
    return <div className={styles.loadingState}>{t('blogpost.loading')}</div>;
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(t('blogpost.link_copied'));
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setSubStatus({ state: 'loading', message: '' });
    try {
      await subscribeNewsletter(email);
      setSubStatus({ state: 'success', message: t('blogpost.subscribe_success') });
      setEmail('');
    } catch (err) {
      setSubStatus({ state: 'error', message: err.message || t('blogpost.subscribe_error') });
    }
  };

  return (
    <div className={styles.blogPostPage}>
      <SEO 
        title={blog.title} 
        description={blog.summary || "Geido Studio blog yazısı."}
        keywords={blog.keywords || "blog, web tasarım, teknoloji, dijital pazarlama"}
        image={blog.image}
      />
      {/* Article Header */}
      <header className={styles.articleHeader}>
        <div className={styles.headerBackground} style={{ backgroundImage: `url(${blog.image || 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=1600'})` }}>
          <div className={styles.overlay}></div>
        </div>
        
        <div className={styles.container}>
          <m.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={styles.headerContent}
          >
            <Link to="/blog" className={styles.backLink}>
              <ArrowLeft size={20} /> {t('blogpost.back_to_blog')}
            </Link>
            
            <h1 className={styles.title}>{blog.title}</h1>
            
            <div className={styles.metaInfo}>
              <div className={styles.metaItem}>
                <User size={18} />
                <span>{blog.author || 'Geido Studio'}</span>
              </div>
              <div className={styles.metaItem}>
                <Clock size={18} />
                <span>{blog.date}</span>
              </div>
            </div>
          </m.div>
        </div>
      </header>

      {/* Article Content */}
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <aside className={styles.sidebar}>
            <div className={styles.stickySidebar}>
              <span className={styles.shareTitle}>{t('blogpost.share')}</span>
              <button className={styles.shareBtn} onClick={handleShare}>
                <Share2 size={20} />
              </button>
            </div>
          </aside>

          <m.article 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={styles.articleBody}
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </div>

      {/* Newsletter Section */}
      <section className={styles.newsletterSection}>
        <div className={styles.container}>
          <div className={styles.newsletterCard}>
            <h2>{t('blogpost.newsletter_title')}</h2>
            <p>{t('blogpost.newsletter_desc')}</p>
            
            <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder={t('blogpost.email_placeholder')} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" disabled={subStatus.state === 'loading'}>
                {subStatus.state === 'loading' ? t('blogpost.subscribing') : t('blogpost.subscribe')}
              </button>
            </form>
            
            {subStatus.message && (
              <p className={`${styles.statusMessage} ${styles[subStatus.state]}`}>
                {subStatus.message}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPost;
