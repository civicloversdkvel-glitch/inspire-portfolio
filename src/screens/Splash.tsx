import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { InspireLogo } from '../components/InspireLogo';
import { useSkillsViewModel } from '../store/useSkillsViewModel';

export function Splash() {
  const navigate = useNavigate();
  const { skills, isLoaded } = useSkillsViewModel();

  useEffect(() => {
    if (!isLoaded) return;

    const timer = setTimeout(() => {
      if (skills.length === 0) {
        navigate('/skills', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, isLoaded, skills.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center bg-blue-900 text-white relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[50%] rounded-full bg-blue-800/50 blur-3xl"></div>
        <div className="absolute -bottom-[10%] -left-[10%] w-[60%] h-[40%] rounded-full bg-yellow-500/20 blur-3xl"></div>
      </div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
        className="z-10 flex flex-col items-center"
      >
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="w-32 h-32 bg-white rounded-3xl p-2 shadow-2xl mb-8 flex items-center justify-center overflow-hidden border-4 border-yellow-400/80"
        >
          <InspireLogo
            alt="The Inspire Business Academy Logo"
            className="w-full h-full object-contain"
          />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-3xl font-extrabold tracking-wider text-center px-4 leading-tight"
        >
          THE INSPIRE
          <br />
          <span className="text-yellow-400">BUSINESS ACADEMY</span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-4 text-blue-200 text-sm tracking-[0.3em] uppercase font-medium"
        >
          Learn &bull; Earn &bull; Grow
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-16 z-10 flex flex-col items-center gap-3"
      >
        <div className="w-8 h-8 border-4 border-blue-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
        <span className="text-xs text-blue-300 uppercase tracking-widest font-medium">Loading Workspace</span>
      </motion.div>
    </motion.div>
  );
}
