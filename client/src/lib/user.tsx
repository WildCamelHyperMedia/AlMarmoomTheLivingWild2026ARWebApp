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

const SESSION_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
    const loginTime = localStorage.getItem("loginTime");
    
    // Check if session has expired (6 hours)
    if (loginTime) {
      const elapsed = Date.now() - parseInt(loginTime);
      if (elapsed > SESSION_DURATION) {
        localStorage.removeItem("userId");
        localStorage.removeItem("loginTime");
        setIsLoading(false);
        return;
      }
    }
    
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
          localStorage.removeItem("loginTime");
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  // Check session expiry periodically
  useEffect(() => {
    const checkSession = () => {
      const loginTime = localStorage.getItem("loginTime");
      if (loginTime) {
        const elapsed = Date.now() - parseInt(loginTime);
        if (elapsed > SESSION_DURATION) {
          logout();
        }
      }
    };

    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const setUser = (user: SafeUser | null) => {
    setUserState(user);
    if (user) {
      localStorage.setItem("userId", user.id);
      localStorage.setItem("loginTime", Date.now().toString());
    } else {
      localStorage.removeItem("userId");
      localStorage.removeItem("loginTime");
    }
  };

  const logout = () => {
    setUserState(null);
    localStorage.removeItem("userId");
    localStorage.removeItem("loginTime");
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
