import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SafeUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  createdAt: Date;
}

interface UserContextType {
  user: SafeUser | null;
  setUser: (user: SafeUser | null) => void;
  logout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
    
    if (savedUserId) {
      fetch(`/api/auth/user/${savedUserId}`)
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
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const setUser = (user: SafeUser | null) => {
    setUserState(user);
    if (user) {
      localStorage.setItem("userId", user.id);
    } else {
      localStorage.removeItem("userId");
    }
  };

  const logout = () => {
    setUserState(null);
    localStorage.removeItem("userId");
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, isLoading }}>
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
