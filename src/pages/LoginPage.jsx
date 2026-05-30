import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { TreePine, Eye, EyeOff, ArrowRight } from 'lucide-react'
import treeIcon from '../assets/icons/tree.png'
import cameraIcon from '../assets/icons/camera.png'
import aiIcon from '../assets/icons/ai.png'
export default function LoginPage() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setError('') }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Vui lòng điền đầy đủ thông tin'); return }
    if (mode === 'register' && !form.name) { setError('Vui lòng nhập họ tên'); return }

    setLoading(true)
    await new Promise(r => setTimeout(r, 900)) // Fake API delay

    const name = mode === 'register' ? form.name : (form.email.split('@')[0] || 'Người dùng')
    login(name.charAt(0).toUpperCase() + name.slice(1), form.email)
    navigate('/home')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel – decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-amber-400/10 rounded-full" />

        {/* Content */}
        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <TreePine className="w-11 h-11 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-2">
            Legacy<span className="text-amber-300">AI</span>
          </h1>
          <p className="text-brand-200 text-lg mb-10">
            Nền tảng số hóa ký ức gia tộc
          </p>

          {/* Feature cards */}
          <div className="space-y-3 text-left">
            {[
              { icon: treeIcon, title: 'Cây gia phả số', desc: 'Trực quan hóa dòng tộc qua nhiều thế hệ' },
              { icon: cameraIcon, title: 'Lưu trữ ký ức', desc: 'Hình ảnh, câu chuyện, cột mốc cuộc đời' },
              { icon: aiIcon, title: 'AI suy luận quan hệ', desc: 'Tự động nhận diện ông bà, cô chú, anh em' },
            ].map((f, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-4 flex gap-3 items-start">
                {f.icon.startsWith('/') || f.icon.includes('.') ? (
                  <img src={f.icon} alt={f.title} className="w-7 h-7 object-contain" />
                ) : (
                  <span className="text-2xl">{f.icon}</span>
                )}
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-brand-200 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-brand-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center">
              <TreePine className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-brand-800">Legacy<span className="text-brand-400">AI</span></span>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            {/* Tab switcher */}
            <div className="flex bg-brand-50 rounded-2xl p-1 mb-8">
              {['login', 'register'].map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError('') }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    mode === m
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  {m === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="text-sm font-semibold text-stone-600 mb-1.5 block">Họ và tên</label>
                  <input
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    className="input-field"
                    placeholder="Nguyễn Văn A"
                    autoFocus
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-stone-600 mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  className="input-field"
                  placeholder="email@example.com"
                  autoFocus={mode === 'login'}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-stone-600 mb-1.5 block">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    className="input-field pr-11"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-brand-500 transition"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-2 flex items-center justify-center gap-2 h-12 text-base"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Demo hint */}
            {/* <div className="mt-6 p-3 bg-amber-50 rounded-xl border border-amber-100 text-center">
              <p className="text-xs text-amber-700">
                💡 <span className="font-semibold">Demo:</span> Nhập bất kỳ email/mật khẩu nào để đăng nhập
              </p>
            </div> */}
          </div>

          <p className="text-center text-xs text-stone-400 mt-6">
            © 2026 LegacyAI · Dự án FShark · ĐH FPT
          </p>
        </div>
      </div>
    </div>
  )
}
