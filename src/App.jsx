// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { LazyMotion, domAnimation, AnimatePresence, m } from 'framer-motion';
import { lazy, Suspense, useEffect, useState } from 'react';

// Components
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import PageTransition from './components/PageTransition/PageTransition';
import ScrollFeatures from './components/ScrollFeatures/ScrollFeatures';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import SplashScreen from './components/SplashScreen/SplashScreen';

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home/Home'));
const Projects = lazy(() => import('./pages/Projects/Projects'));
const About = lazy(() => import('./pages/About/About'));
const Contact = lazy(() => import('./pages/Contact/Contact'));

// Admin pages
const AdminLayout = lazy(() => import('./components/AdminLayout/AdminLayout'));
const AdminLogin = lazy(() => import('./pages/Admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const AdminHero = lazy(() => import('./pages/Admin/AdminHero'));
const AdminTexts = lazy(() => import('./pages/Admin/AdminTexts'));
const AdminImages = lazy(() => import('./pages/Admin/AdminImages'));
const AdminContact = lazy(() => import('./pages/Admin/AdminContact'));
const AdminMessages = lazy(() => import('./pages/Admin/AdminMessages'));

import useCmsStore from './store/cmsStore';

// Module-level flag — survives re-renders, resets on full page refresh
let splashHasShown = false;

// ─── Stagger variants ──────────────────────────────────────────────────────
const pageRevealVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.05,
    },
  },
};

const revealItem = {
  hidden: { opacity: 0, y: 28, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/projeler" element={<PageTransition><Projects /></PageTransition>} />
        <Route path="/hakkinda" element={<PageTransition><About /></PageTransition>} />
        <Route path="/iletisim" element={<PageTransition><Contact /></PageTransition>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Suspense fallback={<LoadingScreen />}><AdminLogin /></Suspense>} />
        <Route path="/admin" element={<Suspense fallback={<LoadingScreen />}><AdminLayout /></Suspense>}>
          <Route index element={<AdminDashboard />} />
          <Route path="hero" element={<AdminHero />} />
          <Route path="texts" element={<AdminTexts />} />
          <Route path="images" element={<AdminImages />} />
          <Route path="contact" element={<AdminContact />} />
          <Route path="messages" element={<AdminMessages />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const init = useCmsStore((state) => state.init);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showSplash, setShowSplash] = useState(!splashHasShown);
  const [contentRevealed, setContentRevealed] = useState(splashHasShown);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    init();
  }, [init]);

  // Navigation loading for non-home pages (skip during splash)
  useEffect(() => {
    if (showSplash) return;
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 800);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleSplashComplete = () => {
    splashHasShown = true;
    setShowSplash(false);
    // Start content reveal slightly before/as splash exits
    setTimeout(() => setContentRevealed(true), 200);
  };

  const shouldShowSplash = isHomePage && showSplash && !isAdminRoute;
  const isLoading = !shouldShowSplash && isNavigating;

  // Use stagger reveal only for the initial home page load
  const useReveal = isHomePage && !isAdminRoute;
  const revealState = contentRevealed ? 'visible' : 'hidden';

  return (
    <LazyMotion features={domAnimation}>
      {useReveal ? (
        // ── HOME PAGE: everything stagger-reveals after splash ──────────────
        <m.div
          className="app"
          variants={pageRevealVariants}
          initial={splashHasShown ? 'visible' : 'hidden'}
          animate={revealState}
        >
          <m.div variants={revealItem}>
            <ScrollFeatures />
          </m.div>

          <m.div variants={revealItem}>
            <Navbar />
          </m.div>

          <m.main className="main-content" variants={revealItem}>
            <Suspense fallback={<LoadingScreen />}>
              <AnimatedRoutes />
            </Suspense>
          </m.main>

          <m.div variants={revealItem}>
            <Footer />
          </m.div>

          {/* Splash overlay on top of everything */}
          <AnimatePresence>
            {shouldShowSplash && (
              <SplashScreen key="splash" onComplete={handleSplashComplete} />
            )}
          </AnimatePresence>
        </m.div>
      ) : (
        // ── OTHER PAGES / ADMIN: normal layout, no stagger ─────────────────
        <div className="app">
          {!isAdminRoute && <ScrollFeatures />}
          {!isAdminRoute && <Navbar />}
          <main className="main-content">
            <Suspense fallback={<LoadingScreen />}>
              <AnimatedRoutes />
            </Suspense>

            <AnimatePresence>
              {isLoading && <LoadingScreen key="loading-overlay" />}
            </AnimatePresence>
          </main>
          {!isAdminRoute && <Footer />}
        </div>
      )}
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
