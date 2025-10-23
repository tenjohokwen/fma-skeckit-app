const fs = require('fs');

// Try to load semver for proper validation, fall back to basic checks
let semver = null;
try {
  semver = require('semver');
  console.log('✓ Using semver package for strict validation');
} catch (e) {
  console.log('⚠️  semver package not found, using basic validation (install with: npm install --save-dev semver)');
}

function isValidVersion(version) {
  // Empty or null is always invalid
  if (version === '' || version === null || version === undefined) {
    return false;
  }

  const versionStr = String(version);

  // If we have semver, use it for strict validation
  if (semver) {
    // Check if it's a valid semver or valid range
    return semver.valid(versionStr) !== null ||
           semver.validRange(versionStr) !== null ||
           versionStr.startsWith('git') ||
           versionStr.startsWith('http') ||
           versionStr.startsWith('file') ||
           versionStr.startsWith('workspace:');
  }

  // Fallback: basic pattern check
  // Valid versions should have at least one digit or be a special protocol
  if (versionStr.startsWith('git') ||
      versionStr.startsWith('http') ||
      versionStr.startsWith('file') ||
      versionStr.startsWith('workspace:')) {
    return true;
  }

  // Should have at least one digit for version numbers
  return /\d/.test(versionStr);
}

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

        if (!isValidVersion(version)) {
          bad.push(`${fullPath}: "${version}" (invalid semver)`);
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
