import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

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
    <motion.div 
      className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden"
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      <video
        src="/videos/boot-screen.mp4"
        className="w-full h-full object-contain"
        autoPlay
        muted
        playsInline
      />
    </motion.div>
  );
}
