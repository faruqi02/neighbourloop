import time
import uuid
import requests
from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from typing import List, Optional
from schemas import (
    RecycleCenter, DonationItem, DonationCreate, 
    SmartRecommendRequest, SmartRecommendResponse
)

router = APIRouter(prefix="/recycle", tags=["Smart Recycling & Donation"])

APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzfZ19MpaNnKrMmgkwDGFhnZQ1Kjuo4n4UDM3rWcdHscIU9WesFKILxEGNlyH_hkJQv/exec"

RECYCLE_CACHE = {
    "centers": [],
    "centers_last_fetched": 0,
    "donations": [],
    "donations_last_fetched": 0
}
CACHE_TTL = 60.0

DAMANSARA_PJ_CENTERS = [
    RecycleCenter(
        id="c_pj_1",
        name="Pusat Kitar Semula Komuniti MBPJ Kota Damansara",
        type="RecycleCenter",
        address="Jalan Cecawi 6/19, Seksyen 6 Kota Damansara, Petaling Jaya",
        distance=1.2,
        contactPhone="03-79563544",
        operatingHours="Isnin - Sabtu: 8:00 AM - 5:00 PM",
        coordinates={"latitude": 3.1578, "longitude": 101.5901},
        typesAccepted=["Kertas & Buku", "Plastik", "Logam & Besi", "Kaca", "Pakaian & Tekstil"]
    ),
    RecycleCenter(
        id="c_pj_2",
        name="IPC Recycling & Waste Drop-off (Mutiara Damansara)",
        type="RecycleCenter",
        address="IPC Shopping Centre, Mutiara Damansara, Petaling Jaya",
        distance=1.8,
        contactPhone="03-77300333",
        operatingHours="Setiap Hari: 10:00 AM - 10:00 PM",
        coordinates={"latitude": 3.1565, "longitude": 101.6120},
        typesAccepted=["Kertas & Buku", "Plastik", "E-waste & Elektronik", "Logam & Besi", "Kaca"]
    ),
    RecycleCenter(
        id="c_pj_3",
        name="Pusat Pengumpulan E-Waste Petaling Jaya & Damansara",
        type="RecycleCenter",
        address="Pusat Bandar Damansara / SS2, Petaling Jaya",
        distance=2.5,
        contactPhone="03-77281234",
        operatingHours="Setiap Hari: 9:00 AM - 6:00 PM",
        coordinates={"latitude": 3.1480, "longitude": 101.6150},
        typesAccepted=["E-waste & Elektronik", "Logam & Besi"]
    ),
    RecycleCenter(
        id="c_pj_4",
        name="Pertubuhan Kebajikan & Sumbangan Prihatin Damansara",
        type="NGO",
        address="No. 8, Jalan PJU 5/20, The Strand, Kota Damansara, Petaling Jaya",
        distance=1.5,
        contactPhone="012-3891122",
        operatingHours="Selasa - Ahad: 10:00 AM - 4:00 PM",
        coordinates={"latitude": 3.1530, "longitude": 101.5940},
        typesAccepted=["Pakaian & Tekstil", "Buku", "Perabot & Rumah"]
    ),
    RecycleCenter(
        id="c_pj_5",
        name="Pusat Jagaan Kasih & Derma Rezeki Komuniti PJ",
        type="NGO",
        address="Jalan 14/1, Seksyen 14, Petaling Jaya",
        distance=3.2,
        contactPhone="03-79552211",
        operatingHours="Isnin - Jumaat: 9:00 AM - 5:00 PM",
        coordinates={"latitude": 3.1110, "longitude": 101.6310},
        typesAccepted=["Pakaian & Tekstil", "Barangan Dapur", "Alat Tulis"]
    )
]

