# Build Scripts

This directory contains build automation scripts for the multi-client FMA Skeckit application.

## Prerequisites

### Required Tools

- **Bash**: All scripts are bash scripts
- **Python 3**: Used for JSON processing
- **Git**: For version control operations
- **Node.js & npm**: For building web and desktop applications

### Optional Tools

- **jq**: JSON command-line processor (recommended but scripts will fallback to Python if not available)
  ```bash
  # Install on macOS
  brew install jq

  # Install on Linux
  sudo apt-get install jq
  ```

## Scripts

### validate-client-config.sh

**Purpose**: Validates client configuration files against requirements

**Usage**:
```bash
./scripts/validate-client-config.sh <clientId>
```

**Example**:
```bash
./scripts/validate-client-config.sh bechem
```

**Validation Checks**:
- Config file exists at `config/clients/<clientId>.json`
- JSON is valid and parseable
- All required fields present (clientId, displayName, branding, version)
- Branding assets exist at specified paths
- Versions follow semantic versioning (X.Y.Z)
- Colors are valid hex codes (#RRGGBB)
- clientId in config matches filename

**Exit Codes**:
- `0`: Validation passed
- `1`: Validation failed

### select-client-config.sh

**Purpose**: Selects and copies client configuration to desktop build directory

**Usage**:
```bash
./scripts/select-client-config.sh <clientId>
```

**Example**:
```bash
./scripts/select-client-config.sh bechem
```

**Actions**:
1. Validates client configuration
2. Copies `config/clients/<clientId>.json` to `desktop/client-config.json`
3. Copies branding assets to `desktop/branding/`
4. Copies icon to `desktop/icons/icon.png` (for electron-builder)

**Next Steps** (printed after success):
1. Run `update-desktop-metadata.sh`
2. Build web app with `npm run build`
3. Build desktop app with `npm run electron:build:mac` (or `:win`, `:linux`)

### update-desktop-metadata.sh

**Purpose**: Updates `desktop/package.json` with client-specific metadata

**Usage**:
```bash
./scripts/update-desktop-metadata.sh <clientId>
```

**Example**:
```bash
./scripts/update-desktop-metadata.sh bechem
```

**Updates**:
- `version`: Set to client version
- `description`: Set to client app name
- `clientId`: Set to client identifier
- `clientVersion`: Set to client version
- `coreVersion`: Set to core version
- `buildDate`: Set to current timestamp (ISO 8601)

**Output**: Modified `desktop/package.json`

### update-version-matrix.sh

**Purpose**: Updates version matrix documentation with new release

**Usage**:
```bash
./scripts/update-version-matrix.sh <clientId> <clientVersion> <coreVersion> <status> [notes]
```

**Arguments**:
- `clientId`: Client identifier (e.g., "bechem")
- `clientVersion`: Client version without 'v' prefix (e.g., "1.0.0")
- `coreVersion`: Core version without 'v' prefix (e.g., "1.0.0")
- `status`: One of: Development, Staging, Production, Archived
- `notes`: Optional release notes

**Example**:
```bash
./scripts/update-version-matrix.sh bechem 1.0.0 1.0.0 Production "Initial release"
```

**Actions**:
1. Creates `docs/version-matrix.md` if it doesn't exist
2. Appends new row with release information
3. Updates "Last Updated" timestamp

## Typical Workflow

### Local Development Build

```bash
# 1. Select client configuration
./scripts/validate-client-config.sh bechem
./scripts/select-client-config.sh bechem
./scripts/update-desktop-metadata.sh bechem

# 2. Build web application
npm run build

# 3. Build desktop application
npm run electron:build:mac  # or :win, :linux
```

### CI/CD Workflow

The CI/CD workflow (`.github/workflows/build-client-reusable.yml`) automatically runs:

```yaml
- run: ./scripts/validate-client-config.sh ${{ inputs.client }}
- run: ./scripts/select-client-config.sh ${{ inputs.client }}
- run: ./scripts/update-desktop-metadata.sh ${{ inputs.client }}
- run: npm run build
- run: npm run electron:build:mac  # per platform
```

### Release Workflow

```bash
# 1. Build for client
./scripts/validate-client-config.sh bechem
./scripts/select-client-config.sh bechem
./scripts/update-desktop-metadata.sh bechem
npm run build
npm run electron:build:mac

# 2. Update version matrix
./scripts/update-version-matrix.sh bechem 1.0.0 1.0.0 Production "Initial release"

# 3. Commit and tag
git add docs/version-matrix.md
git commit -m "Release bechem v1.0.0"
git tag bechem/v1.0.0
git push origin client/bechem --tags
```

## Troubleshooting

### "jq: command not found"

Scripts are designed to work without `jq` by falling back to Python's JSON tools. However, for best performance, install `jq`:

```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# Alpine Linux
apk add jq
```

### "Config file not found"

Ensure:
1. Client configuration exists at `config/clients/<clientId>.json`
2. You're running scripts from repository root
3. ClientId is spelled correctly (lowercase)

### "Invalid JSON"

Validate JSON syntax:
```bash
# Using Python
python3 -m json.tool config/clients/bechem.json

# Using jq (if installed)
jq empty config/clients/bechem.json
```

### "Logo file not found"

Ensure:
1. Branding assets exist at paths specified in config
2. Paths in config are relative to repository root
3. Files have correct names (logo.png, icon.png)

See [branding/README.md](../branding/README.md) for asset specifications.

### "Permission denied"

Make scripts executable:
```bash
chmod +x scripts/*.sh
```

## Development

### Adding New Scripts

When creating new scripts:

1. Use bash shebang: `#!/bin/bash`
2. Enable strict mode: `set -e` (exit on error)
3. Validate input parameters
4. Provide usage message if parameters missing
5. Echo status messages with ✓ and ✗ symbols
6. Exit with appropriate exit codes (0 = success, 1 = error)
7. Make executable: `chmod +x scripts/new-script.sh`

### Testing Scripts

Test scripts with:
- Valid client configurations
- Invalid client configurations (missing fields, wrong format)
- Missing files
- Edge cases (special characters, empty values)

## Related Documentation

- [Client Configuration Guide](../config/README.md)
- [Branding Assets Guide](../branding/README.md)
- [Branching Strategy](../docs/branching-strategy.md)
- [CI/CD Workflows](../.github/workflows/README.md)
