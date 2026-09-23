import time
import uuid
import requests
from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from typing import List, Optional
from schemas import Listing, ListingCreate

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])

APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwitujRlYaYoxpd7UzD5Ieffo87pOarz_vTXwo9_mSPvf0cjcj9OHHUCIfUEQdjUQDU/exec"

MARKET_CACHE = {
    "data": [],
    "last_fetched": 0
}
CACHE_TTL = 60.0  # 60 seconds

def sync_save_to_gas(payload: dict):
    try:
        requests.post(APPS_SCRIPT_URL, json=payload, timeout=60.0)
    except Exception as e:
        print("Error saving to GAS:", e)

@router.get("", response_model=List[Listing])
def get_listings(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search keyword"),
    max_distance: Optional[float] = Query(None, description="Max radius in km")
):
    now = time.time()
    if (now - MARKET_CACHE["last_fetched"] > CACHE_TTL) or not MARKET_CACHE["data"]:
        try:
            res = requests.get(APPS_SCRIPT_URL, params={"sheet": "Listings"}, timeout=45.0)
            items = res.json()
            if isinstance(items, list):
                parsed = []
                for d in items:
                    if not d.get("id") and not d.get("title"):
                        continue
                    try:
                        raw_price = d.get("price", 0)
                        try:
                            price = float(raw_price) if raw_price != "" else 0.0
                        except Exception:
                            price = 0.0

                        raw_dist = d.get("distance", 1.0)
                        try:
                            dist = float(raw_dist) if raw_dist != "" else 1.0
                        except Exception:
                            dist = 1.0

                        cat = d.get("category") or "Lain-lain"
                        if cat not in ['Semua', 'Perabot', 'Elektronik', 'Pakaian', 'Lain-lain']:
                            cat = "Lain-lain"

                        cond = d.get("condition") or "Terpakai"
                        if cond not in ['Baru', 'Seperti Baru', 'Terpakai']:
                            cond = "Terpakai"

                        parsed.append(Listing(
                            id=str(d.get("id") or f"l_{uuid.uuid4().hex[:6]}"),
                            title=str(d.get("title") or "Barangan"),
                            description=str(d.get("description") or ""),
                            price=price,
                            category=cat,
                            condition=cond,
                            distance=dist,
                            imageUrl=str(d.get("imageUrl") or "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400"),
                            sellerId=str(d.get("sellerId") or "u1"),
                            sellerName=str(d.get("sellerName") or "Jiran"),
                            sellerPhone=str(d.get("sellerPhone") or ""),
                            sellerContactNotes=str(d.get("sellerContactNotes") or ""),
                            createdAt=str(d.get("createdAt") or "Baru sahaja")
                        ))
                    except Exception as err:
                        print("Row parse err:", err)

                MARKET_CACHE["data"] = parsed
                MARKET_CACHE["last_fetched"] = now
        except Exception as e:
            print(f"Error fetching listings: {e}")

    results = list(MARKET_CACHE["data"])
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
    listings = get_listings()
    for item in listings:
        if item.id == listing_id:
            return item
    raise HTTPException(status_code=404, detail="Listing not found")

@router.post("", response_model=Listing)
def create_listing(data: ListingCreate, background_tasks: BackgroundTasks, user_id: str = Query("u1")):
    seller_name = "Jiran"
    seller_phone = data.sellerPhone or ""

    new_id = f"l_{uuid.uuid4().hex[:8]}"
    created_at = time.strftime("%Y-%m-%d %H:%M")
    img_url = data.imageUrl or "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400"

    row_data = {
        "id": new_id,
        "title": data.title,
        "description": data.description,
        "price": data.price,
        "category": data.category,
        "condition": data.condition,
        "distance": 0.5,
        "imageUrl": img_url,
        "sellerId": user_id,
        "sellerName": seller_name,
        "sellerPhone": seller_phone,
        "sellerContactNotes": data.sellerContactNotes or "",
        "createdAt": created_at
    }

    new_item = Listing(**row_data)

    # Immediately cache so it shows on frontend without waiting
    MARKET_CACHE["data"].insert(0, new_item)

    # Asynchronously save to Google Sheets in background
    background_tasks.add_task(sync_save_to_gas, {"action": "create", "sheet": "Listings", "data": row_data})

    return new_item

@router.delete("/{listing_id}")
def delete_listing(listing_id: str, background_tasks: BackgroundTasks):
    MARKET_CACHE["data"] = [item for item in MARKET_CACHE["data"] if item.id != listing_id]
    background_tasks.add_task(sync_save_to_gas, {"action": "delete", "sheet": "Listings", "id": listing_id})
    return {"success": True, "message": "Listing deleted successfully"}
