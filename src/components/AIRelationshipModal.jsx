import React, { useState } from 'react'
import { X, Sparkles, ChevronRight, CheckCircle } from 'lucide-react'
import { suggestRelationships } from '../utils/relationshipEngine'
import { useApp } from '../context/AppContext'

export default function AIRelationshipModal({ newMember, onClose }) {
  const { members } = useApp()
  // Exclude the new member itself when computing suggestions
  const existingMembers = members.filter(m => m.id !== newMember.id)
  const suggestions = suggestRelationships(newMember, existingMembers)

  const [confirmed, setConfirmed] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-slide-up overflow-hidden">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">LegacyAI Gợi Ý</h2>
                <p className="text-brand-200 text-sm">Phân tích mối quan hệ họ hàng</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white p-1 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New member preview */}
          <div className="mt-4 bg-white/10 rounded-2xl p-3 flex items-center gap-3">
            <img
              src={newMember.avatar}
              alt={newMember.name}
              className="w-12 h-12 rounded-xl border-2 border-white/30"
            />
            <div>
              <p className="text-white font-semibold">{newMember.name}</p>
              <p className="text-brand-200 text-sm">
                Sinh {newMember.birthYear} · {newMember.gender === 'male' ? 'Nam' : 'Nữ'}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {suggestions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🌱</div>
              <p className="text-stone-500 text-sm">
                Đây là thành viên gốc. Khi có thêm thành viên khác, LegacyAI sẽ tự động phân tích mối quan hệ.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-stone-500 mb-4">
                Dựa trên cây gia phả, <span className="font-semibold text-brand-700">LegacyAI</span> phát hiện{' '}
                <span className="font-bold text-brand-600">{suggestions.length} mối quan hệ</span> tự động:
              </p>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {suggestions.map((sug, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-brand-50 rounded-xl border border-amber-100 hover:border-brand-200 transition"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {/* Person avatar */}
                    <img
                      src={sug.person.avatar}
                      alt={sug.person.name}
                      className="w-10 h-10 rounded-lg border border-amber-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{sug.icon}</span>
                        <span className="font-semibold text-brand-800 text-sm">{sug.person.name}</span>
                      </div>
                      <p className="text-xs text-stone-500 truncate mt-0.5">{sug.description}</p>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="badge bg-brand-100 text-brand-700 font-bold">
                        {sug.relationship}
                      </span>
                      <span className="text-xs text-stone-400 mt-1">{sug.confidence}% chắc</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 border-t border-amber-100">
          {!confirmed ? (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="btn-secondary flex-1 text-sm"
              >
                Xem lại sau
              </button>
              <button
                onClick={() => setConfirmed(true)}
                className="btn-primary flex-1 text-sm"
              >
                <CheckCircle className="w-4 h-4 inline mr-1.5" />
                Xác nhận & Lưu
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-sm font-semibold text-brand-700 mb-1">Đã cập nhật thành công!</p>
              <p className="text-xs text-stone-400 mb-4">
                Thành viên mới và các mối quan hệ đã được lưu vào cây gia phả.
              </p>
              <button onClick={onClose} className="btn-primary w-full text-sm">
                Xem cây gia phả <ChevronRight className="w-4 h-4 inline ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
