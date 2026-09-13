from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from schemas import (
    RecycleCenter, DonationItem, DonationCreate, 
    SmartRecommendRequest, SmartRecommendResponse, ActivityItem
)
from database import RECYCLE_CENTERS_DB, DONATIONS_DB, USERS_DB, ACTIVITIES_DB
import uuid

router = APIRouter(prefix="/recycle", tags=["Smart Recycling & Donation"])

@router.post("/recommend", response_model=SmartRecommendResponse)
def get_smart_recommendation(data: SmartRecommendRequest):
    """
    FYP Core Smart Recommendation Engine:
    Evaluates item category & condition and provides actionable circular economy guidance.
    """
    is_good_condition = "elok" in data.condition.lower()
    cat_lower = data.category.lower()

    if is_good_condition:
        # Item is still functional: recommend donating or selling to prolong life
        decision = "Derma"
        title = f"Cadangan Pintar: Sesuai untuk Didermakan atau Dijual"
        explanation = (
            f"Barang '{data.itemName}' masih dalam keadaan elok! Untuk menyokong SDG 12 "
            f"(Responsible Consumption), anda disyorkan untuk mendermakannya kepada NGO "
            f"atau komuniti setempat melalui 'Barang Derma (Claim)', atau menjualnya di Marketplace."
        )
        suggested_actions = ["NGO", "Komuniti", "Marketplace"]
        # Find matching NGO centers
        matching = [c for c in RECYCLE_CENTERS_DB if c.type == "NGO"]
        points = 50
    else:
        # Item is damaged or broken: route to certified recycling / e-waste
        decision = "Recycle"
        title = f"Cadangan Pintar: Hantar ke Pusat Kitar Semula"
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
        # Find matching recycling centers
        matching = [c for c in RECYCLE_CENTERS_DB if c.type == "RecycleCenter"]
        points = 30

    return SmartRecommendResponse(
        decision=decision,
        title=title,
        explanation=explanation,
        suggestedActions=suggested_actions,
        matchingCenters=matching,
        potentialGreenPoints=points
    )

@router.get("/centers", response_model=List[RecycleCenter])
def get_centers(
    type_filter: Optional[str] = Query(None, description="RecycleCenter or NGO"),
    category: Optional[str] = Query(None, description="Material accepted")
):
    results = RECYCLE_CENTERS_DB
    if type_filter and type_filter != "Semua":
        results = [c for c in results if c.type == type_filter]
    if category and category != "Semua":
        c_lower = category.lower()
        results = [c for c in results if any(c_lower in t.lower() for t in c.typesAccepted)]
    return results

@router.get("/donations", response_model=List[DonationItem])
def get_donations():
    return DONATIONS_DB

@router.post("/donations", response_model=DonationItem)
def create_donation(data: DonationCreate, user_id: str = Query("u1")):
    user = USERS_DB.get(user_id, USERS_DB["u1"])
    img = data.imageUrl or "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400"

    new_donation = DonationItem(
        id=f"d{uuid.uuid4().hex[:6]}",
        title=data.title,
        description=data.description,
        category=data.category,
        imageUrl=img,
        donorId=user.id,
        donorName=user.name,
        distance=0.6,
        status="Available",
        createdAt="Baru sahaja"
    )
    DONATIONS_DB.insert(0, new_donation)

    # Award Green Points (+50 points for donating)
    user.greenPoints += 50

    ACTIVITIES_DB.insert(0, ActivityItem(
        id=f"a{uuid.uuid4().hex[:6]}",
        title=f"{user.name} mendermakan {data.title}",
        description=f"Barang derma percuma untuk komuniti setempat",
        timestamp="Baru sahaja",
        pointsEarned=50,
        category="donation"
    ))

    return new_donation

@router.post("/donations/{donation_id}/claim", response_model=DonationItem)
def claim_donation(donation_id: str, user_id: str = Query("u2")):
    claimer = USERS_DB.get(user_id, USERS_DB["u2"])
    for d in DONATIONS_DB:
        if d.id == donation_id:
            if d.status == "Claimed":
                raise HTTPException(status_code=400, detail="Item already claimed")
            d.status = "Claimed"
            d.claimedBy = claimer.name

            # Claimer gets a small reward for reuse (+15 points)
            claimer.greenPoints += 15

            ACTIVITIES_DB.insert(0, ActivityItem(
                id=f"a{uuid.uuid4().hex[:6]}",
                title=f"{claimer.name} menuntut (claim) {d.title}",
                description=f"Barangan terpakai berjaya diselamatkan untuk guna semula!",
                timestamp="Baru sahaja",
                pointsEarned=15,
                category="donation"
            ))
            return d

    raise HTTPException(status_code=404, detail="Donation item not found")

@router.post("/recycle-action", response_model=dict)
def record_recycle_dropoff(center_id: str, material: str, user_id: str = Query("u1")):
    user = USERS_DB.get(user_id, USERS_DB["u1"])
    user.greenPoints += 30

    center_name = "Pusat Kitar Semula"
    for c in RECYCLE_CENTERS_DB:
        if c.id == center_id:
            center_name = c.name
            break

    ACTIVITIES_DB.insert(0, ActivityItem(
        id=f"a{uuid.uuid4().hex[:6]}",
        title=f"{user.name} mengitar semula {material}",
        description=f"Dihantar ke {center_name}",
        timestamp="Baru sahaja",
        pointsEarned=30,
        category="recycle"
    ))

    return {
        "success": True,
        "message": f"Tahniah! Anda menerima +30 Mata Hijau atas kitar semula {material}.",
        "newTotalPoints": user.greenPoints
    }
