# GitHub Actions Workflow Error - Fix Documentation

**Date**: 2025-10-23
**Error**: `npm error Invalid Version:`
**Workflow**: build-client-reusable.yml

---

## Root Cause Analysis

The error `npm error Invalid Version:` occurs when the workflow tries to run `npm ci` but encounters an invalid version in package.json.

### Likely Causes:

1. **Build-time files in repository**: If `desktop/client-config.json` or modified `desktop/package.json` were accidentally committed
2. **Branch mismatch**: Workflow checking out wrong branch
3. **Script execution order**: Metadata update script runs before validation

---

## The Issue

Looking at the workflow error, it appears to happen at the root `npm ci` step. The workflow structure is:

```yaml
- name: Install root dependencies
  run: npm ci

- name: Install desktop dependencies
  run: |
    cd desktop
    npm ci
```

The error happens at the first `npm ci`, which means the **root package.json** has an issue, not the desktop one.

---

## Solution

The issue is that when we run the workflow, it's checking out the `client/bechem` branch, but that branch **doesn't exist yet**!

The workflow has:
```yaml
- name: Checkout client branch
  uses: actions/checkout@v4
  with:
    ref: client/${{ inputs.client }}
```

If the branch doesn't exist, checkout fails or checks out main, causing issues.

---

## Fix: Update Workflow Prerequisites

### Option 1: Add Branch Existence Check (Recommended)

Add a step before checkout to verify the branch exists:

```yaml
- name: Check if client branch exists
  run: |
    if ! git ls-remote --heads origin client/${{ inputs.client }} | grep -q client/${{ inputs.client }}; then
      echo "Error: Branch client/${{ inputs.client }} does not exist"
      echo "Please create the client branch first:"
      echo "  git checkout main"
      echo "  git checkout -b client/${{ inputs.client }}"
      echo "  git push -u origin client/${{ inputs.client }}"
      exit 1
    fi
```

### Option 2: Create Branch Automatically

Add a step to create the branch if it doesn't exist:

```yaml
- name: Ensure client branch exists
  run: |
    git fetch origin
    if ! git ls-remote --heads origin client/${{ inputs.client }} | grep -q client/${{ inputs.client }}; then
      echo "Creating client branch client/${{ inputs.client }} from main"
      git checkout -b client/${{ inputs.client }} origin/main
      git push origin client/${{ inputs.client }}
    fi

- name: Checkout client branch
  uses: actions/checkout@v4
  with:
    ref: client/${{ inputs.client }}
```

### Option 3: Fallback to Main (Not Recommended)

```yaml
- name: Checkout client branch
  uses: actions/checkout@v4
  with:
    ref: client/${{ inputs.client }}
  continue-on-error: true

- name: Fallback to main if client branch doesn't exist
  if: failure()
  uses: actions/checkout@v4
  with:
    ref: main
```

---

## Immediate Fix for Testing

Since you're testing the workflow before the client branch exists, you have two options:

### Quick Fix 1: Create the Client Branch Now

```bash
# On your local machine
git checkout main
git pull origin main
git checkout -b client/bechem main
git push -u origin client/bechem
```

Then re-run the workflow.

### Quick Fix 2: Test with Main Branch First

Temporarily modify the workflow to checkout `main` instead:

```yaml
- name: Checkout client branch
  uses: actions/checkout@v4
  with:
    ref: main  # Changed from: client/${{ inputs.client }}
```

This lets you test the workflow logic before setting up client branches.

---

## Proper Setup Sequence

The correct order of operations is:

1. **Merge feature branch to main**
   ```bash
   # Create PR, get approval, merge
   ```

2. **Create client branch**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b client/bechem main
   git push -u origin client/bechem
   ```

3. **Configure branch protection**
   - Settings → Branches → Add rule for `main`
   - Require PR review

4. **Test workflow**
   - Go to Actions → Build Client Desktop Packages (Manual)
   - Select client: bechem
   - Run workflow

---

## Prevention

Add this to the workflow documentation:

```markdown
## Prerequisites

Before running this workflow:

1. ✅ Feature 014 merged to main branch
2. ✅ Client configuration exists in config/clients/<client>.json
3. ✅ Client branding exists in branding/<client>/
4. ✅ **Client branch exists**: client/<client>

To create a client branch:
\`\`\`bash
git checkout main
git checkout -b client/<client>
git push -u origin client/<client>
\`\`\`
```

