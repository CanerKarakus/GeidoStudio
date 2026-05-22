import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import useCmsStore from '../../store/cmsStore';
import styles from '../../pages/Admin/AdminDashboard.module.scss';
import {
  LogOut, Image as ImageIcon, MessageSquare,
  LayoutDashboard, Eye, Globe, ChevronRight,
  Layers, Edit3, ExternalLink, FileText, Database
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/admin',          label: 'Genel Bakış',       icon: LayoutDashboard, exact: true },
  { path: '/admin/hero',     label: 'Hero / Vitrin',     icon: Layers },
  { path: '/admin/texts',    label: 'İçerik & Metinler', icon: Edit3 },
  { path: '/admin/about',    label: 'Hakkımızda',        icon: Globe },
  { path: '/admin/images',   label: 'Görseller',         icon: ImageIcon },
  { path: '/admin/blog',     label: 'Blog Yönetimi',     icon: FileText },
  { path: '/admin/projects', label: 'Projeler',          icon: Layers },
  { path: '/admin/contact',  label: 'İletişim Bilgileri', icon: Globe },
  { path: '/admin/messages', label: 'Gelen Mesajlar',    icon: MessageSquare },
  { path: '/admin/newsletter', label: 'Bülten', icon: Globe },
  { path: '/admin/database', label: 'Veri Tabanı', icon: Database },
];

const AdminLayout = () => {
  const { isAdmin, isLoading, logout, messages } = useCmsStore();
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);

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

  const currentNav = NAV_ITEMS.find(n =>
    n.exact ? location.pathname === n.path : location.pathname.startsWith(n.path)
  ) || NAV_ITEMS[0];

  // For non-exact matches, we need to check more carefully
  const activeItem = NAV_ITEMS.slice().reverse().find(n =>
    n.exact ? location.pathname === n.path : location.pathname === n.path
  ) || NAV_ITEMS[0];

  return (
    <div className={styles.dashboard}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <div className={styles.brandIcon}>G</div>
          <div>
            <div className={styles.brandName}>Geido</div>
            <div className={styles.brandSub}>Admin Panel</div>
          </div>
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
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.path === '/admin/messages' && messages.length > 0 && (
                  <span className={styles.navBadge}>{messages.length}</span>
                )}
                {isActive && <ChevronRight size={14} className={styles.navArrow} />}
              </button>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.adminInfo}>
            <div className={styles.adminAvatar}>A</div>
            <div>
              <div className={styles.adminName}>Admin</div>
              <div className={styles.adminEmail}>admin@geidostudio.com</div>
            </div>
          </div>
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
