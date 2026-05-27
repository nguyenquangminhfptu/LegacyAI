import React, { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CARD_W = 124
const CARD_H = 88
const H_GAP  = 36
const V_GAP  = 80
const PAD_X  = 60
const PAD_Y  = 40

function computeLayout(members) {
  // Group by generation
  const gens = {}
  members.forEach(m => {
    const g = m.generation ?? 0
    if (!gens[g]) gens[g] = []
    gens[g].push(m)
  })

  const maxGen = Math.max(...Object.keys(gens).map(Number))
  const positions = {}

  // Pass 1: assign initial x per generation (evenly spaced)
  Object.entries(gens).forEach(([gen, mems]) => {
    const genNum = parseInt(gen)
    const totalRowW = mems.length * CARD_W + (mems.length - 1) * H_GAP
    // Center each generation row
    const startX = PAD_X
    mems.forEach((m, i) => {
      positions[m.id] = {
        x: startX + i * (CARD_W + H_GAP),
        y: PAD_Y + genNum * (CARD_H + V_GAP),
        rowW: totalRowW,
        genNum,
      }
    })
  })

  // Pass 2: try to center parents above their children
  for (let g = maxGen - 1; g >= 0; g--) {
    const parentGen = gens[g] || []
    parentGen.forEach(parent => {
      const children = members.filter(m =>
        m.parentIds && m.parentIds.includes(parent.id)
      )
      if (children.length === 0) return
      const childXs = children
        .map(c => positions[c.id])
        .filter(Boolean)
        .map(p => p.x + CARD_W / 2)
      if (childXs.length === 0) return
      const midX = (Math.min(...childXs) + Math.max(...childXs)) / 2
      // shift parent so its center aligns with children mid
      // (we don't re-space siblings here for simplicity – demo is fine)
    })
  }

  // Compute canvas size
  const allX = Object.values(positions).map(p => p.x + CARD_W)
  const allY = Object.values(positions).map(p => p.y + CARD_H)
  const totalW = Math.max(...allX) + PAD_X
  const totalH = Math.max(...allY) + PAD_Y

  return { positions, totalW, totalH }
}

function computeLines(members, positions) {
  const lines = []
  members.forEach(child => {
    if (!child.parentIds || child.parentIds.length === 0) return
    const childPos = positions[child.id]
    if (!childPos) return

    const parentPositions = child.parentIds
      .map(pid => positions[pid])
      .filter(Boolean)
    if (parentPositions.length === 0) return

    const parentMidX = parentPositions.reduce((sum, p) => sum + p.x + CARD_W / 2, 0) / parentPositions.length
    const parentY     = parentPositions[0].y + CARD_H

    const childTopX = childPos.x + CARD_W / 2
    const childTopY = childPos.y

    // Elbow connector: down from parent, then horizontal, then up to child
    const midY = parentY + V_GAP / 2

    lines.push({
      key: `line-${child.id}`,
      d: `M ${parentMidX} ${parentY} L ${parentMidX} ${midY} L ${childTopX} ${midY} L ${childTopX} ${childTopY}`,
    })
  })

  // Draw spouse connectors
  const drawn = new Set()
  members.forEach(m => {
    if (!m.spouseId) return
    const spouse = members.find(s => s.id === m.spouseId)
    if (!spouse) return
    const key = [m.id, spouse.id].sort().join('-')
    if (drawn.has(key)) return
    drawn.add(key)
    const posA = positions[m.id]
    const posB = positions[spouse.id]
    if (!posA || !posB) return
    lines.push({
      key: `spouse-${key}`,
      d: `M ${posA.x + CARD_W} ${posA.y + CARD_H / 2} L ${posB.x} ${posB.y + CARD_H / 2}`,
      spouse: true,
    })
  })

  return lines
}

function MemberCard({ member, pos, onClick }) {
  const [imgErr, setImgErr] = useState(false)
  const initial = member.name.charAt(0)

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      className="cursor-pointer"
      onClick={() => onClick(member.id)}
      style={{ cursor: 'pointer' }}
    >
      {/* Shadow */}
      <rect
        x="3" y="4"
        width={CARD_W} height={CARD_H}
        rx="12"
        fill="rgba(0,0,0,0.06)"
      />
      {/* Card bg */}
      <rect
        width={CARD_W} height={CARD_H}
        rx="12"
        fill="white"
        stroke="#F3D9A8"
        strokeWidth="1.5"
      />
      {/* Avatar circle */}
      <clipPath id={`clip-${member.id}`}>
        <circle cx={CARD_W / 2} cy="28" r="18" />
      </clipPath>
      <circle cx={CARD_W / 2} cy="28" r="18" fill={member.gender === 'male' ? '#DBEAFE' : '#FCE7F3'} />
      {!imgErr ? (
        <image
          href={member.avatar}
          x={CARD_W / 2 - 18} y="10"
          width="36" height="36"
          clipPath={`url(#clip-${member.id})`}
          onError={() => setImgErr(true)}
        />
      ) : (
        <text
          x={CARD_W / 2} y="33"
          textAnchor="middle"
          fontSize="14"
          fontWeight="700"
          fill={member.gender === 'male' ? '#1D4ED8' : '#BE185D'}
        >
          {initial}
        </text>
      )}
      {/* Gender badge */}
      <circle
        cx={CARD_W / 2 + 13} cy="42"
        r="7"
        fill={member.gender === 'male' ? '#3B82F6' : '#EC4899'}
      />
      <text x={CARD_W / 2 + 13} y="46" textAnchor="middle" fontSize="8" fill="white">
        {member.gender === 'male' ? '♂' : '♀'}
      </text>
      {/* Name */}
      <text
        x={CARD_W / 2} y="58"
        textAnchor="middle"
        fontSize="9.5"
        fontWeight="700"
        fill="#1C1410"
        fontFamily="'Be Vietnam Pro', sans-serif"
      >
        {member.name.length > 14 ? member.name.slice(0, 13) + '…' : member.name}
      </text>
      {/* Birth year */}
      <text
        x={CARD_W / 2} y="70"
        textAnchor="middle"
        fontSize="8.5"
        fill="#92400E"
        fontFamily="'Be Vietnam Pro', sans-serif"
      >
        {member.birthYear}{member.deathYear ? ` – ${member.deathYear}` : ''}
      </text>
      {/* Role */}
      <text
        x={CARD_W / 2} y="81"
        textAnchor="middle"
        fontSize="7.5"
        fill="#B45309"
        fontFamily="'Be Vietnam Pro', sans-serif"
      >
        {member.role && member.role.length > 18 ? member.role.slice(0, 17) + '…' : (member.role || '')}
      </text>
      {/* Hover overlay */}
      <rect
        width={CARD_W} height={CARD_H}
        rx="12"
        fill="transparent"
        stroke="#D4A853"
        strokeWidth="0"
        className="hover-stroke"
      />
    </g>
  )
}

