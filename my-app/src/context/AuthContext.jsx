// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  // initialize from localStorage so state survives refresh
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const login = ({ token, user }) => {
    localStorage.setItem('token', token)                              // store token
    localStorage.setItem('user', JSON.stringify(user))               // store user
    setUser(user)                                                   // update context
  }

  const logout = () => {
    localStorage.removeItem('token')                                // clear token
    localStorage.removeItem('user')                                 // clear user
    setUser(null)                                                   // reset context
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
