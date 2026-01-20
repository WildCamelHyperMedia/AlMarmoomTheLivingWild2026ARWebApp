import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { animals } from "./data";

interface ProgressContextType {
  unlockedAnimals: string[];
  watchedCount: number;
  unlockNext: (currentId: string) => void;
  isUnlocked: (id: string) => boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage or default to first animal
  const [unlockedAnimals, setUnlockedAnimals] = useState<string[]>(() => {
    const saved = localStorage.getItem("unlockedAnimals");
    return saved ? JSON.parse(saved) : [animals[0].id];
  });

  const [watchedCount, setWatchedCount] = useState<number>(() => {
    const saved = localStorage.getItem("watchedCount");
    return saved ? parseInt(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem("unlockedAnimals", JSON.stringify(unlockedAnimals));
  }, [unlockedAnimals]);

  useEffect(() => {
    localStorage.setItem("watchedCount", watchedCount.toString());
  }, [watchedCount]);

  const unlockNext = (currentId: string) => {
    const currentIndex = animals.findIndex(a => a.id === currentId);
    if (currentIndex === -1) return;

    // Increment watch count
    setWatchedCount(prev => prev + 1);

    // Unlock next animal if it exists
    if (currentIndex < animals.length - 1) {
      const nextAnimal = animals[currentIndex + 1];
      if (!unlockedAnimals.includes(nextAnimal.id)) {
        setUnlockedAnimals(prev => [...prev, nextAnimal.id]);
      }
    }
  };

  const isUnlocked = (id: string) => {
    return unlockedAnimals.includes(id);
  };

  return (
    <ProgressContext.Provider value={{ unlockedAnimals, watchedCount, unlockNext, isUnlocked }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
}
