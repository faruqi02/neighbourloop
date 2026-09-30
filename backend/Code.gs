/**
 * ==============================================================================
 * NEIGHBOURLOOP - GOOGLE APPS SCRIPT DATABASE API (DYNAMIC CRUD)
 * ==============================================================================
 */

const DRIVE_FOLDER_ID = "13RieHioFy2OKIWQJ3E9ROxxXn_7TyOzb"; // Folder ID asal anda
 
/**
 * Jalankan fungsi ini SEKALI SAHAJA (Pilih 'authorizeDrive' dan tekan butang 'Run' / 'Jalankan' ▶️)
 * untuk membenarkan akses Google Drive (Klik Review Permissions -> Allow).
 */
function authorizeDrive() {
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const testFile = folder.createFile("temp_auth.txt", "NeighbourLoop Auth Test");
  testFile.setTrashed(true); // Padam fail ujian serta-merta
  Logger.log("Akses Penuh Google Drive Berjaya Dibenarkan!");
}

function jsonResponse(data, status = 200) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// -------------------------------------------------------------
// GET API (Fetch all data or specific sheet)
// -------------------------------------------------------------
function doGet(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const action = e.parameter.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Kekalkan sokongan untuk get_all (supaya sistem backend tidak rosak)
    if (action === "get_all") {
      return jsonResponse({
        users: getSheetData(ss, "Users"),
        listings: getSheetData(ss, "Listings"),
        recycleCenters: getSheetData(ss, "RecycleCenters"),
        donations: getSheetData(ss, "Donations"),
        helpRequests: getSheetData(ss, "HelpRequests"),
        notices: getSheetData(ss, "CommunityNotices")
      });
    }

    // Generic Get
    const sheetName = e.parameter.sheet;
    if (!sheetName) return jsonResponse({ error: "Missing query parameter 'sheet'" }, 400);
    
    const targetId = e.parameter.id ? String(e.parameter.id) : null;
    const result = getSheetData(ss, sheetName);

    if (targetId) {
      const single = result.find(r => String(r.id) === targetId);
      if (single) return jsonResponse(single);
      return jsonResponse({ error: "Record not found" }, 404);
    }
    
    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ error: err.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}

