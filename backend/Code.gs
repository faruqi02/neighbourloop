/**
 * ==============================================================================
 * NEIGHBOURLOOP - GOOGLE APPS SCRIPT DATABASE API (V2 - CLEAN ARCHITECTURE)
 * ==============================================================================
 * Petunjuk:
 * 1. Buka Google Sheets baru di Google Drive anda (Namakan contoh: "NeighbourLoop_DB").
 * 2. Pergi ke Extensions > Apps Script.
 * 3. Padam semua kod sedia ada, dan tampal (paste) keseluruhan kod fail ini.
 * 4. Jalankan fungsi "setupDatabase()" sekali sahaja untuk auto-create semua tab & data awal.
 * 5. Klik "Deploy" > "New deployment" > Pilih type "Web app".
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (Penting untuk mobile app boleh akses)
 * 6. Salin Web App URL yang diberikan.
 * ==============================================================================
 */

// Senarai Nama Tab / Sheets
const TABS = {
  USERS: "Users",
  LISTINGS: "Listings",
  CENTERS: "RecycleCenters",
  DONATIONS: "Donations",
  HELP: "HelpRequests",
  NOTICES: "CommunityNotices"
};

/**
 * Fungsi Auto-Setup: Cipta semua 6 Tab, Kolum Header, dan Data Permulaan (Seed Data).
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Tab Users
  initSheet(ss, TABS.USERS, [
    "id", "name", "email", "phone", "telegram", "contactNotes", "preferredContactMethod", "location", "radiusKm", "avatarUrl", "role", "status", "createdAt"
  ], [
    ["u1", "Aisyah", "aisyah@example.com", "012-3456789", "@aisyah_melati", "Boleh WhatsApp atau call bila-bila masa.", "WhatsApp", "Taman Melati, Johor Bahru", 5, "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", "User", "Aktif", new Date().toISOString()],
    ["u2", "Abu Bakar", "abu@utm.my", "013-9876543", "@abu_utm", "Pelajar UTM. WhatsApp waktu petang atau malam sahaja.", "Chat Aplikasi", "Kolej Rahman Putra, UTM", 5, "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150", "User", "Aktif", new Date().toISOString()],
    ["u3", "Siti Aminah", "siti@example.com", "017-1122334", "@sitiaminah_jb", "Suri rumah. Call atau WhatsApp sebelum jam 8 malam.", "WhatsApp", "Taman Perling, Johor Bahru", 10, "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", "User", "Aktif", new Date().toISOString()],
    ["u_admin", "Dr. Faruqi (Admin & SV)", "admin@neighbourloop.org", "019-8877665", "@admin_neighbourloop", "Penyelia & Pentadbir Platform Komuniti NeighbourLoop.", "Semua", "Pusat Pentadbiran, UTM Skudai", 20, "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", "Admin", "Aktif", new Date().toISOString()]
  ]);

  // 2. Tab Listings (Marketplace Preloved)
  initSheet(ss, TABS.LISTINGS, [
    "id", "title", "description", "price", "category", "condition", "distance", "imageUrl", "sellerId", "sellerName", "sellerPhone", "sellerContactNotes", "createdAt"
  ], [
    ["l1", "Meja Belajar Kayu", "Meja belajar kukuh kayu jati, sangat sesuai untuk pelajar universiti.", 40, "Perabot", "Terpakai", 1.2, "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400", "u2", "Abu Bakar", "013-9876543", "Boleh pick up di Kolej Rahman Putra UTM.", "Hari ini, 10:30 AM"],
    ["l2", "Basikal Komuter 26 Inci", "Basikal berkeadaan baik, brek dan tayar baru ditukar.", 120, "Lain-lain", "Seperti Baru", 2.2, "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400", "u3", "Siti Aminah", "017-1122334", "Self pick-up di Taman Perling.", "Semalam"],
    ["l3", "Kipas Elektrik Meja", "Jenama Panasonic, 3 kelajuan berfungsi lancar, jimat elektrik.", 30, "Elektronik", "Terpakai", 1.5, "https://images.unsplash.com/photo-1618941716939-553df3c6c278?w=400", "u1", "Aisyah", "012-3456789", "WhatsApp sebelum datang.", "2 hari lalu"],
    ["l4", "Beg Galas Sekolah Deuter", "Beg warna biru kalis air, banyak poket dan ruang luas.", 25, "Pakaian", "Seperti Baru", 1.0, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", "u2", "Abu Bakar", "013-9876543", "", "3 hari lalu"]
  ]);

  // 3. Tab RecycleCenters (Pusat Kitar Semula & NGO)
  initSheet(ss, TABS.CENTERS, [
    "id", "name", "type", "address", "distance", "operatingHours", "typesAccepted", "contactPhone", "lat", "lng"
  ], [
    ["r1", "Pusat Kitar Semula Komuniti Taman Perling", "RecycleCenter", "Jalan Camar 1, Taman Perling, 81200 JB", 1.6, "8:00 AM - 6:00 PM (Setiap Hari)", "Elektronik, Plastik, Kaca, Kertas, Logam, E-waste", "07-2345678", 1.493, 103.684],
    ["r2", "Pusat Pengumpulan E-Waste & Fabrik Skudai", "RecycleCenter", "Jalan Universiti, Taman Universiti, 81300 Skudai", 3.4, "9:00 AM - 5:00 PM (Isnin - Sabtu)", "E-waste, Elektronik, Bateri, Kabel & Wayar, Pakaian", "07-5211234", 1.535, 103.633],
    ["n1", "Pusat Pengumpulan Derma NGO Prihatin", "NGO", "Pusat Komuniti Taman Melati, Johor Bahru", 0.8, "10:00 AM - 7:00 PM", "Pakaian & Tekstil, Buku, Perabot Kecil, Mainan", "019-7654321", 1.488, 103.702],
    ["n2", "Yayasan Amal Lestari Johor (Kechara Hub)", "NGO", "Jalan Kebudayaan, Taman Universiti, Johor", 2.8, "9:00 AM - 6:00 PM", "Makanan Kering, Pakaian, Buku Rujukan, Peralatan Rumah", "016-8899001", 1.530, 103.628]
  ]);

  // 4. Tab Donations (Barang Derma Percuma - Free Claim)
  initSheet(ss, TABS.DONATIONS, [
    "id", "title", "description", "category", "imageUrl", "donorId", "donorName", "donorPhone", "donorContactNotes", "distance", "status", "claimedBy", "createdAt"
  ], [
    ["d1", "Baju Kurung Moden (Saiz M)", "Masih sangat elok, hanya pakai 2 kali. Ingin dermakan kepada yang memerlukan.", "Pakaian & Tekstil", "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400", "u1", "Aisyah", "012-3456789", "Boleh ambil di Taman Melati pada hujung minggu.", 0.6, "Available", "", "1 jam lalu"],
    ["d2", "Buku Teks Sains & Matematik Tingkatan 4", "Buku teks lengkap untuk pelajar SPM atau rujukan.", "Kertas & Buku", "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400", "u3", "Siti Aminah", "017-1122334", "", 1.8, "Available", "", "3 jam lalu"]
  ]);

  // 5. Tab HelpRequests (Help Nearby Kejiranan)
  initSheet(ss, TABS.HELP, [
    "id", "title", "description", "category", "type", "distance", "requesterId", "requesterName", "requesterPhone", "requesterContactNotes", "imageUrl", "status", "fulfilledBy", "createdAt"
  ], [
    ["h1", "Perlukan bantuan angkat barang pindah", "Perlukan 1-2 jiran untuk tolong angkat peti ais kecil ke tingkat 1 petang ini.", "Khidmat/Tenaga", "Permintaan", 0.5, "u2", "Abu Bakar", "013-9876543", "", "", "Open", "", "20 minit lalu"],
    ["h2", "Pinjam gerudi elektrik (1-2 hari)", "Nak pasang rak dinding bilik. Janji akan jaga dengan cermat.", "Pinjam Barang", "Permintaan", 1.3, "u3", "Siti Aminah", "017-1122334", "", "", "Open", "", "1 jam lalu"],
    ["h3", "Tawaran: Tumpang hantar bungkusan ke PosLaju", "Saya nak pergi pejabat pos jam 3 petang ini. Boleh tumpang drop parcel.", "Khidmat/Tenaga", "Tawaran", 2.0, "u1", "Aisyah", "012-3456789", "", "", "Open", "", "3 jam lalu"]
  ]);

  // 6. Tab CommunityNotices (Informasi & Pengumuman Komuniti)
  initSheet(ss, TABS.NOTICES, [
    "id", "title", "category", "description", "date", "time", "location", "organizer", "contactPerson", "isImportant", "createdAt"
  ], [
    ["not_1", "Program Gotong-Royong Perdana Komuniti Lestari", "Gotong-Royong", "Semua penduduk dijemput hadir untuk membersihkan perparitan dan taman permainan bagi cegah denggi.", "Ahad ini (21 Sept)", "8:00 AM - 11:30 AM", "Padang Awam Jalan Melati 3", "Persatuan Penduduk Taman Melati", "En. Razak (019-3344556)", true, "Hari ini"],
    ["not_2", "Kerja Pembaikan Jalan Berlubang & Turap Semula", "Penyelenggaraan", "Pihak kontraktor MBJB akan menjalankan kerja-kerja menurap semula laluan utama. Laluan satu lorong dibuka bergilir.", "Isnin - Rabu", "9:00 AM - 4:00 PM", "Jalan Camar 2, Taman Perling", "MBIP", "Unit Aduan MBIP", true, "Semalam"],
    ["not_3", "Gangguan Sementara Bekalan Air Berjadual", "Penyelenggaraan", "Kerja penggantian injap paip utama oleh Ranhill SAJ.", "Khamis", "10:00 PM - 5:00 AM", "Zon A & B (Taman Universiti & Sekitar UTM)", "Ranhill SAJ Sdn Bhd", "Talian Aduan (1800-88-7474)", false, "2 hari lalu"]
  ]);

  Logger.log("✅ Database NeighbourLoop berjaya dicipta dengan 6 tab V2!");
}

function initSheet(ss, sheetName, headers, seedRows) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e2e8f0");
    if (seedRows && seedRows.length > 0) {
      seedRows.forEach(row => sheet.appendRow(row));
    }
  }
}

/**
 * HTTP GET HANDLER
 */
