/**
 * LegacyAI – Rule-Based Relationship Engine
 * Tự động suy luận mối quan hệ họ hàng dựa trên cây gia phả
 */

/**
 * Tính mối quan hệ giữa thành viên mới và các thành viên hiện có
 * @param {Object} newMember - Thành viên vừa thêm (cần có parentIds, generation, gender)
 * @param {Array}  allMembers - Toàn bộ danh sách thành viên (chưa gồm newMember)
 * @returns {Array} Danh sách gợi ý quan hệ { person, relationship, description, confidence, icon }
 */
export function suggestRelationships(newMember, allMembers) {
  const suggestions = []
  const seen = new Set()

  const add = (person, relationship, description, confidence, icon = '🔗') => {
    if (!seen.has(person.id)) {
      seen.add(person.id)
      suggestions.push({ person, relationship, description, confidence, icon })
    }
  }

  // ── Lấy cha/mẹ của thành viên mới ──────────────────────────────────
  const parents = allMembers.filter(m => newMember.parentIds.includes(m.id))

  parents.forEach(parent => {
    // 1. Ông/Bà (cha/mẹ của cha/mẹ)
    const grandparents = allMembers.filter(m => parent.parentIds.includes(m.id))
    grandparents.forEach(gp => {
      const rel = gp.gender === 'male' ? 'Ông nội/ngoại' : 'Bà nội/ngoại'
      add(gp, rel,
        `${gp.name} là ${gp.gender === 'male' ? 'ông' : 'bà'} của ${newMember.name}`,
        99, gp.gender === 'male' ? '👴' : '👵')
    })

    // 2. Cô/Chú/Bác/Dì (anh chị em của cha/mẹ)
    const parentSiblings = allMembers.filter(m =>
      m.id !== parent.id &&
      m.parentIds.length > 0 &&
      m.parentIds.some(pid => parent.parentIds.includes(pid))
    )
    parentSiblings.forEach(ps => {
      let rel
      if (parent.gender === 'male') {
        rel = ps.gender === 'female' ? 'Cô ruột' : (ps.birthYear < parent.birthYear ? 'Bác' : 'Chú')
      } else {
        rel = ps.gender === 'female' ? (ps.birthYear < parent.birthYear ? 'Bác gái' : 'Dì') : 'Cậu'
      }
      add(ps, rel,
        `${ps.name} là ${rel.toLowerCase()} của ${newMember.name}`,
        96, ps.gender === 'female' ? '👩' : '👨')
    })

    // 3. Anh/Chị/Em ruột (cùng cha/mẹ)
    const siblings = allMembers.filter(m =>
      m.id !== newMember.id &&
      m.parentIds.some(pid => newMember.parentIds.includes(pid))
    )
    siblings.forEach(sib => {
      const isOlder = sib.birthYear < newMember.birthYear
      const rel = sib.gender === 'male'
        ? (isOlder ? 'Anh trai' : 'Em trai')
        : (isOlder ? 'Chị gái' : 'Em gái')
      add(sib, rel,
        `${sib.name} là ${rel.toLowerCase()} của ${newMember.name}`,
        99, '👫')
    })
  })

  // ── Các quan hệ mở rộng ─────────────────────────────────────────────
  // 4. Anh/Chị em họ (con của cô/chú/bác/dì)
  const parentSiblingIds = allMembers
    .filter(m => parents.some(p => p.parentIds.some(pid => m.parentIds.includes(pid)) && m.id !== p.id))
    .map(m => m.id)

  const cousins = allMembers.filter(m =>
    m.parentIds.some(pid => parentSiblingIds.includes(pid))
  )
  cousins.forEach(c => {
    add(c, 'Anh/Chị em họ',
      `${c.name} là anh/chị em họ của ${newMember.name}`,
      88, '👥')
  })

  // 5. Cháu nội/ngoại (nếu thành viên mới là cha/mẹ thế hệ cao hơn)
  const nephewNieces = allMembers.filter(m =>
    m.parentIds.includes(newMember.id)
  )
  nephewNieces.forEach(nn => {
    add(nn, 'Cháu',
      `${nn.name} là cháu của ${newMember.name}`,
      99, '👶')
  })

  // Sắp xếp theo confidence giảm dần
  return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 6)
}

/**
 * Trả về nhãn mối quan hệ ngắn gọn giữa hai người (A nhìn B)
 */
export function getRelationshipLabel(personA, personB, allMembers) {
  if (!personA || !personB) return 'Thành viên'

  // B là cha/mẹ của A
  if (personA.parentIds.includes(personB.id)) {
    return personB.gender === 'male' ? 'Cha' : 'Mẹ'
  }
  // B là con của A
  if (personB.parentIds.includes(personA.id)) {
    return personB.gender === 'male' ? 'Con trai' : 'Con gái'
  }
  // Vợ/Chồng
  if (personA.spouseId === personB.id) {
    return personB.gender === 'male' ? 'Chồng' : 'Vợ'
  }
  // Anh chị em ruột
  const sharedParent = personA.parentIds.some(pid => personB.parentIds.includes(pid))
  if (sharedParent && personA.parentIds.length > 0) {
    const isOlder = personB.birthYear < personA.birthYear
    return personB.gender === 'male'
      ? (isOlder ? 'Anh trai' : 'Em trai')
      : (isOlder ? 'Chị gái' : 'Em gái')
  }
  // Ông/Bà
  const parentsOfA = allMembers.filter(m => personA.parentIds.includes(m.id))
  const isGrandparent = parentsOfA.some(p => p.parentIds.includes(personB.id))
  if (isGrandparent) return personB.gender === 'male' ? 'Ông' : 'Bà'

  // Cháu
  const parentsOfB = allMembers.filter(m => personB.parentIds.includes(m.id))
  const isGrandchild = parentsOfB.some(p => p.parentIds.includes(personA.id))
  if (isGrandchild) return 'Cháu'

  return personB.role || 'Thành viên'
}

/**
 * Tính khoảng cách thế hệ giữa hai người
 */
export function getGenerationGap(personA, personB) {
  return Math.abs((personA.generation ?? 0) - (personB.generation ?? 0))
}
