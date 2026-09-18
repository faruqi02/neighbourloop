from typing import List, Dict
from schemas import (
    User, 
    Listing, 
    RecycleCenter, 
    HelpRequest, 
    DonationItem, 
    CommunityNotice, 
    ChatConversation, 
    ChatMessage
)

# Current demo users
USERS_DB: Dict[str, User] = {}

LISTINGS_DB: List[Listing] = [
    Listing(
        id="l1",
        title="Meja Belajar Kayu",
        description="Meja belajar kukuh kayu jati, sangat sesuai untuk pelajar universiti.",
        price=40.0,
        category="Perabot",
        condition="Terpakai",
        distance=1.2,
        imageUrl="https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400",
        sellerId="u2",
        sellerName="Abu Bakar",
        sellerPhone="013-9876543",
        sellerContactNotes="Boleh pick up di Kolej Rahman Putra UTM.",
        createdAt="Hari ini, 10:30 AM"
    ),
    Listing(
        id="l2",
        title="Basikal Komuter 26 Inci",
        description="Basikal berkeadaan baik, brek dan tayar baru ditukar. Sesuai pusing taman.",
        price=120.0,
        category="Lain-lain",
        condition="Seperti Baru",
        distance=2.2,
        imageUrl="https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400",
        sellerId="u3",
        sellerName="Siti Aminah",
        sellerPhone="017-1122334",
        createdAt="Semalam"
    ),
    Listing(
        id="l3",
        title="Kipas Elektrik Meja",
        description="Jenama Panasonic, 3 kelajuan berfungsi lancar, jimat elektrik.",
        price=30.0,
        category="Elektronik",
        condition="Terpakai",
        distance=1.5,
        imageUrl="https://images.unsplash.com/photo-1618941716939-553df3c6c278?w=400",
        sellerId="u1",
        sellerName="Aisyah",
        sellerPhone="012-3456789",
        createdAt="2 hari lalu"
    ),
    Listing(
        id="l4",
        title="Beg Galas Sekolah Deuter",
        description="Beg warna biru kalis air, banyak poket dan ruang luas.",
        price=25.0,
        category="Pakaian",
        condition="Seperti Baru",
        distance=1.0,
        imageUrl="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
        sellerId="u2",
        sellerName="Abu Bakar",
        sellerPhone="013-9876543",
        createdAt="3 hari lalu"
    )
]

RECYCLE_CENTERS_DB: List[RecycleCenter] = [
    RecycleCenter(
        id="r1",
        name="Pusat Kitar Semula Komuniti Taman Perling",
        type="RecycleCenter",
        address="Jalan Camar 1, Taman Perling, 81200 Johor Bahru",
        distance=1.6,
        operatingHours="8:00 AM - 6:00 PM (Setiap Hari)",
        coordinates={"lat": 1.493, "lng": 103.684},
        typesAccepted=["Elektronik", "Plastik", "Kaca", "Kertas", "Logam", "E-waste"],
        contactPhone="07-2345678"
    ),
    RecycleCenter(
        id="r2",
        name="Pusat Pengumpulan E-Waste & Fabrik Skudai",
        type="RecycleCenter",
        address="Jalan Universiti, Taman Universiti, 81300 Skudai",
        distance=3.4,
        operatingHours="9:00 AM - 5:00 PM (Isnin - Sabtu)",
        coordinates={"lat": 1.535, "lng": 103.633},
        typesAccepted=["E-waste", "Elektronik", "Bateri", "Kabel & Wayar", "Pakaian & Tekstil"],
        contactPhone="07-5211234"
    ),
    RecycleCenter(
        id="n1",
        name="Pusat Pengumpulan Derma NGO Prihatin",
        type="NGO",
        address="Pusat Komuniti Taman Melati, Johor Bahru",
        distance=0.8,
        operatingHours="10:00 AM - 7:00 PM",
        coordinates={"lat": 1.488, "lng": 103.702},
        typesAccepted=["Pakaian & Tekstil", "Buku", "Perabot Kecil", "Mainan Kanak-kanak"],
        contactPhone="019-7654321"
    ),
    RecycleCenter(
        id="n2",
        name="Yayasan Amal Lestari Johor (Kechara Hub)",
        type="NGO",
        address="Jalan Kebudayaan, Taman Universiti, Johor",
        distance=2.8,
        operatingHours="9:00 AM - 6:00 PM",
        coordinates={"lat": 1.530, "lng": 103.628},
        typesAccepted=["Makanan Kering", "Pakaian", "Buku Rujukan", "Peralatan Elektrik Berfungsi"],
        contactPhone="016-8899001"
    )
]

DONATIONS_DB: List[DonationItem] = [
    DonationItem(
        id="d1",
        title="Baju Kurung Moden (Saiz M)",
        description="Masih sangat elok, hanya pakai 2 kali. Ingin dermakan kepada yang memerlukan.",
        category="Pakaian & Tekstil",
        imageUrl="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400",
        donorId="u1",
        donorName="Aisyah",
        donorPhone="012-3456789",
        distance=0.6,
        status="Available",
        createdAt="1 jam lalu"
    ),
    DonationItem(
        id="d2",
        title="Buku Teks Sains & Matematik Tingkatan 4",
        description="Buku teks lengkap untuk pelajar SPM atau yang memerlukan rujukan.",
        category="Kertas & Buku",
        imageUrl="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400",
        donorId="u3",
        donorName="Siti Aminah",
        donorPhone="017-1122334",
        distance=1.8,
        status="Available",
        createdAt="3 jam lalu"
    )
]

