# Merge Workflow: Updating Client Branches with Core Changes

**Last Updated**: 2025-10-23
**Feature**: Multi-Client Branching Strategy (Feature 014)

## Overview

This document provides step-by-step instructions for merging core application updates (`main` branch) into client branches (`client/bechem`, etc.). Regular merges keep client branches synchronized with core improvements while preserving client-specific customizations.

## Merge Frequency

**Recommended Schedule**: Weekly or bi-weekly

### Why Frequent Merges Matter

| Frequency | Conflict Risk | Merge Difficulty | Recommended? |
|-----------|---------------|------------------|--------------|
| **Weekly** | Low | Easy | ✅ Yes - Ideal |
| **Bi-weekly** | Moderate | Moderate | ⚠️ Acceptable |
| **Monthly** | High | Difficult | ❌ No |
| **Ad-hoc** | Very High | Very Difficult | ❌ No |

**Rationale**: Smaller, frequent merges are easier to manage than large, infrequent merges. A week's worth of changes is typically manageable; a month's worth can be overwhelming.

## Prerequisites

Before merging, ensure:

1. ✅ You have local clone of the repository
2. ✅ You have write access to the client branch
3. ✅ All local changes are committed or stashed
4. ✅ You have 30-60 minutes available for merge + testing

## Standard Merge Workflow

### Step 1: Prepare Your Environment

```bash
# Navigate to repository
cd /path/to/fma-skeckit-app

# Ensure you're starting clean
git status
# Should show "working tree clean"

# If you have uncommitted changes, stash them
git stash save "WIP before merge"
```

### Step 2: Update Local Branches

```bash
# Fetch latest from remote
git fetch origin

# Checkout the client branch
git checkout client/bechem

# Ensure client branch is up-to-date
git pull origin client/bechem

# View what's new in main
git log client/bechem..origin/main --oneline
# This shows commits that will be merged
```

**Review the log output** to understand what changes are coming from core.

### Step 3: Merge Main into Client Branch

```bash
# Merge main into client branch
git merge origin/main

# If merge is successful (no conflicts):
# You'll see "Merge made by the 'recursive' strategy" or similar
```

#### If Merge is Clean (No Conflicts)

```bash
# Verify merge was successful
git status
# Should show "On branch client/bechem, Your branch is ahead..."

# Skip to Step 5 (Testing)
```

#### If Merge Has Conflicts

```bash
# Git will report conflicts, example:
# CONFLICT (content): Merge conflict in src/components/Dashboard.vue
# Automatic merge failed; fix conflicts and then commit the result.

# View conflicted files
git status
# Files with conflicts will be marked "both modified"

# Proceed to Step 4 (Conflict Resolution)
```

### Step 4: Resolve Conflicts

#### 4a. Identify Conflict Types

For each conflicted file, determine the conflict type:

```bash
# View conflicts in a file
git diff src/components/Dashboard.vue

# Or open in your editor/IDE
code src/components/Dashboard.vue
```

#### 4b. Apply Decision Tree

Use this decision tree for each conflict:

```
Conflicted file path:
│
├── config/clients/*.json
│   └── RESOLUTION: Keep client version (merge=ours should handle this automatically)
│
├── branding/**/*
│   └── RESOLUTION: Keep client version (merge=ours should handle this automatically)
│
├── src/**/* (application code)
│   ├── Is this a bug fix from core?
│   │   └── RESOLUTION: Accept core version (theirs)
│   │
│   ├── Is this a new feature from core?
│   │   ├── Does client have customization in this area?
│   │   │   ├── YES: Manually merge both changes
│   │   │   └── NO: Accept core version (theirs)
│   │   └── RESOLUTION: Evaluate case-by-case
│   │
│   └── Complex conflict?
│       └── RESOLUTION: Consult team, create test branch first
│
├── tests/**/*
│   └── RESOLUTION: Keep both changes, update tests to pass
│
├── package.json / package-lock.json
│   └── RESOLUTION: Accept core version, then run npm install
│
└── Other files (docs, configs, etc.)
    └── RESOLUTION: Evaluate case-by-case
```

#### 4c. Resolve Each File

**Option 1: Keep Ours (Client Version)**
```bash
git checkout --ours path/to/conflicted-file.js
git add path/to/conflicted-file.js
```

**Option 2: Keep Theirs (Core Version)**
```bash
git checkout --theirs path/to/conflicted-file.js
git add path/to/conflicted-file.js
```

