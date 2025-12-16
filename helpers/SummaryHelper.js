import fs from 'fs';
import path from 'path';

export default class SummaryHelper {

  /* ===========================
     CREATE SUMMARY
  ============================ */
  static exportCreateSummary(moduleName, created, skipped) {
    this.exportSummary(moduleName, 'Create', created, skipped);
  }

  /* ===========================
     UPDATE SUMMARY
  ============================ */
  static exportUpdateSummary(moduleName, updated, skipped) {
    this.exportSummary(moduleName, 'Update', updated, skipped);
  }

  /* ===========================
     DELETE SUMMARY
  ============================ */
  static exportDeleteSummary(moduleName, deleted, skipped) {
    this.exportSummary(moduleName, 'Delete', deleted, skipped);
  }

  /* ===========================
     COMMON SUMMARY HANDLER
  ============================ */
  static exportSummary(moduleName, action, successRecords, skippedRecords) {
    const summary = {
      module: moduleName,
      action,
      totalRecordsAttempted: successRecords.length + skippedRecords.length,
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

    // 📄 JSON
    fs.writeFileSync(
      path.join(outputDir, `${moduleName}-${action.toLowerCase()}-summary.json`),
      JSON.stringify(summary, null, 2)
    );

    // 🌐 HTML
    fs.writeFileSync(
      path.join(outputDir, `${moduleName}-${action.toLowerCase()}-summary.html`),
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
  <h1>🧾 ${summary.module} ${summary.action} Summary</h1>

  <p><b>Total Records Attempted:</b> ${summary.totalRecordsAttempted}</p>
  <p class="success"><b>Success:</b> ${summary.successCount}</p>

  <h3 class="success">✅ ${summary.action}d Records</h3>
  <ol>
    ${summary.successRecords.map(r => `<li>${r}</li>`).join('')}
  </ol>

  <p class="failed"><b>Skipped / Failed:</b> ${summary.skippedCount}</p>

  <h3 class="failed">🚫 Skipped/Failed Records</h3>
  <ol>
    ${summary.skippedRecords.map(r => `<li>${r}</li>`).join('')}
  </ol>

  <p><b>Executed At:</b> ${summary.executedAt}</p>
</body>
</html>`;
  }
}
