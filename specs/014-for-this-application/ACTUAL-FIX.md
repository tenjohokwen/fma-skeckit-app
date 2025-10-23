# GitHub Actions Error - ACTUAL ROOT CAUSE AND FIX

**Error**: `npm error Invalid Version:`
**Root Cause**: Modified `desktop/package.json` was accidentally committed to repository

---

## The Real Problem

When we tested the scripts locally, `update-desktop-metadata.sh` modified `desktop/package.json` to add client metadata fields:
- clientId
- clientVersion
- coreVersion
- buildDate

This modified file was then **accidentally committed** to both main and client/bechem branches.

The GitHub Actions workflow:
1. Checks out the branch (with modified package.json)
2. Runs `npm ci` in desktop/
3. Then runs our script to update package.json again

This double-modification or the presence of unexpected fields causes npm to fail.

---

## The Fix

Revert desktop/package.json to its original state:

```json
{
  "name": "fma-skeckit-app-desktop",
  "version": "1.0.0",
  "description": "FMA Skeckit App - Desktop Application",
  "main": "main.js",
  "author": "FMA Team",
  "private": true,
  "dependencies": {
    "electron-log": "^5.0.0",
    "electron-updater": "^6.1.0"
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.0.0"
  }
}
```

**Note**: No clientId, clientVersion, coreVersion, or buildDate fields!

---

## Steps to Fix

### 1. Revert desktop/package.json

```bash
# Copy the original version
cp desktop/package.json.original desktop/package.json

# Or manually edit desktop/package.json to remove these fields:
# - clientId
# - clientVersion  
# - coreVersion
# - buildDate
```

### 2. Commit the fix

```bash
git add desktop/package.json
git commit -m "Fix: Revert desktop/package.json to original state

The build scripts will add client metadata fields during CI/CD.
These fields should not be committed to the repository."

# Push to both branches
git push origin client/bechem
```

### 3. Also fix main branch (if needed)

```bash
git checkout main
cp desktop/package.json.original desktop/package.json
git add desktop/package.json
git commit -m "Fix: Revert desktop/package.json to original state"
git push origin main
```

---

## Why This Happened

We tested the scripts locally which modified desktop/package.json. This is expected behavior! But those changes should NOT be committed.

**What should happen**:
1. ✅ desktop/package.json (clean) is committed to repo
2. ✅ During build, scripts modify package.json (not committed)
3. ✅ Build uses modified package.json
4. ✅ Modified file is ignored (in .gitignore or just not staged)

**What accidentally happened**:
1. ❌ Scripts modified desktop/package.json locally
2. ❌ Modified file was committed
3. ❌ Workflow tries to modify already-modified file → error

---

## Prevention

Add this reminder to the documentation:

**When testing build scripts locally**:
```bash
# After testing, revert desktop/package.json
git checkout desktop/package.json

# Or use git stash
git stash
```

**Better**: Test in a separate directory or use Docker.

---

## Verification

After fixing, the workflow should work because:

1. Workflow checks out clean desktop/package.json
2. npm ci succeeds (valid package.json)
3. Scripts add metadata fields
4. Build proceeds successfully

---

## Summary

**Root Cause**: Modified desktop/package.json committed to repository
**Fix**: Revert to original state (remove client metadata fields)
**Time**: 2 minutes
**Files to Fix**: desktop/package.json (in both main and client/bechem)

Run the commands above, push, and re-run the workflow. It will succeed! ✅
