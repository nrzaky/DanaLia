/**
 * Tabungan Lia — Google Apps Script
 *
 * Instructions:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Replace all code with this file's content
 * 4. Click Deploy > New Deployment
 * 5. Type: Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the Web App URL
 * 7. Set GOOGLE_SHEET_WEBHOOK_URL=<your url> in .env
 */

const SHEET_NAME = 'Transaksi'

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName(SHEET_NAME)
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME)
    // Header row
    sheet.getRange(1, 1, 1, 6).setValues([['ID', 'Tanggal', 'Jumlah', 'Metode', 'Pesan', 'Bukti']])
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold')
    sheet.setFrozenRows(1)
  }
  return sheet
}

function findRowById(sheet, id) {
  const data = sheet.getDataRange().getValues()
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) return i + 1 // 1-indexed
  }
  return -1
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents)
    const { action, id, amount, paymentMethod, depositMessage, transactionDate, proofUrl } = payload
    const sheet = getOrCreateSheet()

    const dateStr = transactionDate ? new Date(transactionDate).toLocaleDateString('id-ID') : ''
    const amountNum = Number(amount)

    if (action === 'create') {
      sheet.appendRow([id, dateStr, amountNum, paymentMethod || '', depositMessage || '', proofUrl || ''])
    } else if (action === 'update') {
      const row = findRowById(sheet, id)
      if (row > 0) {
        sheet.getRange(row, 1, 1, 6).setValues([[id, dateStr, amountNum, paymentMethod || '', depositMessage || '', proofUrl || '']])
      }
    } else if (action === 'delete') {
      const row = findRowById(sheet, id)
      if (row > 0) sheet.deleteRow(row)
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON)
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'Tabungan Lia Webhook active' }))
    .setMimeType(ContentService.MimeType.JSON)
}
