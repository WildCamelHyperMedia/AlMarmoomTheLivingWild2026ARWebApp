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
  
  useEffect(() => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
      const positions = geometry.attributes.position;
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        
        const wave1 = Math.sin(x * 0.15) * Math.cos(y * 0.12) * 0.8;
        const wave2 = Math.sin(x * 0.08 + y * 0.06) * 0.5;
        const wave3 = Math.sin(x * 0.3) * Math.sin(y * 0.25) * 0.3;
        const ripples = Math.sin(x * 1.5) * Math.cos(y * 1.2) * 0.08;
        
        positions.setZ(i, wave1 + wave2 + wave3 + ripples);
      }
      
      geometry.computeVertexNormals();
      positions.needsUpdate = true;
    }
  }, []);
  
  return (
    <group>
      <mesh 
        ref={meshRef} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 200, 256, 256]} />
        <meshStandardMaterial 
          color="#D4A045"
          roughness={0.98}
          metalness={0.02}
          flatShading={false}
        />
      </mesh>
      
      <SandRipples position={[0, -0.45, 0]} />
      <SandRipples position={[-20, -0.45, -15]} />
      <SandRipples position={[15, -0.45, 10]} />
      <SandRipples position={[-10, -0.45, 20]} />
    </group>
  );
}

function SandRipples({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
      const positions = geometry.attributes.position;
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const ripple = Math.sin(x * 2 + y * 0.5) * 0.05;
        positions.setZ(i, ripple);
      }
      
      geometry.computeVertexNormals();
      positions.needsUpdate = true;
    }
  }, []);
  
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={position}>
      <planeGeometry args={[30, 30, 64, 64]} />
      <meshStandardMaterial 
        color="#C8983A"
        roughness={1}
        transparent
        opacity={0.4}
      />
    </mesh>
  );
}

function SandDune({ position, scale = 1, rotation = 0 }: { position: [number, number, number]; scale?: number; rotation?: number }) {
  const mainDuneRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (mainDuneRef.current) {
      const geometry = mainDuneRef.current.geometry as THREE.SphereGeometry;
      const positions = geometry.attributes.position;
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        
        if (y > 0) {
          const windward = x > 0 ? 0.85 : 1.15;
          positions.setX(i, x * windward);
          
          const ripple = Math.sin(x * 3 + z * 2) * 0.05;
          positions.setY(i, y + ripple);
        }
      }
      
      geometry.computeVertexNormals();
      positions.needsUpdate = true;
    }
  }, []);
  
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh ref={mainDuneRef} position={[0, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[5, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial 
          color="#C4923E" 
          roughness={0.95}
          flatShading={false}
        />
      </mesh>
      
      <mesh position={[4, -0.2, 2]} scale={[1.2, 0.6, 0.8]} castShadow>
        <sphereGeometry args={[3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#BF8E38" roughness={0.96} />
      </mesh>
      
      <mesh position={[-3, -0.15, -2]} scale={[0.8, 0.5, 1.1]} castShadow>
        <sphereGeometry args={[3.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#D09E42" roughness={0.94} />
      </mesh>
      
      <mesh position={[2, -0.3, -4]} scale={[1.5, 0.4, 0.7]} castShadow>
        <sphereGeometry args={[2.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#C8983A" roughness={0.97} />
      </mesh>
      
      <DuneRidge position={[0, 0.1, 0]} length={8} />
    </group>
  );
}

function DuneRidge({ position, length }: { position: [number, number, number]; length: number }) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= 20; i++) {
    const t = (i / 20) * length - length / 2;
    const y = Math.sin((i / 20) * Math.PI) * 0.3;
    points.push(new THREE.Vector3(t, y, 0));
  }
  
  return (
    <group position={position}>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#E8C068" linewidth={2} />
      </line>
    </group>
  );
}

function DesertRock({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow rotation={[0.2, 0.5, 0.1]}>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#8B7355" roughness={0.9} />
      </mesh>
      <mesh position={[0.5, -0.3, 0.3]} scale={0.6} castShadow rotation={[0.3, 0.8, 0]}>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#9B8365" roughness={0.85} />
      </mesh>
    </group>
  );
}

function DesertPlant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.3, 0]}>
        <coneGeometry args={[0.15, 0.8, 8]} />
        <meshStandardMaterial color="#5D7A3D" roughness={0.8} />
      </mesh>
      <mesh position={[0.15, 0.2, 0.1]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.1, 0.5, 6]} />
        <meshStandardMaterial color="#4A6830" roughness={0.8} />
      </mesh>
      <mesh position={[-0.12, 0.15, -0.08]} rotation={[0, 0, -0.25]}>
        <coneGeometry args={[0.08, 0.4, 6]} />
        <meshStandardMaterial color="#6B8B45" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Cactus({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 1.6, 12]} />
        <meshStandardMaterial color="#4A7C3F" roughness={0.7} />
      </mesh>
      <mesh position={[0.35, 0.9, 0]} rotation={[0, 0, -0.5]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.6, 10]} />
        <meshStandardMaterial color="#3D6A33" roughness={0.7} />
      </mesh>
      <mesh position={[-0.3, 0.7, 0]} rotation={[0, 0, 0.6]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.5, 10]} />
        <meshStandardMaterial color="#5A8C4F" roughness={0.7} />
      </mesh>
    </group>
  );
}

function DustParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 200;
  
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 1] = Math.random() * 15 + 0.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.002;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#E8D5B7"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

function Tumbleweed({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.3;
      meshRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.2) * 2;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[0.4, 1]} />
      <meshStandardMaterial color="#8B7355" roughness={1} wireframe />
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
      <ambientLight intensity={0.5} color="#FFF5E6" />
      <directionalLight 
        position={[50, 40, 30]} 
        intensity={2} 
        castShadow
        shadow-mapSize={[2048, 2048]}
        color="#FFE4B5"
      />
      <directionalLight 
        position={[-30, 20, -20]} 
        intensity={0.4} 
        color="#87CEEB"
      />
      <hemisphereLight 
        color="#FFF5E6"
        groundColor="#D4A045"
        intensity={0.6}
      />
      
      <Sky 
        distance={450000}
        sunPosition={[100, 30, 100]}
        inclination={0.55}
        azimuth={0.25}
        rayleigh={0.4}
        turbidity={8}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />
      
      <fog attach="fog" args={['#E8D5B7', 25, 100]} />
      
      <DesertTerrain />
      
      <DustParticles />
      
      <SandDune position={[-20, -0.5, -25]} scale={2.5} rotation={0.3} />
      <SandDune position={[25, -0.5, -20]} scale={2} rotation={-0.5} />
      <SandDune position={[-15, -0.5, 20]} scale={2.2} rotation={0.8} />
      <SandDune position={[20, -0.5, 25]} scale={2.8} rotation={-0.2} />
      <SandDune position={[0, -0.5, -35]} scale={2} rotation={0.5} />
      <SandDune position={[-30, -0.5, 0]} scale={1.8} rotation={1.2} />
      <SandDune position={[35, -0.5, 5]} scale={2.3} rotation={-0.8} />
      <SandDune position={[-8, -0.5, -40]} scale={1.5} rotation={0.1} />
      <SandDune position={[12, -0.5, 35]} scale={1.7} rotation={-1.1} />
      <SandDune position={[-35, -0.5, -15]} scale={2.1} rotation={0.6} />
      
      <DesertRock position={[-5, -0.3, -8]} scale={1.2} />
      <DesertRock position={[7, -0.3, -12]} scale={0.8} />
      <DesertRock position={[-12, -0.3, 3]} scale={1} />
      <DesertRock position={[15, -0.3, -6]} scale={0.6} />
      <DesertRock position={[3, -0.3, 10]} scale={0.9} />
      <DesertRock position={[-9, -0.3, -18]} scale={1.1} />
      
      <DesertPlant position={[-3, -0.5, -6]} scale={1.2} />
      <DesertPlant position={[5, -0.5, -10]} scale={0.9} />
      <DesertPlant position={[-8, -0.5, 8]} scale={1.1} />
      <DesertPlant position={[12, -0.5, 3]} scale={0.8} />
      <DesertPlant position={[-15, -0.5, -5]} scale={1} />
      <DesertPlant position={[8, -0.5, -18]} scale={1.3} />
      <DesertPlant position={[-2, -0.5, 15]} scale={0.7} />
      
      <Cactus position={[-18, -0.5, -8]} scale={1.2} />
      <Cactus position={[18, -0.5, 12]} scale={0.9} />
      <Cactus position={[-10, -0.5, 18]} scale={1} />
      <Cactus position={[22, -0.5, -10]} scale={1.1} />
      
      <Tumbleweed position={[5, 0, 5]} />
      <Tumbleweed position={[-12, 0, -3]} />
      
      {animalHotspots.map((hotspot) => (
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
