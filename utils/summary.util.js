import fs from 'fs';
import path from 'path';

export class SummaryUtil {

  /**
   * Logs a generic CRUD summary report in console.
   *
   * @param {Object} options
   * @param {string} options.entityName - Master name (Supplier, Customer, etc.)
   * @param {'create'|'update'|'delete'} options.action - Action performed
   * @param {Array<string>} options.successRecords - Successfully processed records
   * @param {Array<string>} options.skippedRecords - Skipped or failed records
   * @param {number} options.totalCount - Total records attempted
   */
  static logCrudSummary({
    entityName,
    action,
    successRecords = [],
    skippedRecords = [],
    totalCount = 0
  }) {
    console.info(`\n========== ${entityName} ${action} Summary ==========`);

    console.info(`📄 Total records attempted: ${totalCount}`);
    console.info(`✅ Successfully ${action}d records: ${successRecords.length}`);

    if (successRecords.length) {
      console.info(`🟢 ${action}d record names: ${successRecords.join(', ')}`);
    }

    console.info(`⚠️ Skipped/Failed records: ${skippedRecords.length}`);

    if (skippedRecords.length) {
      console.info(`🔴 Skipped record names: ${skippedRecords.join(', ')}`);
    }

    console.info(`🕒 Test executed at: ${new Date().toLocaleString('en-IN')}\n`);
    console.info('=====================================================');
  }

  /**
   * Logs duplicate master creation not allowed validation summary.
   * 
   * @param {string} masterName - Name of the master (Supplier, Customer, etc.) 
   * @param {string} masterCode - Code of the master (Supplier, Customer, etc.)
   */
  static logValidateSummary(masterName, masterCode) {
    console.info('===== Duplicate Master Creation Not Allowed Validation Summary =====\n');
    console.info(`✅ Validated Master Name: ${masterName}`);
    console.info(`✅ Validated Master Code: ${masterCode || 'Not Applicable'}`);
    console.info(`🕒 Test executed at: ${new Date().toLocaleString('en-IN')}`);
    console.info('==============================================\n');
  }

  /**
   * Export a generic CRUD summary report in console.
   *
   * @param {Object} options
   * @param {string} options.entityName - Master name (Supplier, Customer, etc.)
   * @param {'create'|'update'|'delete'} options.action - Action performed
   * @param {Array<string>} options.successRecords - Successfully processed records
   * @param {Array<string>} options.skippedRecords - Skipped or failed records
   * @param {number} options.totalCount - Total records attempted
   */
  static exportCrudSummary({
    entityName,
    action,
    successRecords = [],
    skippedRecords = [],
    totalCount = 0
  }) {    
    const summary = {
      module: entityName,
      action,
      total: totalCount ?? successRecords.length + skippedRecords.length,
      successCount: successRecords.length,
      skippedCount: skippedRecords.length,
      successRecords,
      skippedRecords,
      executedAt: new Date().toLocaleString('en-IN')
    };

    const outputDir = path.resolve('reports/summaries');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileBaseName = `${entityName}-${action.toLowerCase()}-Summary`;

    // 📄 JSON
    fs.writeFileSync(
      path.join(outputDir, `${fileBaseName}.json`),
      JSON.stringify(summary, null, 2)
    );

    // 🌐 HTML
    fs.writeFileSync(
      path.join(outputDir, `${fileBaseName}.html`),
      this.generateHtml(summary)
    );
  }

  /* ===========================
     HTML GENERATOR
  ============================ */
  static generateHtml(summary) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${summary.module} ${summary.action} Summary</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        h1 { color: #000; }
        .success { color: green; }
        .failed { color: red; }
        ol { margin-left: 20px; }
      </style>
    </head>
    <body>
      <h1>🧾 ${summary.module} ${summary.action} summary</h1>

      <p><b>Total records attempted:</b> ${summary.total}</p>
      <p class="success"><b>Success records: ${summary.successCount}</b></p>

      <h3 class="success">✅ ${summary.action}d record names</h3>
      <ul>
        ${summary.successRecords.length
        ? summary.successRecords.map(r => `<li>${r}</li><br />`).join('')
        : '<p>No record deleted</p>'}
      </ul>

      <p class="failed"><b>Skipped / Failed records: ${summary.skippedCount}</b></p>

      <h3 class="failed">🚫 Skipped / Failed record names</h3>
      <ul>
        ${summary.skippedRecords.length
        ? summary.skippedRecords.map(r => `<li>${r}</li><br />`).join('')
        : '<p>No record skipped</p>'}
      </ul>

      <p><b>Executed at:</b> ${summary.executedAt}</p>
    </body>
    </html>`;
  }

}