BEHRANG_TM_CENTERS = [
    RecycleCenter(
        id="c_tm_1",
        name="Pusat Kitar Semula Komuniti Behrang Sentral",
        type="RecycleCenter",
        address="Jalan Sentral 2, Behrang Sentral, Perak",
        distance=1.0,
        contactPhone="05-4591234",
        operatingHours="Isnin - Sabtu: 8:00 AM - 5:00 PM",
        coordinates={"latitude": 3.7512, "longitude": 101.4551},
        typesAccepted=["Kertas & Buku", "Plastik", "Logam & Besi", "Kaca", "Pakaian & Tekstil"]
    ),
    RecycleCenter(
        id="c_tm_2",
        name="Pusat Pengumpulan Barangan Kitar Semula UPSI Tanjung Malim",
        type="RecycleCenter",
        address="Kampus Sultan Azlan Shah, Tanjung Malim, Perak",
        distance=2.8,
        contactPhone="05-4506000",
        operatingHours="Isnin - Jumaat: 8:30 AM - 4:30 PM",
        coordinates={"latitude": 3.6833, "longitude": 101.5167},
        typesAccepted=["E-waste & Elektronik", "Kertas & Buku", "Logam & Besi"]
    ),
    RecycleCenter(
        id="c_tm_3",
        name="Pusat Pengumpulan E-Waste & Logam Slim River",
        type="RecycleCenter",
        address="Pekan Slim River, Perak",
        distance=4.2,
        contactPhone="05-4528899",
        operatingHours="Setiap Hari: 9:00 AM - 6:00 PM",
        coordinates={"latitude": 3.8333, "longitude": 101.4000},
        typesAccepted=["E-waste & Elektronik", "Logam & Besi"]
    ),
    RecycleCenter(
        id="c_tm_4",
        name="Pusat Kebajikan & Sumbangan Komuniti Muallim",
        type="NGO",
        address="Taman Universiti, Tanjung Malim, Perak",
        distance=2.2,
        contactPhone="019-5511223",
        operatingHours="Selasa - Ahad: 10:00 AM - 4:00 PM",
        coordinates={"latitude": 3.6900, "longitude": 101.5200},
        typesAccepted=["Pakaian & Tekstil", "Buku", "Perabot & Rumah"]
    ),
    RecycleCenter(
        id="c_tm_5",
        name="Pusat Jagaan Kasih & Prihatin Behrang 2020",
        type="NGO",
        address="Bandar Baru Behrang 2020, Perak",
        distance=1.4,
        contactPhone="011-33221144",
        operatingHours="Isnin - Jumaat: 9:00 AM - 5:00 PM",
        coordinates={"latitude": 3.7400, "longitude": 101.4420},
        typesAccepted=["Pakaian & Tekstil", "Barangan Dapur", "Alat Tulis"]
    )
]

