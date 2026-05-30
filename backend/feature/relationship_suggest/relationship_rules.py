def parent_title(gender: str) -> str:
    return "Cha" if gender == "male" else "Mẹ"

def child_title(gender: str) -> str:
    return "Con trai" if gender == "male" else "Con gái"

def grandparent_title(gender: str, paternal: bool = True) -> str:
    if paternal:
        return "Ông nội" if gender == "male" else "Bà nội"

    return "Ông ngoại" if gender == "male" else "Bà ngoại"

def grandchild_title(gender: str, paternal: bool = True) -> str:
    if paternal:
        return "Cháu nội"

    return "Cháu ngoại"

def sibling_title(
    target_gender: str,
    target_birth_year: int,
    current_birth_year: int
) -> str:
    older = target_birth_year < current_birth_year
    if target_gender == "male":
        return "Anh trai" if older else "Em trai"

    return "Chị gái" if older else "Em gái"