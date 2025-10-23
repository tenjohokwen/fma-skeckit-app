const fs = require('fs');

function checkFile(filepath) {
  if (!fs.existsSync(filepath)) {
    console.log(`⚠️  Skipping ${filepath} (not found)`);
    return true;
  }

  const content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  const bad = [];

  function traverse(obj, path = 'root') {
    if (!obj || typeof obj !== 'object') return;

    for (const key of Object.keys(obj)) {
      if (key === 'version' && obj[key] !== undefined) {
        const version = obj[key];
        const fullPath = `${path}.${key}`;

        // Check for invalid versions
        if (version === '' || version === null) {
          bad.push(`${fullPath}: EMPTY (${JSON.stringify(version)})`);
        } else if (typeof version === 'string') {
          // Very basic check - valid versions should have at least one digit
          if (!version.match(/\d/) && !version.startsWith('git') && !version.startsWith('http') && !version.startsWith('file')) {
            bad.push(`${fullPath}: "${version}" (no digits, not a URL)`);
          }
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        traverse(obj[key], path === 'root' ? key : `${path}.${key}`);
      }
    }
  }

  traverse(content);

  if (bad.length > 0) {
    console.error(`❌ Invalid versions in ${filepath}:`);
    bad.forEach(msg => console.error(`   ${msg}`));
    return false;
  } else {
    console.log(`✅ ${filepath} - all versions valid`);
    return true;
  }
}

let allOk = true;
allOk = checkFile('package.json') && allOk;
allOk = checkFile('package-lock.json') && allOk;
allOk = checkFile('desktop/package.json') && allOk;

if (!allOk) {
  console.error('\n❌ Found invalid version fields!');
  process.exit(1);
} else {
  console.log('\n✅ All version fields are valid!');
  process.exit(0);
}
