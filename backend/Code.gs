/**
 * ==============================================================================
 * NEIGHBOURLOOP - GOOGLE APPS SCRIPT DATABASE API
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
  ACTIVITIES: "Activities"
};

/**
 * Fungsi Auto-Setup: Cipta semua 6 Tab, Kolum Header, dan Data Permulaan (Seed Data).
 * Boleh dijalankan dari Apps Script Editor (Pilih 'setupDatabase' -> Tekan 'Run').
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Tab Users
  initSheet(ss, TABS.USERS, [
    "id", "name", "email", "phone", "location", "radiusKm", "greenPoints", "avatarUrl", "createdAt"
  ], [
    ["u1", "Aisyah", "aisyah@example.com", "012-3456789", "Taman Melati, Johor Bahru", 5, 120, "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", new Date().toISOString()],
    ["u2", "Abu Bakar", "abu@utm.my", "013-9876543", "Kolej Rahman Putra, UTM", 5, 80, "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150", new Date().toISOString()],
    ["u3", "Siti Aminah", "siti@example.com", "017-1122334", "Taman Perling, Johor Bahru", 10, 210, "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", new Date().toISOString()]
  ]);

  // 2. Tab Listings (Marketplace)
  initSheet(ss, TABS.LISTINGS, [
    "id", "title", "description", "price", "category", "condition", "distance", "imageUrl", "sellerId", "sellerName", "createdAt"
  ], [
    ["l1", "Meja Belajar Kayu", "Meja belajar kukuh kayu jati, sangat sesuai untuk pelajar.", 40, "Perabot", "Terpakai", 1.2, "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400", "u2", "Abu Bakar", "Hari ini, 10:30 AM"],
    ["l2", "Basikal Komuter 26 Inci", "Basikal berkeadaan baik, brek dan tayar baru ditukar.", 120, "Lain-lain", "Seperti Baru", 2.2, "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400", "u3", "Siti Aminah", "Semalam"],
    ["l3", "Kipas Elektrik Meja", "Jenama Panasonic, 3 kelajuan berfungsi lancar, jimat elektrik.", 30, "Elektronik", "Terpakai", 1.5, "https://images.unsplash.com/photo-1618941716939-553df3c6c278?w=400", "u1", "Aisyah", "2 hari lalu"],
    ["l4", "Beg Galas Sekolah Deuter", "Beg warna biru kalis air, banyak poket dan ruang luas.", 25, "Pakaian", "Seperti Baru", 1.0, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", "u2", "Abu Bakar", "3 hari lalu"]
  ]);

  // 3. Tab RecycleCenters (Pusat Kitar Semula & NGO)
  initSheet(ss, TABS.CENTERS, [
    "id", "name", "type", "address", "distance", "operatingHours", "typesAccepted", "contactPhone", "lat", "lng"
  ], [
    ["r1", "Pusat Kitar Semula Taman Perling", "RecycleCenter", "Jalan Camar 1, Taman Perling, 81200 JB", 1.6, "8:00 AM - 6:00 PM", "Elektronik, Plastik, Kaca, Kertas, Logam, E-waste", "07-2345678", 1.493, 103.684],
    ["r2", "Pusat E-Waste & Fabrik Skudai", "RecycleCenter", "Jalan Universiti, Taman Universiti, 81300 Skudai", 3.4, "9:00 AM - 5:00 PM", "E-waste, Elektronik, Bateri, Kabel & Wayar, Pakaian", "07-5211234", 1.535, 103.633],
    ["n1", "Pusat Pengumpulan Derma NGO Prihatin", "NGO", "Pusat Komuniti Taman Melati, Johor Bahru", 0.8, "10:00 AM - 7:00 PM", "Pakaian & Tekstil, Buku, Perabot Kecil, Mainan", "019-7654321", 1.488, 103.702],
    ["n2", "Yayasan Amal Lestari Johor (Kechara Hub)", "NGO", "Jalan Kebudayaan, Taman Universiti, Johor", 2.8, "9:00 AM - 6:00 PM", "Makanan Kering, Pakaian, Buku Rujukan, Peralatan Rumah", "016-8899001", 1.530, 103.628]
  ]);

  // 4. Tab Donations (Barang Derma Komuniti - Claim)
  initSheet(ss, TABS.DONATIONS, [
    "id", "title", "description", "category", "imageUrl", "donorId", "donorName", "distance", "status", "claimedBy", "createdAt"
  ], [
    ["d1", "Baju Kurung Moden (Saiz M)", "Masih sangat elok, hanya pakai 2 kali. Ingin dermakan kepada yang memerlukan.", "Pakaian & Tekstil", "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400", "u1", "Aisyah", 0.6, "Available", "", "1 jam lalu"],
    ["d2", "Buku Teks Sains & Matematik Tingkatan 4", "Buku teks lengkap untuk pelajar SPM atau rujukan.", "Kertas & Buku", "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400", "u3", "Siti Aminah", 1.8, "Available", "", "3 jam lalu"]
  ]);

  // 5. Tab HelpRequests (Help Nearby)
  initSheet(ss, TABS.HELP, [
    "id", "title", "description", "category", "type", "distance", "requesterId", "requesterName", "status", "fulfilledBy", "rewardPoints", "createdAt"
  ], [
    ["h1", "Perlukan bantuan angkat barang pindah", "Perlukan 1-2 jiran untuk tolong angkat peti ais kecil ke tingkat 1 petang ini.", "Khidmat/Tenaga", "Permintaan", 0.5, "u2", "Abu Bakar", "Open", "", 30, "20 minit lalu"],
    ["h2", "Pinjam gerudi elektrik (1-2 hari)", "Nak pasang rak dinding bilik. Janji akan jaga dengan cermat.", "Pinjam Barang", "Permintaan", 1.3, "u3", "Siti Aminah", "Open", "", 20, "1 jam lalu"],
    ["h3", "Tawaran: Tumpang hantar bungkusan ke PosLaju", "Saya nak pergi pejabat pos jam 3 petang ini. Boleh tumpang drop parcel.", "Khidmat/Tenaga", "Tawaran", 2.0, "u1", "Aisyah", "Open", "", 25, "3 jam lalu"]
  ]);

  // 6. Tab Activities (Recent Activity Feed)
  initSheet(ss, TABS.ACTIVITIES, [
    "id", "title", "description", "timestamp", "pointsEarned", "category"
  ], [
    ["a1", "Abu Bakar menjual Meja Belajar", "Berjaya dijual kepada jiran blok sebelah", "5 minit lalu", 50, "marketplace"],
    ["a2", "Siti Aminah menderma 5kg Pakaian Terpakai", "Dihantar ke Pusat Pengumpulan NGO Prihatin", "15 minit lalu", 30, "recycle"],
    ["a3", "Aisyah membantu jiran tumpang barang ke pos", "Bantuan diselesaikan dengan jiran sekitar Taman Melati", "1 jam lalu", 25, "help"]
  ]);

  Logger.log("✅ Database NeighbourLoop berjaya dicipta dengan 6 tab & data contoh!");
}

/**
 * Helper untuk cipta sheet jika belum wujud
 */