JOHOR_CENTERS = [
    RecycleCenter(
        id="c_jb_pelangi",
        name="Pusat Kitar Semula Komuniti Taman Pelangi JB",
        type="RecycleCenter",
        address="Jalan Kuning, Taman Pelangi, 80400 Johor Bahru, Johor",
        distance=0.8,
        contactPhone="07-3331234",
        operatingHours="Isnin - Sabtu: 8:00 AM - 5:00 PM",
        coordinates={"latitude": 1.4815, "longitude": 103.7712},
        typesAccepted=["Kertas & Buku", "Plastik", "Logam & Besi", "Kaca", "Pakaian & Tekstil"]
    ),
    RecycleCenter(
        id="c_jb_ngo_pelangi",
        name="Pertubuhan Kebajikan & Pusat Derma Prihatin Pelangi",
        type="NGO",
        address="Jalan Serampang, Taman Pelangi, 80400 Johor Bahru, Johor",
        distance=1.1,
        contactPhone="012-7890123",
        operatingHours="Selasa - Ahad: 10:00 AM - 5:00 PM",
        coordinates={"latitude": 1.4852, "longitude": 103.7680},
        typesAccepted=["Pakaian & Tekstil", "Buku", "Perabot & Rumah", "Barangan Dapur"]
    ),
    RecycleCenter(
        id="c1",
        name="Pusat Kitar Semula Komuniti Skudai",
        type="RecycleCenter",
        address="Jalan Kebudayaan 16, Taman Universiti, Skudai",
        distance=1.8,
        contactPhone="07-5211234",
        operatingHours="Isnin - Sabtu: 8:00 AM - 5:00 PM",
        coordinates={"latitude": 1.5366, "longitude": 103.6599},
        typesAccepted=["Kertas & Buku", "Plastik", "Logam & Besi", "Kaca", "Pakaian & Tekstil"]
    ),
    RecycleCenter(
        id="c2",
        name="Pusat Pengumpulan E-Waste Johor Bahru",
        type="RecycleCenter",
        address="Kompleks Kraftangan, Jalan Skudai, Johor Bahru",
        distance=3.5,
        contactPhone="07-2234567",
        operatingHours="Setiap Hari: 9:00 AM - 6:00 PM",
        coordinates={"latitude": 1.4927, "longitude": 103.7414},
        typesAccepted=["E-waste & Elektronik", "Logam & Besi"]
    ),
    RecycleCenter(
        id="c3",
        name="Pertubuhan Kebajikan & Derma Prihatin JB",
        type="NGO",
        address="No. 12, Jalan Pulai Perdana 3, Kangkar Pulai",
        distance=2.4,
        contactPhone="019-7788990",
        operatingHours="Selasa - Ahad: 10:00 AM - 4:00 PM",
        coordinates={"latitude": 1.5588, "longitude": 103.6122},
        typesAccepted=["Pakaian & Tekstil", "Buku", "Perabot & Rumah"]
    ),
    RecycleCenter(
        id="c4",
        name="Pusat Jagaan Kasih & Sumbangan Komuniti",
        type="NGO",
        address="Jalan Flora 1, Taman Pulai Flora, Skudai",
        distance=1.2,
        contactPhone="011-22334455",
        operatingHours="Isnin - Jumaat: 9:00 AM - 5:00 PM",
        coordinates={"latitude": 1.5412, "longitude": 103.6421},
        typesAccepted=["Pakaian & Tekstil", "Barangan Dapur", "Alat Tulis"]
    )
]

ALL_SYSTEM_CENTERS = DAMANSARA_PJ_CENTERS + BEHRANG_TM_CENTERS + JOHOR_CENTERS

DEFAULT_CENTERS = JOHOR_CENTERS

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    import math
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

def resolve_centers_for_user(
    user_location: Optional[str] = None, 
    lat: Optional[float] = None, 
    lng: Optional[float] = None, 
    radius_km: Optional[float] = None
) -> List[RecycleCenter]:
    loc_lower = (user_location or "").lower()

    # 1. If GPS coordinates (lat, lng) are provided, calculate exact distance to ALL known centers in the system
    # and return only the nearest centers, sorted strictly from nearest to farthest!
    if lat is not None and lng is not None and not (lat == 0 and lng == 0):
        centers_with_dist = []
        for c in ALL_SYSTEM_CENTERS:
            c_copy = c.copy()
            if c_copy.coordinates and "latitude" in c_copy.coordinates and "longitude" in c_copy.coordinates:
                c_copy.distance = haversine_distance(lat, lng, c_copy.coordinates["latitude"], c_copy.coordinates["longitude"])
                centers_with_dist.append(c_copy)
        
        # Sort strictly from nearest to farthest
        centers_with_dist.sort(key=lambda x: x.distance)

        # If the nearest center is reasonably close (e.g. within 50km or radius_km), filter by radius
        limit_r = radius_km if (radius_km and radius_km > 0) else 50.0
        nearby = [c for c in centers_with_dist if c.distance <= limit_r]
        if nearby:
            return nearby
        # Otherwise return the closest 5 centers so the user always sees the nearest ones
        return centers_with_dist[:5]

    # 2. If no GPS coordinates, resolve based on location text
    # Check Johor / JB / Pelangi first (matches Taman Pelangi, Johor Bahru, Skudai, etc.)
    if any(k in loc_lower for k in ["pelangi", "johor", "jb", "skudai", "iskandar", "pulai", "tebrau", "stulang", "tampoi"]):
        selected = [c.copy() for c in JOHOR_CENTERS]
    elif any(k in loc_lower for k in ["behrang", "tanjung malim", "slim river", "muallim", "perak"]):
        selected = [c.copy() for c in BEHRANG_TM_CENTERS]
    elif any(k in loc_lower for k in ["damansara", "petaling", "pj", "kelana", "subang", "shah alam", "selangor", "kl", "kuala lumpur"]):
        selected = [c.copy() for c in DAMANSARA_PJ_CENTERS]
    else:
        # Default fallback to Johor centers if user didn't specify
        clean_loc = (user_location or "Johor Bahru").strip()
        selected = [c.copy() for c in JOHOR_CENTERS]

    # Sort ascending by distance (nearest to farthest)
    selected.sort(key=lambda x: x.distance)
    return selected

