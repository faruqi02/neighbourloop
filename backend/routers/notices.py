import time
import uuid
import requests
from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from typing import List, Optional
from schemas import CommunityNotice, CommunityNoticeCreate

router = APIRouter(prefix="/notices", tags=["Community Notices & Announcements"])

APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzfZ19MpaNnKrMmgkwDGFhnZQ1Kjuo4n4UDM3rWcdHscIU9WesFKILxEGNlyH_hkJQv/exec"

NOTICES_CACHE = {
    "data": [],
    "last_fetched": 0
}
CACHE_TTL = 5.0  # 5 seconds fast cache

def sync_save_to_gas(payload: dict):
    try:
        res = requests.post(APPS_SCRIPT_URL, json=payload, timeout=60.0)
        print("GAS notice sync response:", res.status_code, res.text[:200])
    except Exception as e:
        print("Error saving notice to GAS:", e)

def format_gas_date(val: str) -> str:
    if not val:
        return "Hari Ini"
    val = str(val).strip()
    if "T" in val and len(val) >= 10:
        return val.split("T")[0]
    return val

def format_gas_time(val: str) -> str:
    if not val:
        return ""
    val = str(val).strip()
    if "T" in val:
        try:
            part = val.split("T")[1].split(".")[0]
            parts = part.split(":")
            if len(parts) >= 2:
                hh, mm = int(parts[0]), int(parts[1])
                ampm = "AM" if hh < 12 else "PM"
                h12 = hh if 1 <= hh <= 12 else (hh - 12 if hh > 12 else 12)
                return f"{h12:02d}:{mm:02d} {ampm}"
        except Exception:
            return val.split("T")[1].split(".")[0]
    return val

def format_gas_created(val: str) -> str:
    if not val:
        return "Baru sahaja"
    val = str(val).strip()
    if "T" in val:
        try:
            d_part = val.split("T")[0]
            t_part = val.split("T")[1][:5]
            return f"{d_part} {t_part}"
        except Exception:
            return val
    return val

@router.get("", response_model=List[CommunityNotice])
def get_community_notices(
    category: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[str] = None
):
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

                    raw_status = str(d.get("status") or "Approved").capitalize()
                    if raw_status not in ["Approved", "Pending", "Rejected"]:
                        raw_status = "Approved"

                    parsed.append(CommunityNotice(
                        id=str(d.get("id") or f"not_{uuid.uuid4().hex[:6]}"),
                        title=str(d.get("title") or "Notis Komuniti"),
                        category=cat,
                        description=str(d.get("description") or ""),
                        date=format_gas_date(d.get("date")),
                        time=format_gas_time(d.get("time")),
                        location=str(d.get("location") or ""),
                        organizer=str(d.get("organizer") or "Persatuan Penduduk"),
                        contactPerson=str(d.get("contactPerson") or ""),
                        isImportant=is_imp,
                        imageUrl=d.get("imageUrl") or None,
                        createdAt=format_gas_created(d.get("createdAt")),
                        status=raw_status,
                        authorId=str(d.get("authorId") or "") if d.get("authorId") else None,
                        authorName=str(d.get("authorName") or "") if d.get("authorName") else None
                    ))
                NOTICES_CACHE["data"] = parsed
                NOTICES_CACHE["last_fetched"] = now
        except Exception as e:
            print("Notice fetch err:", e)

    results = list(NOTICES_CACHE["data"])

    # Status filter logic
    if status and status.lower() == "all":
        # Return all (for admin portal)
        pass
    elif status:
        results = [n for n in results if (n.status or "Approved").lower() == status.lower()]
    else:
        # Default public feed: Approved notices + own pending notices if user_id provided
        if user_id:
            results = [
                n for n in results 
                if (n.status or "Approved") == "Approved" or (n.status == "Pending" and n.authorId == user_id)
            ]
        else:
            results = [n for n in results if (n.status or "Approved") == "Approved"]

    if category and category != "Semua":
        results = [n for n in results if n.category.lower() == category.lower()]
    return results

@router.post("", response_model=CommunityNotice)
def create_community_notice(data: CommunityNoticeCreate, background_tasks: BackgroundTasks):
    new_id = f"not_{uuid.uuid4().hex[:6]}"
    created_at = time.strftime("%Y-%m-%d %H:%M")
    notice_status = data.status or "Pending"

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
        "createdAt": created_at,
        "status": notice_status,
        "authorId": data.authorId or "",
        "authorName": data.authorName or ""
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
        createdAt=created_at,
        status=notice_status,
        authorId=data.authorId,
        authorName=data.authorName
    )

    NOTICES_CACHE["data"].insert(0, new_notice)
    background_tasks.add_task(sync_save_to_gas, {"action": "create", "sheet": "CommunityNotices", "data": row_data})

    return new_notice

@router.post("/{notice_id}/approve", response_model=CommunityNotice)
@router.put("/{notice_id}/approve", response_model=CommunityNotice)
def approve_community_notice(notice_id: str, background_tasks: BackgroundTasks):
    target = None
    for n in NOTICES_CACHE["data"]:
        if n.id == notice_id:
            n.status = "Approved"
            target = n
            break

    if not target:
        # If cache cold, fetch once
        get_community_notices(status="all")
        for n in NOTICES_CACHE["data"]:
            if n.id == notice_id:
                n.status = "Approved"
                target = n
                break

    if not target:
        raise HTTPException(status_code=404, detail="Notice not found")

    background_tasks.add_task(sync_save_to_gas, {
        "action": "update",
        "sheet": "CommunityNotices",
        "id": notice_id,
        "data": {"status": "Approved"}
    })
    return target

@router.post("/{notice_id}/reject", response_model=CommunityNotice)
@router.put("/{notice_id}/reject", response_model=CommunityNotice)
def reject_community_notice(notice_id: str, background_tasks: BackgroundTasks):
    target = None
    for n in NOTICES_CACHE["data"]:
        if n.id == notice_id:
            n.status = "Rejected"
            target = n
            break

    if not target:
        # If cache cold, fetch once
        get_community_notices(status="all")
        for n in NOTICES_CACHE["data"]:
            if n.id == notice_id:
                n.status = "Rejected"
                target = n
                break

    if not target:
        raise HTTPException(status_code=404, detail="Notice not found")

    background_tasks.add_task(sync_save_to_gas, {
        "action": "update",
        "sheet": "CommunityNotices",
        "id": notice_id,
        "data": {"status": "Rejected"}
    })
    return target

@router.delete("/{notice_id}")
def delete_community_notice(notice_id: str, background_tasks: BackgroundTasks):
    NOTICES_CACHE["data"] = [n for n in NOTICES_CACHE["data"] if n.id != notice_id]
    background_tasks.add_task(sync_save_to_gas, {"action": "delete", "sheet": "CommunityNotices", "id": notice_id})
    return {"success": True, "message": "Notice deleted successfully"}
