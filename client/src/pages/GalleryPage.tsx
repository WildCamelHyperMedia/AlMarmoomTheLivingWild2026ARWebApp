import { motion } from "framer-motion";
import { ArrowLeft, Play, Maximize2, Info, Share2, Heart, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import birdImage from "@assets/generated_images/close_up_of_a_cream-colored_courser_bird_in_desert.png";

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-background text-white pb-20">
      
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent">
        <Link href="/">
          <button className="rounded-full bg-black/20 p-2 backdrop-blur-md hover:bg-black/40 transition-colors">
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
        </Link>
        <div className="flex gap-4">
          <button className="rounded-full bg-black/20 p-2 backdrop-blur-md hover:bg-black/40 transition-colors">
            <Share2 className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-6">
        
        {/* Featured VR Experience Card */}
        <div className="relative h-[85vh] w-full overflow-hidden rounded-b-[3rem] shadow-2xl">
          <div className="absolute inset-0 bg-black/20 z-10" />
          <img 
            src={birdImage} 
            alt="Cream-colored Courser" 
            className="h-full w-full object-cover"
          />
          
          {/* Video Player UI Overlay */}
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 bg-gradient-to-t from-black/90 via-transparent to-transparent">
            
            {/* Play Button - Centered */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="pointer-events-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-lg border border-white/30 text-white shadow-lg hover:bg-white/30 transition-all"
              >
                <Play className="h-8 w-8 ml-1 fill-white" />
              </motion.button>
            </div>

            {/* Info Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-medium tracking-wider uppercase backdrop-blur-sm">
                  Featured
                </span>
                <span className="text-white/60 text-xs tracking-wider uppercase">Rare Sighting</span>
              </div>
              <h2 className="font-serif text-4xl mb-2">The Cream-colored Courser</h2>
              <p className="text-white/70 font-sans text-sm max-w-xs leading-relaxed">
                A native resident of the Arabian desert, perfectly camouflaged against the dunes. Experience its habitat in VR.
              </p>
            </motion.div>

            {/* VR CTA */}
            <button className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-primary/90 hover:bg-primary text-background font-semibold py-4 transition-all active:scale-[0.98]">
              <Maximize2 className="h-5 w-5" />
              <span className="tracking-widest text-sm">ENTER VR EXPERIENCE</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Progress Bar (Mock) */}
            <div className="mt-6 flex items-center gap-3 text-xs font-mono text-white/50">
              <span>0:57</span>
              <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                <div className="absolute left-0 top-0 h-full w-1/3 bg-primary rounded-full" />
              </div>
              <span>3:21</span>
            </div>

          </div>
        </div>

        {/* Secondary Content - "Unified Gallery" Hint */}
        <div className="px-6 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-serif tracking-wide text-white/90">More from the Exhibition</h3>
            <span className="text-xs text-primary cursor-pointer hover:underline">View All</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="text-center opacity-40 group-hover:opacity-100 transition-opacity">
                  <span className="block text-2xl mb-1">Coming Soon</span>
                  <span className="text-xs font-mono">Image {i}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
