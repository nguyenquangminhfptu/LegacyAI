import React, { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CARD_W     = 124
const CARD_H     = 88
const SPOUSE_GAP = 20   // gap between the two cards of a couple
const SIBLING_GAP = 44  // gap between sibling subtrees
const V_GAP      = 84   // vertical gap between generations
const PAD_X      = 70
const PAD_Y      = 44

// ── Build family "nodes" (a node = a couple or a single person) ──────────
function buildNodes(members) {
  const byId = new Map(members.map(m => [m.id, m]))
  const used = new Set()
  const nodeOf = new Map()   // memberId -> node
  const nodes = []

  members.forEach(m => {
    if (used.has(m.id)) return
    if (m.spouseId && byId.has(m.spouseId)) {
      const s = byId.get(m.spouseId)
      // order so male is on the left; tie-break by id for stability
      const pair = [m, s].sort((p, q) =>
        p.gender !== q.gender ? (p.gender === 'male' ? -1 : 1) : p.id - q.id
      )
      const node = { couple: true, members: pair, children: [] }
      nodes.push(node)
      pair.forEach(p => { used.add(p.id); nodeOf.set(p.id, node) })
    } else {
      const node = { couple: false, members: [m], children: [] }
      nodes.push(node)
      used.add(m.id); nodeOf.set(m.id, node)
    }
  })

  // Wire up parent → children (a child belongs to the node of its parent)
  nodes.forEach(node => {
    const blood = node.members.find(mm => mm.parentIds && mm.parentIds.length)
    if (!blood) return
    const parentNode = nodeOf.get(blood.parentIds[0])
    if (parentNode && parentNode !== node) parentNode.children.push(node)
  })

  const childSet = new Set()
  nodes.forEach(n => n.children.forEach(c => childSet.add(c)))
  const roots = nodes.filter(n => !childSet.has(n))
  return { nodes, roots }
}

function nodeWidth(node) {
  return node.couple ? CARD_W * 2 + SPOUSE_GAP : CARD_W
}

// Pass 1: how wide is each subtree?
function computeSubtreeWidth(node) {
  const own = nodeWidth(node)
  if (node.children.length === 0) { node._sw = own; return own }
  let childrenW = 0
  node.children.forEach((c, i) => {
    childrenW += computeSubtreeWidth(c)
    if (i > 0) childrenW += SIBLING_GAP
  })
  node._sw = Math.max(own, childrenW)
  return node._sw
}

// Pass 2: assign center x + y, recursively
function assign(node, leftX, depth) {
  node.y = PAD_Y + depth * (CARD_H + V_GAP)
  if (node.children.length === 0) {
    node.cx = leftX + node._sw / 2
    return
  }
  let childrenW = 0
  node.children.forEach((c, i) => {
    childrenW += c._sw
    if (i > 0) childrenW += SIBLING_GAP
  })
  let cursor = leftX + (node._sw - childrenW) / 2   // center the children block
  const centers = []
  node.children.forEach(c => {
    assign(c, cursor, depth + 1)
    centers.push(c.cx)
    cursor += c._sw + SIBLING_GAP
  })
  node.cx = (centers[0] + centers[centers.length - 1]) / 2
}

function computeLayout(members) {
  if (members.length === 0) return { positions: {}, totalW: 200, totalH: 200, rows: [] }

  const { nodes, roots } = buildNodes(members)

  let cursor = PAD_X
  roots.forEach(r => {
    computeSubtreeWidth(r)
    assign(r, cursor, 0)
    cursor += r._sw + SIBLING_GAP
  })

  // Convert node centers → individual card positions
  const positions = {}
  nodes.forEach(node => {
    if (node.couple) {
      const [a, b] = node.members
      positions[a.id] = { x: node.cx - SPOUSE_GAP / 2 - CARD_W, y: node.y }
      positions[b.id] = { x: node.cx + SPOUSE_GAP / 2,          y: node.y }
    } else {
      positions[node.members[0].id] = { x: node.cx - CARD_W / 2, y: node.y }
    }
  })

  const allX = Object.values(positions).map(p => p.x)
  const allY = Object.values(positions).map(p => p.y)
  const totalW = Math.max(...allX) + CARD_W + PAD_X
  const totalH = Math.max(...allY) + CARD_H + PAD_Y

  // Unique generation rows (for the "Đời N" labels)
  const rows = [...new Set(allY)].sort((a, b) => a - b)

  return { positions, totalW, totalH, rows }
}

function computeLines(members, positions) {
  const lines = []

  // Parent → child connectors
  members.forEach(child => {
    if (!child.parentIds || child.parentIds.length === 0) return
    const childPos = positions[child.id]
    if (!childPos) return

    const parentPositions = child.parentIds.map(pid => positions[pid]).filter(Boolean)
    if (parentPositions.length === 0) return

    const parentMidX = parentPositions.reduce((sum, p) => sum + p.x + CARD_W / 2, 0) / parentPositions.length
    const parentY    = parentPositions[0].y + CARD_H
    const childTopX  = childPos.x + CARD_W / 2
    const childTopY  = childPos.y
    const midY       = parentY + V_GAP / 2

    lines.push({
      key: `line-${child.id}`,
      d: `M ${parentMidX} ${parentY} L ${parentMidX} ${midY} L ${childTopX} ${midY} L ${childTopX} ${childTopY}`,
    })
  })

  // Spouse connectors — always join the two inner edges
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
    const left  = posA.x < posB.x ? posA : posB
    const right = posA.x < posB.x ? posB : posA
    lines.push({
      key: `spouse-${key}`,
      d: `M ${left.x + CARD_W} ${left.y + CARD_H / 2} L ${right.x} ${right.y + CARD_H / 2}`,
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
      <rect x="3" y="4" width={CARD_W} height={CARD_H} rx="12" fill="rgba(0,0,0,0.06)" />
      <rect width={CARD_W} height={CARD_H} rx="12" fill="white" stroke="#F3D9A8" strokeWidth="1.5" />
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
        <text x={CARD_W / 2} y="33" textAnchor="middle" fontSize="14" fontWeight="700" fill={member.gender === 'male' ? '#1D4ED8' : '#BE185D'}>
          {initial}
        </text>
      )}
      <circle cx={CARD_W / 2 + 13} cy="42" r="7" fill={member.gender === 'male' ? '#3B82F6' : '#EC4899'} />
      <text x={CARD_W / 2 + 13} y="46" textAnchor="middle" fontSize="8" fill="white">
        {member.gender === 'male' ? '♂' : '♀'}
      </text>
      <text x={CARD_W / 2} y="58" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#1C1410" fontFamily="'Be Vietnam Pro', sans-serif">
        {member.name.length > 14 ? member.name.slice(0, 13) + '…' : member.name}
      </text>
      <text x={CARD_W / 2} y="70" textAnchor="middle" fontSize="8.5" fill="#92400E" fontFamily="'Be Vietnam Pro', sans-serif">
        {member.birthYear}{member.deathYear ? ` – ${member.deathYear}` : ''}
      </text>
      <text x={CARD_W / 2} y="81" textAnchor="middle" fontSize="7.5" fill="#B45309" fontFamily="'Be Vietnam Pro', sans-serif">
        {member.role && member.role.length > 18 ? member.role.slice(0, 17) + '…' : (member.role || '')}
      </text>
    </g>
  )
}

