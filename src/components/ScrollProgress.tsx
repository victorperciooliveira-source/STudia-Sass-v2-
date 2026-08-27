import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

export default function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* Barra de Progresso Fina e Elegante no Topo */}
      <div 
        id="global-scroll-progress-bar"
        className="fixed top-0 left-0 right-0 h-[2px] z-[99999] pointer-events-none"
      >
        <div 
          className="h-full bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-500 transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Botão Flutuante Voltar ao Topo */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            id="scroll-to-top-button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            className="fixed bottom-6 left-6 z-50 w-10 h-10 bg-slate-900/90 hover:bg-slate-900 text-white rounded-full shadow-lg border border-white/10 backdrop-blur-md flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
            title="Voltar ao topo"
          >
            <ArrowUp size={18} className="text-sky-400" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

