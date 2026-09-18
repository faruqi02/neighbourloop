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
  ]);

  // 2. Tab Listings (Marketplace Preloved)
  initSheet(ss, TABS.LISTINGS, [
    "id", "title", "description", "price", "category", "condition", "distance", "imageUrl", "sellerId", "sellerName", "sellerPhone", "sellerContactNotes", "createdAt"
  ]);

  // 3. Tab RecycleCenters (Pusat Kitar Semula & NGO)
  initSheet(ss, TABS.CENTERS, [
    "id", "name", "type", "address", "distance", "operatingHours", "typesAccepted", "contactPhone", "lat", "lng"
  ]);

  // 4. Tab Donations (Barang Derma Percuma - Free Claim)
  initSheet(ss, TABS.DONATIONS, [
    "id", "title", "description", "category", "imageUrl", "donorId", "donorName", "donorPhone", "donorContactNotes", "distance", "status", "claimedBy", "createdAt"
  ]);

  // 5. Tab HelpRequests (Help Nearby Kejiranan)
  initSheet(ss, TABS.HELP, [
    "id", "title", "description", "category", "type", "distance", "requesterId", "requesterName", "requesterPhone", "requesterContactNotes", "imageUrl", "status", "fulfilledBy", "createdAt"
  ]);

  // 6. Tab CommunityNotices (Informasi & Pengumuman Komuniti)
  initSheet(ss, TABS.NOTICES, [
    "id", "title", "category", "description", "date", "time", "location", "organizer", "contactPerson", "isImportant", "createdAt"
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
    
    // Folder ID for Image Uploads
    const DRIVE_FOLDER_ID = "13RieHioFy2OKIWQJ3E9ROxxXn_7TyOzb";
    
    function uploadImage(base64Str, fileName) {
      if (!base64Str) return "";
      try {
        const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
        // Remove data:image/...;base64, prefix if exists
        const base64Data = base64Str.split(',')[1] || base64Str;
        const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'image/jpeg', fileName || ('IMG_' + new Date().getTime() + '.jpg'));
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        return file.getDownloadUrl();
      } catch(e) {
        Logger.log("Error uploading image: " + e);
        return "";
      }
    }

    if (action === "create_user") {
      const newUser = {
        id: payload.id || "u_" + new Date().getTime(),
        name: payload.name || "Unknown",
        email: payload.email || "",
        phone: payload.phone || "",
        telegram: payload.telegram || "",
        contactNotes: payload.contactNotes || "",
        preferredContactMethod: payload.preferredContactMethod || "WhatsApp",
        location: payload.location || "",
        radiusKm: payload.radiusKm || 5,
        avatarUrl: payload.avatarUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(payload.name || "User"),
        role: payload.role || "User",
        status: payload.status || "Aktif",
        createdAt: new Date().toISOString()
      };
      appendSheetRow(ss, TABS.USERS, newUser);
      return jsonResponse({ success: true, user: newUser });
    }

    if (action === "create_listing") {
      let finalImageUrl = payload.imageUrl || "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400";
      if (payload.imageBase64) {
         finalImageUrl = uploadImage(payload.imageBase64, payload.imageName) || finalImageUrl;
      }
      
      const newListing = {
        id: "l_" + new Date().getTime(),
        title: payload.title || "Barang Preloved",
        description: payload.description || "",
        price: Number(payload.price) || 0,
        category: payload.category || "Lain-lain",
        condition: payload.condition || "Terpakai",
        distance: 0.8,
        imageUrl: finalImageUrl,
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
      let finalImageUrl = payload.imageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400";
      if (payload.imageBase64) {
         finalImageUrl = uploadImage(payload.imageBase64, payload.imageName) || finalImageUrl;
      }
      const newDonation = {
        id: "d_" + new Date().getTime(),
        title: payload.title || "Barang Derma",
        description: payload.description || "",
        category: payload.category || "Pakaian & Tekstil",
        imageUrl: finalImageUrl,
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
      let finalImageUrl = payload.imageUrl || "";
      if (payload.imageBase64) {
         finalImageUrl = uploadImage(payload.imageBase64, payload.imageName) || finalImageUrl;
      }
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
        imageUrl: finalImageUrl,
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
