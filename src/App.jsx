import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import FamilyTreePage from './pages/FamilyTreePage'
import MemberProfilePage from './pages/MemberProfilePage'
import MemoryTimelinePage from './pages/MemoryTimelinePage'

function ProtectedRoute({ children }) {
  const { user } = useApp()
  if (!user) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { user } = useApp()
  return (
    <Routes>
      <Route path="/"             element={user ? <Navigate to="/home" /> : <LoginPage />} />
      <Route path="/home"         element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/family-tree"  element={<ProtectedRoute><FamilyTreePage /></ProtectedRoute>} />
      <Route path="/member/:id"   element={<ProtectedRoute><MemberProfilePage /></ProtectedRoute>} />
      <Route path="/timeline"     element={<ProtectedRoute><MemoryTimelinePage /></ProtectedRoute>} />
      <Route path="*"             element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}
