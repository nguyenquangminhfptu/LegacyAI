import React, { useState } from 'react'
import { X, User, Calendar, Users, Link } from 'lucide-react'
import { useApp } from '../context/AppContext'

const AVATARS = [
  'https://api.dicebear.com/7.x/personas/svg?seed=A1&backgroundColor=b6e3f4,c0aede',
  'https://api.dicebear.com/7.x/personas/svg?seed=A2&backgroundColor=ffd5dc,ffdfbf',
  'https://api.dicebear.com/7.x/personas/svg?seed=A3&backgroundColor=d1f7c4,b6e3f4',
  'https://api.dicebear.com/7.x/personas/svg?seed=A4&backgroundColor=ffeab6,c0aede',
  'https://api.dicebear.com/7.x/personas/svg?seed=A5&backgroundColor=c0aede,ffd5dc',
  'https://api.dicebear.com/7.x/personas/svg?seed=A6&backgroundColor=b4c5e4,d1f7c4',
]

export default function AddMemberModal({ onClose, onAdded }) {
  const { members, addMember } = useApp()
  const [form, setForm] = useState({
    name: '',
    birthYear: '',
    gender: 'male',
    role: '',
    parentId: '',
    avatar: AVATARS[0],
    bio: '',
    hometown: '',
    occupation: '',
  })
  const [selectedAvatar, setSelectedAvatar] = useState(0)
  const [errors, setErrors] = useState({})

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Vui lòng nhập họ tên'
    if (!form.birthYear || isNaN(form.birthYear) || form.birthYear < 1800 || form.birthYear > 2026)
      errs.birthYear = 'Năm sinh không hợp lệ'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const parentIds = form.parentId ? [parseInt(form.parentId)] : []
    // Also add spouse of parent if exists
    if (form.parentId) {
      const parent = members.find(m => m.id === parseInt(form.parentId))
      if (parent?.spouseId) parentIds.push(parent.spouseId)
    }

    // Determine generation based on parent
    let generation = 0
    if (parentIds.length > 0) {
      const parent = members.find(m => m.id === parentIds[0])
      generation = parent ? (parent.generation ?? 0) + 1 : 0
    }

    const newMember = addMember({
      name: form.name.trim(),
      birthYear: parseInt(form.birthYear),
      gender: form.gender,
      role: form.role.trim() || (form.gender === 'male' ? 'Thành viên nam' : 'Thành viên nữ'),
      parentIds,
      spouseId: null,
      generation,
      avatar: form.avatar,
      bio: form.bio.trim(),
      hometown: form.hometown.trim(),
      occupation: form.occupation.trim(),
      story: '',
      deathYear: null,
    })

    onAdded(newMember)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-6 pt-6 pb-4 border-b border-amber-100 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold text-brand-800">Thêm thành viên</h2>
            <p className="text-sm text-stone-400 mt-0.5">Bổ sung thành viên mới vào cây gia phả</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-brand-50 rounded-xl transition">
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Avatar picker */}
          <div>
            <label className="text-sm font-semibold text-stone-600 mb-2 block">Chọn avatar</label>
            <div className="flex gap-2 flex-wrap">
              {AVATARS.map((av, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setSelectedAvatar(i); set('avatar', av) }}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition ${
                    selectedAvatar === i ? 'border-brand-500 shadow-md scale-105' : 'border-amber-100 hover:border-brand-300'
                  }`}
                >
                  <img src={av} alt="" className="w-full h-full" />
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-semibold text-stone-600 mb-1.5 block">
              <User className="inline w-3.5 h-3.5 mr-1 text-brand-400" />
              Họ và tên <span className="text-red-400">*</span>
            </label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="input-field"
              placeholder="VD: Nguyễn Văn Nam"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Birth year + Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-stone-600 mb-1.5 block">
                <Calendar className="inline w-3.5 h-3.5 mr-1 text-brand-400" />
                Năm sinh <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={form.birthYear}
                onChange={e => set('birthYear', e.target.value)}
                className="input-field"
                placeholder="VD: 1990"
                min="1800" max="2026"
              />
              {errors.birthYear && <p className="text-xs text-red-500 mt-1">{errors.birthYear}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-stone-600 mb-1.5 block">Giới tính</label>
              <select
                value={form.gender}
                onChange={e => set('gender', e.target.value)}
                className="input-field"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="text-sm font-semibold text-stone-600 mb-1.5 block">Vai trò / Xưng hô</label>
            <input
              value={form.role}
              onChange={e => set('role', e.target.value)}
              className="input-field"
              placeholder="VD: Con trai, Cháu nội, Dâu..."
            />
          </div>

          {/* Parent */}
          <div>
            <label className="text-sm font-semibold text-stone-600 mb-1.5 block">
              <Link className="inline w-3.5 h-3.5 mr-1 text-brand-400" />
              Con của (chọn cha hoặc mẹ)
            </label>
            <select
              value={form.parentId}
              onChange={e => set('parentId', e.target.value)}
              className="input-field"
            >
              <option value="">-- Không có (gốc rễ) --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.birthYear}) – {m.role}
                </option>
              ))}
            </select>
          </div>

          {/* Hometown + Occupation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-stone-600 mb-1.5 block">Quê quán</label>
              <input
                value={form.hometown}
                onChange={e => set('hometown', e.target.value)}
                className="input-field"
                placeholder="VD: Hà Nội"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-stone-600 mb-1.5 block">Nghề nghiệp</label>
              <input
                value={form.occupation}
                onChange={e => set('occupation', e.target.value)}
                className="input-field"
                placeholder="VD: Kỹ sư"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="text-sm font-semibold text-stone-600 mb-1.5 block">Mô tả ngắn</label>
            <textarea
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              className="input-field resize-none"
              rows={2}
              placeholder="Vài dòng giới thiệu về thành viên này..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Hủy
            </button>
            <button type="submit" className="btn-primary flex-1">
              ✨ Thêm thành viên
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
