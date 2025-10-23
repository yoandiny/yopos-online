import React from 'react';
import { motion } from 'framer-motion';
import Logo from '../../assets/logo.png';

const SplashScreen: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 bg-primary-600 z-[100] flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 120, duration: 0.5 }}
      >
        <img src={Logo} className="text-white w-35 h-35"  />
      </motion.div>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="text-primary-200"
      >
        Votre caisse, simplifiée.
      </motion.p>
    </motion.div>
  );
};

export default SplashScreen;
