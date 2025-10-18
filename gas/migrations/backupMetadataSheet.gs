/**
 * Feature 006: Backup Script
 * Creates a backup of the metadata sheet before implementing clientId column
 *
 * @author Development Team
 * @date 2025-10-18
 */

/**
 * Creates a backup copy of the metadata sheet
 * @returns {string} Name of the backup sheet
 */
function backupMetadataSheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet()
    const metadataSheet = ss.getSheetByName('metadata')

    if (!metadataSheet) {
      throw new Error('Metadata sheet not found')
    }

    // Create backup with timestamp
    const timestamp = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyy-MM-dd_HHmmss'
    )
    const backupName = `metadata_backup_${timestamp}`

    // Copy sheet
    const backup = metadataSheet.copyTo(ss)
    backup.setName(backupName)

    // Add protection to prevent accidental edits
    const protection = backup.protect().setDescription('Backup - Do Not Edit')
    protection.setWarningOnly(true)

    Logger.log(`✅ Backup created: ${backupName}`)
    Logger.log(`   Total rows: ${metadataSheet.getLastRow()}`)
    Logger.log(`   Total columns: ${metadataSheet.getLastColumn()}`)

    return backupName
  } catch (error) {
    Logger.log(`❌ Backup failed: ${error.message}`)
    throw error
  }
}

/**
 * Creates a backup and exports to CSV for extra safety
 * @returns {Object} Backup details
 */
function backupMetadataSheetWithExport() {
  const sheetName = backupMetadataSheet()

  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const backupSheet = ss.getSheetByName(sheetName)

  Logger.log(``)
  Logger.log(`📋 BACKUP INSTRUCTIONS:`)
  Logger.log(`   1. Sheet backed up as: "${sheetName}"`)
  Logger.log(`   2. To download CSV:`)
  Logger.log(`      - Open the backup sheet`)
  Logger.log(`      - File > Download > CSV`)
  Logger.log(`   3. Store CSV in safe location`)
  Logger.log(``)

  return {
    backupSheetName: sheetName,
    timestamp: new Date(),
    rowCount: backupSheet.getLastRow(),
    columnCount: backupSheet.getLastColumn()
  }
}
