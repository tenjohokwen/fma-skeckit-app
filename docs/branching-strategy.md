# Git Branching Strategy for Multi-Client Development

**Last Updated**: 2025-10-23
**Feature**: Multi-Client Branching Strategy and CI/CD (Feature 014)

## Overview

This document describes the git branching strategy for managing a single core application (coreFma) shared across multiple clients, each with client-specific customizations.

## Branch Structure

```
main (core application)
├── client/bechem (bechem client)
├── client/[future-client-1]
└── client/[future-client-n]
```

### Main Branch (Core)

**Branch Name**: `main`

**Purpose**: Contains the core FMA Skeckit application shared by all clients

**Protection Rules**:
- ✅ Requires pull request before merging
- ✅ Requires 1 reviewer approval (minimum)
- ✅ Requires status checks to pass
- ✅ Prevents force pushes
- ✅ Prevents deletion

**Who Commits**:
- Core development team
- Shared feature development
- Bug fixes that apply to all clients

**Merge Strategy**:
- All changes to `main` must go through pull requests
- No direct commits to `main`
- Use squash or merge commits (team preference)

### Client Branches

**Naming Pattern**: `client/<clientId>`

**Examples**:
- `client/bechem`
- `client/newclient`

**Purpose**: Long-lived branches containing:
- Full core application code (merged from `main`)
- Client-specific customizations
- Client-specific configuration
- Client-specific branding assets

**Lifecycle**:
1. Created from `main` when onboarding new client
2. Receives regular merges from `main` to stay synchronized with core
3. Contains client-specific commits (configuration, branding, features)
4. Source branch for client-specific CI/CD builds
5. Exists as long as client is active

**Protection Rules** (recommended):
- ⚠️ Optional: Require pull request for significant changes
- ✅ Require status checks to pass before merge
- ✅ Allow force pushes (for merge cleanup if needed)

**Who Commits**:
- Client-specific customizations
- Configuration updates for that client
- Merges from `main` (weekly cadence recommended)

## Version Tags

### Core Version Tags

**Format**: `core/vMAJOR.MINOR.PATCH`

**Examples**:
- `core/v1.0.0`
- `core/v1.5.0`
- `core/v2.0.0`

**Usage**:
- Tag `main` branch when core reaches a release milestone
- Helps track which core version each client is based on

**Creating Core Tags**:
```bash
git checkout main
git tag -a core/v1.0.0 -m "Core v1.0.0 release"
git push origin core/v1.0.0
```

### Client Version Tags

**Format**: `<clientId>/vMAJOR.MINOR.PATCH`

**Examples**:
- `bechem/v1.0.0`
- `bechem/v2.0.0`
- `newclient/v1.0.0`

**Usage**:
- Tag client branch when building release for that client
- Indicates client-specific version
- Artifacts/releases reference this tag

**Creating Client Tags**:
```bash
git checkout client/bechem
git tag -a bechem/v1.0.0 -m "Release: Bechem v1.0.0 (based on Core v1.0.0)"
git push origin bechem/v1.0.0
```

**Tag Message Template**:
```
Release: Bechem v2.0.0 (based on Core v1.5.0)

Changes:
- Updated branding to new logo
- Enabled advanced analytics feature
- Updated API endpoint to production URL

Core Version: v1.5.0
Client Version: v2.0.0
Release Date: 2025-10-23
Status: Production
```

## Workflows

### 1. Creating a New Client Branch

**When**: Onboarding a new client

**Steps**:
```bash
# 1. Ensure main is up-to-date
git checkout main
git pull origin main

# 2. Create client branch from main
git checkout -b client/newclient main

# 3. Push to remote
git push -u origin client/newclient

# 4. Set up client configuration
# (See config/README.md for details)

# 5. Commit client-specific changes
git add config/clients/newclient.json branding/newclient/
git commit -m "Add configuration and branding for newclient"
git push origin client/newclient
```

**Estimated Time**: 30 minutes (infrastructure) + time for branding assets

### 2. Merging Core Updates into Client Branch

**When**: Weekly or bi-weekly (recommended)

**Purpose**: Keep client branch synchronized with core improvements

**Steps**:
```bash
# 1. Checkout client branch
git checkout client/bechem

# 2. Ensure client branch is up-to-date
git pull origin client/bechem

# 3. Fetch latest main
git fetch origin main

# 4. Merge main into client branch
git merge origin/main

# 5. Resolve any conflicts (see Conflict Resolution below)

# 6. Test build after merge
npm run build
npm run electron:build:mac

# 7. Push merged changes
git push origin client/bechem
```

**Frequency Recommendations**:
- **Weekly**: Ideal for active development, minimizes merge conflicts
- **Bi-weekly**: Acceptable for stable clients, moderate conflict risk
- **Monthly**: High conflict risk, not recommended
- **Ad-hoc**: Only when specific core fix needed, very high conflict risk

### 3. Developing Core Features

**When**: Building features shared by all clients

**Steps**:
```bash
# 1. Create feature branch from main
git checkout main
git checkout -b feature/new-feature

# 2. Develop feature
# ... make changes ...

# 3. Create pull request to main
git push origin feature/new-feature
# Open PR via GitHub UI

# 4. After PR approved and merged to main
# Schedule merges to all client branches (see Workflow #2)
```

### 4. Developing Client-Specific Features

**When**: Building features for a specific client only

**Steps**:
```bash
# 1. Create feature branch from client branch
git checkout client/bechem
git checkout -b feature/bechem-specific-feature

# 2. Develop feature
# ... make changes ...

# 3. Merge or PR back to client branch
git checkout client/bechem
git merge feature/bechem-specific-feature
git push origin client/bechem

# 4. Tag and release
git tag -a bechem/v1.1.0 -m "Release: Bechem v1.1.0 - Added feature X"
git push origin bechem/v1.1.0
```

