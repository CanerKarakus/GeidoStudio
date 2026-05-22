// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { LazyMotion, domAnimation, AnimatePresence } from 'framer-motion';
import { lazy, Suspense, useEffect, useState, useRef } from 'react';

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
const Blog = lazy(() => import('./pages/Blog/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost/BlogPost'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));
const PrivacyPolicy = lazy(() => import('./pages/Legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/Legal/TermsOfService'));
const CookiePolicy = lazy(() => import('./pages/Legal/CookiePolicy'));
const KvkkPolicy = lazy(() => import('./pages/Legal/KvkkPolicy'));
const Ticket = lazy(() => import('./pages/Ticket/Ticket'));
const Unsubscribe = lazy(() => import('./pages/Unsubscribe/Unsubscribe'));

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

import useCmsStore from './store/cmsStore';

// Module-level flag — survives re-renders, resets on full page refresh
let splashHasShown = false;

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
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const init = useCmsStore((state) => state.init);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showSplash, setShowSplash] = useState(!splashHasShown);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isHomePage = location.pathname === '/';

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

  const shouldShowSplash = isHomePage && showSplash && !isAdminRoute;
  const isLoading = !shouldShowSplash && isNavigating;

  return (
    <LazyMotion features={domAnimation}>
      <div className="app">
        {!isAdminRoute && <ScrollFeatures />}
        {!isAdminRoute && <Navbar />}
        <main className="main-content">
          <Suspense fallback={<LoadingScreen />}>
            <AnimatedRoutes />
          </Suspense>

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
        {!isAdminRoute && <Footer />}
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
