import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import MemoryCard from '../components/MemoryCard'
import AddMemoryModal from '../components/AddMemoryModal'
import { ArrowLeft, MapPin, Briefcase, Calendar, Heart, Plus, Image, Clock, BookOpen, Users } from 'lucide-react'
import { getRelationshipLabel } from '../utils/relationshipEngine'

const TABS = [
  { id: 'about',    label: 'Hồ sơ',    icon: BookOpen },
  { id: 'memories', label: 'Ký ức',    icon: Clock },
  { id: 'gallery',  label: 'Thư viện', icon: Image },
  { id: 'family',   label: 'Gia đình', icon: Users },
]

export default function MemberProfilePage() {
  const { id } = useParams()
  const { getMemberById, members, getMemoriesForMember } = useApp()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('about')
  const [showAddMemory, setShowAddMemory] = useState(false)
  const [newMemorySuccess, setNewMemorySuccess] = useState(false)

  const member = getMemberById(id)

  if (!member) {
    return (
      <div className="min-h-screen bg-brand-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-brand-800">Không tìm thấy thành viên</h2>
            <button onClick={() => navigate('/family-tree')} className="btn-primary mt-4">
              Về cây gia phả
            </button>
          </div>
        </div>
      </div>
    )
  }

  const memberMemories = getMemoriesForMember(member.id)
  const parents = members.filter(m => member.parentIds.includes(m.id))
  const siblings = members.filter(m =>
    m.id !== member.id &&
    m.parentIds.some(pid => member.parentIds.includes(pid))
  )
  const children = members.filter(m => m.parentIds.includes(member.id))
  const spouse = member.spouseId ? members.find(m => m.id === member.spouseId) : null

  function handleMemoryAdded() {
    setShowAddMemory(false)
    setActiveTab('memories')
    setNewMemorySuccess(true)
    setTimeout(() => setNewMemorySuccess(false), 3000)
  }

  const age = member.deathYear
    ? `${member.birthYear} – ${member.deathYear}`
    : `${new Date().getFullYear() - member.birthYear} tuổi`

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-6 animate-fade-in">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-stone-400 hover:text-brand-600 mb-5 transition font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        {/* Hero card */}
        <div className="card overflow-hidden mb-5">
          {/* Gradient header */}
          <div className="h-28 bg-gradient-to-br from-brand-600 to-brand-800 relative overflow-hidden -mx-5 -mt-5 mb-0">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
            <div className="absolute -bottom-6 left-1/4 w-24 h-24 bg-amber-400/10 rounded-full" />
          </div>

          {/* Avatar */}
          <div className="flex items-end gap-4 -mt-10 px-1 mb-4">
            <div className="relative">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-24 h-24 rounded-3xl border-4 border-white shadow-lg object-cover"
              />
              <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-3 border-white flex items-center justify-center text-sm font-bold shadow-sm ${
                member.gender === 'male' ? 'bg-blue-400 text-white' : 'bg-pink-400 text-white'
              }`}>
                {member.gender === 'male' ? '♂' : '♀'}
              </div>
            </div>
            <div className="pb-1">
              <span className="badge bg-brand-100 text-brand-700 mb-1">
                Đời {(member.generation ?? 0) + 1}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-brand-900">{member.name}</h1>
              <p className="text-brand-500 font-medium text-sm mt-0.5">{member.role}</p>
            </div>
            <button
              onClick={() => setShowAddMemory(true)}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm ký ức
            </button>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-amber-50">
            <div className="flex items-center gap-1.5 text-sm text-stone-500">
              <Calendar className="w-4 h-4 text-brand-400" />
              {age}
            </div>
            {member.hometown && (
              <div className="flex items-center gap-1.5 text-sm text-stone-500">
                <MapPin className="w-4 h-4 text-brand-400" />
                {member.hometown}
              </div>
            )}
            {member.occupation && (
              <div className="flex items-center gap-1.5 text-sm text-stone-500">
                <Briefcase className="w-4 h-4 text-brand-400" />
                {member.occupation}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm text-stone-500">
              <Heart className="w-4 h-4 text-red-400" />
              {memberMemories.length} ký ức
            </div>
          </div>
        </div>

        {/* Success toast */}
        {newMemorySuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in">
            ✅ Ký ức mới đã được lưu thành công!
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-amber-100 mb-5">
          {TABS.map(({ id: tid, label, icon: Icon }) => {
            const count = tid === 'memories' ? memberMemories.length
                        : tid === 'gallery'  ? (member.gallery?.length || 0)
                        : tid === 'family'   ? (parents.length + siblings.length + children.length + (spouse ? 1 : 0))
                        : null
            return (
              <button
                key={tid}
                onClick={() => setActiveTab(tid)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tid
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-brand-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
                {count !== null && count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tid ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="animate-fade-in">
          {/* ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              {member.bio && (
                <div className="card">
                  <h3 className="font-bold text-brand-800 mb-2">Giới thiệu</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{member.bio}</p>
                </div>
              )}
              {member.story && (
                <div className="card">
                  <h3 className="font-bold text-brand-800 mb-3">📖 Câu chuyện cuộc đời</h3>
                  <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">{member.story}</p>
                </div>
              )}
              <div className="card">
                <h3 className="font-bold text-brand-800 mb-3">Thông tin cơ bản</h3>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  {[
                    { label: 'Năm sinh', value: member.birthYear },
                    { label: 'Giới tính', value: member.gender === 'male' ? 'Nam' : 'Nữ' },
                    { label: 'Quê quán', value: member.hometown || '–' },
                    { label: 'Nghề nghiệp', value: member.occupation || '–' },
                    { label: 'Vai trò', value: member.role },
                    { label: 'Thế hệ', value: `Đời ${(member.generation ?? 0) + 1}` },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-stone-400 text-xs mb-0.5">{label}</p>
                      <p className="font-semibold text-brand-800">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MEMORIES */}
          {activeTab === 'memories' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-stone-400">
                  {memberMemories.length} ký ức được lưu giữ
                </p>
                <button
                  onClick={() => setShowAddMemory(true)}
                  className="btn-primary text-sm py-2 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm ký ức
                </button>
              </div>

              {memberMemories.length === 0 ? (
                <div className="card text-center py-12">
                  <div className="text-5xl mb-4">📝</div>
                  <p className="text-stone-500 font-medium mb-1">Chưa có ký ức nào</p>
                  <p className="text-sm text-stone-400 mb-5">
                    Hãy là người đầu tiên lưu giữ câu chuyện của {member.name}
                  </p>
                  <button
                    onClick={() => setShowAddMemory(true)}
                    className="btn-primary"
                  >
                    ✨ Tạo ký ức đầu tiên
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {memberMemories.map(mem => (
                    <MemoryCard key={mem.id} memory={mem} showMember={false} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* GALLERY */}
          {activeTab === 'gallery' && (
            <div>
              {(!member.gallery || member.gallery.length === 0) ? (
                <div className="card text-center py-12">
                  <div className="text-5xl mb-4">🖼️</div>
                  <p className="text-stone-500 font-medium">Chưa có ảnh nào</p>
                  <p className="text-sm text-stone-400 mt-1">Thêm ký ức có ảnh để gallery tự động cập nhật</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {member.gallery.map((url, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden aspect-square bg-amber-50 shadow-sm">
                      <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FAMILY */}
          {activeTab === 'family' && (
            <div className="space-y-4">
              {/* Parents */}
              {parents.length > 0 && (
                <div className="card">
                  <h3 className="font-bold text-brand-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">👨‍👩‍👧</span> Cha/Mẹ
                  </h3>
                  <div className="space-y-3">
                    {parents.map(p => (
                      <FamilyRelativeRow key={p.id} member={p} label={p.gender === 'male' ? 'Cha' : 'Mẹ'} navigate={navigate} />
                    ))}
                  </div>
                </div>
              )}

              {/* Spouse */}
              {spouse && (
                <div className="card">
                  <h3 className="font-bold text-brand-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">💑</span> Vợ/Chồng
                  </h3>
                  <FamilyRelativeRow member={spouse} label={spouse.gender === 'male' ? 'Chồng' : 'Vợ'} navigate={navigate} />
                </div>
              )}

              {/* Siblings */}
              {siblings.length > 0 && (
                <div className="card">
                  <h3 className="font-bold text-brand-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">👫</span> Anh/Chị/Em
                  </h3>
                  <div className="space-y-3">
                    {siblings.map(s => (
                      <FamilyRelativeRow
                        key={s.id}
                        member={s}
                        label={s.gender === 'male'
                          ? (s.birthYear < member.birthYear ? 'Anh trai' : 'Em trai')
                          : (s.birthYear < member.birthYear ? 'Chị gái' : 'Em gái')
                        }
                        navigate={navigate}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Children */}
              {children.length > 0 && (
                <div className="card">
                  <h3 className="font-bold text-brand-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">👶</span> Con cái
                  </h3>
                  <div className="space-y-3">
                    {children.map(c => (
                      <FamilyRelativeRow
                        key={c.id}
                        member={c}
                        label={c.gender === 'male' ? 'Con trai' : 'Con gái'}
                        navigate={navigate}
                      />
                    ))}
                  </div>
                </div>
              )}

              {parents.length === 0 && siblings.length === 0 && children.length === 0 && !spouse && (
                <div className="card text-center py-12">
                  <div className="text-5xl mb-4">🌱</div>
                  <p className="text-stone-500">Chưa có kết nối gia đình</p>
                  <p className="text-sm text-stone-400 mt-1">
                    Thêm thành viên mới và chỉ định mối quan hệ để kết nối
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {showAddMemory && (
        <AddMemoryModal
          member={member}
          onClose={() => setShowAddMemory(false)}
          onAdded={handleMemoryAdded}
        />
      )}
    </div>
  )
}

function FamilyRelativeRow({ member, label, navigate }) {
  return (
    <button
      onClick={() => navigate(`/member/${member.id}`)}
      className="flex items-center gap-3 w-full hover:bg-brand-50 rounded-xl p-2 transition group text-left"
    >
      <img src={member.avatar} alt={member.name} className="w-11 h-11 rounded-xl border border-amber-100" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-brand-800 text-sm">{member.name}</p>
        <p className="text-xs text-stone-400">{member.birthYear} · {member.occupation || member.role}</p>
      </div>
      <span className="badge bg-brand-50 text-brand-600 flex-shrink-0 group-hover:bg-brand-100 transition">
        {label}
      </span>
    </button>
  )
}