function doGet(e) {
  try {
    const action = e.parameter.action || "get_all";
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "setup") {
      setupDatabase();
      return jsonResponse({ success: true, message: "Database NeighbourLoop berjaya disetup!" });
    }

    if (action === "get_all") {
      return jsonResponse({
        users: getSheetData(ss, TABS.USERS),
        listings: getSheetData(ss, TABS.LISTINGS),
        recycleCenters: getSheetData(ss, TABS.CENTERS).map(formatCenterRow),
        donations: getSheetData(ss, TABS.DONATIONS),
        helpRequests: getSheetData(ss, TABS.HELP),
        notices: getSheetData(ss, TABS.NOTICES)
      });
    }

    if (action === "get_listings") {
      return jsonResponse(getSheetData(ss, TABS.LISTINGS));
    }

    if (action === "get_centers") {
      return jsonResponse(getSheetData(ss, TABS.CENTERS).map(formatCenterRow));
    }

    if (action === "get_donations") {
      return jsonResponse(getSheetData(ss, TABS.DONATIONS));
    }

    if (action === "get_help") {
      return jsonResponse(getSheetData(ss, TABS.HELP));
    }

    if (action === "get_notices") {
      return jsonResponse(getSheetData(ss, TABS.NOTICES));
    }

    // Smart Recommendation Engine
    if (action === "recommend") {
      const itemName = e.parameter.itemName || "Barangan";
      const category = e.parameter.category || "Lain-lain";
      const condition = e.parameter.condition || "Masih elok";

      const isGood = condition.toLowerCase().indexOf("elok") !== -1;
      const allCenters = getSheetData(ss, TABS.CENTERS).map(formatCenterRow);

      let decision = "Derma";
      let title = "Cadangan Pintar: Sesuai untuk Didermakan atau Dijual";
      let explanation = "";
      let matchingCenters = [];

      if (isGood) {
        decision = "Derma";
        title = "Cadangan Pintar: Sesuai untuk Didermakan atau Dijual";
        explanation = `Barang "${itemName}" masih dalam keadaan elok! Disyorkan untuk didermakan kepada NGO atau komuniti melalui 'Barang Derma (Claim)' atau dijual di Marketplace.`;
        matchingCenters = allCenters.filter(c => c.type === "NGO");
      } else {
        decision = "Recycle";
        title = "Cadangan Pintar: Hantar ke Pusat Kitar Semula";
        explanation = `Barang "${itemName}" yang rosak boleh dihantar ke pusat kitar semula untuk proses pengasingan bahan.`;
        matchingCenters = allCenters.filter(c => c.type === "RecycleCenter");
      }

      return jsonResponse({
        decision: decision,
        title: title,
        explanation: explanation,
        suggestedActions: isGood ? ["NGO", "Komuniti", "Marketplace"] : ["RecycleCenter"],
        matchingCenters: matchingCenters
      });
    }

    return jsonResponse({ error: "Action tidak dikenali" });
  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}