// -------------------------------------------------------------
// POST API (Generic create, update, delete)
// -------------------------------------------------------------
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter;
    }

    let action = (payload.action || "").toLowerCase();
    const nowIso = new Date().toISOString();

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // --- UPLOAD FILE / IMAGE TO GOOGLE DRIVE (app_storage) ---
    if (action === "upload_file" || action === "upload_image") {
      const base64Data = payload.base64 || payload.data;
      if (!base64Data) {
        return jsonResponse({ error: "Missing base64 data" }, 400);
      }
      
      const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
      const mimeType = payload.mimeType || "image/jpeg";
      const fileName = payload.filename || ("file_" + new Date().getTime() + ".jpg");
      
      const cleanBase64 = String(base64Data).replace(/^data:image\/[a-z]+;base64,/, "");
      const decodedBytes = Utilities.base64Decode(cleanBase64);
      const blob = Utilities.newBlob(decodedBytes, mimeType, fileName);
      
      const file = folder.createFile(blob);
      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (shareErr) {
        Logger.log("Sharing note: " + shareErr);
      }
      
      const fileId = file.getId();
      const publicUrl = "https://lh3.googleusercontent.com/d/" + fileId;
      
      // If userId is provided, update avatarUrl in Users sheet automatically
      const targetUserId = payload.userId || payload.user_id;
      if (targetUserId) {
        const uSheet = ss.getSheetByName("Users");
        if (uSheet) {
          const uRows = uSheet.getDataRange().getValues();
          const uHeaders = uRows[0];
          const avatarCol = uHeaders.indexOf("avatarUrl");
          const idCol = uHeaders.indexOf("id");
          if (avatarCol !== -1 && idCol !== -1) {
            for (let r = 1; r < uRows.length; r++) {
              if (String(uRows[r][idCol]) === String(targetUserId)) {
                uSheet.getRange(r + 1, avatarCol + 1).setValue(publicUrl);
                break;
              }
            }
          }
        }
      }
      
      return jsonResponse({
        success: true,
        fileId: fileId,
        url: publicUrl,
        message: "File uploaded successfully to Google Drive"
      });
    }

    // Support for create_user
    if (action === "create_user") {
       payload.sheet = "Users";
       payload.data = {
         id: payload.id || "u_" + new Date().getTime(),
         name: payload.name || "Unknown",
         username: payload.username || (payload.email ? payload.email.split('@')[0] : ""),
         email: payload.email || "",
         password_hash: payload.password_hash || "",
         phone: payload.phone || "",
         location: payload.location || "",
         lat: (payload.lat !== undefined && payload.lat !== null && payload.lat !== "") ? payload.lat : "",
         lng: (payload.lng !== undefined && payload.lng !== null && payload.lng !== "") ? payload.lng : "",
         radiusKm: (payload.radiusKm !== undefined && payload.radiusKm !== null && payload.radiusKm !== "") ? payload.radiusKm : 5,
         avatarUrl: payload.avatarUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(payload.name || "User"),
         role: payload.role || "User",
         status: payload.status || "Aktif"
       };
       action = "create";
       payload.action = "create";
    }

    const sheetName = payload.sheet;
    if (!sheetName) return jsonResponse({ error: "Missing required 'sheet' attribute" }, 400);

    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return jsonResponse({ error: "Sheet '" + sheetName + "' not found" }, 404);

    const rows = sheet.getDataRange().getValues();
    if (rows.length === 0) return jsonResponse({ error: "Sheet is empty, missing headers" }, 400);
    const headers = rows[0];

    // --- CREATE ---
    if (action === "create") {
      const newId = payload.data.id || (sheetName.charAt(0).toLowerCase() + "_" + new Date().getTime());
      
      const newRow = headers.map(header => {
        const cleanHeader = (header || "").toString().trim();
        if (cleanHeader === "id") return newId;
        if (cleanHeader === "createdAt" || cleanHeader === "created_at") return nowIso;
        return payload.data && payload.data[cleanHeader] !== undefined ? payload.data[cleanHeader] : "";
      });

      sheet.appendRow(newRow);
      return jsonResponse({ success: true, message: "Created successfully", id: newId, user: payload.data }); // user included for legacy compatibility
    }

    // --- UPDATE ---
    if (action === "update") {
      if (!payload.id) return jsonResponse({ error: "Missing required 'id' for update" }, 400);
      
      const targetId = String(payload.id);
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === targetId) {
          const rowNum = i + 1;
          headers.forEach((header, colIdx) => {
            if (header !== "id" && header !== "createdAt" && payload.data && payload.data[header] !== undefined) {
              sheet.getRange(rowNum, colIdx + 1).setValue(payload.data[header]);
            }
          });
          return jsonResponse({ success: true, message: "Updated successfully", id: targetId });
        }
      }
      return jsonResponse({ error: "Record not found" }, 404);
    }

    // --- BATCH MARK READ FOR CHAT MESSAGES ---
    if (action === "mark_messages_read") {
      const msgSheet = ss.getSheetByName("Messages");
      if (msgSheet) {
        const mRows = msgSheet.getDataRange().getValues();
        if (mRows.length > 1) {
          const mHeaders = mRows[0];
          const isReadIdx = mHeaders.indexOf("is_read");
          const u1Idx = mHeaders.indexOf("user1_id");
          const u2Idx = mHeaders.indexOf("user2_id");
          const senderIdx = mHeaders.indexOf("sender_id");
          const uid = String(payload.userId || payload.user_id || "");
          const oid = String(payload.otherUserId || payload.other_user_id || "");

          if (isReadIdx !== -1 && u1Idx !== -1 && u2Idx !== -1) {
            for (let r = 1; r < mRows.length; r++) {
              const u1 = String(mRows[r][u1Idx]);
              const u2 = String(mRows[r][u2Idx]);
              const snd = String(mRows[r][senderIdx]);
              const isMatch = (u1 === uid && u2 === oid) || (u1 === oid && u2 === uid);
              if (isMatch && snd !== uid) {
                if (String(mRows[r][isReadIdx]).toUpperCase() !== "TRUE") {
                  msgSheet.getRange(r + 1, isReadIdx + 1).setValue("TRUE");
                }
              }
            }
          }
        }
      }
      return jsonResponse({ success: true, message: "Messages marked as read successfully" });
    }

    // --- DELETE ---
    if (action === "delete") {
      if (!payload.id) return jsonResponse({ error: "Missing required 'id' for delete" }, 400);
      const targetId = String(payload.id);
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === targetId) {
          sheet.deleteRow(i + 1);
          return jsonResponse({ success: true, message: "Deleted successfully", id: targetId });
        }
      }
      return jsonResponse({ error: "Record not found" }, 404);
    }

    return jsonResponse({ error: "Invalid action. Supported: create, update, delete" }, 400);
  } catch (err) {
    return jsonResponse({ error: err.toString() }, 500);
  } finally {
    lock.releaseLock();
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
