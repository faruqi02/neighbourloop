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

APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwitujRlYaYoxpd7UzD5Ieffo87pOarz_vTXwo9_mSPvf0cjcj9OHHUCIfUEQdjUQDU/exec"

RECYCLE_CACHE = {
    "centers": [],
    "centers_last_fetched": 0,
    "donations": [],
    "donations_last_fetched": 0
}
CACHE_TTL = 60.0

DEFAULT_CENTERS = [
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

def sync_save_to_gas(payload: dict):
    try:
        requests.post(APPS_SCRIPT_URL, json=payload, timeout=60.0)
    except Exception as e:
        print("Error saving to GAS:", e)

@router.post("/recommend", response_model=SmartRecommendResponse)
def get_smart_recommendation(data: SmartRecommendRequest):
    is_good_condition = "elok" in data.condition.lower()
    cat_lower = data.category.lower()

    centers = get_recycle_centers()

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
    accepted_type: Optional[str] = Query(None, description="Material accepted")
):
    now = time.time()
    if (now - RECYCLE_CACHE["centers_last_fetched"] > CACHE_TTL) or not RECYCLE_CACHE["centers"]:
        try:
            res = requests.get(APPS_SCRIPT_URL, params={"sheet": "RecycleCenters"}, timeout=45.0)
            items = res.json()
            if isinstance(items, list) and len(items) > 0:
                parsed = []
                for d in items:
                    if not d.get("name"):
                        continue
                    raw_dist = d.get("distance", 1.0)
                    try:
                        dist = float(raw_dist) if raw_dist != "" else 1.0
                    except:
                        dist = 1.0

                    raw_types = d.get("acceptedMaterials") or d.get("typesAccepted") or ""
                    types_list = [t.strip() for t in str(raw_types).split(",") if t.strip()] if raw_types else ["Semua"]

                    c_type = d.get("type") or "RecycleCenter"
                    if c_type not in ["RecycleCenter", "NGO"]:
                        c_type = "RecycleCenter"

                    parsed.append(RecycleCenter(
                        id=str(d.get("id") or f"c_{uuid.uuid4().hex[:6]}"),
                        name=str(d.get("name") or "Pusat"),
                        type=c_type,
                        address=str(d.get("address") or ""),
                        distance=dist,
                        contactPhone=str(d.get("contactPhone") or ""),
                        operatingHours=str(d.get("operatingHours") or "8:00 AM - 5:00 PM"),
                        typesAccepted=types_list
                    ))
                if parsed:
                    RECYCLE_CACHE["centers"] = parsed
                    RECYCLE_CACHE["centers_last_fetched"] = now
        except Exception:
            pass

    results = list(RECYCLE_CACHE["centers"]) if RECYCLE_CACHE["centers"] else list(DEFAULT_CENTERS)

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

                    st = d.get("status") or "Available"
                    if st.capitalize() not in ["Available", "Claimed"]:
                        st = "Available"
                    else:
                        st = st.capitalize()

                    parsed.append(DonationItem(
                        id=str(d.get("id") or f"d_{uuid.uuid4().hex[:6]}"),
                        title=str(d.get("title") or "Barang Derma"),
                        description=str(d.get("description") or ""),
                        category=str(d.get("category") or "Pakaian"),
                        imageUrl=str(d.get("imageUrl") or "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400"),
                        donorId=str(d.get("donorId") or "u1"),
                        donorName=str(d.get("donorName") or "Penderma"),
                        donorPhone=str(d.get("donorPhone") or ""),
                        donorContactNotes=str(d.get("donorContactNotes") or ""),
                        distance=dist,
                        status=st,
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
    donor_name = "Penderma"
    donor_phone = data.donorPhone or ""

    new_id = f"d_{uuid.uuid4().hex[:8]}"
    created_at = time.strftime("%Y-%m-%d %H:%M")
    img = data.imageUrl or "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400"

    row_data = {
        "id": new_id,
        "title": data.title,
        "description": data.description,
        "category": data.category,
        "imageUrl": img,
        "donorId": user_id,
        "donorName": donor_name,
        "donorPhone": donor_phone,
        "donorContactNotes": data.donorContactNotes or "",
        "distance": 0.5,
        "status": "Available",
        "claimedBy": ""
    }

    new_item = DonationItem(**row_data, createdAt=created_at)

    RECYCLE_CACHE["donations"].insert(0, new_item)
    background_tasks.add_task(sync_save_to_gas, {"sheet": "Donations", "data": row_data})

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
