/**
 * ==============================================================================
 * NEIGHBOURLOOP - GOOGLE APPS SCRIPT DATABASE API (DYNAMIC CRUD)
 * ==============================================================================
 */

const DRIVE_FOLDER_ID = "13RieHioFy2OKIWQJ3E9ROxxXn_7TyOzb"; // Folder ID asal anda

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
    
    // Legacy support for create_user so that the existing Python backend doesn't instantly crash
    if (action === "create_user") {
       payload.sheet = "Users";
       payload.data = {
         id: payload.id || "u_" + new Date().getTime(),
         name: payload.name || "Unknown",
         email: payload.email || "",
         password_hash: payload.password_hash || "",
         phone: payload.phone || "",
         location: payload.location || "",
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