def sync_save_to_gas(payload: dict):
    try:
        requests.post(APPS_SCRIPT_URL, json=payload, timeout=60.0)
    except Exception as e:
        print("Error saving to GAS:", e)

@router.post("/recommend", response_model=SmartRecommendResponse)
def get_smart_recommendation(data: SmartRecommendRequest):
    is_good_condition = "elok" in data.condition.lower()
    cat_lower = data.category.lower()

    centers = resolve_centers_for_user(
        user_location=data.userLocation,
        lat=data.lat,
        lng=data.lng,
        radius_km=data.radiusKm
    )

    if is_good_condition:
        decision = "Derma"
        title = "Cadangan Pintar: Sesuai untuk Didermakan atau Dijual"
        explanation = (
            f"Barang '{data.itemName}' masih dalam keadaan elok! "
            f"Anda disyorkan untuk mendermakannya kepada NGO atau komuniti setempat "
            f"melalui 'Barang Derma (Claim)', atau menjualnya di Marketplace sebelum dilupuskan."
        )
        suggested_actions = ["NGO", "Komuniti", "Marketplace"]
        matching = [c for c in centers if c.type == "NGO"]
    else:
        decision = "Recycle"
        title = "Cadangan Pintar: Hantar ke Pusat Kitar Semula"
        if "e-waste" in cat_lower or "elektronik" in cat_lower or "telefon" in data.itemName.lower():
            explanation = (
                f"Barang '{data.itemName}' dikategorikan sebagai E-Waste berbahaya jika dibuang ke tapak pelupusan. "
                f"Sila hantar ke pusat pengumpulan E-Waste berdekatan untuk pengasingan komponen logam berharga."
            )
        else:
            explanation = (
                f"Barang '{data.itemName}' yang rosak boleh dikitar semula menjadi bahan mentah baru. "
                f"Sila rujuk pusat kitar semula berdekatan yang menerima kategori '{data.category}'."
            )
        suggested_actions = ["RecycleCenter"]
        matching = [c for c in centers if c.type == "RecycleCenter"]

    return SmartRecommendResponse(
        decision=decision,
        title=title,
        explanation=explanation,
        suggestedActions=suggested_actions,
        matchingCenters=matching,
    )

@router.get("/centers", response_model=List[RecycleCenter])
def get_recycle_centers(
    center_type: Optional[str] = Query(None, description="Filter: RecycleCenter or NGO"),
    accepted_type: Optional[str] = Query(None, description="Material accepted"),
    user_location: Optional[str] = Query(None, description="User current neighborhood/location"),
    lat: Optional[float] = Query(None, description="User latitude"),
    lng: Optional[float] = Query(None, description="User longitude"),
    radius_km: Optional[float] = Query(None, description="Search radius in KM")
):
    results = resolve_centers_for_user(
        user_location=user_location,
        lat=lat,
        lng=lng,
        radius_km=radius_km
    )

    if center_type and center_type != "Semua":
        results = [c for c in results if c.type == center_type]
    if accepted_type:
        results = [c for c in results if any(accepted_type.lower() in t.lower() for t in c.typesAccepted)]
    return results

