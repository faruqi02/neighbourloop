import time
import uuid
import requests
from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from typing import List, Optional
from schemas import CommunityNotice, CommunityNoticeCreate

router = APIRouter(prefix="/notices", tags=["Community Notices & Announcements"])

APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwitujRlYaYoxpd7UzD5Ieffo87pOarz_vTXwo9_mSPvf0cjcj9OHHUCIfUEQdjUQDU/exec"

NOTICES_CACHE = {
    "data": [],
    "last_fetched": 0
}
CACHE_TTL = 60.0

def sync_save_to_gas(payload: dict):
    try:
        requests.post(APPS_SCRIPT_URL, json=payload, timeout=60.0)
    except Exception as e:
        print("Error saving notice to GAS:", e)

@router.get("", response_model=List[CommunityNotice])
def get_community_notices(category: Optional[str] = Query(None, description="Category filter")):
    now = time.time()
    if (now - NOTICES_CACHE["last_fetched"] > CACHE_TTL) or not NOTICES_CACHE["data"]:
        try:
            res = requests.get(APPS_SCRIPT_URL, params={"sheet": "CommunityNotices"}, timeout=45.0)
            items = res.json()
            if isinstance(items, list):
                parsed = []
                for d in items:
                    if not d.get("id") and not d.get("title"):
                        continue
                    cat = d.get("category") or "Umum"
                    if cat not in ['Aktiviti', 'Keselamatan', 'Gotong-Royong', 'Penyelenggaraan', 'Umum']:
                        cat = "Umum"

                    raw_important = str(d.get("isImportant", "")).lower()
                    is_imp = raw_important in ["true", "1", "yes"]

                    parsed.append(CommunityNotice(
                        id=str(d.get("id") or f"not_{uuid.uuid4().hex[:6]}"),
                        title=str(d.get("title") or "Notis Komuniti"),
                        category=cat,
                        description=str(d.get("description") or ""),
                        date=str(d.get("date") or "Hari Ini"),
                        time=str(d.get("time") or ""),
                        location=str(d.get("location") or ""),
                        organizer=str(d.get("organizer") or "Persatuan Penduduk"),
                        contactPerson=str(d.get("contactPerson") or ""),
                        isImportant=is_imp,
                        imageUrl=d.get("imageUrl") or None,
                        createdAt=str(d.get("createdAt") or "Baru sahaja")
                    ))
                NOTICES_CACHE["data"] = parsed
                NOTICES_CACHE["last_fetched"] = now
        except Exception as e:
            print("Notice fetch err:", e)

    results = list(NOTICES_CACHE["data"])
    if category and category != "Semua":
        results = [n for n in results if n.category.lower() == category.lower()]
    return results

@router.post("", response_model=CommunityNotice)
def create_community_notice(data: CommunityNoticeCreate, background_tasks: BackgroundTasks):
    new_id = f"not_{uuid.uuid4().hex[:6]}"
    created_at = time.strftime("%Y-%m-%d %H:%M")

    row_data = {
        "id": new_id,
        "title": data.title,
        "category": data.category,
        "description": data.description,
        "date": data.date,
        "time": data.time,
        "location": data.location,
        "organizer": data.organizer,
        "contactPerson": data.contactPerson or "",
        "isImportant": "TRUE" if data.isImportant else "FALSE",
        "imageUrl": data.imageUrl or "",
        "createdAt": created_at
    }

    new_notice = CommunityNotice(
        id=new_id,
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
        createdAt=created_at
    )

    NOTICES_CACHE["data"].insert(0, new_notice)
    background_tasks.add_task(sync_save_to_gas, {"sheet": "CommunityNotices", "data": row_data})

    return new_notice

@router.delete("/{notice_id}")
def delete_community_notice(notice_id: str, background_tasks: BackgroundTasks):
    NOTICES_CACHE["data"] = [n for n in NOTICES_CACHE["data"] if n.id != notice_id]
    background_tasks.add_task(sync_save_to_gas, {"action": "delete", "sheet": "CommunityNotices", "id": notice_id})
    return {"success": True, "message": "Notice deleted successfully"}
