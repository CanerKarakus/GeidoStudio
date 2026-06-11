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
  const { init, cms } = useCmsStore();
  const [isNavigating, setIsNavigating] = useState(false);
  const [showSplash, setShowSplash] = useState(!splashHasShown);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isHomePage = location.pathname === '/';
  
  const isMaintenanceMode = cms?.settings?.maintenanceMode;

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
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
