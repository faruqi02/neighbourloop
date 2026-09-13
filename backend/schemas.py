from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class User(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = ""
    location: str
    radiusKm: int = 5
    greenPoints: int = 120
    avatarUrl: Optional[str] = None

class LoginRequest(BaseModel):
    identifier: str  # email or phone
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    location: str

class Listing(BaseModel):
    id: str
    title: str
    description: str
    price: float
    category: Literal['Semua', 'Perabot', 'Elektronik', 'Pakaian', 'Lain-lain']
    condition: Literal['Baru', 'Seperti Baru', 'Terpakai'] = 'Terpakai'
    distance: float
    imageUrl: str
    sellerId: str
    sellerName: str
    createdAt: str

class ListingCreate(BaseModel):
    title: str
    description: str
    price: float
    category: Literal['Perabot', 'Elektronik', 'Pakaian', 'Lain-lain']
    condition: Literal['Baru', 'Seperti Baru', 'Terpakai'] = 'Terpakai'
    imageUrl: Optional[str] = None

class RecycleCenter(BaseModel):
    id: str
    name: str
    type: Literal['RecycleCenter', 'NGO']  # Pusat Kitar Semula vs Pusat Derma NGO
    address: str
    distance: float
    operatingHours: str
    coordinates: dict
    typesAccepted: List[str]
    contactPhone: Optional[str] = None

class DonationItem(BaseModel):
    id: str
    title: str
    description: str
    category: str
    imageUrl: str
    donorId: str
    donorName: str
    distance: float
    status: Literal['Available', 'Claimed'] = 'Available'
    claimedBy: Optional[str] = None
    createdAt: str

class DonationCreate(BaseModel):
    title: str
    description: str
    category: str
    imageUrl: Optional[str] = None

class SmartRecommendRequest(BaseModel):
    itemName: str
    category: str  # Pakaian & Tekstil, E-waste, Kertas, Plastik, Kaca, Logam, etc.
    condition: Literal['Masih elok', 'Rosak / Tidak Berfungsi']
    description: Optional[str] = ""

class SmartRecommendResponse(BaseModel):
    decision: Literal['Derma', 'Recycle', 'Jual']
    title: str
    explanation: str
    suggestedActions: List[str]  # ['Marketplace', 'NGO', 'Komuniti', 'RecycleCenter']
    matchingCenters: List[RecycleCenter]
    potentialGreenPoints: int

class HelpRequest(BaseModel):
    id: str
    title: str
    description: str
    category: Literal['Pinjam Barang', 'Khidmat/Tenaga', 'Kemahiran', 'Lain-lain']
    distance: float
    type: Literal['Permintaan', 'Tawaran']
    requesterId: str
    requesterName: str
    status: Literal['Open', 'Completed'] = 'Open'
    fulfilledBy: Optional[str] = None
    rewardPoints: int = 20
    createdAt: str

class HelpCreate(BaseModel):
    title: str
    description: str
    category: Literal['Pinjam Barang', 'Khidmat/Tenaga', 'Kemahiran', 'Lain-lain']
    type: Literal['Permintaan', 'Tawaran']
    rewardPoints: Optional[int] = 20

class ActivityItem(BaseModel):
    id: str
    title: str
    description: str
    timestamp: str
    pointsEarned: int
    category: Literal['marketplace', 'recycle', 'help', 'donation']
