from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from schemas import Listing, ListingCreate
from database import LISTINGS_DB, USERS_DB
import uuid

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])

@router.get("", response_model=List[Listing])
def get_listings(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search keyword"),
    max_distance: Optional[float] = Query(None, description="Max radius in km")
):
    results = LISTINGS_DB
    if category and category != "Semua":
        results = [item for item in results if item.category.lower() == category.lower()]
    if search:
        s = search.lower()
        results = [item for item in results if s in item.title.lower() or s in item.description.lower()]
    if max_distance:
        results = [item for item in results if item.distance <= max_distance]
    return results

@router.get("/{listing_id}", response_model=Listing)
def get_listing(listing_id: str):
    for item in LISTINGS_DB:
        if item.id == listing_id:
            return item
    raise HTTPException(status_code=404, detail="Listing not found")

@router.post("", response_model=Listing)
def create_listing(data: ListingCreate, user_id: str = Query("u1")):
    user = USERS_DB.get(user_id, USERS_DB["u1"])
    
    img_url = data.imageUrl or "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400"
    
    new_listing = Listing(
        id=f"l{uuid.uuid4().hex[:6]}",
        title=data.title,
        description=data.description,
        price=data.price,
        category=data.category,
        condition=data.condition,
        distance=0.5,
        imageUrl=img_url,
        sellerId=user.id,
        sellerName=user.name,
        sellerPhone=data.sellerPhone or user.phone,
        sellerContactNotes=data.sellerContactNotes or user.contactNotes,
        createdAt="Baru sahaja"
    )
    LISTINGS_DB.insert(0, new_listing)
    return new_listing

@router.delete("/{listing_id}")
def delete_listing(listing_id: str):
    global LISTINGS_DB
    for i, item in enumerate(LISTINGS_DB):
        if item.id == listing_id:
            del LISTINGS_DB[i]
            return {"success": True, "message": "Listing deleted successfully"}
    raise HTTPException(status_code=404, detail="Listing not found")
