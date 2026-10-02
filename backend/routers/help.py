import time
import uuid
import requests
from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from typing import List, Optional
from schemas import HelpRequest, HelpCreate

router = APIRouter(prefix="/help", tags=["Help Nearby"])

APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzfZ19MpaNnKrMmgkwDGFhnZQ1Kjuo4n4UDM3rWcdHscIU9WesFKILxEGNlyH_hkJQv/exec"

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

                    raw_type = str(d.get("type") or "").strip().lower()
                    if raw_type in ["tawaran", "offer"]:
                        t = "Tawaran"
                    else:
                        t = "Permintaan"

                    st = str(d.get("status") or "Open").strip()
                    is_blk = (st.lower() in ["disekat", "blocked"] or d.get("isBlocked") in [True, "true", "True", 1, "1"])
                    if is_blk:
                        st = "Disekat"
                    elif st not in ["Open", "In Progress", "Completed"]:
                        st = "Open"

                    cat = str(d.get("category") or "Lain-lain").strip()

                    req_name = str(d.get("requesterName") or "Jiran").strip().lstrip('@')
                    if not req_name:
                        req_name = "Jiran"

                    parsed.append(HelpRequest(
                        id=str(d.get("id") or f"h_{uuid.uuid4().hex[:6]}"),
                        title=str(d.get("title") or "Bantuan"),
                        description=str(d.get("description") or ""),
                        category=cat,
                        distance=dist,
                        type=t,
                        requesterId=str(d.get("requesterId") or "u1"),
                        requesterName=req_name,
                        requesterPhone=str(d.get("requesterPhone") or ""),
                        requesterContactNotes=str(d.get("requesterContactNotes") or ""),
                        imageUrl=d.get("imageUrl") or None,
                        status=st,
                        isBlocked=is_blk,
                        fulfilledBy=d.get("fulfilledBy") or None,
                        createdAt=str(d.get("createdAt") or "Baru sahaja")
                    ))
                HELP_CACHE["data"] = parsed
                HELP_CACHE["last_fetched"] = now
        except Exception as e:
            print(f"Error fetching help requests: {e}")

    results = list(HELP_CACHE["data"])
    if type_filter and type_filter != "Semua":
        tf = type_filter.strip().lower()
        if tf in ["tawaran", "offer"]:
            results = [h for h in results if h.type.lower() in ["tawaran", "offer"]]
        elif tf in ["permintaan", "request"]:
            results = [h for h in results if h.type.lower() in ["permintaan", "request"]]
        else:
            results = [h for h in results if h.type.lower() == tf]

    if category and category != "Semua":
        results = [h for h in results if h.category.lower() == category.lower()]
    if max_distance:
        results = [h for h in results if h.distance <= max_distance]
    return results

@router.post("", response_model=HelpRequest)
def create_help_item(data: HelpCreate, background_tasks: BackgroundTasks, user_id: str = Query("u1")):
    new_id = f"h_{uuid.uuid4().hex[:8]}"
    created_at = time.strftime("%Y-%m-%d %H:%M")

    req_id = data.requesterId or user_id or "u1"

    # 1. Resolve requester username / name
    req_name = data.requesterName
    if not req_name or req_name == "Jiran":
        try:
            user_resp = requests.get(APPS_SCRIPT_URL, params={"sheet": "Users", "id": req_id}, timeout=10.0)
            u = user_resp.json()
            if isinstance(u, dict) and u.get("id"):
                req_name = u.get("username") or u.get("name") or "Jiran"
        except Exception:
            req_name = "Jiran"

    if req_name:
        req_name = str(req_name).strip().lstrip('@')
    else:
        req_name = "Jiran"

    # 2. Normalize type
    raw_type = str(data.type or "").strip().lower()
    t = "Tawaran" if raw_type in ["tawaran", "offer"] else "Permintaan"

    # 3. Upload image to Google Drive if base64 data is provided
    img_url = data.imageUrl or ""
    base64_data = data.imageBase64
    if not base64_data and img_url and img_url.startswith("data:image"):
        base64_data = img_url

    if base64_data:
        try:
            upload_payload = {
                "action": "upload_file",
                "base64": base64_data,
                "filename": f"help_{new_id}_{int(time.time())}.jpg",
                "mimeType": "image/jpeg"
            }
            up_res = requests.post(APPS_SCRIPT_URL, json=upload_payload, timeout=60.0)
            up_json = up_res.json()
            if isinstance(up_json, dict):
                if up_json.get("url"):
                    img_url = up_json["url"]
                elif up_json.get("fileId"):
                    img_url = f"https://lh3.googleusercontent.com/d/{up_json['fileId']}"
        except Exception as e:
            print("Error uploading help image to Google Drive:", e)

    dist = data.distance if data.distance is not None else 0.5

    row_data = {
        "id": new_id,
        "title": data.title,
        "description": data.description,
        "category": data.category,
        "type": t,
        "distance": dist,
        "requesterId": req_id,
        "requesterName": req_name,
        "requesterPhone": data.requesterPhone or "",
        "requesterContactNotes": data.requesterContactNotes or "",
        "imageUrl": img_url,
        "status": "Open",
        "fulfilledBy": "",
        "createdAt": created_at
    }

    new_item = HelpRequest(**row_data)

    HELP_CACHE["data"].insert(0, new_item)
    background_tasks.add_task(sync_save_to_gas, {"action": "create", "sheet": "HelpRequests", "data": row_data})

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
            type="Permintaan",
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

@router.put("/{help_id}/block")
@router.post("/{help_id}/block")
def toggle_block_help(
    help_id: str, 
    background_tasks: BackgroundTasks, 
    block: Optional[bool] = Query(None, description="Explicitly set block status true/false")
):
    found = False
    new_is_blocked = True
    new_status = "Disekat"

    for item in HELP_CACHE["data"]:
        if item.id == help_id:
            current_blocked = bool(getattr(item, "isBlocked", False) or getattr(item, "status", "") == "Disekat")
            if block is not None:
                new_is_blocked = bool(block)
            else:
                new_is_blocked = not current_blocked
            
            new_status = "Disekat" if new_is_blocked else "Open"
            item.status = new_status
            item.isBlocked = new_is_blocked
            found = True
            break

    if not found:
        new_is_blocked = True if block is None or block else False
        new_status = "Disekat" if new_is_blocked else "Open"

    background_tasks.add_task(sync_save_to_gas, {
        "action": "update", 
        "sheet": "HelpRequests", 
        "id": help_id, 
        "data": {"status": new_status, "isBlocked": new_is_blocked}
    })

    return {
        "success": True, 
        "id": help_id, 
        "status": new_status, 
        "isBlocked": new_is_blocked,
        "message": f"Bantuan telah {'disekat' if new_is_blocked else 'dinyahsekat'}."
    }
