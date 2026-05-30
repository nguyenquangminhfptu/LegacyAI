from pydantic import BaseModel, Field
from typing import List, Optional

class Relationship(BaseModel):
    targetId: int
    relationship: str

class Member(BaseModel):
    id: int
    name: str
    birthYear: int
    deathYear: Optional[int] = None
    gender: str

    parentIds: List[int] = Field(default_factory=list)
    spouseId: Optional[int] = None
    generation: int = 0

    role: Optional[str] = None
    lineage_role: Optional[str] = None
    family_role: Optional[str] = None
    display_role: Optional[str] = None
    relationships: List[Relationship] = Field(default_factory=list)
    
    avatar: Optional[str] = None
    bio: Optional[str] = None
    story: Optional[str] = None
    hometown: Optional[str] = None
    occupation: Optional[str] = None


class RelationshipSuggestRequest(BaseModel):
    all_members: List[Member]

class RelationshipSuggestResponse(BaseModel):
    status: str = "success"
    endpoint: str = "relationship_suggest"
    members: List[Member]