// src/App.jsx
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { LazyMotion, domAnimation, AnimatePresence } from 'framer-motion';
import { lazy, Suspense, useEffect } from 'react';

// Components
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import PageTransition from './components/PageTransition/PageTransition';
import ScrollFeatures from './components/ScrollFeatures/ScrollFeatures';

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home/Home'));
const Projects = lazy(() => import('./pages/Projects/Projects'));
const About = lazy(() => import('./pages/About/About'));
const Contact = lazy(() => import('./pages/Contact/Contact'));

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/projeler" element={<PageTransition><Projects /></PageTransition>} />
        <Route path="/hakkinda" element={<PageTransition><About /></PageTransition>} />
        <Route path="/iletisim" element={<PageTransition><Contact /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <LazyMotion features={domAnimation}>
        <div className="app">
          <ScrollFeatures />
          <Navbar />
          <main className="main-content">
            <Suspense fallback={<div className="loading-screen">Yükleniyor...</div>}>
              <AnimatedRoutes />
            </Suspense>
          </main>
          <Footer />
        </div>
      </LazyMotion>
    </Router>
  );
}

export default App;
