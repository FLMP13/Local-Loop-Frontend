// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios' // Import axios for making HTTP requests

export const AuthContext = createContext()

// AuthProvider component to manage authentication state and provide login/logout functionality by getting/setting token and user data in localStorage
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser]   = useState(() => {
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u) : null
  })

  // Set axios default header if token exists
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // Function to log in a user by storing token and user data in localStorage and updating state
  const login = ({ token, user }) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  // Function to log out a user by removing token and user data from localStorage and updating state
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  // Function to update user data (e.g., after premium upgrade)
  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}