import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function BootScreen() {
  const [, setLocation] = useLocation();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 4500);

    const redirectTimer = setTimeout(() => {
      setLocation("/language");
    }, 5000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(redirectTimer);
    };
  }, [setLocation]);

  return (
    <AnimatePresence>
      {!fadeOut ? (
        <motion.div 
          className="fixed inset-0 bg-black z-50"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <video
            src="/videos/boot-screen.mp4"
            className="h-full w-full object-cover"
            autoPlay
            muted
            playsInline
          />
        </motion.div>
      ) : (
        <motion.div 
          className="fixed inset-0 bg-black z-50"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <video
            src="/videos/boot-screen.mp4"
            className="h-full w-full object-cover"
            muted
            playsInline
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
