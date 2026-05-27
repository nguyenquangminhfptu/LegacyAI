import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import MemoryCard from '../components/MemoryCard'
import { TreePine, Clock, Users, Heart, ChevronRight, Plus, Sparkles, BookOpen } from 'lucide-react'

export default function HomePage() {
  const { user, members, memories, stats } = useApp()
  const navigate = useNavigate()

  const recentMemories = memories.slice(0, 3)
  const currentMember = members.find(m => m.name.toLowerCase().includes('quang minh')) || members[6]

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        {/* Welcome banner */}
        <section className="relative bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-7 overflow-hidden shadow-xl">
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute -bottom-12 -left-4 w-32 h-32 bg-amber-400/10 rounded-full" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <p className="text-brand-200 text-sm font-medium mb-1">Chào mừng trở lại 👋</p>
              <h1 className="text-3xl font-bold text-white mb-2">{user?.name || 'Gia đình'}</h1>
              <p className="text-brand-200 text-sm leading-relaxed max-w-sm">
                Cây gia phả của bạn đang phát triển. Hôm nay hãy thêm một ký ức mới
                cho các thế hệ tương lai.
              </p>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => navigate('/family-tree')}
                  className="bg-white text-brand-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-50 transition shadow-sm text-sm flex items-center gap-2"
                >
                  <TreePine className="w-4 h-4" />
                  Xem cây gia phả
                </button>
                <button
                  onClick={() => navigate('/timeline')}
                  className="bg-white/15 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-white/25 transition text-sm flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Ký ức
                </button>
              </div>
            </div>
            <div className="hidden sm:block flex-shrink-0">
              <div className="w-20 h-20 bg-white/15 rounded-3xl flex items-center justify-center">
                <TreePine className="w-11 h-11 text-amber-300" />
              </div>
            </div>
          </div>
        </section>

        {/* Stats row */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Thành viên', value: stats.totalMembers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Ký ức', value: stats.totalMemories, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: 'Thế hệ', value: stats.generations, icon: TreePine, color: 'text-brand-600', bg: 'bg-brand-50' },
            { label: 'Còn sống', value: stats.livingMembers, icon: Heart, color: 'text-red-400', bg: 'bg-red-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card flex items-center gap-4">
              <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-900">{value}</p>
                <p className="text-xs text-stone-400 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Family overview – member cards */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-brand-900">Tổng quan gia đình</h2>
            <button
              onClick={() => navigate('/family-tree')}
              className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {members.slice(0, 4).map(member => (
              <button
                key={member.id}
                onClick={() => navigate(`/member/${member.id}`)}
                className="card hover:shadow-md transition-all hover:-translate-y-0.5 group text-center p-4"
              >
                <div className="relative mx-auto w-14 h-14 mb-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-14 h-14 rounded-2xl border-2 border-amber-100 group-hover:border-brand-300 transition object-cover"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-xs ${
                    member.gender === 'male' ? 'bg-blue-400' : 'bg-pink-400'
                  }`}>
                    {member.gender === 'male' ? '♂' : '♀'}
                  </div>
                </div>
                <p className="text-sm font-semibold text-brand-800 leading-tight line-clamp-2">{member.name}</p>
                <p className="text-xs text-stone-400 mt-1">{member.birthYear}</p>
                <p className="text-xs text-brand-500 font-medium mt-0.5 truncate">{member.role.split('–')[0].trim()}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Quick actions */}
        <section>
          <h2 className="text-xl font-bold text-brand-900 mb-4">Thao tác nhanh</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/family-tree')}
              className="card hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-4 text-left group"
            >
              <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-200 transition">
                <Plus className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <p className="font-semibold text-brand-800 text-sm">Thêm thành viên</p>
                <p className="text-xs text-stone-400">Bổ sung vào cây gia phả</p>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300 ml-auto" />
            </button>

            <button
              onClick={() => currentMember && navigate(`/member/${currentMember.id}`)}
              className="card hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-4 text-left group"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-brand-800 text-sm">Thêm ký ức</p>
                <p className="text-xs text-stone-400">Lưu câu chuyện, hình ảnh</p>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300 ml-auto" />
            </button>

            <button
              onClick={() => navigate('/family-tree')}
              className="card hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-4 text-left group"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-brand-800 text-sm">AI Gợi ý</p>
                <p className="text-xs text-stone-400">Phân tích quan hệ họ hàng</p>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300 ml-auto" />
            </button>
          </div>
        </section>

        {/* Recent memories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-brand-900">Ký ức gần đây</h2>
            <button
              onClick={() => navigate('/timeline')}
              className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {recentMemories.map(mem => (
              <MemoryCard key={mem.id} memory={mem} showMember />
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="text-center pb-8">
          <p className="text-stone-400 text-sm">
            🌳 LegacyAI – Giữ gìn ký ức, kết nối thế hệ
          </p>
        </div>
      </main>
    </div>
  )
}