/**
 * HTTP POST HANDLER
 */
function doPost(e) {
  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter;
    }

    const action = payload.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "create_listing") {
      const newListing = {
        id: "l_" + new Date().getTime(),
        title: payload.title || "Barang Preloved",
        description: payload.description || "",
        price: Number(payload.price) || 0,
        category: payload.category || "Lain-lain",
        condition: payload.condition || "Terpakai",
        distance: 0.8,
        imageUrl: payload.imageUrl || "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400",
        sellerId: payload.sellerId || "u1",
        sellerName: payload.sellerName || "Aisyah",
        sellerPhone: payload.sellerPhone || "",
        sellerContactNotes: payload.sellerContactNotes || "",
        createdAt: "Baru sahaja"
      };
      appendSheetRow(ss, TABS.LISTINGS, newListing);
      return jsonResponse({ success: true, listing: newListing });
    }

    if (action === "create_donation") {
      const newDonation = {
        id: "d_" + new Date().getTime(),
        title: payload.title || "Barang Derma",
        description: payload.description || "",
        category: payload.category || "Pakaian & Tekstil",
        imageUrl: payload.imageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400",
        donorId: payload.donorId || "u1",
        donorName: payload.donorName || "Aisyah",
        donorPhone: payload.donorPhone || "",
        donorContactNotes: payload.donorContactNotes || "",
        distance: 0.6,
        status: "Available",
        claimedBy: "",
        createdAt: "Baru sahaja"
      };
      appendSheetRow(ss, TABS.DONATIONS, newDonation);
      return jsonResponse({ success: true, donation: newDonation });
    }

    if (action === "claim_donation") {
      const donationId = payload.donationId;
      const claimerName = payload.claimerName || "Jiran";

      const sheet = ss.getSheetByName(TABS.DONATIONS);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idIdx = headers.indexOf("id");
      const statusIdx = headers.indexOf("status");
      const claimedByIdx = headers.indexOf("claimedBy");

      for (let r = 1; r < data.length; r++) {
        if (data[r][idIdx] == donationId) {
          sheet.getRange(r + 1, statusIdx + 1).setValue("Claimed");
          sheet.getRange(r + 1, claimedByIdx + 1).setValue(claimerName);
          return jsonResponse({ success: true, message: "Barang berjaya dituntut!" });
        }
      }
      return jsonResponse({ success: false, error: "Barang tidak dijumpai" });
    }

    if (action === "create_help") {
      const newHelp = {
        id: "h_" + new Date().getTime(),
        title: payload.title || "Bantuan Jiran",
        description: payload.description || "",
        category: payload.category || "Pinjam Barang",
        type: payload.type || "Permintaan",
        distance: 0.4,
        requesterId: payload.requesterId || "u1",
        requesterName: payload.requesterName || "Aisyah",
        requesterPhone: payload.requesterPhone || "",
        requesterContactNotes: payload.requesterContactNotes || "",
        imageUrl: payload.imageUrl || "",
        status: "Open",
        fulfilledBy: "",
        createdAt: "Baru sahaja"
      };
      appendSheetRow(ss, TABS.HELP, newHelp);
      return jsonResponse({ success: true, helpRequest: newHelp });
    }

    if (action === "create_notice") {
      const newNotice = {
        id: "not_" + new Date().getTime(),
        title: payload.title || "Hebahan Komuniti",
        category: payload.category || "Gotong-Royong",
        description: payload.description || "",
        date: payload.date || "Hujung minggu",
        time: payload.time || "8:00 AM",
        location: payload.location || "Kawasan Perumahan",
        organizer: payload.organizer || "Persatuan Penduduk",
        contactPerson: payload.contactPerson || "",
        isImportant: payload.isImportant || false,
        createdAt: "Baru sahaja"
      };
      appendSheetRow(ss, TABS.NOTICES, newNotice);
      return jsonResponse({ success: true, notice: newNotice });
    }

    if (action === "update_contact") {
      const userId = payload.userId || "u1";
      const sheet = ss.getSheetByName(TABS.USERS);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idIdx = headers.indexOf("id");
      const phoneIdx = headers.indexOf("phone");
      const telegramIdx = headers.indexOf("telegram");
      const notesIdx = headers.indexOf("contactNotes");

      for (let r = 1; r < data.length; r++) {
        if (data[r][idIdx] == userId) {
          if (payload.phone !== undefined) sheet.getRange(r + 1, phoneIdx + 1).setValue(payload.phone);
          if (payload.telegram !== undefined) sheet.getRange(r + 1, telegramIdx + 1).setValue(payload.telegram);
          if (payload.contactNotes !== undefined) sheet.getRange(r + 1, notesIdx + 1).setValue(payload.contactNotes);
          return jsonResponse({ success: true });
        }
      }
      return jsonResponse({ success: false, error: "User tidak dijumpai" });
    }

    return jsonResponse({ error: "Action POST tidak dikenali" });
  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}

function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];

  const headers = rows[0];
  const list = [];
  for (let r = 1; r < rows.length; r++) {
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = rows[r][c];
    }
    list.push(obj);
  }
  return list;
}

function appendSheetRow(ss, sheetName, itemObj) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = headers.map(h => (itemObj[h] !== undefined ? itemObj[h] : ""));
  sheet.appendRow(newRow);
}

function formatCenterRow(c) {
  return {
    id: c.id,
    name: c.name,
    type: c.type,
    address: c.address,
    distance: Number(c.distance) || 1.0,
    operatingHours: c.operatingHours,
    typesAccepted: typeof c.typesAccepted === "string" ? c.typesAccepted.split(",").map(s => s.trim()) : c.typesAccepted,
    contactPhone: c.contactPhone,
    coordinates: {
      lat: Number(c.lat) || 1.493,
      lng: Number(c.lng) || 103.684
    }
  };
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
