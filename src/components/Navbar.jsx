import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { TreePine, Home, Users, Clock, LogOut, Menu, X } from 'lucide-react'

const navItems = [
  { path: '/home',        label: 'Trang chủ',  Icon: Home },
  { path: '/family-tree', label: 'Cây gia phả', Icon: TreePine },
  { path: '/timeline',    label: 'Ký ức',       Icon: Clock },
]

export default function Navbar() {
  const { user, logout } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <TreePine className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-brand-800 text-lg leading-none">Legacy</span>
            <span className="font-bold text-brand-400 text-lg leading-none">AI</span>
          </div>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ path, label, Icon }) => {
            const active = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-stone-500 hover:text-brand-700 hover:bg-brand-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-300 to-brand-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-stone-700">{user.name}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="btn-ghost text-stone-400 hover:text-red-500 p-2"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-brand-50 text-stone-500"
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-amber-100 px-4 py-3 flex flex-col gap-1 animate-fade-in">
          {navItems.map(({ path, label, Icon }) => {
            const active = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => { navigate(path); setMobileOpen(false) }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? 'bg-brand-50 text-brand-700' : 'text-stone-600 hover:bg-brand-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            )
          })}
        </div>
      )}
    </header>
  )
}
