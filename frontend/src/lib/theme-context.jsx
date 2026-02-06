import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("wellness-journal-theme");
    // Only allow 'dark' or 'light', default to 'light'
    if (stored === "dark" || stored === "light") {
      return stored;
    }
    // Default to light if no stored preference
    return "light";
  });

  useEffect(() => {
    localStorage.setItem("wellness-journal-theme", theme);

    const root = document.documentElement;
    // Remove all theme classes
    root.classList.remove("light", "dark", "soft", "system");

    // Only apply dark or light
    if (theme === "dark" || theme === "light") {
      root.classList.add(theme);
    } else {
      // Fallback to dark
      root.classList.add("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, resolvedTheme: theme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