**Option 3: Manual Resolution**
```bash
# Open file in editor
code path/to/conflicted-file.js

# Look for conflict markers:
# <<<<<<< HEAD (your changes)
# ... client code ...
# =======
# ... core code ...
# >>>>>>> origin/main (incoming changes)

# Edit file to keep desired changes from both sides
# Remove conflict markers (<<<<<<< ======= >>>>>>>)
# Save file

# Stage resolved file
git add path/to/conflicted-file.js
```

#### 4d. Verify All Conflicts Resolved

```bash
# Check status
git status

# Should NOT see "Unmerged paths" or "both modified"
# All files should be "Changes to be committed"

# If any files still show conflicts, repeat Step 4c for those files
```

#### 4e. Complete the Merge

```bash
# Commit the merge
git commit -m "Merge main into client/bechem - [brief description of changes]"

# Example:
# git commit -m "Merge main into client/bechem - Dashboard performance improvements + new analytics"
```

### Step 5: Test After Merge

**CRITICAL**: Never skip testing after a merge. Merged code may not work correctly even if conflicts were resolved.

#### 5a. Validate Configuration

```bash
# Validate client configuration still works
./scripts/validate-client-config.sh bechem

# Should output:
# ✓ Config file exists
# ✓ JSON is valid
# ✓ All required fields present
# ... (all checks pass)
```

#### 5b. Build Web Application

```bash
# Build web app
npm run build

# Watch for errors
# Build should complete successfully
```

#### 5c. Build Desktop Application

```bash
# Build desktop app for your platform
npm run electron:build:mac  # macOS
# or
npm run electron:build:win  # Windows
# or
npm run electron:build:linux  # Linux

# Build should complete successfully
```

#### 5d. Run Tests (if available)

```bash
# Run test suite
npm test

# All tests should pass
# If tests fail, investigate and fix before pushing
```

#### 5e. Manual Testing

Launch the desktop application and verify:

- [ ] Application launches successfully
- [ ] Client branding appears correctly (name, logo, colors)
- [ ] About dialog shows correct version info
- [ ] Key functionality works (dashboard, navigation, etc.)
- [ ] No console errors in dev tools
- [ ] Client-specific features work as expected

**If any issues found**: Fix them before pushing the merge.

### Step 6: Push Merged Changes

```bash
# Push to remote
git push origin client/bechem

# If push is rejected (unlikely):
# Someone else may have pushed to client branch
git pull origin client/bechem --rebase
git push origin client/bechem
```

### Step 7: Document the Merge

Add entry to version matrix if this is a significant update:

```bash
# If core version changed significantly, update version matrix
./scripts/update-version-matrix.sh bechem [client-version] [new-core-version] Development "Merged core v[X.Y.Z]"

# Example:
./scripts/update-version-matrix.sh bechem 1.0.0 1.5.0 Development "Merged core v1.5.0 - Dashboard improvements"

# Commit version matrix update
git add docs/version-matrix.md
git commit -m "Update version matrix after core merge"
git push origin client/bechem
```

## Common Merge Scenarios

### Scenario 1: Clean Merge (No Conflicts)

**What Happened**: All core changes are compatible with client customizations.

**Action**:
- ✅ Complete merge
- ✅ Test thoroughly
- ✅ Push

**Estimated Time**: 15-20 minutes (mostly testing)

### Scenario 2: Config/Branding Conflicts

