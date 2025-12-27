export class SummaryUtil {

  /**
   * Prints a delete summary report in console.
   *
   * @param {string} entityName - Name of the master (Supplier, Customer, etc.)
   * @param {Array<string>} deletedRecords - Successfully deleted records
   * @param {Array<string>} skippedRecords - Skipped or failed records
   * @param {number} totalCount - Total records attempted
   */
  static printDeleteSummary(entityName, deletedRecords, skippedRecords, totalCount) {
    console.info(`========== ${entityName} delete summary ==========\n`);

    console.info(`✅ Total records attempted: ${totalCount}`);
    console.info(`✅ Successfully deleted records: ${deletedRecords.length}`);

    if (deletedRecords.length) {
      console.info(`✅ Deleted records name: ${deletedRecords.join(', ')}`);
    }

    console.info(`✅ Skipped/Failed records: ${skippedRecords.length}`);

    if (skippedRecords.length) {
      console.info(`✅ Skipped records name: ${skippedRecords.join(', ')}`);
    }

    console.info(`🕒 Test executed at: ${new Date().toLocaleString('en-IN')}\n`);
    console.info('===============================================');
  }

  /**
   * Prints a validation summary report in console.
   *
   * @param {string} masterName - Name of the master (Supplier, Customer, etc.)
   * @param {string} masterCode - Code of the master (Supplier, Customer, etc.)
   */

  static validationSummary(masterName, masterCode) {
    console.info('===== Duplicate Master Not Allowed Validation Summary =====\n');
    console.info(`✅ Validated Master Name: ${masterName}`);
    console.info(`✅ Validated Master Code: ${masterCode ? masterCode : 'Not Applicable'}`);
    console.info(`🕒 Test Executed At: ${new Date().toLocaleString('en-IN')}`);
    console.info('======================================\n');
  }
}