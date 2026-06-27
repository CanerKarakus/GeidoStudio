import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import useCmsStore from '../../store/cmsStore';
import styles from '../../pages/Admin/AdminDashboard.module.scss';
import {
  LogOut, Image as ImageIcon, MessageSquare,
  LayoutDashboard, Eye, Globe, ChevronRight,
  Layers, Edit3, ExternalLink, FileText, Database,
  Search, Mail
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/admin',             label: 'Dashboard',         icon: LayoutDashboard },
  { path: '/admin/hero',        label: 'Hero / Vitrin',     icon: Layers },
  { path: '/admin/about',       label: 'Hakkımızda',        icon: Globe },
  { path: '/admin/images',      label: 'Görseller',         icon: ImageIcon },
  { path: '/admin/blog',        label: 'Blog Yazıları',     icon: FileText },
  { path: '/admin/projects',    label: 'Projeler',          icon: FileText },
  { path: '/admin/contact',     label: 'İletişim Bilgileri',icon: Globe },
  { path: '/admin/messages',    label: 'Gelen Mesajlar',    icon: MessageSquare },
  { path: '/admin/newsletter',  label: 'Bülten / E-Posta',  icon: Globe },
  { path: '/admin/tracking',    label: 'Proje Takip',       icon: Layers },
  { path: '/admin/database',    label: 'Veri Tabanı',       icon: Database },
  { path: '/admin/seo',         label: 'SEO Ayarları',      icon: Search },
  { path: '/admin/emails',      label: 'E-Posta Şablonları',icon: Mail },
  { path: '/admin/heatmap',     label: 'Isı Haritası',      icon: Eye },
];

const AdminLayout = () => {
  const { isAdmin, isLoading, logout, messages } = useCmsStore();
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (navRef.current) {
      const activeElement = navRef.current.querySelector(`.${styles.navActive}`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className={styles.fullLoading}>
        <div className={styles.loadingPulse}></div>
        <span>Yükleniyor...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';

  const activeItem = NAV_ITEMS.slice().reverse().find(n =>
    n.exact ? location.pathname === n.path : location.pathname.startsWith(n.path)
  ) || NAV_ITEMS[0];

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className={`${styles.dashboard} ${isCollapsed ? styles.collapsed : ''}`}>
      {/* SIDEBAR */}
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.sidebarBrand}>
          <img src="/logo.svg" alt="Geido Logo" className={styles.brandLogo} />
          {!isCollapsed && (
            <div>
              <div className={styles.brandName}>Geido</div>
              <div className={styles.brandSub}>Studio</div>
            </div>
          )}
          <button className={styles.collapseToggle} onClick={() => setIsCollapsed(!isCollapsed)}>
            <ChevronRight size={18} className={isCollapsed ? '' : styles.arrowLeft} />
          </button>
        </div>

        <nav ref={navRef} className={styles.sidebarNav}>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`${styles.navItem} ${isActive ? styles.navActive : ''}`}
                onClick={() => navigate(item.path)}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={18} className={styles.navIcon} />
                {!isCollapsed && <span>{item.label}</span>}
                {item.path === '/admin/messages' && unreadCount > 0 && (
                  <span className={`${styles.navBadge} ${isCollapsed ? styles.badgeCollapsed : ''}`}>
                    {isCollapsed ? '' : unreadCount}
                  </span>
                )}
                {!isCollapsed && isActive && <ChevronRight size={14} className={styles.navArrow} />}
              </button>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          {!isCollapsed && (
            <div className={styles.adminInfo}>
              <div className={styles.adminAvatar}>A</div>
              <div>
                <div className={styles.adminName}>Admin</div>
                <div className={styles.adminEmail}>admin@geidostudio.com</div>
              </div>
            </div>
          )}
          <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/admin/login'); }} title="Çıkış Yap">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className={styles.mainWrapper}>
        <header className={styles.topBar}>
          <div>
            <h1 className={styles.pageTitle}>{activeItem.label}</h1>
            <p className={styles.pageGreeting}>{greeting}, hoş geldiniz 👋</p>
          </div>
          <div className={styles.topBarActions}>
            <a href="/" target="_blank" rel="noreferrer" className={styles.previewBtn}>
              <Eye size={16} /> Siteyi Görüntüle <ExternalLink size={12} />
            </a>
          </div>
        </header>

        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
