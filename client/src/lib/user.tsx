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
  token: string | null;
  setUser: (user: SafeUser | null, token?: string, expiresAt?: string) => void;
  logout: () => void;
  isLoading: boolean;
  getAuthHeaders: () => { Authorization?: string; "Content-Type": string };
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<SafeUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    const expiresAt = localStorage.getItem("expiresAt");
    
    if (expiresAt && new Date(expiresAt) < new Date()) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("expiresAt");
      setIsLoading(false);
      return;
    }
    
    if (savedToken) {
      fetch("/api/auth/validate", {
        headers: {
          "Authorization": `Bearer ${savedToken}`
        }
      })
        .then(res => {
          if (!res.ok) throw new Error("Invalid session");
          return res.json();
        })
        .then(data => {
          if (data.valid) {
            setUserState(data.user);
            setToken(savedToken);
            localStorage.setItem("expiresAt", data.expiresAt);
          } else {
            localStorage.removeItem("authToken");
            localStorage.removeItem("expiresAt");
          }
          setIsLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("authToken");
          localStorage.removeItem("expiresAt");
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkSession = () => {
      const expiresAt = localStorage.getItem("expiresAt");
      if (expiresAt && new Date(expiresAt) < new Date()) {
        logout();
      }
    };

    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, []);

  const setUser = (newUser: SafeUser | null, newToken?: string, expiresAt?: string) => {
    setUserState(newUser);
    if (newUser && newToken) {
      setToken(newToken);
      localStorage.setItem("authToken", newToken);
      if (expiresAt) {
        localStorage.setItem("expiresAt", expiresAt);
      }
    } else if (!newUser) {
      setToken(null);
      localStorage.removeItem("authToken");
      localStorage.removeItem("expiresAt");
    }
  };

  const logout = async () => {
    const savedToken = localStorage.getItem("authToken");
    if (savedToken) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${savedToken}`
          }
        });
      } catch (e) {
      }
    }
    setUserState(null);
    setToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("expiresAt");
  };

  const getAuthHeaders = () => {
    const headers: { Authorization?: string; "Content-Type": string } = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  };

  return (
    <UserContext.Provider value={{ user, token, setUser, logout, isLoading, getAuthHeaders }}>
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
