from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from schemas import (
    RecycleCenter, DonationItem, DonationCreate, 
    SmartRecommendRequest, SmartRecommendResponse
)
from database import RECYCLE_CENTERS_DB, DONATIONS_DB, USERS_DB
import uuid

router = APIRouter(prefix="/recycle", tags=["Smart Recycling & Donation"])

@router.post("/recommend", response_model=SmartRecommendResponse)
def get_smart_recommendation(data: SmartRecommendRequest):
    """
    FYP Core Smart Recommendation Engine:
    Evaluates item category & condition and provides actionable guidance.
    """
    is_good_condition = "elok" in data.condition.lower()
    cat_lower = data.category.lower()

    if is_good_condition:
        decision = "Derma"
        title = "Cadangan Pintar: Sesuai untuk Didermakan atau Dijual"
        explanation = (
            f"Barang '{data.itemName}' masih dalam keadaan elok! "
            f"Anda disyorkan untuk mendermakannya kepada NGO atau komuniti setempat "
            f"melalui 'Barang Derma (Claim)', atau menjualnya di Marketplace sebelum dilupuskan."
        )
        suggested_actions = ["NGO", "Komuniti", "Marketplace"]
        matching = [c for c in RECYCLE_CENTERS_DB if c.type == "NGO"]
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
        matching = [c for c in RECYCLE_CENTERS_DB if c.type == "RecycleCenter"]

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
    accepted_type: Optional[str] = Query(None, description="Material accepted e.g. E-waste, Plastik")
):
    results = RECYCLE_CENTERS_DB
    if center_type and center_type != "Semua":
        results = [c for c in results if c.type == center_type]
    if accepted_type:
        results = [c for c in results if any(accepted_type.lower() in t.lower() for t in c.typesAccepted)]
    return results

@router.get("/donations", response_model=List[DonationItem])
def get_donations(status: Optional[str] = Query(None, description="Available or Claimed")):
    results = DONATIONS_DB
    if status:
        results = [d for d in results if d.status.lower() == status.lower()]
    return results

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
        donorPhone=data.donorPhone or user.phone,
        donorContactNotes=data.donorContactNotes or user.contactNotes,
        distance=0.6,
        status="Available",
        createdAt="Baru sahaja"
    )
    DONATIONS_DB.insert(0, new_donation)
    return new_donation

@router.post("/donations/{donation_id}/claim", response_model=DonationItem)
def claim_donation(donation_id: str, claimer_name: str = Query("Abu Bakar")):
    for item in DONATIONS_DB:
        if item.id == donation_id:
            if item.status == "Claimed":
                raise HTTPException(status_code=400, detail="Item already claimed")
            item.status = "Claimed"
            item.claimedBy = claimer_name
            return item
    raise HTTPException(status_code=404, detail="Donation item not found")

@router.delete("/donations/{donation_id}")
def delete_donation(donation_id: str):
    global DONATIONS_DB
    for i, item in enumerate(DONATIONS_DB):
        if item.id == donation_id:
            del DONATIONS_DB[i]
            return {"success": True, "message": "Donation item deleted successfully"}
    raise HTTPException(status_code=404, detail="Donation item not found")
