from collections import defaultdict
from .lineage_rules import (
    get_child_rank_title,
    get_inlaw_rank_title
)

def _build_sibling_groups(members):
    groups = defaultdict(list)

    for member in members:
        parent_ids = member.get("parentIds", [])
        if not parent_ids:
            continue
        key = "-".join(str(pid) for pid in sorted(parent_ids))
        groups[key].append(member)

    for key in groups:
        groups[key].sort(
            key=lambda x: (
                x.get("birthYear", 9999),
                x.get("id", 0)
            )
        )
    return groups

def _find_member(members, member_id):
    return next((m for m in members if m.get("id") == member_id), None)

def _get_bloodline_role(member, sibling_groups):
    generation = member.get("generation", 0)
    gender = member.get("gender")

    # Tổ tiên gốc
    if generation == 0:
        return "Tổ phụ" if gender == "male" else "Tổ mẫu"
    
    parent_ids = member.get("parentIds", [])
    # Đời con
    if generation == 1:
        if not parent_ids:
            return ""
        key = "-".join(str(pid) for pid in sorted(parent_ids))
        siblings = sibling_groups.get(key, [])
        rank = next(
            (
                idx
                for idx, s in enumerate(siblings)
                if s["id"] == member["id"]
            ),
            0
        )

        return get_child_rank_title(
            rank=rank,
            total=len(siblings),
            gender=gender
        )
    # Đời cháu
    if generation == 2:
        return "Cháu nội"
    
    # Đời chắt
    if generation == 3:
        return "Chắt nội"

    # Đời cao hơn
    if generation >= 4:
        return "Hậu duệ"

    return ""

def _get_inlaw_role(member, members, sibling_groups):
    spouse_id = member.get("spouseId")
    if not spouse_id:
        return ""

    spouse = _find_member(members, spouse_id)
    if not spouse:
        return ""

    spouse_parent_ids = spouse.get("parentIds", [])
    if not spouse_parent_ids:
        return ""

    key = "-".join(
        str(pid)
        for pid in sorted(spouse_parent_ids)
    )

    siblings = sibling_groups.get(key, [])
    spouse_rank = next(
        (
            idx
            for idx, s in enumerate(siblings)
            if s["id"] == spouse["id"]
        ),
        0
    )
    return get_inlaw_rank_title(
        rank=spouse_rank,
        total=len(siblings),
        gender=member.get("gender")
    )

def calculate_lineage_role(member, members):
    sibling_groups = _build_sibling_groups(members)
    parent_ids = member.get("parentIds", [])

    # Có huyết thống
    if parent_ids:
        return _get_bloodline_role(
            member,
            sibling_groups
        )

    # Không có parentIds nhưng là vợ/chồng
    inlaw_role = _get_inlaw_role(
        member,
        members,
        sibling_groups
    )
    if inlaw_role:
        return inlaw_role

    # Gốc cây
    if member.get("generation", 0) == 0:
        return (
            "Tổ phụ"
            if member.get("gender") == "male"
            else "Tổ mẫu"
        )

    return ""

def build_display_role(lineage_role, family_role):
    if lineage_role and family_role:
        return f"{lineage_role} – {family_role}"
    if lineage_role:
        return lineage_role
    if family_role:
        return family_role

    return "Thành viên"

def enrich_lineage_roles(members):
    for member in members:
        member["lineage_role"] = calculate_lineage_role(member, members)
    return members