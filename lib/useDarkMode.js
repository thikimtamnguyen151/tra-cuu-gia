'use client'
import { useState, useEffect } from 'react'

export function useDarkMode() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(localStorage.getItem('darkMode') === 'true')
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('darkMode', String(next))
    document.documentElement.classList.toggle('dark', next)
  }

  return { dark, toggle }
}