@router.get("/donations", response_model=List[DonationItem])
def get_donations(status: Optional[str] = Query(None, description="Available or Claimed")):
    now = time.time()
    if (now - RECYCLE_CACHE["donations_last_fetched"] > CACHE_TTL) or not RECYCLE_CACHE["donations"]:
        try:
            res = requests.get(APPS_SCRIPT_URL, params={"sheet": "Donations"}, timeout=45.0)
            items = res.json()
            if isinstance(items, list):
                parsed = []
                for d in items:
                    if not d.get("id") and not d.get("title"):
                        continue
                    raw_dist = d.get("distance", 0.5)
                    try:
                        dist = float(raw_dist) if raw_dist != "" else 0.5
                    except:
                        dist = 0.5

                    st = str(d.get("status") or "Available").strip()
                    is_blk = (st.lower() in ["disekat", "blocked"] or d.get("isBlocked") in [True, "true", "True", 1, "1"])
                    if is_blk:
                        st = "Disekat"
                    elif st.capitalize() in ["Available", "Claimed"]:
                        st = st.capitalize()
                    else:
                        st = "Available"

                    raw_img = str(d.get("imageUrl") or "").strip()
                    if not raw_img or raw_img.startswith("file:") or raw_img.startswith("blob:"):
                        raw_img = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400"

                    parsed.append(DonationItem(
                        id=str(d.get("id") or f"d_{uuid.uuid4().hex[:6]}"),
                        title=str(d.get("title") or "Barang Derma"),
                        description=str(d.get("description") or ""),
                        category=str(d.get("category") or "Pakaian"),
                        imageUrl=raw_img,
                        donorId=str(d.get("donorId") or "u1"),
                        donorName=str(d.get("donorName") or "Penderma"),
                        donorPhone=str(d.get("donorPhone") or ""),
                        donorContactNotes=str(d.get("donorContactNotes") or ""),
                        distance=dist,
                        status=st,
                        isBlocked=is_blk,
                        claimedBy=d.get("claimedBy") or None,
                        createdAt=str(d.get("createdAt") or "Baru sahaja")
                    ))
                RECYCLE_CACHE["donations"] = parsed
                RECYCLE_CACHE["donations_last_fetched"] = now
        except Exception as e:
            print(f"Error fetching donations: {e}")

    results = list(RECYCLE_CACHE["donations"])
    if status:
        results = [d for d in results if d.status.lower() == status.lower()]
    return results

