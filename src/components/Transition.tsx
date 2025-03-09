
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TransitionProps {
  children: React.ReactNode;
  location: string;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -8,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

const Transition: React.FC<TransitionProps> = ({ children, location, className }) => {
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut');
      
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('fadeIn');
      }, 400); // Matches the animation duration
      
      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={displayLocation}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default Transition;
