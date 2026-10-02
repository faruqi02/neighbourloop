from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class User(BaseModel):
    id: str
    name: str
    email: str
    username: Optional[str] = ""
    phone: Optional[str] = ""
    location: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    radiusKm: Optional[int] = 5
    avatarUrl: Optional[str] = None
    role: Optional[str] = "User"
    status: Optional[str] = "Aktif"
    joinedDate: Optional[str] = None

class LoginRequest(BaseModel):
    identifier: str  # email, phone, or username
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    username: Optional[str] = ""
    phone: Optional[str] = ""
    password: str
    location: str
    lat: Optional[float] = None
    lng: Optional[float] = None

class UserProfileUpdate(BaseModel):
    user_id: Optional[str] = None
    name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    radiusKm: Optional[int] = None
    avatarUrl: Optional[str] = None
    avatarBase64: Optional[str] = None
    newPassword: Optional[str] = None

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
    status: Optional[str] = 'Aktif'
    isBlocked: Optional[bool] = False

class ListingCreate(BaseModel):
    title: str
    description: str
    price: float
    category: Literal['Perabot', 'Elektronik', 'Pakaian', 'Lain-lain']
    condition: Literal['Baru', 'Seperti Baru', 'Terpakai'] = 'Terpakai'
    imageUrl: Optional[str] = None
    imageBase64: Optional[str] = None
    sellerId: Optional[str] = None
    sellerName: Optional[str] = None
    sellerPhone: Optional[str] = None
    sellerContactNotes: Optional[str] = None
    distance: Optional[float] = None

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
    status: str = 'Available'
    isBlocked: Optional[bool] = False
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
    category: str
    distance: float
    type: str
    requesterId: str
    requesterName: str
    requesterPhone: Optional[str] = None
    requesterContactNotes: Optional[str] = None
    imageUrl: Optional[str] = None
    status: str = 'Open'
    isBlocked: Optional[bool] = False
    fulfilledBy: Optional[str] = None
    createdAt: str

class HelpCreate(BaseModel):
    title: str
    description: str
    category: str
    type: str
    distance: Optional[float] = 0.5
    imageUrl: Optional[str] = None
    imageBase64: Optional[str] = None
    requesterId: Optional[str] = None
    requesterName: Optional[str] = None
    requesterPhone: Optional[str] = None
    requesterContactNotes: Optional[str] = None

class CommunityNotice(BaseModel):
    id: str
    title: str
    category: str
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
    category: str
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
