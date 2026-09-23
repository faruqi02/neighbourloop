from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class User(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = ""
    telegram: Optional[str] = ""
    contactNotes: Optional[str] = ""
    preferredContactMethod: Optional[str] = "Semua"
    location: str
    radiusKm: int = 5
    avatarUrl: Optional[str] = None
    role: Optional[str] = "User"
    status: Optional[str] = "Aktif"
    joinedDate: Optional[str] = None

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
    sellerPhone: Optional[str] = None
    sellerContactNotes: Optional[str] = None
    createdAt: str

class ListingCreate(BaseModel):
    title: str
    description: str
    price: float
    category: Literal['Perabot', 'Elektronik', 'Pakaian', 'Lain-lain']
    condition: Literal['Baru', 'Seperti Baru', 'Terpakai'] = 'Terpakai'
    imageUrl: Optional[str] = None
    sellerPhone: Optional[str] = None
    sellerContactNotes: Optional[str] = None

class RecycleCenter(BaseModel):
    id: str
    name: str
    type: Literal['RecycleCenter', 'NGO']  # Pusat Kitar Semula vs Pusat Derma NGO
    address: str
    distance: float
    operatingHours: str
    coordinates: Optional[dict] = {"latitude": 1.5533, "longitude": 103.6366}
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
    donorPhone: Optional[str] = None
    donorContactNotes: Optional[str] = None
    distance: float
    status: Literal['Available', 'Claimed'] = 'Available'
    claimedBy: Optional[str] = None
    createdAt: str

class DonationCreate(BaseModel):
    title: str
    description: str
    category: str
    imageUrl: Optional[str] = None
    donorPhone: Optional[str] = None
    donorContactNotes: Optional[str] = None

class SmartRecommendRequest(BaseModel):
    itemName: str
    category: str
    condition: Literal['Masih elok', 'Rosak / Tidak Berfungsi']
    description: Optional[str] = ""

class SmartRecommendResponse(BaseModel):
    decision: Literal['Derma', 'Recycle', 'Jual']
    title: str
    explanation: str
    suggestedActions: List[str]  # ['Marketplace', 'NGO', 'Komuniti', 'RecycleCenter']
    matchingCenters: List[RecycleCenter]

class HelpRequest(BaseModel):
    id: str
    title: str
    description: str
    category: Literal['Pinjam Barang', 'Khidmat/Tenaga', 'Kemahiran', 'Lain-lain']
    distance: float
    type: Literal['Permintaan', 'Tawaran']
    requesterId: str
    requesterName: str
    requesterPhone: Optional[str] = None
    requesterContactNotes: Optional[str] = None
    imageUrl: Optional[str] = None
    status: Literal['Open', 'Completed'] = 'Open'
    fulfilledBy: Optional[str] = None
    createdAt: str

class HelpCreate(BaseModel):
    title: str
    description: str
    category: Literal['Pinjam Barang', 'Khidmat/Tenaga', 'Kemahiran', 'Lain-lain']
    type: Literal['Permintaan', 'Tawaran']
    imageUrl: Optional[str] = None
    requesterPhone: Optional[str] = None
    requesterContactNotes: Optional[str] = None

class CommunityNotice(BaseModel):
    id: str
    title: str
    category: Literal['Gotong-Royong', 'Penyelenggaraan', 'Keselamatan', 'Hebahan', 'Aktiviti Komuniti']
    description: str
    date: str
    time: Optional[str] = None
    location: str
    organizer: str
    contactPerson: Optional[str] = None
    isImportant: bool = False
    imageUrl: Optional[str] = None
    createdAt: str

class CommunityNoticeCreate(BaseModel):
    title: str
    category: Literal['Gotong-Royong', 'Penyelenggaraan', 'Keselamatan', 'Hebahan', 'Aktiviti Komuniti']
    description: str
    date: str
    time: Optional[str] = None
    location: str
    organizer: str
    contactPerson: Optional[str] = None
    isImportant: Optional[bool] = False
    imageUrl: Optional[str] = None

class ChatMessage(BaseModel):
    id: str
    conversationId: str
    senderId: str
    senderName: str
    text: str
    timestamp: str
    isMe: Optional[bool] = False

class ChatConversation(BaseModel):
    id: str
    participantId: str
    participantName: str
    participantAvatar: Optional[str] = None
    participantPhone: Optional[str] = None
    itemContextTitle: Optional[str] = None
    itemContextPrice: Optional[float] = None
    itemContextCategory: Optional[str] = None
    lastMessage: str
    lastMessageTime: str
    unreadCount: int = 0
    messages: List[ChatMessage] = []

class SendMessageRequest(BaseModel):
    conversationId: str
    text: str
    senderId: str
    senderName: str

class AdminStatsResponse(BaseModel):
    totalUsers: int
    totalListings: int
    totalDonations: int
    totalHelpRequests: int
    totalCenters: int
    totalNotices: int
    systemStatus: str
