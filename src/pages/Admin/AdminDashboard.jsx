import { motion } from 'framer-motion';
import useCmsStore from '../../store/cmsStore';
import styles from './AdminDashboard.module.scss';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Image as ImageIcon, Globe, Clock,
  Layers, Edit3, ChevronRight, Database
} from 'lucide-react';

const QUICK_LINKS = [
  { path: '/admin/hero',       label: 'Hero / Vitrin',      icon: Layers },
  { path: '/admin/texts',      label: 'İçerik & Metinler',  icon: Edit3 },
  { path: '/admin/about',      label: 'Hakkımızda',         icon: Globe },
  { path: '/admin/images',     label: 'Görseller',          icon: ImageIcon },
  { path: '/admin/contact',    label: 'İletişim Bilgileri', icon: Globe },
  { path: '/admin/messages',   label: 'Gelen Mesajlar',     icon: MessageSquare },
  { path: '/admin/newsletter', label: 'Bülten',   icon: Globe },
  { path: '/admin/database',   label: 'Veri Tabanı',        icon: Database },
];

const StatCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
  <motion.div className={styles.statCard}
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }} style={{ '--accent': color }}>
    <div className={styles.statIcon}><Icon size={22} /></div>
    <div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  </motion.div>
);

const AdminOverview = () => {
  const { messages, cms } = useCmsStore();
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className={styles.statsGrid}>
        <StatCard icon={MessageSquare} label="Toplam Mesaj"   value={messages.length}                    color="#b30000" delay={0.0} />
        <StatCard icon={ImageIcon}    label="Hero Görseli"    value={cms?.heroImages?.length || 0}       color="#6366f1" delay={0.1} />
        <StatCard icon={Globe}        label="Aktif Sayfalar"  value="4"                                  color="#0ea5e9" delay={0.2} />
        <StatCard icon={Clock}        label="Son Güncelleme"  value="Az önce"                            color="#10b981" delay={0.3} />
      </div>

      <div className={styles.overviewGrid}>
        <motion.div className={styles.overviewCard}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className={styles.cardTitle}>Hızlı İşlemler</h3>
          <div className={styles.quickActions}>
            {QUICK_LINKS.map(item => {
              const Icon = item.icon;
              return (
                <button key={item.path} className={styles.quickAction} onClick={() => navigate(item.path)}>
                  <Icon size={20} />
                  <span>{item.label}</span>
                  <ChevronRight size={14} />
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div className={styles.overviewCard}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className={styles.cardTitleRow}>
            <h3 className={styles.cardTitle}>Son Mesajlar</h3>
            <button className={styles.cardLink} onClick={() => navigate('/admin/messages')}>
              Tümünü Gör <ChevronRight size={14} />
            </button>
          </div>
          {messages.length === 0 ? (
            <div className={styles.emptySmall}>Henüz mesaj yok</div>
          ) : (
            <div className={styles.recentMessages}>
              {messages.slice(0, 4).map(msg => (
                <div key={msg.id} className={styles.recentMsg}>
                  <div className={styles.recentMsgAvatar}>{msg.name?.[0]}</div>
                  <div className={styles.recentMsgBody}>
                    <div className={styles.recentMsgName}>{msg.name}</div>
                    <div className={styles.recentMsgText}>{msg.message?.slice(0, 60)}...</div>
                  </div>
                  <div className={styles.recentMsgDate}>
                    {new Date(msg.date).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminOverview;
