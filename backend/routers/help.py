import time
import uuid
import requests
from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from typing import List, Optional
from schemas import HelpRequest, HelpCreate

router = APIRouter(prefix="/help", tags=["Help Nearby"])

APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwitujRlYaYoxpd7UzD5Ieffo87pOarz_vTXwo9_mSPvf0cjcj9OHHUCIfUEQdjUQDU/exec"

HELP_CACHE = {
    "data": [],
    "last_fetched": 0
}
CACHE_TTL = 60.0

def sync_save_to_gas(payload: dict):
    try:
        requests.post(APPS_SCRIPT_URL, json=payload, timeout=60.0)
    except Exception as e:
        print("Error saving to GAS:", e)

@router.get("", response_model=List[HelpRequest])
def get_help_items(
    type_filter: Optional[str] = Query(None, description="request or offer"),
    category: Optional[str] = Query(None, description="Category filter"),
    max_distance: Optional[float] = Query(None, description="Max radius in km")
):
    now = time.time()
    if (now - HELP_CACHE["last_fetched"] > CACHE_TTL) or not HELP_CACHE["data"]:
        try:
            res = requests.get(APPS_SCRIPT_URL, params={"sheet": "HelpRequests"}, timeout=45.0)
            items = res.json()
            if isinstance(items, list):
                parsed = []
                for d in items:
                    if not d.get("id") and not d.get("title"):
                        continue

                    raw_dist = d.get("distance", 0.5)
                    try:
                        dist = float(raw_dist) if raw_dist != "" else 0.5
                    except Exception:
                        dist = 0.5

                    t = d.get("type") or "request"
                    if t.lower() not in ["request", "offer"]:
                        t = "request"
                    else:
                        t = t.lower()

                    st = d.get("status") or "Open"
                    if st not in ["Open", "In Progress", "Completed"]:
                        st = "Open"

                    cat = d.get("category") or "Lain-lain"
                    if cat not in ['Semua', 'Pinjam Barang', 'Khidmat/Tenaga', 'Kecemasan', 'Lain-lain']:
                        cat = "Lain-lain"

                    parsed.append(HelpRequest(
                        id=str(d.get("id") or f"h_{uuid.uuid4().hex[:6]}"),
                        title=str(d.get("title") or "Bantuan"),
                        description=str(d.get("description") or ""),
                        category=cat,
                        distance=dist,
                        type=t,
                        requesterId=str(d.get("requesterId") or "u1"),
                        requesterName=str(d.get("requesterName") or "Jiran"),
                        requesterPhone=str(d.get("requesterPhone") or ""),
                        requesterContactNotes=str(d.get("requesterContactNotes") or ""),
                        imageUrl=d.get("imageUrl") or None,
                        status=st,
                        fulfilledBy=d.get("fulfilledBy") or None,
                        createdAt=str(d.get("createdAt") or "Baru sahaja")
                    ))
                HELP_CACHE["data"] = parsed
                HELP_CACHE["last_fetched"] = now
        except Exception as e:
            print(f"Error fetching help requests: {e}")

    results = list(HELP_CACHE["data"])
    if type_filter and type_filter != "Semua":
        results = [h for h in results if h.type == type_filter.lower()]
    if category and category != "Semua":
        results = [h for h in results if h.category.lower() == category.lower()]
    if max_distance:
        results = [h for h in results if h.distance <= max_distance]
    return results

@router.post("", response_model=HelpRequest)
def create_help_item(data: HelpCreate, background_tasks: BackgroundTasks, user_id: str = Query("u1")):
    new_id = f"h_{uuid.uuid4().hex[:8]}"
    created_at = time.strftime("%Y-%m-%d %H:%M")

    row_data = {
        "id": new_id,
        "title": data.title,
        "description": data.description,
        "category": data.category,
        "type": data.type.lower(),
        "distance": 0.5,
        "requesterId": user_id,
        "requesterName": "Jiran",
        "requesterPhone": data.requesterPhone or "",
        "requesterContactNotes": data.requesterContactNotes or "",
        "imageUrl": data.imageUrl or "",
        "status": "Open"
    }

    new_item = HelpRequest(**row_data, createdAt=created_at)

    HELP_CACHE["data"].insert(0, new_item)
    background_tasks.add_task(sync_save_to_gas, {"sheet": "HelpRequests", "data": row_data})

    return new_item

@router.post("/{help_id}/fulfill", response_model=HelpRequest)
def fulfill_help(help_id: str, background_tasks: BackgroundTasks, helper_id: str = Query("u1")):
    target = None
    for h in HELP_CACHE["data"]:
        if h.id == help_id:
            h.status = "Completed"
            target = h
            break

    if not target:
        target = HelpRequest(
            id=help_id,
            title="Bantuan",
            description="",
            category="Pinjam Barang",
            distance=0.5,
            type="request",
            requesterId="u1",
            requesterName="Jiran",
            status="Completed",
            createdAt="Baru sahaja"
        )

    background_tasks.add_task(sync_save_to_gas, {
        "sheet": "HelpRequests",
        "action": "update",
        "id": help_id,
        "data": {
            "status": "Completed"
        }
    })

    return target

@router.delete("/{help_id}")
def delete_help(help_id: str, background_tasks: BackgroundTasks):
    HELP_CACHE["data"] = [h for h in HELP_CACHE["data"] if h.id != help_id]
    background_tasks.add_task(sync_save_to_gas, {"action": "delete", "sheet": "HelpRequests", "id": help_id})
    return {"success": True, "message": "Bantuan berjaya dipadam"}