export default function FamilyTree({ members }) {
  const navigate = useNavigate()
  const [scale, setScale] = useState(0.9)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const drag = useRef(null)
  const moved = useRef(false)
  const [grabbing, setGrabbing] = useState(false)

  const { positions, totalW, totalH, rows } = useMemo(() => computeLayout(members), [members])
  const lines = useMemo(() => computeLines(members, positions), [members, positions])

  function handleMemberClick(id) {
    if (moved.current) return   // was a drag, not a click
    navigate(`/member/${id}`)
  }

  function onMouseDown(e) {
    drag.current = { startX: e.clientX, startY: e.clientY, ox: offset.x, oy: offset.y }
    moved.current = false
    setGrabbing(true)
  }
  function onMouseMove(e) {
    if (!drag.current) return
    const dx = e.clientX - drag.current.startX
    const dy = e.clientY - drag.current.startY
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved.current = true
    setOffset({ x: drag.current.ox + dx, y: drag.current.oy + dy })
  }
  function onMouseUp() {
    drag.current = null
    setGrabbing(false)
  }
  function resetView() {
    setScale(0.9)
    setOffset({ x: 0, y: 0 })
  }

  return (
    <div className="relative">
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <button onClick={() => setScale(s => Math.min(s + 0.15, 2))} className="w-8 h-8 bg-white border border-amber-200 rounded-lg text-brand-700 font-bold hover:bg-brand-50 transition shadow-sm text-lg flex items-center justify-center">+</button>
        <button onClick={() => setScale(s => Math.max(s - 0.15, 0.4))} className="w-8 h-8 bg-white border border-amber-200 rounded-lg text-brand-700 font-bold hover:bg-brand-50 transition shadow-sm text-lg flex items-center justify-center">−</button>
        <button onClick={resetView} className="w-8 h-8 bg-white border border-amber-200 rounded-lg text-brand-600 hover:bg-brand-50 transition shadow-sm text-xs font-semibold flex items-center justify-center" title="Về vị trí gốc">↺</button>
      </div>

      {/* Pannable viewport */}
      <div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 to-amber-50/30 select-none"
        style={{ height: '68vh', minHeight: 420, cursor: grabbing ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: drag.current ? 'none' : 'transform 0.15s',
            width: totalW,
            height: totalH,
          }}
        >
          <svg width={totalW} height={totalH} xmlns="http://www.w3.org/2000/svg">
            {/* Generation labels */}
            {rows.map((y, i) => (
              <text key={`gen-${i}`} x="10" y={y + CARD_H / 2 + 4} fontSize="11" fill="#B45309" fontWeight="600" fontFamily="'Be Vietnam Pro', sans-serif" opacity="0.6">
                Đời {i + 1}
              </text>
            ))}

            {/* Connector lines */}
            {lines.map(line => (
              <path
                key={line.key}
                d={line.d}
                stroke={line.spouse ? '#E8B96A' : '#D4A853'}
                strokeWidth="2"
                strokeDasharray={line.spouse ? '5,3' : '0'}
                fill="none"
                opacity="0.75"
              />
            ))}

            {/* Member cards */}
            {members.map(m => {
              const pos = positions[m.id]
              if (!pos) return null
              return <MemberCard key={m.id} member={m} pos={pos} onClick={handleMemberClick} />
            })}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-stone-500 px-1">
        <div className="flex items-center gap-1.5">
          <svg width="28" height="6"><line x1="0" y1="3" x2="28" y2="3" stroke="#D4A853" strokeWidth="2"/></svg>
          Quan hệ cha/mẹ – con
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="28" height="6"><line x1="0" y1="3" x2="28" y2="3" stroke="#E8B96A" strokeWidth="2" strokeDasharray="5,3"/></svg>
          Vợ/Chồng
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-brand-600 font-medium">Kéo để di chuyển</span> · click thẻ để xem hồ sơ
        </div>
      </div>
    </div>
  )
}
