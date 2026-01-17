import { motion } from "framer-motion";
import { ArrowLeft, Share2 } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/language";
import useEmblaCarousel from "embla-carousel-react";
import { useState, useEffect } from "react";

// Data Structure for Animals
const animals = [
  // Page 1
  {
    id: "white_tailed_lapwing",
    image: "/animals/All Animals - Pictures/25- white tailes lapwing.jpg",
  },
  {
    id: "water_rail",
    image: "/animals/All Animals - Pictures/9-Water Rail.jpg",
  },
  {
    id: "blue_throated_wagtail",
    image: "/animals/All Animals - Pictures/14-Blue-throated Wagtail.jpg",
  },
  {
    id: "purple_sunbird",
    image: "/animals/All Animals - Pictures/13-Purple Sunbird.jpg",
  },
  {
    id: "eurasian_stone_curlew",
    image: "/animals/All Animals - Pictures/24-Eurasian Stone-curlew.jpg",
  },
  {
    id: "houbara_bustard",
    image: "/animals/All Animals - Pictures/21 Houbara Bustard١.jpg",
  },
  {
    id: "little_grebe",
    image: "/animals/All Animals - Pictures/1-Little Grebe.jpg",
  },
  {
    id: "western_great_egret",
    image: "/animals/All Animals - Pictures/3-Western Great Egrettif.jpg",
  },
  {
    id: "hoopoe",
    image: "/animals/All Animals - Pictures/6-Hoopoe.jpg",
  },
  {
    id: "yellow_wagtail",
    image: "/animals/All Animals - Pictures/16-The Yellow Wagtails.jpg",
  },
  {
    id: "grey_headed_swamphen",
    image: "/animals/All Animals - Pictures/27-Grey-headed Swamphen.jpg",
  },
  {
    id: "iraqi_sandgrouse",
    image: "/animals/All Animals - Pictures/8-Iraqi Sandgrouse-.jpg",
  },
  // Page 2
  {
    id: "desert_eagle_owl",
    image: "/animals/All Animals - Pictures/26- desert eagle owl .jpg",
  },
  {
    id: "little_owl",
    image: "/animals/All Animals - Pictures/19-Little Owl.jpg",
  },
  {
    id: "ruppells_fox",
    image: "/animals/All Animals - Pictures/7-Ruppell’s Fox 1.jpg",
  },
  {
    id: "gerbillus_cheesmani",
    image: "/animals/All Animals - Pictures/15-Gerbillus cheesmani.jpg",
  },
  {
    id: "hedgehog",
    image: "/animals/All Animals - Pictures/28-hedgehog.jpg",
  },
  {
    id: "desert_monitor",
    image: "/animals/All Animals - Pictures/11-Desert Monitor.jpg",
  },
  {
    id: "arabian_oryx",
    image: "/animals/All Animals - Pictures/20-Arabian Oryx.jpg",
  },
  {
    id: "dorcas_gazelle",
    image: "/animals/All Animals - Pictures/22-(Dorcas Gazelle.jpg",
  },
  {
    id: "frog_headed_lizard",
    image: "/animals/All Animals - Pictures/2-Frog-headed Lizard 1.jpg",
  },
  {
    id: "sandfish_lizard",
    image: "/animals/All Animals - Pictures/17-Sandfish Lizard.jpg",
  },
  {
    id: "spiny_tailed_lizard",
    image: "/animals/All Animals - Pictures/18-Spiny-tailed Lizard.jpg",
  },
];

export default function GalleryPage() {
  const { t, dir } = useLanguage();
  const [emblaRef, emblaApi] = useEmblaCarousel({ direction: dir });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on("select", () => {
        setSelectedIndex(emblaApi.selectedScrollSnap());
      });
    }
  }, [emblaApi]);

  // Chunk animals into groups of 12 for pagination
  const chunkSize = 12;
  const chunks = [];
  for (let i = 0; i < animals.length; i += chunkSize) {
    chunks.push(animals.slice(i, i + chunkSize));
  }

  return (
    <div className="min-h-screen bg-background text-white pb-20 relative overflow-hidden">
      
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between p-6 z-10 relative">
        <Link href="/intro">
          <button className={`p-2 rounded-full hover:bg-white/10 transition-colors ${dir === 'rtl' ? 'rotate-180' : ''}`}>
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
        </Link>
        {/* <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <Share2 className="h-5 w-5 text-white" />
        </button> */}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 mb-8 z-10 relative"
      >
        <h1 className="font-serif text-2xl font-bold uppercase tracking-wider text-white">
          {t("gallery.title")}
        </h1>
      </motion.div>

      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef} dir={dir}>
        <div className="flex touch-pan-y">
          {chunks.map((chunk, pageIndex) => (
            <div className="flex-[0_0_100%] min-w-0 pl-6 pr-6 relative" key={pageIndex}>
              <div className="grid grid-cols-3 gap-y-8 gap-x-4">
                {chunk.map((animal) => (
                  <Link href={`/animal/${animal.id}`} key={animal.id}>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: true }}
                      className="flex flex-col items-center gap-3 text-center cursor-pointer group"
                    >
                      <div className="relative w-full aspect-square rounded-full overflow-hidden border-2 border-white/10 shadow-lg group-hover:border-primary/50 transition-colors">
                        <img 
                          src={animal.image} 
                          alt={t(`animals.${animal.id}`)}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-[10px] font-sans font-medium uppercase tracking-widest leading-tight text-white/80 h-8 flex items-center justify-center group-hover:text-primary transition-colors">
                        {t(`animals.${animal.id}`)}
                      </span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-3 mt-12">
        {chunks.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi && emblaApi.scrollTo(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === selectedIndex ? "bg-white scale-110" : "bg-white/20"
            }`}
            aria-label={`Go to page ${index + 1}`}
          />
        ))}
      </div>

    </div>
  );
}
