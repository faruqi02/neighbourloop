from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from schemas import HelpRequest, HelpCreate
from database import HELP_REQUESTS_DB, USERS_DB
import uuid

router = APIRouter(prefix="/help", tags=["Help Nearby"])

@router.get("", response_model=List[HelpRequest])
def get_help_items(
    type_filter: Optional[str] = Query(None, description="Permintaan or Tawaran"),
    category: Optional[str] = Query(None, description="Category filter"),
    max_distance: Optional[float] = Query(None, description="Max radius in km")
):
    results = HELP_REQUESTS_DB
    if type_filter and type_filter != "Semua":
        results = [h for h in results if h.type == type_filter]
    if category and category != "Semua":
        results = [h for h in results if h.category.lower() == category.lower()]
    if max_distance:
        results = [h for h in results if h.distance <= max_distance]
    return results

@router.post("", response_model=HelpRequest)
def create_help_item(data: HelpCreate, user_id: str = Query("u1")):
    user = USERS_DB.get(user_id, USERS_DB["u1"])

    new_item = HelpRequest(
        id=f"h{uuid.uuid4().hex[:6]}",
        title=data.title,
        description=data.description,
        category=data.category,
        distance=0.4,
        type=data.type,
        requesterId=user.id,
        requesterName=user.name,
        requesterPhone=data.requesterPhone or user.phone,
        requesterContactNotes=data.requesterContactNotes or user.contactNotes,
        imageUrl=data.imageUrl,
        status="Open",
        createdAt="Baru sahaja"
    )
    HELP_REQUESTS_DB.insert(0, new_item)
    return new_item

@router.post("/{help_id}/fulfill", response_model=HelpRequest)
def fulfill_help(help_id: str, helper_id: str = Query("u1")):
    helper = USERS_DB.get(helper_id, USERS_DB["u1"])
    for h in HELP_REQUESTS_DB:
        if h.id == help_id:
            if h.status == "Completed":
                raise HTTPException(status_code=400, detail="Bantuan ini telah pun diselesaikan.")
            h.status = "Completed"
            h.fulfilledBy = helper.name
            return h
    raise HTTPException(status_code=404, detail="Bantuan tidak dijumpai.")

@router.delete("/{help_id}")
def delete_help(help_id: str):
    global HELP_REQUESTS_DB
    for i, item in enumerate(HELP_REQUESTS_DB):
        if item.id == help_id:
            del HELP_REQUESTS_DB[i]
            return {"success": True, "message": "Help request deleted successfully"}
    raise HTTPException(status_code=404, detail="Help request not found")
