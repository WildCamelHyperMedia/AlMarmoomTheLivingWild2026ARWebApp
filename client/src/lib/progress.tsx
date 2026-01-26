import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { animals } from "./data";
import { useUser } from "./user";

interface ProgressContextType {
  unlockedAnimals: string[];
  watchedCount: number;
  unlockNext: (currentId: string) => void;
  isUnlocked: (id: string) => boolean;
  isLoading: boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: userLoading, getAuthHeaders } = useUser();
  const [unlockedAnimals, setUnlockedAnimals] = useState<string[]>(["little_grebe"]);
  const [watchedCount, setWatchedCount] = useState<number>(0);
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
          setUnlockedAnimals(data.progress.unlockedAnimals || [animals[0].id]);
          setWatchedCount(data.progress.unlockedAnimals?.length - 1 || 0);
          setIsLoading(false);
        })
        .catch(() => {
          setUnlockedAnimals(["little_grebe"]);
          setWatchedCount(0);
          setIsLoading(false);
        });
    } else {
      const saved = localStorage.getItem("unlockedAnimals");
      const savedCount = localStorage.getItem("watchedCount");
      setUnlockedAnimals(saved ? JSON.parse(saved) : ["little_grebe"]);
      setWatchedCount(savedCount ? parseInt(savedCount) : 0);
      setIsLoading(false);
    }
  }, [user, userLoading]);

  const unlockNext = async (currentId: string) => {
    const currentIndex = animals.findIndex(a => a.id === currentId);
    if (currentIndex === -1) return;

    if (currentIndex < animals.length - 1) {
      const nextAnimal = animals[currentIndex + 1];
      if (!unlockedAnimals.includes(nextAnimal.id)) {
        const newUnlocked = [...unlockedAnimals, nextAnimal.id];
        const newWatchedCount = newUnlocked.length - 1;
        
        setUnlockedAnimals(newUnlocked);
        setWatchedCount(newWatchedCount);

        if (user) {
          try {
            await fetch(`/api/progress/${user.id}`, {
              method: "PATCH",
              headers: getAuthHeaders(),
              body: JSON.stringify({ unlockedAnimals: newUnlocked })
            });
          } catch (error) {
            console.error("Failed to sync progress:", error);
          }
        } else {
          localStorage.setItem("unlockedAnimals", JSON.stringify(newUnlocked));
          localStorage.setItem("watchedCount", newWatchedCount.toString());
        }
      }
    }
  };

  const isUnlocked = (id: string) => {
    return unlockedAnimals.includes(id);
  };

  return (
    <ProgressContext.Provider value={{ unlockedAnimals, watchedCount, unlockNext, isUnlocked, isLoading }}>
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
