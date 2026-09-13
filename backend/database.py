from typing import List, Dict
from schemas import User, Listing, RecycleCenter, HelpRequest, DonationItem, ActivityItem

# Current demo users
USERS_DB: Dict[str, User] = {
    "u1": User(
        id="u1",
        name="Aisyah",
        email="aisyah@example.com",
        phone="012-3456789",
        location="Taman Melati, Johor Bahru",
        radiusKm=5,
        greenPoints=120,
        avatarUrl="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    ),
    "u2": User(
        id="u2",
        name="Abu Bakar",
        email="abu@utm.my",
        phone="013-9876543",
        location="Kolej Rahman Putra, UTM",
        radiusKm=5,
        greenPoints=80,
        avatarUrl="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
    ),
    "u3": User(
        id="u3",
        name="Siti Aminah",
        email="siti@example.com",
        phone="017-1122334",
        location="Taman Perling, Johor Bahru",
        radiusKm=10,
        greenPoints=210,
        avatarUrl="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
    )
}

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
        name="Pusat E-Waste & Fabrik Skudai",
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
        typesAccepted=["Pakaian & Tekstil", "Buku", "Perabot Kecil", "Mainan", "Peralatan Rumah"],
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
        status="Open",
        rewardPoints=30,
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
        status="Open",
        rewardPoints=20,
        createdAt="1 jam lalu"
    ),
    HelpRequest(
        id="h3",
        title="Tawaran: Tumpang hantar bungkusan ke J&T / PosLaju",
        description="Saya nak pergi pejabat pos jam 3 petang ini. Siapa nak tumpang drop parcel boleh maklumkan.",
        category="Khidmat/Tenaga",
        distance=2.0,
        type="Tawaran",
        requesterId="u1",
        requesterName="Aisyah",
        status="Open",
        rewardPoints=25,
        createdAt="3 jam lalu"
    )
]

ACTIVITIES_DB: List[ActivityItem] = [
    ActivityItem(
        id="a1",
        title="Abu Bakar menjual Meja Belajar",
        description="Berjaya dijual kepada jiran blok sebelah",
        timestamp="5 minit lalu",
        pointsEarned=50,
        category="marketplace"
    ),
    ActivityItem(
        id="a2",
        title="Siti Aminah menderma 5kg Pakaian Terpakai",
        description="Dihantar ke Pusat Pengumpulan NGO Prihatin",
        timestamp="15 minit lalu",
        pointsEarned=30,
        category="recycle"
    ),
    ActivityItem(
        id="a3",
        title="Aisyah membantu jiran tumpang barang ke pos",
        description="Bantuan diselesaikan dengan jiran sekitar Taman Melati",
        timestamp="1 jam lalu",
        pointsEarned=25,
        category="help"
    )
]
