import { useState, useEffect } from 'react'

export default function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('access_token'))

  useEffect(() => {
    if (token) localStorage.setItem('access_token', token)
    else localStorage.removeItem('access_token')
  }, [token])

  const login = (accessToken) => setToken(accessToken)
  const logout = () => {
    setToken(null)
    // window.location.href = '/login'
  }

  return { token, login, logout }
}