import fs from 'fs';
import path from 'path';

export class SummaryHelper {

    /**
     * Logs a generic CRUD summary report in console.
     *
     * @param {Object} options
     * @param {string} options.entityName - Master name with description
     * @param {'Create'|'Update'|'Delete'} options.action - Action performed
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
        console.info(`✅ Success records: ${successRecords.length}`);

        if (successRecords.length) {
            console.info(`🟢 ${action}d records: ${successRecords.join(', ')}`);
        }

        console.info(`⚠️ Skipped/Failed records: ${skippedRecords.length}`);

        if (skippedRecords.length) {
            console.info(`🔴 Skipped/Failed records: ${skippedRecords.join(', ')}`);
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
    static logValidationSummary(masterName, masterCode) {
        console.info('===== Duplicate Master Creation Not Allowed Validation Summary =====\n');
        console.info(`✅ Validated Master Name: ${masterName}`);
        console.info(`✅ Validated Master Code: ${masterCode || 'Not Applicable'}`);
        console.info(`🕒 Test executed at: ${new Date().toLocaleString('en-IN')}`);
        console.info('==============================================\n');
    }

    /**
     * Export a generic CRUD summary report to files (JSON & HTML)
     *
     * @param {Object} options
     * @param {string} options.entityName - Master name with description
     * @param {'Create'|'Update'|'Delete'} options.action - Action performed
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

        // const fileBaseName = `${entityName}-${action}-Summary`;
        const fileBaseName = `${entityName.replace(/[^a-z0-9]/gi, '_')}_${action}_Summary`;

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
        body { font-family: Arial; padding: 20px; color: #d2d2d2; background: #1a1a1a; }
        li { color: #1f9aff; }
        p { color: #1f9aff;}
        .success { color: #66ff66c1; }
        .failed { color: #fff833d0; }
        ul { margin-left: 20px; }
      </style>
    </head>
    <body>
      <h2>${summary.module} ${summary.action} Summary</h2>

      <h3>Total records attempted: ${summary.total}</h3>
      <h4 class="success">✅ Success records: ${summary.successCount}</h4>
      <h4 class="success">✅ Success records</h4>
      <ul>
        ${summary.successRecords.length
                ? summary.successRecords.map(r => `<li>${r}</li><br />`).join('')
                : `<p>No Record ${summary.action}d</p>`}
      </ul>

      <h4 class="failed">🚫 Skipped / Failed records: ${summary.skippedCount}</h4>
      <h4 class="failed">🚫 Skipped / Failed records</h4>
      <ul>
        ${summary.skippedRecords.length
                ? summary.skippedRecords.map(r => `<li>${r}</li><br />`).join('')
                : '<p>No Record Skipped / Failed</p>'}
      </ul>

      <p>Executed at: ${summary.executedAt}</p>
    </body>
    </html>`;
    }

}