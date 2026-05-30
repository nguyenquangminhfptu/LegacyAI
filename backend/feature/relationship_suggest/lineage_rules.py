def get_child_rank_title(rank: int, total: int, gender: str) -> str:
    is_male = gender == "male"
    if total <= 0:
        return ""
    if rank == 0:
        return "Con trai cả" if is_male else "Con gái cả"
    if rank == total - 1 and total > 1:
        return "Con trai út" if is_male else "Con gái út"
    
    return "Con trai thứ" if is_male else "Con gái thứ"


def get_inlaw_rank_title(rank: int, total: int, gender: str) -> str:
    is_male = gender == "male"
    if rank == 0:
        return "Rể cả" if is_male else "Dâu cả"
    if rank == total - 1 and total > 1:
        return "Rể út" if is_male else "Dâu út"

    return "Rể thứ" if is_male else "Dâu thứ"