**Note**: Client-specific features stay on client branch and are **not** merged back to `main`.

### 5. Releasing a Client Version

**When**: Ready to deploy to production for a client

**Steps**:
```bash
# 1. Ensure client branch is up-to-date and tested
git checkout client/bechem
git pull origin client/bechem

# 2. Update version in client config
nano config/clients/bechem.json
# Increment version.client (e.g., 1.0.0 → 1.1.0)

# 3. Commit version bump
git add config/clients/bechem.json
git commit -m "Bump bechem version to 1.1.0"
git push origin client/bechem

# 4. Tag release
git tag -a bechem/v1.1.0 -m "Release: Bechem v1.1.0"
git push origin bechem/v1.1.0

# 5. Trigger CI/CD build
# (Via GitHub Actions manual workflow with release=true)

# 6. Update version matrix
./scripts/update-version-matrix.sh bechem 1.1.0 1.0.0 Production "Feature X released"
git add docs/version-matrix.md
git commit -m "Update version matrix for bechem v1.1.0"
git push origin client/bechem
```

## Conflict Resolution

### Merge Strategy (Automatic via `.gitattributes`)

The `.gitattributes` file defines automatic conflict resolution strategies:

```gitattributes
# Client-specific config - always keep client version
config/clients/*.json merge=ours

# Client-specific branding - never merge from core
branding/** merge=ours

# Desktop build-time config - always keep local
desktop/client-config.json merge=ours
desktop/branding/** merge=ours

# Application code - prefer core version in conflicts
src/** merge=theirs
```

### Decision Tree for Manual Conflicts

When conflicts occur, use this decision tree:

```
Conflict in:
├── config/clients/*.json
│   └── KEEP: Client version (merge=ours)
│
├── branding/**
│   └── KEEP: Client version (merge=ours)
│
├── src/** (application code)
│   ├── Core bug fix?
│   │   └── KEEP: Core version (merge=theirs)
│   ├── Core feature enhancement?
│   │   └── KEEP: Core version, then re-apply client customization if needed
│   └── Significant conflict?
│       └── CONSULT: Team review required
│
├── tests/**
│   └── MERGE: Both changes, update tests to pass
│
└── Other files
    └── EVALUATE: Case-by-case basis
```

### Testing After Merge

**Always test after merging `main` into client branch**:

```bash
# 1. Validate client configuration
./scripts/validate-client-config.sh bechem

# 2. Build web application
npm run build

# 3. Build desktop application
npm run electron:build:mac

# 4. Run tests
npm test

# 5. Manual testing
# - Launch desktop app
# - Verify client branding appears correctly
# - Test key functionality
```

If tests fail after merge, **DO NOT push** until resolved.

## Best Practices

### ✅ DO

- **Merge main → client frequently** (weekly recommended)
- **Test after every merge** before pushing
- **Tag releases** with descriptive messages
- **Document client-specific changes** in commit messages
- **Use pull requests** for significant core changes
- **Keep client configs up-to-date** in version control
- **Update version matrix** after releases

### ❌ DON'T

- **Don't merge client branches back to main** (one-way flow: main → client only)
- **Don't let client branches drift** (>2 weeks behind main is risky)
- **Don't force push to main** (protected branch)
- **Don't commit secrets** to config files (use GitHub Secrets)
- **Don't skip testing** after merges
- **Don't create client branches from other client branches**
- **Don't tag main with client tags** (use `core/v*` tags only)

## Branch Visualization

```
main (core)
  │
  ├─── core/v1.0.0 (tag)
  │
  ├─── feature/dashboard-analytics (PR)
  │      │
  │      └─── merged to main
  │
  ├─── core/v1.1.0 (tag)
  │
  │ ... (time) ...
  │
  ├─── client/bechem (created from main @ core/v1.0.0)
  │      │
  │      ├─── Add bechem config & branding
  │      ├─── bechem/v1.0.0 (tag)
  │      │
  │      ├─── Merge main (core/v1.1.0)
  │      ├─── Update bechem config
  │      ├─── bechem/v1.1.0 (tag)
  │      │
  │      └─── (continues...)
  │
  └─── client/newclient (created from main @ core/v1.1.0)
         │
         ├─── Add newclient config & branding
         ├─── newclient/v1.0.0 (tag)
         │
         └─── (continues...)
```

## Troubleshooting

### Merge Conflicts

**Problem**: Conflicts during `git merge origin/main`

**Solutions**:
1. Check `.gitattributes` is present and correct
2. Use `git mergetool` for visual conflict resolution
3. Follow decision tree above
4. Consult [merge-workflow.md](merge-workflow.md) for detailed examples

### Client Branch Diverged

**Problem**: Client branch significantly behind main

**Solutions**:
1. Create merge strategy:
   ```bash
   git log client/bechem..main --oneline  # See what's new in main
   ```
2. Merge incrementally if possible (merge one feature at a time)
3. Test thoroughly after merge
4. Consider creating fresh client branch if divergence is extreme (last resort)

### Wrong Branch Tagged

**Problem**: Tagged wrong branch or wrong version

**Solutions**:
```bash
# Delete local tag
git tag -d bechem/v1.0.0

# Delete remote tag
git push origin :refs/tags/bechem/v1.0.0

# Create correct tag
git checkout client/bechem
git tag -a bechem/v1.0.0 -m "Correct tag message"
git push origin bechem/v1.0.0
```

## Related Documentation

- [Client Configuration Guide](../config/README.md)
- [Merge Workflow Guide](merge-workflow.md)
- [Version Matrix](version-matrix.md)
- [CI/CD Workflows](../.github/workflows/README.md)

## Questions?

For questions about branching strategy or git workflows, contact the development team.
