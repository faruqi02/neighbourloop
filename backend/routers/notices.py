from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from schemas import CommunityNotice, CommunityNoticeCreate
from database import NOTICES_DB
import uuid

router = APIRouter(prefix="/notices", tags=["Community Notices & Announcements"])

@router.get("", response_model=List[CommunityNotice])
def get_community_notices(category: Optional[str] = Query(None, description="Category filter")):
    results = NOTICES_DB
    if category and category != "Semua":
        results = [n for n in results if n.category.lower() == category.lower()]
    return results

@router.post("", response_model=CommunityNotice)
def create_community_notice(data: CommunityNoticeCreate):
    new_notice = CommunityNotice(
        id=f"not_{uuid.uuid4().hex[:6]}",
        title=data.title,
        category=data.category,
        description=data.description,
        date=data.date,
        time=data.time,
        location=data.location,
        organizer=data.organizer,
        contactPerson=data.contactPerson,
        isImportant=data.isImportant or False,
        imageUrl=data.imageUrl,
        createdAt="Baru sahaja"
    )
    NOTICES_DB.insert(0, new_notice)
    return new_notice

@router.delete("/{notice_id}")
def delete_community_notice(notice_id: str):
    global NOTICES_DB
    for i, n in enumerate(NOTICES_DB):
        if n.id == notice_id:
            del NOTICES_DB[i]
            return {"success": True, "message": "Notice deleted successfully"}
    raise HTTPException(status_code=404, detail="Notice not found")

