'use client'
// components/Shell.js
import Sidebar from './Sidebar'

export default function Shell({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen p-8 animate-fade-in">
        {children}
      </main>
    </div>
  )
}
