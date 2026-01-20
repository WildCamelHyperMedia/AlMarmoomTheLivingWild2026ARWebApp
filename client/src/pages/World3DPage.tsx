import { useState, useRef, Suspense, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sky, Html, OrbitControls } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X, ScanLine, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/language";
import { animals, Animal } from "@/lib/data";
import { useProgress } from "@/lib/progress";
import * as THREE from "three";

interface AnimalHotspot {
  animal: Animal;
  position: [number, number, number];
  scale: number;
}

const animalHotspots: AnimalHotspot[] = [
  { animal: animals[0], position: [-8, 0.5, -5], scale: 1.2 },
  { animal: animals[1], position: [6, 0.5, -8], scale: 1 },
  { animal: animals[2], position: [-4, 0.5, -12], scale: 1.1 },
  { animal: animals[3], position: [10, 0.5, -3], scale: 0.9 },
  { animal: animals[4], position: [-12, 0.5, -10], scale: 1 },
  { animal: animals[5], position: [3, 0.5, -15], scale: 1.2 },
  { animal: animals[6], position: [-6, 0.5, 5], scale: 1 },
  { animal: animals[7], position: [8, 0.5, 8], scale: 1.1 },
];

function DesertTerrain() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  return (
    <mesh 
      ref={meshRef} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -0.5, 0]}
      receiveShadow
    >
      <planeGeometry args={[100, 100, 64, 64]} />
      <meshStandardMaterial 
        color="#D4A045"
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  );
}

function Dune({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#C4923E" roughness={0.95} />
    </mesh>
  );
}

function AnimalMarker({ 
  hotspot, 
  onClick, 
  isUnlocked 
}: { 
  hotspot: AnimalHotspot; 
  onClick: () => void;
  isUnlocked: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = hotspot.position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const handleClick = () => {
    if (isUnlocked) {
      onClick();
    }
  };

  return (
    <group position={hotspot.position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => isUnlocked && setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? hotspot.scale * 1.2 : hotspot.scale}
      >
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial 
          color={isUnlocked ? "#D4A045" : "#8B6B58"}
          emissive={isUnlocked ? "#D4A045" : "#5C4033"}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          transparent
          opacity={isUnlocked ? 0.9 : 0.5}
        />
      </mesh>
      
      <Html
        position={[0, 1.5, 0]}
        center
        distanceFactor={10}
        style={{ pointerEvents: 'none' }}
      >
        <div className={`bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs whitespace-nowrap border border-white/20 ${isUnlocked ? 'text-white' : 'text-white/50'}`}>
          {isUnlocked ? hotspot.animal.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '🔒 Locked'}
        </div>
      </Html>
      
      <pointLight 
        position={[0, 0.5, 0]} 
        color={isUnlocked ? "#D4A045" : "#8B6B58"} 
        intensity={hovered ? 2 : 1} 
        distance={3} 
      />
    </group>
  );
}

function Scene({ 
  onAnimalClick 
}: { 
  onAnimalClick: (animal: Animal) => void;
}) {
  const { isUnlocked } = useProgress();

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.5} 
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      
      <Sky 
        distance={450000}
        sunPosition={[100, 20, 100]}
        inclination={0.6}
        azimuth={0.25}
        rayleigh={0.5}
      />
      
      <fog attach="fog" args={['#E8D5B7', 30, 80]} />
      
      <DesertTerrain />
      
      <Dune position={[-15, -0.5, -20]} scale={2} />
      <Dune position={[20, -0.5, -15]} scale={1.5} />
      <Dune position={[-10, -0.5, 15]} scale={1.8} />
      <Dune position={[15, -0.5, 20]} scale={2.2} />
      <Dune position={[0, -0.5, -25]} scale={1.6} />
      
      {animalHotspots.map((hotspot, index) => (
        <AnimalMarker
          key={hotspot.animal.id}
          hotspot={hotspot}
          onClick={() => onAnimalClick(hotspot.animal)}
          isUnlocked={isUnlocked(hotspot.animal.id)}
        />
      ))}
      
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 6}
        target={[0, 0, -5]}
      />
    </>
  );
}

function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#1a1410] flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <img src="/logo.png" alt="Al Marmoom" className="w-48 h-auto mx-auto mb-8" />
        
        <h2 className="font-serif text-2xl text-[#D4A045] mb-2">
          {t("world3d.loading") || "Loading 3D World"}
        </h2>
        <p className="text-white/60 text-sm mb-8">
          {t("world3d.prepare") || "Preparing the Arabian Desert..."}
        </p>
        
        <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#D4A045] to-[#E8B84A]"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-white/40 text-xs mt-3">
          {Math.min(Math.round(progress), 100)}%
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-12 text-center"
      >
        <p className="text-white/30 text-xs tracking-widest uppercase">
          Al Marmoom Desert Conservation Reserve
        </p>
      </motion.div>
    </motion.div>
  );
}