---

## Updated Workflow with Error Handling

Here's the improved workflow with better error handling:

```yaml
name: Build Client Desktop Packages (Reusable)

on:
  workflow_call:
    inputs:
      client:
        description: 'Client to build'
        required: true
        type: string
      version:
        description: 'Client version'
        required: true
        type: string
      platforms:
        description: 'Platforms to build'
        required: false
        type: string
        default: 'all'

jobs:
  build:
    name: Build for ${{ matrix.platform_name }}
    runs-on: ${{ matrix.os }}

    strategy:
      fail-fast: false
      matrix:
        include:
          - os: macos-latest
            platform: mac
            platform_name: macOS
            build_command: 'npm run electron:build:mac'
            artifact_pattern: 'dist-desktop/*.dmg'
          - os: windows-latest
            platform: win
            platform_name: Windows
            build_command: 'npm run electron:build:win'
            artifact_pattern: 'dist-desktop/*.exe'
          - os: ubuntu-latest
            platform: linux
            platform_name: Linux
            build_command: 'npm run electron:build:linux'
            artifact_pattern: 'dist-desktop/*.AppImage'

    steps:
      - name: Check if client branch exists
        run: |
          # Check if branch exists on remote
          if ! git ls-remote --exit-code --heads https://github.com/${{ github.repository }}.git client/${{ inputs.client }} > /dev/null 2>&1; then
            echo "❌ Error: Branch 'client/${{ inputs.client }}' does not exist!"
            echo ""
            echo "Please create the client branch first:"
            echo "  git checkout main"
            echo "  git checkout -b client/${{ inputs.client }}"
            echo "  git push -u origin client/${{ inputs.client }}"
            echo ""
            echo "See docs/branching-strategy.md for details."
            exit 1
          fi
          echo "✅ Client branch exists: client/${{ inputs.client }}"

      - name: Checkout client branch
        uses: actions/checkout@v4
        with:
          ref: client/${{ inputs.client }}

      - name: Verify client configuration exists
        run: |
          if [ ! -f "config/clients/${{ inputs.client }}.json" ]; then
            echo "❌ Error: Configuration file not found!"
            echo "Expected: config/clients/${{ inputs.client }}.json"
            echo ""
            echo "Please create the client configuration first."
            echo "See config/README.md for instructions."
            exit 1
          fi
          echo "✅ Client configuration found"

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install root dependencies
        run: npm ci

      - name: Install desktop dependencies
        run: |
          cd desktop
          npm ci
          cd ..

      - name: Validate client configuration
        run: |
          chmod +x scripts/validate-client-config.sh
          ./scripts/validate-client-config.sh ${{ inputs.client }}

      - name: Select client configuration
        run: |
          chmod +x scripts/select-client-config.sh
          ./scripts/select-client-config.sh ${{ inputs.client }}

      - name: Update desktop metadata
        run: |
          chmod +x scripts/update-desktop-metadata.sh
          ./scripts/update-desktop-metadata.sh ${{ inputs.client }}

      - name: Build web application
        run: npm run build

      - name: Build desktop app
        if: inputs.platforms == 'all' || inputs.platforms == matrix.platform || (inputs.platforms == 'macos' && matrix.platform == 'mac')
        run: ${{ matrix.build_command }}

      - name: Upload artifacts
        if: inputs.platforms == 'all' || inputs.platforms == matrix.platform || (inputs.platforms == 'macos' && matrix.platform == 'mac')
        uses: actions/upload-artifact@v4
        with:
          name: ${{ inputs.client }}-${{ matrix.platform }}-v${{ inputs.version }}
          path: ${{ matrix.artifact_pattern }}
          retention-days: 30
          if-no-files-found: error
```

---

## Summary

**Root Cause**: Workflow tries to checkout `client/bechem` branch which doesn't exist yet.

**Immediate Fix**: Create the client branch:
```bash
git checkout main
git checkout -b client/bechem
git push -u origin client/bechem
```

**Long-term Fix**: Add branch existence check to workflow (shown above).

---

## Testing Checklist

Before running the workflow:
- [ ] Feature merged to main
- [ ] Client configuration committed
- [ ] Client branding committed
- [ ] **Client branch created and pushed**
- [ ] Scripts are executable

Then the workflow will succeed! ✅