**What Happened**: Core changed files that should be client-specific (shouldn't happen with proper `.gitattributes`).

**Action**:
- ✅ Keep client version (`git checkout --ours`)
- ✅ Test
- ✅ Push

**Estimated Time**: 10-15 minutes

### Scenario 3: Application Code Conflicts

**What Happened**: Core and client both modified the same application files.

**Action**:
- ⚠️ Evaluate each conflict
- ⚠️ Prefer core version for bug fixes
- ⚠️ Manually merge for feature conflicts
- ⚠️ Test extensively
- ✅ Push

**Estimated Time**: 30-60 minutes (depending on complexity)

### Scenario 4: Dependency Conflicts (package.json)

**What Happened**: Core updated dependencies that conflict with client's.

**Action**:
- ✅ Accept core version (`git checkout --theirs package.json package-lock.json`)
- ✅ Run `npm install` to update dependencies
- ✅ Test thoroughly (dependency changes can break things)
- ✅ Push

**Estimated Time**: 20-30 minutes

### Scenario 5: Major Core Refactoring

**What Happened**: Core did significant refactoring that conflicts with client customizations.

**Action**:
- ⚠️ Create test branch first
- ⚠️ Merge into test branch
- ⚠️ Resolve conflicts carefully
- ⚠️ Test extensively on test branch
- ⚠️ Review with team
- ✅ Merge to client branch after validation
- ✅ Push

**Estimated Time**: 2-4 hours

## Troubleshooting

### Problem: Too Many Conflicts

**Symptoms**: 10+ conflicted files after merge

**Cause**: Client branch has diverged significantly from main

**Solutions**:

**Option A: Incremental Merge**
```bash
# Abort current merge
git merge --abort

# Find intermediate commits
git log client/bechem..origin/main --oneline

# Merge one feature/commit at a time
git merge <commit-hash-1>
# resolve, test, commit
git merge <commit-hash-2>
# resolve, test, commit
# ... continue until caught up
```

**Option B: Team Assistance**
```bash
# Create merge branch
git checkout -b merge-main-into-bechem-2025-10-23

# Attempt merge
git merge origin/main

# Get help resolving conflicts
# Once resolved, create PR to client/bechem for review
```

### Problem: Tests Fail After Merge

**Symptoms**: Build succeeds but tests fail

**Cause**: Core changes broke client-specific logic or tests

**Solution**:
```bash
# Identify failing tests
npm test -- --verbose

# Update tests to work with new core code
# Or update client code to work with new core behavior

# Ensure tests pass before pushing
```

### Problem: Application Doesn't Start After Merge

**Symptoms**: Build succeeds but app crashes on launch

**Cause**: Runtime incompatibility between core and client code

**Solution**:
```bash
# Check dev console for errors
# Identify which component/module is failing

# Options:
# 1. Fix client code to be compatible with new core
# 2. Temporarily revert merge, investigate offline
# 3. Ask team for help

# DO NOT push until app launches successfully
```

### Problem: Lost Client Customizations

**Symptoms**: Client features missing after merge

**Cause**: Accidentally accepted core version over client customizations

**Solution**:
```bash
# View what was lost
git diff origin/client/bechem HEAD -- path/to/affected/file.js

# If not yet pushed, reset to before merge
git reset --hard origin/client/bechem
# Then re-attempt merge more carefully

# If already pushed, create fix commit
# Restore lost customizations manually
git commit -m "Restore client customizations lost in merge"
git push origin client/bechem
```

## Best Practices

### ✅ DO

- **Merge regularly** (weekly recommended)
- **Test after every merge** before pushing
- **Read core commit messages** to understand changes
- **Keep merge commits descriptive**
- **Ask for help** with complex conflicts
- **Document significant merges** in version matrix
- **Create test branch** for risky merges
- **Run full test suite** after merge

### ❌ DON'T

- **Don't skip testing** (ever!)
- **Don't merge when low on time** (30+ minutes needed)
- **Don't force push** to client branches (use with extreme caution)
- **Don't blindly accept theirs** without reviewing
- **Don't merge partial work** from core (wait for feature completion)
- **Don't forget to update dependencies** after package.json merge
- **Don't push failing builds**

## Emergency Procedures

### Undo a Pushed Merge

**WARNING**: Only do this if merge was just pushed and no one else has pulled it.

```bash
# Reset to commit before merge
git reset --hard HEAD~1

# Force push (DANGEROUS!)
git push origin client/bechem --force

# Notify team immediately
```

**Better approach**: Create a revert commit instead:

```bash
# Revert the merge commit
git revert -m 1 HEAD

# Push revert commit
git push origin client/bechem

# This preserves history, safer than force push
```

### Core Breaks Client Functionality

**If core introduces breaking change**:

1. **Document issue**:
   - File issue in repository
   - Tag as "breaking-change"
   - CC responsible developer

2. **Temporary fix in client branch**:
   - Create compatibility layer in client code
   - Add TODO comment referencing issue

3. **Long-term**: Work with core team to restore compatibility

## Automated Merge Conflict Prevention

The `.gitattributes` file automates conflict resolution for known patterns:

```gitattributes
# Client config - always keep client version
config/clients/*.json merge=ours

# Branding - always keep client version
branding/** merge=ours

# Application code - prefer core version
src/** merge=theirs
```

**How it works**:
- `merge=ours`: In conflicts, automatically keep client branch version
- `merge=theirs`: In conflicts, automatically keep main branch version

**When it helps**: Reduces manual conflict resolution for files with predictable resolution strategy.

**When it doesn't help**: Complex conflicts in application code still require manual resolution.

## Related Documentation

- [Branching Strategy](branching-strategy.md) - Overall git workflow
- [Client Configuration Guide](../config/README.md) - Configuration management
- [Build Scripts](../scripts/README.md) - Build automation
- [Version Matrix](version-matrix.md) - Version tracking

## Questions?

For questions about merge workflows or help with difficult merges, contact the development team.

---

**Remember**: When in doubt, create a test branch first. Better safe than sorry!
