import React, { createContext, useContext, useState } from 'react'
import { initialMembers, initialMemories } from '../data/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [members, setMembers] = useState(initialMembers)
  const [memories, setMemories] = useState(initialMemories)
  const [nextMemberId, setNextMemberId] = useState(initialMembers.length + 1)
  const [nextMemoryId, setNextMemoryId] = useState(initialMemories.length + 1)

  // ── Auth ─────────────────────────────────────────────────────────────
  function login(name, email) {
    setUser({ name, email })
  }
  function logout() {
    setUser(null)
  }

  // ── Members ──────────────────────────────────────────────────────────
  function addMember(memberData) {
    const newMember = {
      ...memberData,
      id: nextMemberId,
      gallery: [],
    }
    setMembers(prev => [...prev, newMember])
    setNextMemberId(n => n + 1)
    return newMember
  }

  function getMemberById(id) {
    return members.find(m => m.id === Number(id))
  }

  function updateMember(id, updates) {
    setMembers(prev => prev.map(m => m.id === Number(id) ? { ...m, ...updates } : m))
  }

  // ── Memories ─────────────────────────────────────────────────────────
  function addMemory(memoryData) {
    const newMemory = {
      ...memoryData,
      id: nextMemoryId,
      likes: 0,
    }
    setMemories(prev => [newMemory, ...prev])
    setNextMemoryId(n => n + 1)
    return newMemory
  }

  function getMemoriesForMember(memberId) {
    return memories.filter(m => m.memberId === Number(memberId))
  }

  function likeMemory(memoryId) {
    setMemories(prev =>
      prev.map(m => m.id === memoryId ? { ...m, likes: m.likes + 1 } : m)
    )
  }

  // ── Stats ────────────────────────────────────────────────────────────
  const stats = {
    totalMembers: members.length,
    totalMemories: memories.length,
    generations: Math.max(...members.map(m => (m.generation ?? 0))) + 1,
    livingMembers: members.filter(m => !m.deathYear).length,
  }

  return (
    <AppContext.Provider value={{
      user, login, logout,
      members, addMember, getMemberById, updateMember,
      memories, addMemory, getMemoriesForMember, likeMemory,
      stats,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
