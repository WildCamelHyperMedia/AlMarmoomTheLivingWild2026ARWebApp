import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User } from "@shared/schema";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
    const savedPhone = localStorage.getItem("userPhone");
    
    if (savedUserId && savedPhone) {
      fetch(`/api/users/by-phone/${encodeURIComponent(savedPhone)}`)
        .then(res => {
          if (!res.ok) throw new Error("User not found");
          return res.json();
        })
        .then(data => {
          setUserState(data.user);
          setIsLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("userId");
          localStorage.removeItem("userPhone");
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const setUser = (user: User | null) => {
    setUserState(user);
    if (user) {
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userPhone", user.phone);
    } else {
      localStorage.removeItem("userId");
      localStorage.removeItem("userPhone");
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
