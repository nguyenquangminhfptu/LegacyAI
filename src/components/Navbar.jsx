import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import {
  TreePine,
  Home,
  Users,
  Clock,
  Calendar,
  Bell,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { path: '/home', label: 'Trang chủ', Icon: Home },
  { path: '/family-tree', label: 'Cây gia phả', Icon: TreePine },
  { path: '/timeline', label: 'Ký ức', Icon: Clock },
  { path: '/calendar', label: 'Lịch', Icon: Calendar },
]

export default function Navbar() {
  const { user, logout } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  function getNotificationMessage(date) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const eventDate = new Date(date)
    eventDate.setHours(0, 0, 0, 0)

    const diffDays = Math.ceil(
      (eventDate - today) / (1000 * 60 * 60 * 24)
    )

    if (diffDays < 0 || diffDays > 7) return null
    if (diffDays === 0) return 'Hôm nay'
    if (diffDays === 1) return 'Ngày mai'
    return `Còn ${diffDays} ngày nữa`
  }

  function loadNotifications() {
    const savedEvents = localStorage.getItem('legacy_calendar_events')
    const events = savedEvents ? JSON.parse(savedEvents) : []

    const upcoming = events
      .map((event) => {
        const message = getNotificationMessage(event.date)
        if (!message) return null

        return {
          id: event.id,
          title: event.title,
          message,
          date: event.date,
        }
      })
      .filter(Boolean)

    setNotifications(upcoming)
  }

  useEffect(() => {
    loadNotifications()

    window.addEventListener('legacy-events-updated', loadNotifications)

    return () => {
      window.removeEventListener('legacy-events-updated', loadNotifications)
    }
  }, [])

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <TreePine className="w-5 h-5 text-white" />
          </div>

          <div className="hidden sm:block">
            <span className="font-bold text-brand-800 text-lg">
              Legacy
            </span>
            <span className="font-bold text-brand-400 text-lg">
              AI
            </span>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ path, label, Icon }) => {
            const active = location.pathname === path

            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
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

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-2 rounded-xl hover:bg-brand-50 transition"
              title="Thông báo"
            >
              <Bell className="w-5 h-5 text-stone-600" />

              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {notifications.length}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-amber-100 z-50 overflow-hidden">
                <div className="p-4 border-b border-amber-100">
                  <h3 className="font-bold text-brand-800">
                    🔔 Thông báo
                  </h3>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-sm text-stone-500">
                      Không có sự kiện nào trong 7 ngày tới.
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 border-b border-amber-50 hover:bg-amber-50"
                      >
                        <p className="font-semibold text-stone-800">
                          {item.title}
                        </p>

                        <p className="text-sm text-brand-700 mt-1">
                          {item.message}
                        </p>

                        <p className="text-xs text-stone-400 mt-1">
                          {item.date}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <button className="w-full p-3 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                  Cài đặt thông báo
                </button>
              </div>
            )}
          </div>

          {user && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-300 to-brand-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <span className="text-sm font-medium text-stone-700">
                {user.name}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="btn-ghost text-stone-400 hover:text-red-500 p-2"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-brand-50 text-stone-500"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-amber-100 px-4 py-3 flex flex-col gap-1">
          {navItems.map(({ path, label, Icon }) => {
            const active = location.pathname === path

            return (
              <button
                key={path}
                onClick={() => {
                  navigate(path)
                  setMobileOpen(false)
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-stone-600 hover:bg-brand-50'
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