HELP_REQUESTS_DB: List[HelpRequest] = [
    HelpRequest(
        id="h1",
        title="Perlukan bantuan angkat barang pindah",
        description="Perlukan 1-2 jiran untuk tolong angkat peti ais kecil ke tingkat 1 petang ini.",
        category="Khidmat/Tenaga",
        distance=0.5,
        type="Permintaan",
        requesterId="u2",
        requesterName="Abu Bakar",
        requesterPhone="013-9876543",
        status="Open",
        createdAt="20 minit lalu"
    ),
    HelpRequest(
        id="h2",
        title="Pinjam gerudi elektrik (1-2 hari)",
        description="Nak pasang rak dinding bilik. Janji akan jaga dengan cermat.",
        category="Pinjam Barang",
        distance=1.3,
        type="Permintaan",
        requesterId="u3",
        requesterName="Siti Aminah",
        requesterPhone="017-1122334",
        status="Open",
        createdAt="1 jam lalu"
    ),
    HelpRequest(
        id="h3",
        title="Tawaran: Tumpang hantar bungkusan ke PosLaju",
        description="Saya nak pergi pejabat pos jam 3 petang ini. Boleh tumpang drop parcel.",
        category="Khidmat/Tenaga",
        distance=2.0,
        type="Tawaran",
        requesterId="u1",
        requesterName="Aisyah",
        requesterPhone="012-3456789",
        status="Open",
        createdAt="3 jam lalu"
    )
]

NOTICES_DB: List[CommunityNotice] = [
    CommunityNotice(
        id="not_1",
        title="Program Gotong-Royong Perdana Komuniti Lestari",
        category="Gotong-Royong",
        description="Semua penduduk dijemput hadir untuk membersihkan perparitan, kawasan surau, dan taman permainan bagi membasmi tempat pembiakan nyamuk Aedes. Sarapan pagi disediakan.",
        date="Ahad ini (21 Sept 2026)",
        time="8:00 AM - 11:30 AM",
        location="Padang Awam Jalan Melati 3, Taman Melati",
        organizer="Persatuan Penduduk Taman Melati",
        contactPerson="En. Razak (019-3344556)",
        isImportant=True,
        imageUrl="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400",
        createdAt="Hari ini"
    ),
    CommunityNotice(
        id="not_2",
        title="Kerja Pembaikan Jalan Berlubang & Turap Semula",
        category="Penyelenggaraan",
        description="Pihak kontraktor MBJB akan menjalankan kerja-kerja menurap semula laluan utama. Laluan satu lorong akan dibuka secara bergilir. Sila pandu berhati-hati.",
        date="Isnin - Rabu (22 - 24 Sept)",
        time="9:00 AM - 4:00 PM",
        location="Jalan Camar 2 hingga Persimpangan Utama, Taman Perling",
        organizer="Majlis Bandaraya Iskandar Puteri (MBIP)",
        contactPerson="Unit Aduan MBIP",
        isImportant=True,
        createdAt="Semalam"
    ),
    CommunityNotice(
        id="not_3",
        title="Gangguan Sementara Bekalan Air Berjadual",
        category="Penyelenggaraan",
        description="Kerja penggantian injap paip utama oleh Ranhill SAJ. Penduduk dinasihatkan menyimpan air secukupnya untuk kegunaan sepanjang tempoh kerja.",
        date="Khamis (25 Sept 2026)",
        time="10:00 PM - 5:00 AM",
        location="Zon A & B (Taman Universiti & Sekitar UTM Skudai)",
        organizer="Ranhill SAJ Sdn Bhd",
        contactPerson="Talian Aduan SAJ (1800-88-7474)",
        isImportant=False,
        createdAt="2 hari lalu"
    )
]

CONVERSATIONS_DB: List[ChatConversation] = [
    ChatConversation(
        id="conv_1",
        participantId="u2",
        participantName="Abu Bakar",
        participantAvatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        participantPhone="013-9876543",
        itemContextTitle="Meja Belajar Kayu",
        itemContextPrice=40.0,
        itemContextCategory="Marketplace",
        lastMessage="Boleh, petang ni jam 5 saya ada di kolej.",
        lastMessageTime="10:45 AM",
        unreadCount=1,
        messages=[
            ChatMessage(
                id="m1",
                conversationId="conv_1",
                senderId="u1",
                senderName="Aisyah",
                text="Salam Abu Bakar, meja belajar kayu ni masih ada ke?",
                timestamp="10:35 AM",
                isMe=True
            ),
            ChatMessage(
                id="m2",
                conversationId="conv_1",
                senderId="u2",
                senderName="Abu Bakar",
                text="Waalaikumussalam Aisyah, ya masih ada. Keadaan elok lagi.",
                timestamp="10:40 AM",
                isMe=False
            )
        ]
    )
]
