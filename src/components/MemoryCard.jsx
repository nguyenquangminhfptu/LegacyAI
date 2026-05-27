import React, { useState } from 'react'
import { Heart, MessageCircle, Share2, Calendar, Image, BookOpen, Star } from 'lucide-react'
import { useApp } from '../context/AppContext'

const TYPE_CONFIG = {
  story:     { icon: BookOpen,  color: 'text-purple-500',  bg: 'bg-purple-50',  label: 'Câu chuyện' },
  photo:     { icon: Image,     color: 'text-blue-500',    bg: 'bg-blue-50',    label: 'Hình ảnh' },
  milestone: { icon: Star,      color: 'text-amber-500',   bg: 'bg-amber-50',   label: 'Cột mốc' },
  recipe:    { icon: '🍜',      color: 'text-green-600',   bg: 'bg-green-50',   label: 'Công thức' },
}

export default function MemoryCard({ memory, showMember = true }) {
  const { likeMemory } = useApp()
  const [liked, setLiked] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  const cfg = TYPE_CONFIG[memory.type] || TYPE_CONFIG.story
  const TypeIcon = typeof cfg.icon === 'string' ? null : cfg.icon

  function handleLike() {
    if (!liked) {
      likeMemory(memory.id)
      setLiked(true)
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <article className="card hover:shadow-md transition-shadow duration-200 overflow-hidden group">
      {/* Member info */}
      {showMember && (
        <div className="flex items-center gap-3 mb-3">
          <img
            src={memory.memberAvatar}
            alt={memory.memberName}
            className="w-10 h-10 rounded-full border-2 border-amber-100"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-brand-800">{memory.memberName}</p>
            <div className="flex items-center gap-2">
              <span className={`badge ${cfg.bg} ${cfg.color}`}>
                {TypeIcon ? <TypeIcon className="w-3 h-3" /> : cfg.icon}
                {cfg.label}
              </span>
              <span className="text-xs text-stone-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(memory.date)}
              </span>
            </div>
          </div>
          {memory.emoji && (
            <span className="text-2xl">{memory.emoji}</span>
          )}
        </div>
      )}

      {/* Title */}
      <h3 className="font-bold text-brand-900 text-base mb-2 leading-snug">{memory.title}</h3>

      {/* Image */}
      {memory.imageUrl && (
        <div className="relative -mx-5 mb-3 overflow-hidden bg-amber-50">
          <img
            src={memory.imageUrl}
            alt={memory.title}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-52 object-cover transition-all duration-500 group-hover:scale-105 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {!imgLoaded && (
            <div className="w-full h-52 bg-gradient-to-br from-amber-50 to-brand-50 animate-pulse" />
          )}
        </div>
      )}

      {/* Content */}
      <p className="text-stone-600 text-sm leading-relaxed line-clamp-3">{memory.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-amber-50">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-all ${
            liked ? 'text-red-500 scale-110' : 'text-stone-400 hover:text-red-400'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
          <span className="font-medium">{memory.likes + (liked ? 1 : 0)}</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-brand-500 transition">
          <MessageCircle className="w-4 h-4" />
          <span>Bình luận</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-brand-500 transition ml-auto">
          <Share2 className="w-4 h-4" />
          <span>Chia sẻ</span>
        </button>
      </div>
    </article>
  )
}