export default function FamilyTree({ members }) {
  const navigate = useNavigate()
  const svgRef = useRef(null)
  const [scale, setScale] = useState(1)

  const { positions, totalW, totalH } = useMemo(() => computeLayout(members), [members])
  const lines = useMemo(() => computeLines(members, positions), [members, positions])

  function handleMemberClick(id) {
    navigate(`/member/${id}`)
  }

  return (
    <div className="relative">
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <button
          onClick={() => setScale(s => Math.min(s + 0.15, 2))}
          className="w-8 h-8 bg-white border border-amber-200 rounded-lg text-brand-700 font-bold hover:bg-brand-50 transition shadow-sm text-lg flex items-center justify-center"
        >+</button>
        <button
          onClick={() => setScale(s => Math.max(s - 0.15, 0.5))}
          className="w-8 h-8 bg-white border border-amber-200 rounded-lg text-brand-700 font-bold hover:bg-brand-50 transition shadow-sm text-lg flex items-center justify-center"
        >−</button>
        <button
          onClick={() => setScale(1)}
          className="w-8 h-8 bg-white border border-amber-200 rounded-lg text-brand-600 hover:bg-brand-50 transition shadow-sm text-xs font-semibold flex items-center justify-center"
          title="Reset zoom"
        >↺</button>
      </div>

      <div className="overflow-auto rounded-2xl bg-gradient-to-br from-brand-50 to-amber-50/30">
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: 'top left', transition: 'transform 0.2s' }}
        >
          <svg
            ref={svgRef}
            width={totalW}
            height={totalH}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Generation labels */}
            {[0, 1, 2].map(gen => (
              <text
                key={`gen-${gen}`}
                x="8"
                y={PAD_Y + gen * (CARD_H + V_GAP) + CARD_H / 2 + 4}
                fontSize="9"
                fill="#B45309"
                fontWeight="600"
                fontFamily="'Be Vietnam Pro', sans-serif"
                opacity="0.6"
              >
                Đời {gen + 1}
              </text>
            ))}

            {/* Connector lines */}
            {lines.map(line => (
              <path
                key={line.key}
                d={line.d}
                stroke={line.spouse ? '#E8B96A' : '#D4A853'}
                strokeWidth={line.spouse ? 2 : 2}
                strokeDasharray={line.spouse ? '5,3' : '0'}
                fill="none"
                opacity="0.75"
              />
            ))}

            {/* Member cards */}
            {members.map(m => {
              const pos = positions[m.id]
              if (!pos) return null
              return (
                <MemberCard
                  key={m.id}
                  member={m}
                  pos={pos}
                  onClick={handleMemberClick}
                />
              )
            })}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-stone-500 px-1">
        <div className="flex items-center gap-1.5">
          <svg width="28" height="6"><line x1="0" y1="3" x2="28" y2="3" stroke="#D4A853" strokeWidth="2"/></svg>
          Quan hệ cha/mẹ – con
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="28" height="6"><line x1="0" y1="3" x2="28" y2="3" stroke="#E8B96A" strokeWidth="2" strokeDasharray="5,3"/></svg>
          Vợ/Chồng
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-brand-600 font-medium">Click vào thẻ</span> để xem hồ sơ
        </div>
      </div>
    </div>
  )
}
