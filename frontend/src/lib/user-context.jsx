import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext(undefined);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedEmail = localStorage.getItem("userEmail");
    const token = localStorage.getItem("authToken");

    // Clean up legacy placeholder tokens that cause 403/invalid token errors
    if (token === "logged-in") {
      localStorage.removeItem("authToken");
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user:", e);
      }
    } else if (token && storedEmail) {
      // Fallback user shape so UI can render while profile loads
      setUser({ email: storedEmail, name: storedEmail.split("@")[0] });
    }

    setIsLoading(false);
  }, []);

  const updateUser = (updates) => {
    const updated = user ? { ...user, ...updates } : updates;
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
  };

  const deleteAccount = () => {
    setUser(null);
    localStorage.clear();
  };

  // Check if user is authenticated based on presence of user object and valid token
  const isAuthenticated = !!user && !!localStorage.getItem("authToken");

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        updateUser,
        logout,
        deleteAccount,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
