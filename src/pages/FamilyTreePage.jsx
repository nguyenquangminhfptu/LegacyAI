import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import FamilyTree from '../components/FamilyTree'
import AddMemberModal from '../components/AddMemberModal'
import AIRelationshipModal from '../components/AIRelationshipModal'
import { Plus, Users, Sparkles, Info } from 'lucide-react'

export default function FamilyTreePage() {
  const { members, stats } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [newMember, setNewMember] = useState(null)
  const [showAI, setShowAI] = useState(false)
  const [showInfo, setShowInfo] = useState(true)

  function handleAdded(member) {
    setNewMember(member)
    setShowAdd(false)
    setShowAI(true)
  }

  function handleAIClose() {
    setShowAI(false)
    setNewMember(null)
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-900 flex items-center gap-3">
              🌳 Cây Gia Phả
            </h1>
            <p className="text-stone-400 mt-1 text-sm">
              {stats.totalMembers} thành viên · {stats.generations} thế hệ
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowInfo(s => !s)}
              className="btn-ghost p-2.5"
              title="Hướng dẫn"
            >
              <Info className="w-5 h-5 text-stone-400" />
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm thành viên
            </button>
          </div>
        </div>

        {/* Info banner */}
        {showInfo && (
          <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex gap-3 items-start animate-fade-in">
            <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-800 mb-1">LegacyAI – Cây gia phả thông minh</p>
              <p className="text-amber-700">
                <strong>Click vào thẻ thành viên</strong> để xem hồ sơ chi tiết.
                Khi <strong>thêm thành viên mới</strong>, AI sẽ tự động phân tích và gợi ý
                mối quan hệ họ hàng (ông/bà, cô/chú, anh/em...) dựa trên cây gia phả.
              </p>
            </div>
            <button onClick={() => setShowInfo(false)} className="text-amber-400 hover:text-amber-600 text-lg leading-none flex-shrink-0">×</button>
          </div>
        )}

        {/* Generation legend */}
        <div className="flex flex-wrap gap-3 mb-5">
          {[
            { gen: 0, label: 'Đời 1 – Ông Bà', color: 'bg-amber-100 text-amber-800 border-amber-200' },
            { gen: 1, label: 'Đời 2 – Cha Mẹ / Cô Chú', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { gen: 2, label: 'Đời 3 – Con Cháu', color: 'bg-green-50 text-green-700 border-green-200' },
          ].map(({ gen, label, color }) => {
            const count = members.filter(m => (m.generation ?? 0) === gen).length
            return (
              <div key={gen} className={`badge border ${color} px-3 py-1.5`}>
                {label} <span className="ml-1 font-bold">({count})</span>
              </div>
            )
          })}
        </div>

        {/* Tree */}
        <div className="card overflow-hidden p-6">
          <FamilyTree members={members} />
        </div>

        {/* Member list compact */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-brand-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-500" />
            Danh sách thành viên
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {members.map(m => (
              <div key={m.id} className="card flex items-center gap-4 hover:shadow-md transition cursor-pointer" onClick={() => window.location.href = `/member/${m.id}`}>
                <img src={m.avatar} alt={m.name} className="w-12 h-12 rounded-xl border border-amber-100 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-800 text-sm truncate">{m.name}</p>
                  <p className="text-xs text-stone-400">{m.birthYear} · {m.role}</p>
                </div>
                <div className="text-xs text-brand-400 font-medium flex-shrink-0">
                  Đời {(m.generation ?? 0) + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {showAdd && (
        <AddMemberModal
          onClose={() => setShowAdd(false)}
          onAdded={handleAdded}
        />
      )}

      {showAI && newMember && (
        <AIRelationshipModal
          newMember={newMember}
          onClose={handleAIClose}
        />
      )}
    </div>
  )
}
