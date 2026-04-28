import React from 'react';
import { m } from 'framer-motion';

const variants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }
};

const PageTransition = ({ children }) => {
  return (
    <m.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={variants}
      style={{ width: '100%', minHeight: '100vh' }}
    >
      {children}
    </m.div>
  );
};

export default PageTransition;
