// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { LazyMotion, domAnimation, AnimatePresence } from 'framer-motion';
import { lazy, Suspense, useEffect, useState, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

// Components
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import PageTransition from './components/PageTransition/PageTransition';
import ScrollFeatures from './components/ScrollFeatures/ScrollFeatures';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import SplashScreen from './components/SplashScreen/SplashScreen';
import MaintenanceScreen from './components/MaintenanceScreen/MaintenanceScreen';
import HeatmapTracker from './components/HeatmapTracker/HeatmapTracker';
import LiveSupport from './components/LiveSupport/LiveSupport';
import EasterEggTerminal from './components/EasterEggTerminal/EasterEggTerminal';

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home/Home'));
const Projects = lazy(() => import('./pages/Projects/Projects'));
const About = lazy(() => import('./pages/About/About'));
const Contact = lazy(() => import('./pages/Contact/Contact'));
const Blog = lazy(() => import('./pages/Blog/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost/BlogPost'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));
const PrivacyPolicy = lazy(() => import('./pages/Legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/Legal/TermsOfService'));
const CookiePolicy = lazy(() => import('./pages/Legal/CookiePolicy'));
const KvkkPolicy = lazy(() => import('./pages/Legal/KvkkPolicy'));
const Ticket = lazy(() => import('./pages/Ticket/Ticket'));
const Unsubscribe = lazy(() => import('./pages/Unsubscribe/Unsubscribe'));
const Tracking = lazy(() => import('./pages/Tracking/Tracking'));
const Honeypot = lazy(() => import('./pages/Honeypot/Honeypot'));

// Admin pages
const AdminLayout = lazy(() => import('./components/AdminLayout/AdminLayout'));
const AdminLogin = lazy(() => import('./pages/Admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const AdminHero = lazy(() => import('./pages/Admin/AdminHero'));
const AdminTexts = lazy(() => import('./pages/Admin/AdminTexts'));
const AdminImages = lazy(() => import('./pages/Admin/AdminImages'));
const AdminContact = lazy(() => import('./pages/Admin/AdminContact'));
const AdminMessages = lazy(() => import('./pages/Admin/AdminMessages'));
const AdminBlog = lazy(() => import('./pages/Admin/AdminBlog'));
const AdminProjects = lazy(() => import('./pages/Admin/AdminProjects'));
const AdminNewsletter = lazy(() => import('./pages/Admin/AdminNewsletter'));
const AdminAbout = lazy(() => import('./pages/Admin/AdminAbout'));
const AdminDatabase = lazy(() => import('./pages/Admin/AdminDatabase'));
const AdminSEO = lazy(() => import('./pages/Admin/AdminSEO'));
const AdminEmails = lazy(() => import('./pages/Admin/AdminEmails'));
const AdminTracking = lazy(() => import('./pages/Admin/AdminTracking'));
const AdminHeatmap = lazy(() => import('./pages/Admin/AdminHeatmap'));

import useCmsStore from './store/cmsStore';
import { api } from './api/db';

// Module-level flag — survives re-renders, resets on full page refresh
let splashHasShown = false;

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (!location.pathname.startsWith('/admin')) {
      api.recordAnalyticsHit(location.pathname);
    }
  }, [location.pathname]);

  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      // Safe, cross-browser scroll to top without 'instant' which causes TypeError in some browsers
      window.scrollTo(0, 0);
    } catch (e) {
      // Ignore
    }
  }, [pathname]);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/projeler" element={<PageTransition><Projects /></PageTransition>} />
        <Route path="/hakkinda" element={<PageTransition><About /></PageTransition>} />
        <Route path="/iletisim" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
        <Route path="/blog/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
        <Route path="/gizlilik-politikasi" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/kullanim-kosullari" element={<PageTransition><TermsOfService /></PageTransition>} />
        <Route path="/cerez-politikasi" element={<PageTransition><CookiePolicy /></PageTransition>} />
        <Route path="/kvkk" element={<PageTransition><KvkkPolicy /></PageTransition>} />
        <Route path="/ticket/:id" element={<PageTransition><Ticket /></PageTransition>} />
        <Route path="/unsubscribe" element={<PageTransition><Unsubscribe /></PageTransition>} />
        <Route path="/takip" element={<PageTransition><Tracking /></PageTransition>} />
        <Route path="/takip/:slug" element={<PageTransition><Tracking /></PageTransition>} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<Suspense fallback={<LoadingScreen />}><AdminLogin /></Suspense>} />
        <Route path="/admin" element={<Suspense fallback={<LoadingScreen />}><AdminLayout /></Suspense>}>
          <Route index element={<AdminDashboard />} />
          <Route path="hero" element={<AdminHero />} />
          <Route path="texts" element={<AdminTexts />} />
          <Route path="images" element={<AdminImages />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="contact" element={<AdminContact />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="newsletter" element={<AdminNewsletter />} />
          <Route path="about" element={<AdminAbout />} />
          <Route path="database" element={<AdminDatabase />} />
          <Route path="seo" element={<AdminSEO />} />
          <Route path="emails" element={<AdminEmails />} />
          <Route path="tracking" element={<AdminTracking />} />
          <Route path="heatmap" element={<AdminHeatmap />} />
        </Route>

        {/* 404 Route */}
        <Route path="/wp-admin" element={<PageTransition><Honeypot /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const { init, cms, isBanned } = useCmsStore();
  const [isNavigating, setIsNavigating] = useState(false);
  const [showSplash, setShowSplash] = useState(!splashHasShown);
  const [userIp, setUserIp] = useState('Yükleniyor...');
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isHomePage = location.pathname === '/';
  
  const isMaintenanceMode = cms?.settings?.maintenanceMode;

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setUserIp(data.ip))
      .catch(() => setUserIp('Bilinmiyor'));

    if (isAdminRoute) return; // Don't use smooth scroll in admin panel

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [isAdminRoute]);

  useEffect(() => {
    init();
  }, [init]);

  // Navigation loading for non-home pages
  useEffect(() => {
    // Skip navigation loader during splash
    if (showSplash) return;

    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 800);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleSplashComplete = () => {
    splashHasShown = true;
    setShowSplash(false);
  };

  const isPreview = window.location.search.includes('adminPreview=true');
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  const shouldShowSplash = isHomePage && showSplash && !isAdminRoute && !isPreview && !isSafari;
  const isLoading = !shouldShowSplash && isNavigating;

  if (isBanned) {
    return (
      <div style={{
        width: '100vw', 
        height: '100vh', 
        background: '#0a0a0a', 
        color: '#ffffff', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
        textAlign: 'center', 
        padding: '2rem', 
        boxSizing: 'border-box'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Geido-style minimal header */}
          <h1 style={{ 
            fontSize: '2.5rem', 
            margin: '0 0 1rem 0',
            fontWeight: '600',
            letterSpacing: '-0.5px',
            color: '#ef4444'
          }}>
            Erişim Engellendi
          </h1>
          <p style={{ 
            fontSize: '1.05rem', 
            color: '#a0a0a0', 
            lineHeight: '1.6', 
            margin: '0 0 2.5rem 0',
            fontWeight: '400',
            maxWidth: '550px'
          }}>
            Sistemlerimiz, ağımıza yönelik olağandışı ve potansiyel olarak zararlı bir etkinlik tespit etmiştir. Geido Studio güvenlik politikaları ve sunucu bütünlüğünü koruma protokolleri gereğince, IP adresinizden gelen tüm bağlantılar kalıcı olarak reddedilmek üzere Güvenlik Duvarı (Firewall) kara listesine alınmıştır.
          </p>

          {/* Mac-style Terminal Block */}
          <div style={{ 
            background: '#16161a', 
            borderRadius: '10px', 
            overflow: 'hidden', 
            width: '100%', 
            textAlign: 'left', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            border: '1px solid #2a2a35'
          }}>
            {/* Terminal Header */}
            <div style={{ 
              background: '#1f1f24', 
              padding: '12px 16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              borderBottom: '1px solid #2a2a35'
            }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }} />
              <span style={{ 
                color: '#8a8a93', 
                fontSize: '0.8rem', 
                marginLeft: '12px', 
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' 
              }}>
                security_log.sh
              </span>
            </div>
            
            {/* Terminal Content */}
            <div style={{ 
              padding: '24px', 
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', 
              color: '#d4d4d8', 
              fontSize: '0.9rem', 
              lineHeight: '1.7' 
            }}>
              <div style={{ color: '#ef4444' }}>
                <span style={{ opacity: 0.5, marginRight: '8px' }}>&gt;</span>
                [ SYSTEM LOCKDOWN INITIATED ]
              </div>
              <div style={{ color: '#eab308', marginTop: '8px' }}>
                <span style={{ opacity: 0.5, marginRight: '8px' }}>&gt;</span>
                DETECTED_ACTIVITY: Unauthorized access attempt via Honeypot / Admin Portal.
              </div>
              <div style={{ color: '#eab308' }}>
                <span style={{ opacity: 0.5, marginRight: '8px' }}>&gt;</span>
                SECURITY_RULE_TRIGGERED: Rule #403-A (Strict Zero-Trust Enforcement).
              </div>
              <div style={{ color: '#eab308' }}>
                <span style={{ opacity: 0.5, marginRight: '8px' }}>&gt;</span>
                ACTION_TAKEN: IP addresses logged and permanently routed to black hole.
              </div>
              <div style={{ color: '#71717a', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>&gt; Connection actively refused by server.</span>
                <span>ERR_CODE: 403_FORBIDDEN</span>
              </div>
            </div>
          </div>
          
          <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#71717a', lineHeight: '1.6' }}>
            Hata olduğunu düşünüyorsanız IP adresiniz (<strong style={{ color: '#d4d4d8' }}>{userIp}</strong>) ile birlikte <br/>
            <a href={`mailto:appeal@geidostudio.com?subject=Ban%20Appeal%20-%20IP:%20${userIp}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>appeal@geidostudio.com</a> adresine e-posta gönderebilirsiniz.
          </p>
        </div>
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="app">
        {!isAdminRoute && !isMaintenanceMode && <ScrollFeatures />}
        {!isAdminRoute && !isMaintenanceMode && <Navbar />}
        <main className="main-content">
          <ScrollToTop />
          <AnalyticsTracker />
          <HeatmapTracker />
          
          {isMaintenanceMode && !isAdminRoute ? (
            <MaintenanceScreen />
          ) : (
            <Suspense fallback={<LoadingScreen />}>
              <AnimatedRoutes />
            </Suspense>
          )}

          <AnimatePresence>
            {/* Home page first load: full splash with gradient */}
            {shouldShowSplash && (
              <SplashScreen key="splash" onComplete={handleSplashComplete} />
            )}
            {/* Other pages: quick dark overlay */}
            {isLoading && !shouldShowSplash && (
              <LoadingScreen key="loading-overlay" />
            )}
          </AnimatePresence>
        </main>
        {!isAdminRoute && !isMaintenanceMode && <Footer />}
        {!isAdminRoute && !isMaintenanceMode && <LiveSupport />}
        {!isAdminRoute && !isMaintenanceMode && <EasterEggTerminal />}
      </div>
    </LazyMotion>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