function AnimalVideoOverlay({ 
  animal, 
  onClose,
  onArLaunch
}: { 
  animal: Animal;
  onClose: () => void;
  onArLaunch: () => void;
}) {
  const { t, dir } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(true);
  const [showArButton, setShowArButton] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setShowArButton(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-6"
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
        data-testid="button-close-video"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-lg">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-black mb-6">
          {animal.video ? (
            <video
              ref={videoRef}
              src={animal.video}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              onEnded={handleVideoEnded}
            />
          ) : (
            <img 
              src={animal.image}
              alt={animal.id}
              className="w-full h-full object-cover"
            />
          )}
          
          {!isPlaying && !animal.video && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white/60 text-sm">No video available</p>
            </div>
          )}
        </div>
        
        <div className="text-center mb-6">
          <h2 className="font-serif text-2xl text-white mb-1">
            {t(`animals.${animal.id}`)}
          </h2>
          <p className="text-white/60 text-sm tracking-widest uppercase">
            {animal.scientificName}
          </p>
        </div>

        <AnimatePresence>
          {(showArButton || !animal.video) && animal.arUrl && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onArLaunch}
              className="w-full bg-[#8B6B58] hover:bg-[#7A5C4A] text-white font-medium py-4 rounded-2xl transition-all flex items-center justify-between px-6 group"
              data-testid="button-launch-ar-3d"
            >
              <ScanLine className="w-5 h-5 opacity-70" />
              <span className="text-sm tracking-widest uppercase flex-1 text-center">
                {t("detail.enterAr") || "Enter AR Experience"}
              </span>
              <ArrowRight className={`w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ArOverlay({ 
  animal, 
  onClose 
}: { 
  animal: Animal;
  onClose: () => void;
}) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black flex flex-col"
    >
      <div className="relative flex-1">
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 z-50 p-3 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors"
          data-testid="button-close-ar-3d"
        >
          <X className="w-6 h-6" />
        </button>
        
        <iframe
          src={animal.arUrl || "https://web.zappar.com/example-project"} 
          className="w-full h-full border-0"
          allow="camera; gyroscope; accelerometer; magnetometer; xr-spatial-tracking; microphone"
          allowFullScreen
        />
      </div>
      
      <div className="relative z-10 bg-black/90 backdrop-blur-md p-6 pb-10 text-center border-t border-white/10">
        <p className="text-white text-sm font-medium mb-1">
          {t(`animals.${animal.id}`)} AR Experience
        </p>
        <p className="text-white/60 text-xs">
          Allow camera access to view the animal in your space
        </p>
      </div>
    </motion.div>
  );
}

export default function World3DPage() {
  const { t, dir } = useLanguage();
  const [isBooting, setIsBooting] = useState(true);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [showAr, setShowAr] = useState(false);

  const handleAnimalClick = (animal: Animal) => {
    setSelectedAnimal(animal);
  };

  const handleCloseVideo = () => {
    setSelectedAnimal(null);
  };

  const handleLaunchAr = () => {
    setShowAr(true);
  };

  const handleCloseAr = () => {
    setShowAr(false);
    setSelectedAnimal(null);
  };

  return (
    <div className="h-[100dvh] w-full bg-[#1a1410] relative overflow-hidden">
      <AnimatePresence>
        {isBooting && (
          <BootScreen onComplete={() => setIsBooting(false)} />
        )}
      </AnimatePresence>

      {!isBooting && (
        <>
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6">
            <Link href="/gallery">
              <button 
                className={`p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-colors ${dir === 'rtl' ? 'rotate-180' : ''}`}
                data-testid="button-back-3d"
              >
                <ArrowLeft className="h-6 w-6 text-white" />
              </button>
            </Link>
            
            <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full">
              <span className="text-white/80 text-sm font-medium">
                {t("world3d.title") || "3D World"}
              </span>
            </div>
          </div>

          <div className="absolute bottom-6 left-0 right-0 z-20 px-6">
            <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl text-center">
              <p className="text-white/60 text-xs">
                {t("world3d.hint") || "Tap on glowing orbs to discover animals. Drag to look around."}
              </p>
            </div>
          </div>

          <Canvas
            shadows
            camera={{ position: [0, 8, 15], fov: 60 }}
            style={{ background: '#E8D5B7' }}
          >
            <Suspense fallback={null}>
              <Scene onAnimalClick={handleAnimalClick} />
            </Suspense>
          </Canvas>
        </>
      )}

      <AnimatePresence>
        {selectedAnimal && !showAr && (
          <AnimalVideoOverlay
            animal={selectedAnimal}
            onClose={handleCloseVideo}
            onArLaunch={handleLaunchAr}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAr && selectedAnimal && (
          <ArOverlay
            animal={selectedAnimal}
            onClose={handleCloseAr}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
