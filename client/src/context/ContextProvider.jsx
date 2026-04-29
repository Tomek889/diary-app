import { useEffect, useState } from "react";
import { AuthContext } from "./useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function ContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/whoami`, {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    (async () => {
      setLoadingUser(true);
      await refreshUser();
      setLoadingUser(false);
    })();
  }, []);

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        refreshUser,
        loadingUser,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
