import React, { useState } from 'react'
import { X, Image, BookOpen, Star, Upload } from 'lucide-react'
import { useApp } from '../context/AppContext'

const TYPES = [
  { value: 'story',     label: 'Câu chuyện',  icon: '📖', desc: 'Chia sẻ ký ức, câu chuyện cuộc đời' },
  { value: 'milestone', label: 'Cột mốc',     icon: '⭐', desc: 'Sự kiện quan trọng trong cuộc đời' },
  { value: 'photo',     label: 'Hình ảnh',    icon: '📷', desc: 'Upload ảnh kèm ghi chú' },
  { value: 'recipe',    label: 'Ký ức ẩm thực', icon: '🍜', desc: 'Công thức, món ăn truyền thống' },
]

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80',
  'https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&q=80',
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&q=80',
  'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&q=80',
]

export default function AddMemoryModal({ member, onClose, onAdded }) {
  const { addMemory } = useApp()
  const [form, setForm] = useState({
    type: 'story',
    title: '',
    content: '',
    imageUrl: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [errors, setErrors] = useState({})
  const [imgPreview, setImgPreview] = useState('')

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Vui lòng nhập tiêu đề'
    if (!form.content.trim()) errs.content = 'Vui lòng nhập nội dung'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const newMem = addMemory({
      memberId: member.id,
      memberName: member.name,
      memberAvatar: member.avatar,
      type: form.type,
      title: form.title.trim(),
      content: form.content.trim(),
      imageUrl: form.imageUrl || imgPreview || '',
      date: form.date,
      emoji: TYPES.find(t => t.value === form.type)?.icon || '📖',
    })

    onAdded(newMem)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-6 pt-6 pb-4 border-b border-amber-100 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold text-brand-800">Thêm ký ức</h2>
            <p className="text-sm text-stone-400 mt-0.5">
              Lưu giữ khoảnh khắc của <span className="text-brand-600 font-medium">{member.name}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-brand-50 rounded-xl transition">
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Type selector */}
          <div>
            <label className="text-sm font-semibold text-stone-600 mb-2 block">Loại ký ức</label>
            <div className="grid grid-cols-2 gap-2">
              {TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set('type', t.value)}
                  className={`p-3 rounded-xl border-2 text-left transition ${
                    form.type === t.value
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-amber-100 hover:border-brand-200'
                  }`}
                >
                  <div className="text-xl mb-1">{t.icon}</div>
                  <div className="text-sm font-semibold text-brand-800">{t.label}</div>
                  <div className="text-xs text-stone-400">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-semibold text-stone-600 mb-1.5 block">
              Tiêu đề <span className="text-red-400">*</span>
            </label>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className="input-field"
              placeholder="VD: Ngày tốt nghiệp đại học"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-semibold text-stone-600 mb-1.5 block">
              Nội dung <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.content}
              onChange={e => set('content', e.target.value)}
              className="input-field resize-none"
              rows={4}
              placeholder="Kể lại câu chuyện, ký ức, hoặc cảm xúc của khoảnh khắc này..."
            />
            {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="text-sm font-semibold text-stone-600 mb-1.5 block">Ngày diễn ra</label>
            <input
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              className="input-field"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="text-sm font-semibold text-stone-600 mb-1.5 block">
              <Image className="inline w-3.5 h-3.5 mr-1 text-brand-400" />
              Ảnh minh họa (URL)
            </label>
            <input
              value={form.imageUrl}
              onChange={e => { set('imageUrl', e.target.value); setImgPreview('') }}
              className="input-field"
              placeholder="https://..."
            />
            {/* Or pick sample */}
            <p className="text-xs text-stone-400 mt-2 mb-1.5">Hoặc chọn ảnh mẫu:</p>
            <div className="grid grid-cols-6 gap-1">
              {SAMPLE_IMAGES.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setImgPreview(url); set('imageUrl', url) }}
                  className={`rounded-lg overflow-hidden border-2 transition ${
                    (form.imageUrl === url || imgPreview === url)
                      ? 'border-brand-500 scale-105'
                      : 'border-transparent hover:border-brand-300'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-10 object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Hủy
            </button>
            <button type="submit" className="btn-primary flex-1">
              📝 Lưu ký ức
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
