import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Loader, Search, ExternalLink, ArrowLeft, PenTool } from 'lucide-react';
import { api } from '../../api/db';
import SEO from '../../components/SEO/SEO';
import styles from './Tracking.module.scss';
import { useTranslation } from 'react-i18next';

const Tracking = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchSlug, setSearchSlug] = useState('');

  useEffect(() => {
    if (slug) {
      fetchProject(slug);
    } else {
      setLoading(false);
    }
  }, [slug]);

  const fetchProject = async (projectSlug) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getTrackingBySlug(encodeURIComponent(projectSlug));
      
      // Ensure status is a number for strict equality checks later
      if (data && data.status) {
        data.status = Number(data.status);
      }
      
      setProject(data);
    } catch (err) {
      setError(t('tracking.not_found'));
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchSlug.trim()) {
      navigate(`/takip/${searchSlug.trim()}`);
    }
  };

  const steps = [
    { id: 1, title: t('tracking.pending'), icon: Search },
    { id: 2, title: t('tracking.in_progress'), icon: PenTool },
    { id: 3, title: t('tracking.completed'), icon: CheckCircle }
  ];

  if (loading) return <div className={styles.loadingWrapper}><Loader className={styles.spinner} size={48} /></div>;

  return (
    <div className={styles.trackingPage}>
      <SEO title={t('tracking.seo_title')} description={t('tracking.seo_desc')} />
      
      <div className={styles.container}>
        {!project ? (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className={styles.searchBox}>
            <h2 dangerouslySetInnerHTML={{ __html: t('tracking.hero_title') }}></h2>
            <p>{t('tracking.hero_desc')}</p>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <div className={styles.inputWrapper}>
                <Search size={20} className={styles.searchIcon} />
                <input 
                  type="text" 
                  placeholder={t('tracking.input_placeholder')} 
                  value={searchSlug} 
                  onChange={(e) => setSearchSlug(e.target.value)}
                  className={styles.input}
                  autoFocus
                />
              </div>
              <button type="submit" className={styles.btn}>
                {t('tracking.track_button')} <ArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} />
              </button>
            </form>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={styles.error}>
                {error}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className={styles.projectCard}>
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <h1 className={styles.projectName}>{project.name}</h1>
              </div>
              <div className={styles.category}>{project.category}</div>
            </div>
            
            <p className={styles.desc}>
              {t('tracking.project_status')}: <strong>{steps.find(s => s.id === project.status)?.title}</strong>
            </p>

            <div className={styles.progressContainer}>
              <div className={styles.steps}>
                {steps.map((step) => {
                  const Icon = step.icon;
                  const isCompleted = project.status >= step.id;
                  const isCurrent = project.status === step.id;
                  
                  return (
                    <div key={step.id} className={`${styles.step} ${isCompleted ? styles.completed : ''} ${isCurrent ? styles.current : ''}`}>
                      <div className={styles.stepIcon}>
                        <Icon size={26} strokeWidth={isCurrent ? 2.5 : 2} />
                      </div>
                      <span className={styles.stepTitle}>{step.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className={styles.footer}>
              <button onClick={() => { setProject(null); navigate('/takip'); setSearchSlug(''); }} className={`${styles.actionBtn} ${styles.secondary}`}>
                <ArrowLeft size={18} /> {t('tracking.track_button')}
              </button>
              {project.url && (
                <a href={project.url.startsWith('http') ? project.url : `https://${project.url}`} target="_blank" rel="noopener noreferrer" className={`${styles.actionBtn} ${styles.primary}`}>
                  {t('tracking.go_project')} <ExternalLink size={18} />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Tracking;
