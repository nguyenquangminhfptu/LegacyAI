from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from typing import List, Dict, Any

router = APIRouter()

def get_family_role(members: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    if not members:
        return members

    # Sắp xếp thứ tự anh chị em ruột
    family_branches = {}
    for m in members:
        parent_ids = m.get("parentIds", [])
        if parent_ids:
            sorted_parents_key = "-".join(str(pid) for pid in sorted(parent_ids))
            if sorted_parents_key not in family_branches:
                family_branches[sorted_parents_key] = []
            family_branches[sorted_parents_key].append(m)

    for key in family_branches:
        family_branches[key].sort(key=lambda x: x.get("birthYear", 0))

    # Gán xưng hô
    updated_members = []
    for member in members:
        current_role = member.get("role")
        if current_role and str(current_role).strip():
            updated_members.append(member)
            continue

        lineage_role = ""
        family_role = ""
        is_male = member.get("gender") == "male"
        generation = member.get("generation", 0)
        parent_ids = member.get("parentIds", [])
        spouse_id = member.get("spouseId")

        # Ông bà
        if generation == 0:
            lineage_role = "Tổ phụ" if is_male else "Tổ mẫu"
            family_role = "Ông nội" if is_male else "Bà nội"

        # Ba mẹ
        elif generation == 1:
            is_blood_relation = len(parent_ids) > 0
            if is_blood_relation:
                sorted_parents_key = "-".join(str(pid) for pid in sorted(parent_ids))
                siblings = family_branches.get(sorted_parents_key, [])
                try:
                    rank = next(i for i, s in enumerate(siblings) if s["id"] == member["id"])
                except StopIteration:
                    rank = -1

                if rank == 0:
                    lineage_role = "Con trai cả" if is_male else "Con gái cả"
                    family_role = "Cha" if is_male else "Mẹ"
                elif rank == len(siblings) - 1 and len(siblings) > 1:
                    lineage_role = "Con trai út" if is_male else "Con gái út"
                    family_role = "Chú" if is_male else "Cô"
                else:
                    lineage_role = "Con trai thứ" if is_male else "Con gái thứ"
                    family_role = "Bác" if is_male else "Cô"
            elif spouse_id:
                spouse = next((m for m in members if m["id"] == spouse_id), None)
                if spouse and spouse.get("parentIds"):
                    spouse_parents_key = "-".join(str(pid) for pid in sorted(spouse["parentIds"]))
                    siblings = family_branches.get(spouse_parents_key, [])
                    try:
                        spouse_rank = next(i for i, s in enumerate(siblings) if s["id"] == spouse["id"])
                    except StopIteration:
                        spouse_rank = -1

                    if spouse_rank == 0:
                        lineage_role = "Rể cả" if is_male else "Dâu cả"
                        family_role = "Cha" if is_male else "Mẹ"
                    elif spouse_rank == len(siblings) - 1 and len(siblings) > 1:
                        lineage_role = "Rể út" if is_male else "Dâu út"
                        family_role = "Chú" if is_male else "Thím"
                    else:
                        lineage_role = "Rể thứ" if is_male else "Dâu thứ"
                        family_role = "Bác" if is_male else "Thím"

        # Cháu
        elif generation == 2:
            lineage_role = "Cháu nội"
            family_role = "Con trai" if is_male else "Con gái"

        # Chắt
        elif generation > 2:
            lineage_role = "Chắt nội"
            family_role = "Chắt trai" if is_male else "Chắt gái"

        if lineage_role and family_role:
            member["role"] = f"{lineage_role} – {family_role}"
        else:
            member["role"] = "Thành viên"

        updated_members.append(member)

    return updated_members

@router.post('/relationship_suggest')
async def relationship_suggest(request: Request):
    data = await request.json() if request.headers.get('content-type', '').startswith('application/json') else {}
    
    # Lấy mảng all_members gửi từ frontend 
    all_members = data.get('all_members', [])
    
    processed_members = get_family_role(all_members)
    
    return JSONResponse({
        'status': 'success',
        'endpoint': 'relationship_suggest',
        'members': processed_members
    })