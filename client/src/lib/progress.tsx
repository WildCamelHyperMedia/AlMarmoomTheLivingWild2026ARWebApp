import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useUser } from "./user";
import { animals } from "./data";

const TOTAL_ANIMALS = animals.length; // 24 animals

// Safe localStorage wrapper for Safari private browsing
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Safari private browsing or storage full - fail silently
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Fail silently
    }
  }
};

interface ProgressContextType {
  watchedVideos: string[];
  unlockedAnimals: string[];
  points: number;
  recordVideoWatch: (animalId: string) => Promise<boolean>;
  hasWatched: (animalId: string) => boolean;
  isUnlocked: (animalId: string) => boolean;
  refreshProgress: () => Promise<void>;
  isLoading: boolean;
  isCollectionComplete: boolean;
  unlockedCount: number;
  totalAnimals: number;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const POINTS_PER_VIDEO = 1;

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: userLoading, getAuthHeaders } = useUser();
  const [watchedVideos, setWatchedVideos] = useState<string[]>([]);
  const [unlockedAnimals, setUnlockedAnimals] = useState<string[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      try {
        const saved = safeLocalStorage.getItem("watchedVideos");
        const videos = saved ? JSON.parse(saved) : [];
        setWatchedVideos(Array.isArray(videos) ? videos : []);
        setPoints(Array.isArray(videos) ? videos.length * POINTS_PER_VIDEO : 0);
        const savedUnlocked = safeLocalStorage.getItem("unlockedAnimals");
        setUnlockedAnimals(savedUnlocked ? JSON.parse(savedUnlocked) : []);
      } catch {
        setWatchedVideos([]);
        setUnlockedAnimals([]);
        setPoints(0);
      }
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/progress/${user.id}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error("Progress not found");
      const data = await res.json();
      const videos = data.progress.watchedVideos || [];
      const unlocked = data.progress.unlockedAnimals || [];
      setWatchedVideos(videos);
      setUnlockedAnimals(unlocked);
      setPoints(videos.length * POINTS_PER_VIDEO);
    } catch {
      setWatchedVideos([]);
      setUnlockedAnimals([]);
      setPoints(0);
    }
    setIsLoading(false);
  }, [user, getAuthHeaders]);

  useEffect(() => {
    if (userLoading) return;
    fetchProgress();
  }, [user, userLoading, fetchProgress]);

  const refreshProgress = async () => {
    await fetchProgress();
  };

  const recordVideoWatch = async (animalId: string): Promise<boolean> => {
    if (watchedVideos.includes(animalId)) {
      return false;
    }

    const newWatched = [...watchedVideos, animalId];
    const newPoints = points + POINTS_PER_VIDEO;
    
    setWatchedVideos(newWatched);
    setPoints(newPoints);

    if (user) {
      try {
        await fetch(`/api/progress/${user.id}`, {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ 
            watchedVideos: newWatched,
            points: newPoints
          })
        });
      } catch (error) {
        console.error("Failed to sync progress:", error);
      }
    } else {
      safeLocalStorage.setItem("watchedVideos", JSON.stringify(newWatched));
      safeLocalStorage.setItem("points", newPoints.toString());
    }
    
    return true;
  };

  const hasWatched = (animalId: string) => {
    return watchedVideos.includes(animalId);
  };

  const isUnlocked = (animalId: string) => {
    return unlockedAnimals.includes(animalId);
  };

  const isCollectionComplete = unlockedAnimals.length >= TOTAL_ANIMALS;
  const unlockedCount = unlockedAnimals.length;

  return (
    <ProgressContext.Provider value={{ 
      watchedVideos, 
      unlockedAnimals, 
      points, 
      recordVideoWatch, 
      hasWatched, 
      isUnlocked, 
      refreshProgress, 
      isLoading,
      isCollectionComplete,
      unlockedCount,
      totalAnimals: TOTAL_ANIMALS
    }}>
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
