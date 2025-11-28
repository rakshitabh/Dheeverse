"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface UserContextType {
  user: User | null
  updateUser: (updates: Partial<User>) => void
  logout: () => void
  deleteAccount: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const defaultUser: User = {
  id: "1",
  name: "Journal User",
  email: "user@example.com",
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(defaultUser)

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates })
    }
  }

  const logout = () => {
    setUser(null)
  }

  const deleteAccount = () => {
    // In production, this would call an API to delete all user data
    setUser(null)
    localStorage.clear()
  }

  return <UserContext.Provider value={{ user, updateUser, logout, deleteAccount }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
