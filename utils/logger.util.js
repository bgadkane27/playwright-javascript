export function logSummary(name, code) {
  console.info('===== Duplicate Master Not Allowed Validation Summary =====\n');
  console.info(`✅ Validated Master Name: ${name}`);
  console.info(`✅ Validated Master Code: ${code ? code : 'Not Applicable'}`);
  console.info(`🕒 Test Executed At: ${new Date().toLocaleString('en-IN')}`);
  console.info('======================================\n');
}