function initSheet(ss, sheetName, headers, seedRows) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  // Hanya masukkan jika sheet kosong
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    // Format header style
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e2e8f0");
    if (seedRows && seedRows.length > 0) {
      seedRows.forEach(row => sheet.appendRow(row));
    }
  }
}

/**
 * ==============================================================================
 * HTTP GET HANDLER
 * ==============================================================================
 */
function doGet(e) {
  try {
    const action = e.parameter.action || "get_all";
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Auto-setup jika dipanggil melalui URL ?action=setup
    if (action === "setup") {
      setupDatabase();
      return jsonResponse({ success: true, message: "Database NeighbourLoop berjaya disetup!" });
    }

    // 2. Ambil Semua Data Sekaligus (Fast Initial Loading)
    if (action === "get_all") {
      return jsonResponse({
        users: getSheetData(ss, TABS.USERS),
        listings: getSheetData(ss, TABS.LISTINGS),
        recycleCenters: getSheetData(ss, TABS.CENTERS).map(formatCenterRow),
        donations: getSheetData(ss, TABS.DONATIONS),
        helpRequests: getSheetData(ss, TABS.HELP),
        activities: getSheetData(ss, TABS.ACTIVITIES)
      });
    }

    // 3. Ambil mengikut modul tertentu
    if (action === "get_listings") {
      const category = e.parameter.category;
      let data = getSheetData(ss, TABS.LISTINGS);
      if (category && category !== "Semua") {
        data = data.filter(item => item.category.toLowerCase() === category.toLowerCase());
      }
      return jsonResponse(data);
    }

    if (action === "get_centers") {
      const type = e.parameter.type;
      let data = getSheetData(ss, TABS.CENTERS).map(formatCenterRow);
      if (type && type !== "Semua") {
        data = data.filter(c => c.type === type);
      }
      return jsonResponse(data);
    }

    if (action === "get_donations") {
      return jsonResponse(getSheetData(ss, TABS.DONATIONS));
    }

    if (action === "get_help") {
      const type = e.parameter.type;
      let data = getSheetData(ss, TABS.HELP);
      if (type && type !== "Semua") {
        data = data.filter(h => h.type === type);
      }
      return jsonResponse(data);
    }

    // 4. Smart Recommendation Engine (FYP Research Objective 2)
    if (action === "recommend") {
      const itemName = e.parameter.itemName || "Barangan";
      const category = e.parameter.category || "Lain-lain";
      const condition = e.parameter.condition || "Masih elok";

      const isGood = condition.toLowerCase().indexOf("elok") !== -1;
      const catLower = category.toLowerCase();
      const allCenters = getSheetData(ss, TABS.CENTERS).map(formatCenterRow);

      let decision = "Derma";
      let title = "Cadangan Pintar: Sesuai untuk Didermakan atau Dijual";
      let explanation = "";
      let suggestedActions = [];
      let matchingCenters = [];
      let points = 50;

      if (isGood) {
        decision = "Derma";
        title = "Cadangan Pintar: Sesuai untuk Didermakan atau Dijual";
        explanation = `Barang "${itemName}" masih dalam keadaan elok! Mengikut prinsip Ekonomi Kitaran (SDG 12), barangan elok disyorkan untuk didermakan kepada NGO atau komuniti melalui 'Barang Derma (Claim)' untuk guna semula.`;
        suggestedActions = ["NGO", "Komuniti", "Marketplace"];
        matchingCenters = allCenters.filter(c => c.type === "NGO");
        points = 50;
      } else {
        decision = "Recycle";
        title = "Cadangan Pintar: Hantar ke Pusat Kitar Semula";
        if (catLower.indexOf("e-waste") !== -1 || catLower.indexOf("elektronik") !== -1) {
          explanation = `Barang "${itemName}" mengandungi komponen E-Waste berbahaya. Hantar ke fasiliti pemulihan berdaftar untuk mengelakkan pencemaran toksik dan menyelamatkan komponen logam.`;
        } else {
          explanation = `Barang "${itemName}" yang rosak boleh dihantar ke pusat kitar semula untuk diproses menjadi bahan mentah baharu.`;
        }
        suggestedActions = ["RecycleCenter"];
        matchingCenters = allCenters.filter(c => c.type === "RecycleCenter");
        points = 30;
      }

      return jsonResponse({
        decision: decision,
        title: title,
        explanation: explanation,
        suggestedActions: suggestedActions,
        matchingCenters: matchingCenters,
        potentialGreenPoints: points
      });
    }

    return jsonResponse({ error: "Action tidak dikenali" });
  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}

/**
 * ==============================================================================
 * HTTP POST HANDLER
 * ==============================================================================
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

    // 1. Tambah Iklan Jualan Marketplace
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
        createdAt: "Baru sahaja"
      };

      appendSheetRow(ss, TABS.LISTINGS, newListing);
      addGreenPoints(ss, newListing.sellerId, 10);
      recordActivity(ss, `${newListing.sellerName} menyenaraikan ${newListing.title}`, "Iklan jualan preloved", 10, "marketplace");

      return jsonResponse({ success: true, listing: newListing });
    }

    // 2. Tambah Barang Derma Komuniti
    if (action === "create_donation") {
      const newDonation = {
        id: "d_" + new Date().getTime(),
        title: payload.title || "Barang Derma",
        description: payload.description || "",
        category: payload.category || "Pakaian & Tekstil",
        imageUrl: payload.imageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400",
        donorId: payload.donorId || "u1",
        donorName: payload.donorName || "Aisyah",
        distance: 0.6,
        status: "Available",
        claimedBy: "",
        createdAt: "Baru sahaja"
      };

      appendSheetRow(ss, TABS.DONATIONS, newDonation);
      addGreenPoints(ss, newDonation.donorId, 50);
      recordActivity(ss, `${newDonation.donorName} mendermakan ${newDonation.title}`, "Barang derma percuma untuk komuniti", 50, "donation");

      return jsonResponse({ success: true, donation: newDonation });
    }

    // 3. Tuntut (Claim) Barang Derma
    if (action === "claim_donation") {
      const donationId = payload.donationId;
      const claimerName = payload.claimerName || "Jiran";
      const claimerId = payload.claimerId || "u2";

      const sheet = ss.getSheetByName(TABS.DONATIONS);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idIdx = headers.indexOf("id");
      const statusIdx = headers.indexOf("status");
      const claimedByIdx = headers.indexOf("claimedBy");
      const titleIdx = headers.indexOf("title");

      let found = false;
      let itemTitle = "";
      for (let r = 1; r < data.length; r++) {
        if (data[r][idIdx] == donationId) {
          sheet.getRange(r + 1, statusIdx + 1).setValue("Claimed");
          sheet.getRange(r + 1, claimedByIdx + 1).setValue(claimerName);
          itemTitle = data[r][titleIdx];
          found = true;
          break;
        }
      }

      if (found) {
        addGreenPoints(ss, claimerId, 15);
        recordActivity(ss, `${claimerName} menuntut ${itemTitle}`, "Barang terpakai diselamatkan untuk guna semula", 15, "donation");
        return jsonResponse({ success: true, message: "Barang berjaya dituntut!" });
      }

      return jsonResponse({ success: false, error: "Barang tidak dijumpai" });
    }

    // 4. Tambah Permintaan / Tawaran Bantuan
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
        status: "Open",
        fulfilledBy: "",
        rewardPoints: Number(payload.rewardPoints) || 20,
        createdAt: "Baru sahaja"
      };

      appendSheetRow(ss, TABS.HELP, newHelp);
      recordActivity(ss, `${newHelp.requesterName} membuat ${newHelp.type.toLowerCase()}: ${newHelp.title}`, "Aktiviti kejiranan", 5, "help");

      return jsonResponse({ success: true, helpRequest: newHelp });
    }

    // 5. Selesaikan Bantuan (Bantu Jiran)
    if (action === "fulfill_help") {
      const helpId = payload.helpId;
      const helperName = payload.helperName || "Jiran Prihatin";
      const helperId = payload.helperId || "u1";

      const sheet = ss.getSheetByName(TABS.HELP);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idIdx = headers.indexOf("id");
      const statusIdx = headers.indexOf("status");
      const fulfilledByIdx = headers.indexOf("fulfilledBy");
      const titleIdx = headers.indexOf("title");
      const pointsIdx = headers.indexOf("rewardPoints");

      for (let r = 1; r < data.length; r++) {
        if (data[r][idIdx] == helpId) {
          sheet.getRange(r + 1, statusIdx + 1).setValue("Completed");
          sheet.getRange(r + 1, fulfilledByIdx + 1).setValue(helperName);
          const pts = Number(data[r][pointsIdx]) || 20;
          const title = data[r][titleIdx];

          addGreenPoints(ss, helperId, pts);
          recordActivity(ss, `${helperName} membantu jiran: ${title}`, "Bantuan berjaya diselesaikan", pts, "help");

          return jsonResponse({ success: true, pointsAwarded: pts });
        }
      }

      return jsonResponse({ success: false, error: "Bantuan tidak dijumpai" });
    }

    // 6. Kemas Kini Lokasi & Radius Pengguna
    if (action === "update_location") {
      const userId = payload.userId || "u1";
      const location = payload.location;
      const radiusKm = Number(payload.radiusKm) || 5;

      const sheet = ss.getSheetByName(TABS.USERS);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idIdx = headers.indexOf("id");
      const locIdx = headers.indexOf("location");
      const radiusIdx = headers.indexOf("radiusKm");

      for (let r = 1; r < data.length; r++) {
        if (data[r][idIdx] == userId) {
          if (location) sheet.getRange(r + 1, locIdx + 1).setValue(location);
          if (radiusKm) sheet.getRange(r + 1, radiusIdx + 1).setValue(radiusKm);
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

/**
 * ==============================================================================
 * DATABASE HELPER UTILITIES
 * ==============================================================================
 */

// Membaca mana-mana sheet menjadi array of JSON objects
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

// Menambah baris baharu ke sheet mengikut turutan header
function appendSheetRow(ss, sheetName, itemObj) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = headers.map(h => (itemObj[h] !== undefined ? itemObj[h] : ""));
  sheet.appendRow(newRow);
}

// Menambah Mata Hijau pengguna
function addGreenPoints(ss, userId, pts) {
  const sheet = ss.getSheetByName(TABS.USERS);
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf("id");
  const ptsIdx = headers.indexOf("greenPoints");

  for (let r = 1; r < data.length; r++) {
    if (data[r][idIdx] == userId) {
      const current = Number(data[r][ptsIdx]) || 0;
      sheet.getRange(r + 1, ptsIdx + 1).setValue(current + pts);
      break;
    }
  }
}

// Merekod aktiviti terkini komuniti
function recordActivity(ss, title, desc, points, category) {
  const newAct = {
    id: "a_" + new Date().getTime(),
    title: title,
    description: desc,
    timestamp: "Baru sahaja",
    pointsEarned: points,
    category: category
  };
  appendSheetRow(ss, TABS.ACTIVITIES, newAct);
}

// Format semula baris pusat kitar semula untuk mobile
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

// JSON Output Wrapper
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