@router.post("/donations", response_model=DonationItem)
def create_donation(data: DonationCreate, background_tasks: BackgroundTasks, user_id: str = Query("u1")):
    donor_id = getattr(data, "donorId", None) or user_id or "u1"
    donor_name = getattr(data, "donorName", None) or "Penderma"
    if donor_name == "Penderma":
        try:
            from routers.admin import CACHE as ADMIN_CACHE
            if ADMIN_CACHE.get("users", {}).get("data"):
                for u in ADMIN_CACHE["users"]["data"]:
                    if u.get("id") == donor_id:
                        donor_name = u.get("username") or u.get("name") or "Penderma"
                        break
        except Exception:
            pass

    if donor_name:
        donor_name = str(donor_name).strip().lstrip('@')
    else:
        donor_name = "Penderma"

    donor_phone = getattr(data, "donorPhone", None) or ""
    new_id = f"d_{uuid.uuid4().hex[:8]}"
    created_at = time.strftime("%Y-%m-%d %H:%M")

    # Image upload to Google Drive if base64 provided
    img_url = getattr(data, "imageUrl", None) or "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400"
    base64_data = getattr(data, "imageBase64", None)
    if not base64_data and img_url and img_url.startswith("data:image"):
        base64_data = img_url

    if base64_data:
        try:
            upload_payload = {
                "action": "upload_file",
                "base64": base64_data,
                "filename": f"donation_{new_id}_{int(time.time())}.jpg",
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
            print("Error uploading donation image to Google Drive:", e)
    elif img_url.startswith("blob:") or img_url.startswith("file:"):
        # Prevent saving raw device local paths (file:///var/mobile/...) or browser blob URLs to Google Sheet
        img_url = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400"

    row_data = {
        "id": new_id,
        "title": data.title,
        "description": data.description,
        "category": data.category,
        "imageUrl": img_url,
        "donorId": donor_id,
        "donorName": donor_name,
        "donorPhone": donor_phone,
        "donorContactNotes": data.donorContactNotes or "",
        "distance": 0.5,
        "status": "Available",
        "claimedBy": ""
    }

    new_item = DonationItem(**row_data, createdAt=created_at)

    RECYCLE_CACHE["donations"].insert(0, new_item)
    background_tasks.add_task(sync_save_to_gas, {"action": "create", "sheet": "Donations", "data": row_data})

    return new_item

@router.post("/donations/{donation_id}/claim", response_model=DonationItem)
def claim_donation(donation_id: str, background_tasks: BackgroundTasks, claimer_name: str = Query("Jiran")):
    target = None
    for item in RECYCLE_CACHE["donations"]:
        if item.id == donation_id:
            target = item
            item.status = "Claimed"
            item.claimedBy = claimer_name
            break

    if not target:
        target = DonationItem(
            id=donation_id,
            title="Barangan",
            description="",
            category="Pakaian",
            imageUrl="",
            donorId="u1",
            donorName="Penderma",
            distance=0.5,
            status="Claimed",
            claimedBy=claimer_name,
            createdAt="Baru sahaja"
        )

    background_tasks.add_task(sync_save_to_gas, {
        "sheet": "Donations",
        "action": "update",
        "id": donation_id,
        "data": {
            "status": "Claimed",
            "claimedBy": claimer_name
        }
    })

    return target

@router.delete("/donations/{donation_id}")
def delete_donation(donation_id: str, background_tasks: BackgroundTasks):
    RECYCLE_CACHE["donations"] = [item for item in RECYCLE_CACHE["donations"] if item.id != donation_id]
    background_tasks.add_task(sync_save_to_gas, {"action": "delete", "sheet": "Donations", "id": donation_id})
    return {"success": True, "message": "Donation item deleted successfully"}

@router.put("/donations/{donation_id}/block")
@router.post("/donations/{donation_id}/block")
def toggle_block_donation(
    donation_id: str, 
    background_tasks: BackgroundTasks, 
    block: Optional[bool] = Query(None, description="Explicitly set block status true/false")
):
    found = False
    new_is_blocked = True
    new_status = "Disekat"

    for item in RECYCLE_CACHE["donations"]:
        if item.id == donation_id:
            current_blocked = bool(getattr(item, "isBlocked", False) or getattr(item, "status", "") == "Disekat")
            if block is not None:
                new_is_blocked = bool(block)
            else:
                new_is_blocked = not current_blocked
            
            new_status = "Disekat" if new_is_blocked else "Available"
            item.status = new_status
            item.isBlocked = new_is_blocked
            found = True
            break

    if not found:
        new_is_blocked = True if block is None or block else False
        new_status = "Disekat" if new_is_blocked else "Available"

    background_tasks.add_task(sync_save_to_gas, {
        "action": "update", 
        "sheet": "Donations", 
        "id": donation_id, 
        "data": {"status": new_status, "isBlocked": new_is_blocked}
    })

    return {
        "success": True, 
        "id": donation_id, 
        "status": new_status, 
        "isBlocked": new_is_blocked,
        "message": f"Barang derma telah {'disekat' if new_is_blocked else 'dinyahsekat'}."
    }

