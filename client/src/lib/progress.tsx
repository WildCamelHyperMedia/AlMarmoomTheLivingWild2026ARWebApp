import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser } from "./user";

interface ProgressContextType {
  watchedVideos: string[];
  points: number;
  recordVideoWatch: (animalId: string) => Promise<boolean>;
  hasWatched: (animalId: string) => boolean;
  isLoading: boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const POINTS_PER_VIDEO = 10;

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: userLoading, getAuthHeaders } = useUser();
  const [watchedVideos, setWatchedVideos] = useState<string[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;
    
    if (user) {
      fetch(`/api/progress/${user.id}`, {
        headers: getAuthHeaders()
      })
        .then(res => {
          if (!res.ok) throw new Error("Progress not found");
          return res.json();
        })
        .then(data => {
          const videos = data.progress.watchedVideos || [];
          setWatchedVideos(videos);
          // Derive points from watchedVideos for consistency
          setPoints(videos.length * POINTS_PER_VIDEO);
          setIsLoading(false);
        })
        .catch(() => {
          setWatchedVideos([]);
          setPoints(0);
          setIsLoading(false);
        });
    } else {
      try {
        const saved = localStorage.getItem("watchedVideos");
        const videos = saved ? JSON.parse(saved) : [];
        setWatchedVideos(Array.isArray(videos) ? videos : []);
        // Derive points from watchedVideos for consistency
        setPoints(Array.isArray(videos) ? videos.length * POINTS_PER_VIDEO : 0);
      } catch {
        setWatchedVideos([]);
        setPoints(0);
      }
      setIsLoading(false);
    }
  }, [user, userLoading]);

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
      localStorage.setItem("watchedVideos", JSON.stringify(newWatched));
      localStorage.setItem("points", newPoints.toString());
    }
    
    return true;
  };

  const hasWatched = (animalId: string) => {
    return watchedVideos.includes(animalId);
  };

  return (
    <ProgressContext.Provider value={{ watchedVideos, points, recordVideoWatch, hasWatched, isLoading }}>
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
