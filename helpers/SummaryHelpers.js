import fs from 'fs';
import path from 'path';

export default class SummaryHelper {
  static exportDeleteSummary(moduleName, deleted, skipped) {
    const summary = {
      module: moduleName,
      totalRecordsAttempted: deleted.length + skipped.length,
      deletedCount: deleted.length,
      skippedCount: skipped.length,
      deletedRecords: deleted,
      skippedRecords: skipped,
      executedAt: new Date().toLocaleString('en-IN')
    };

    const outputDir = path.resolve('reports/summaries');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 📄 JSON
    fs.writeFileSync(
      path.join(outputDir, `${moduleName}-delete-summary.json`),
      JSON.stringify(summary, null, 2)
    );

    // 🌐 HTML
    fs.writeFileSync(
      path.join(outputDir, `${moduleName}-delete-summary.html`),
      this.generateHtml(summary)
    );
  }

  static generateHtml(summary) {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>${summary.module} Delete Summary</title>
  <style>
    body { font-family: Arial; padding: 20px; }
    h1 { color: #000000; }
    .success { color: green; }
    .failed { color: orange; }
    ul { margin-left: 20px; }
  </style>
</head>
<body>
  <h1>🧾 ${summary.module} Delete Summary</h1>  
  <p><b>Total Records Attempted:</b> ${summary.totalRecordsAttempted}</p>
  <p class="success"><b>Deleted:</b> ${summary.deletedCount}</p> 
  <h3 class="success">🗑️ Deleted Records</h3>
  <ol>
    ${summary.deletedRecords.map(r => `<li>${r}</li>`).join('')}
  </ol>
  <p class="failed"><b>Skipped:</b> ${summary.skippedCount}</p>
  <h3 class="failed">🚫 Skipped Records</h3>
  <ol>
    ${summary.skippedRecords.map(r => `<li>${r}</li>`).join('')}
  </ol>
  <p><b>Executed At:</b> ${summary.executedAt}</p>
</body>
</html>`;
  }
}
