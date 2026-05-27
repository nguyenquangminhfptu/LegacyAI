import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import MemoryCard from '../components/MemoryCard'
import { Clock, Filter, Search, ChevronDown } from 'lucide-react'

const TYPE_FILTERS = [
  { value: 'all',       label: 'Tất cả',        emoji: '🗂️' },
  { value: 'story',     label: 'Câu chuyện',    emoji: '📖' },
  { value: 'milestone', label: 'Cột mốc',       emoji: '⭐' },
  { value: 'photo',     label: 'Hình ảnh',      emoji: '📷' },
  { value: 'recipe',    label: 'Ẩm thực',       emoji: '🍜' },
]

export default function MemoryTimelinePage() {
  const { memories, members } = useApp()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [memberFilter, setMemberFilter] = useState('all')

  const filtered = memories.filter(mem => {
    const matchType = filter === 'all' || mem.type === filter
    const matchMember = memberFilter === 'all' || mem.memberId === parseInt(memberFilter)
    const matchSearch = !search ||
      mem.title.toLowerCase().includes(search.toLowerCase()) ||
      mem.content.toLowerCase().includes(search.toLowerCase()) ||
      mem.memberName.toLowerCase().includes(search.toLowerCase())
    return matchType && matchMember && matchSearch
  })

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-brand-900 flex items-center gap-3">
            <Clock className="w-8 h-8 text-brand-500" />
            Dòng thời gian ký ức
          </h1>
          <p className="text-stone-400 mt-1 text-sm">{memories.length} ký ức từ {members.length} thành viên</p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm ký ức..."
            className="input-field pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {TYPE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition ${
                filter === f.value
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-stone-500 border border-amber-100 hover:border-brand-200'
              }`}
            >
              <span>{f.emoji}</span>
              {f.label}
            </button>
          ))}
        </div>

        {/* Member filter */}
        <div className="relative mb-6">
          <select
            value={memberFilter}
            onChange={e => setMemberFilter(e.target.value)}
            className="input-field appearance-none pr-9"
          >
            <option value="all">Tất cả thành viên</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        </div>

        {/* Timeline feed */}
        {filtered.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-stone-500 font-medium">Không tìm thấy ký ức nào</p>
            <p className="text-sm text-stone-400 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-200 via-brand-100 to-transparent ml-5 -z-0" />

            <div className="space-y-6 pl-14 relative">
              {filtered.map((mem, i) => (
                <div key={mem.id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-14 top-4 w-10 h-10 bg-white border-2 border-brand-200 rounded-xl flex items-center justify-center shadow-sm text-lg">
                    {mem.emoji || '📖'}
                  </div>
                  {/* Year label */}
                  {(i === 0 || new Date(mem.date).getFullYear() !== new Date(filtered[i - 1].date).getFullYear()) && (
                    <div className="absolute -left-14 -top-6 w-10 text-center">
                      <span className="text-xs font-bold text-brand-400">
                        {new Date(mem.date).getFullYear()}
                      </span>
                    </div>
                  )}
                  <MemoryCard memory={mem} showMember />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-10 pb-8">
          <p className="text-stone-300 text-xs">🌳 Ký ức gia tộc · LegacyAI</p>
        </div>
      </main>
    </div>
  )
}
