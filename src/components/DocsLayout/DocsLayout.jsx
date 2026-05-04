import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronRight, FileText, Shield, Info, Scale, Cookie, Menu, X } from 'lucide-react';
import styles from './DocsLayout.module.scss';
import { m, AnimatePresence } from 'framer-motion';

const DocsLayout = ({ title, breadcrumb, toc = [], children }) => {
  const { pathname, hash } = useLocation();
  const [activeId, setActiveId] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle active TOC item on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    const headings = document.querySelectorAll('h2[id], h3[id]');
    headings.forEach((h) => observer.observe(h));

    return () => {
      headings.forEach((h) => observer.unobserve(h));
    };
  }, [children]);

  // Handle initial hash link
  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
          setActiveId(id);
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash, pathname]);

  const navGroups = [
    {
      title: 'Kurumsal',
      items: [
        { name: 'Hakkımızda', path: '/hakkinda', icon: Info },
        { name: 'İletişim', path: '/iletisim', icon: ChevronRight },
      ]
    },
    {
      title: 'Yasal Belgeler',
      items: [
        { name: 'Gizlilik Politikası', path: '/gizlilik-politikasi', icon: Shield },
        { name: 'Kullanım Koşulları', path: '/kullanim-kosullari', icon: Scale },
        { name: 'Çerez Politikası', path: '/cerez-politikasi', icon: Cookie },
        { name: 'KVKK Aydınlatma Metni', path: '/kvkk', icon: FileText },
      ]
    }
  ];

  return (
    <div className={styles.docsLayout}>
      
      {/* Mobile Menu Toggle (Optional, can be added to navbar instead) */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-primary text-white p-3 rounded-full shadow-lg"
          style={{ backgroundColor: '#b30000', color: 'white', padding: '12px', borderRadius: '50%', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', position: 'fixed', bottom: '20px', right: '20px', zIndex: 100, display: 'none' }} // Inline styles for quick mobile override if needed
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* 1. LEFT SIDEBAR */}
      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
        {navGroups.map((group, idx) => (
          <div key={idx} className={styles.navGroup}>
            <div className={styles.groupTitle}>{group.title}</div>
            <ul>
              {group.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <li key={i}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => 
                        `${styles.navLink} ${isActive ? styles.active : ''}`
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon size={18} />
                      {item.name}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </aside>

      {/* 2. MAIN CONTENT */}
      <main className={styles.mainContent}>
        <div className={styles.breadcrumb}>
          <span>Yasal</span>
          <ChevronRight size={14} />
          <span className={styles.bcActive}>{breadcrumb || title}</span>
        </div>

        <m.div 
          className={styles.contentWrapper}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1>{title}</h1>
          {children}
        </m.div>
      </main>

      {/* 3. RIGHT SIDEBAR (TABLE OF CONTENTS) */}
      <aside className={styles.toc}>
        <div className={styles.tocCard}>
          <h4>İçindekiler</h4>
          <ul>
            {toc.map((item, idx) => (
              <li key={idx} style={{ paddingLeft: item.level === 3 ? '1rem' : '0' }}>
                <a 
                  href={`#${item.id}`}
                  className={activeId === item.id ? styles.activeToc : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                    setActiveId(item.id);
                    // update URL hash without jump
                    window.history.pushState(null, '', `#${item.id}`);
                  }}
                >
                  {item.title}
                </a>
              </li>
            ))}
            {toc.length === 0 && (
              <li><span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>İçerik başlıkları yükleniyor...</span></li>
            )}
          </ul>
        </div>
      </aside>

    </div>
  );
};

export default DocsLayout;
