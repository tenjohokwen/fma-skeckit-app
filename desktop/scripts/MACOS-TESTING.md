# macOS Desktop Application - Manual Testing Checklist

**Target Platform**: macOS 11+ (Big Sur and later)
**Architectures**: Intel x64, Apple Silicon ARM64
**Test Date**: _____________
**Tested By**: _____________
**Build Version**: _____________

## Pre-Installation Testing

### Build Artifacts
- [ ] `FMA Skeckit App <version>.dmg` file exists in `dist-desktop/`
- [ ] DMG file size is under 150MB (Success Criterion SC-002)
- [ ] Build process completed in under 10 minutes (Success Criterion SC-001)
- [ ] Both Intel (x64) and ARM64 builds created (universal support)

## Installation Testing

### DMG Mounting
- [ ] Double-click .dmg file mounts successfully
- [ ] DMG window opens with application icon and Applications folder shortcut
- [ ] DMG background and layout appear correctly

### Installation Process
- [ ] Drag "FMA Skeckit App" to Applications folder
- [ ] Copy completes successfully
- [ ] Application appears in Applications folder
- [ ] Installation takes under 2 minutes (Success Criterion SC-005)

### Gatekeeper Warning (Expected - Unsigned Package)
- [ ] Gatekeeper warning appears when first attempting to open
- [ ] Warning states application is from an "unidentified developer"
- [ ] User can bypass warning by right-clicking → Open
- [ ] "Open Anyway" button appears in System Preferences → Security & Privacy

## Application Launch Testing

### First Launch
- [ ] Application launches from Applications folder
- [ ] Application launches from Launchpad
- [ ] Application launches from Spotlight search
- [ ] Application launches in under 3 seconds (Success Criterion SC-003)
- [ ] Dock icon appears correctly

### Window Behavior
- [ ] Window opens at 1400x900 resolution
- [ ] Window is centered on screen
- [ ] Minimum window size is 800x600 (enforced when resizing)
- [ ] Window can be resized by dragging edges/corners
- [ ] Window can be moved by dragging title bar
- [ ] Window can be maximized using green button (fullscreen or zoom)
- [ ] Window can be minimized using yellow button (goes to Dock)
- [ ] Window can be closed using red button

## macOS-Specific Features

### Native Menu Bar (T025)
- [ ] macOS menu bar appears at top of screen
- [ ] **App Menu** (FMA Skeckit App):
  - [ ] About FMA Skeckit App
  - [ ] Services submenu
  - [ ] Hide FMA Skeckit App (⌘H)
  - [ ] Hide Others (⌘⌥H)
  - [ ] Show All
  - [ ] Quit FMA Skeckit App (⌘Q)
- [ ] **Edit Menu**:
  - [ ] Undo (⌘Z)
  - [ ] Redo (⇧⌘Z)
  - [ ] Cut (⌘X)
  - [ ] Copy (⌘C)
  - [ ] Paste (⌘V)
  - [ ] Delete
  - [ ] Select All (⌘A)
- [ ] **View Menu**:
  - [ ] Reload (⌘R)
  - [ ] Force Reload (⇧⌘R)
  - [ ] Toggle Developer Tools (⌥⌘I)
  - [ ] Reset Zoom (⌘0)
  - [ ] Zoom In (⌘+)
  - [ ] Zoom Out (⌘-)
  - [ ] Toggle Fullscreen (⌃⌘F)
- [ ] **Window Menu**:
  - [ ] Minimize (⌘M)
  - [ ] Zoom
  - [ ] Bring All to Front
- [ ] **Help Menu**:
  - [ ] Learn More (opens external link)

### macOS Integration
- [ ] Application appears in Dock when running
- [ ] Dock icon shows correctly
- [ ] Dock menu (right-click on Dock icon) works
- [ ] Application stays in Dock after last window closes (macOS behavior)
- [ ] Clicking Dock icon re-opens window if closed
- [ ] Mission Control shows application correctly
- [ ] Application Exposé works (⌘↓ while hovering over Dock icon)

### Keyboard Shortcuts
- [ ] ⌘Q quits application
- [ ] ⌘H hides application
- [ ] ⌘M minimizes window
- [ ] ⌘W closes window (but doesn't quit app)
- [ ] ⌘, opens Preferences (if implemented in web app)
- [ ] Standard Edit shortcuts work (⌘C, ⌘V, ⌘X, ⌘A, ⌘Z)

### Fullscreen Mode
- [ ] Green button enters fullscreen
- [ ] Menu bar auto-hides in fullscreen
- [ ] Can exit fullscreen with ⌃⌘F or green button
- [ ] Window state restores correctly after exiting fullscreen

## Functional Parity Testing (FR-004)

**All web features must work identically in desktop version**

### Authentication
- [ ] Login page loads correctly
- [ ] User can authenticate successfully
- [ ] Session persists across app restarts
- [ ] Logout works correctly

### Navigation
- [ ] All menu items accessible
- [ ] Navigation between pages works
- [ ] Browser back/forward (if applicable)

### Search Functionality
- [ ] Search bar is functional
- [ ] Search results display correctly
- [ ] Fuzzy search works as expected

### Case Management
- [ ] Can view list of cases
- [ ] Can open individual case details
- [ ] Can create new case
- [ ] Can edit existing case
- [ ] Can delete case (if applicable)

### File Operations
- [ ] Can upload files
- [ ] Can download files
- [ ] Can view file metadata
- [ ] File operations complete successfully

### Client Management
- [ ] Can view client list
- [ ] Can view client details
- [ ] Client metadata operations work

### Analytics Dashboard
- [ ] Charts render correctly
- [ ] Data displays accurately
- [ ] Interactive features work

## Performance Testing

### Resource Usage
- [ ] Application uses less than 500MB RAM during normal operation (Success Criterion SC-008)
- [ ] CPU usage is reasonable (<25% on modern hardware)
- [ ] No memory leaks during extended use (monitor over 30 minutes using Activity Monitor)
- [ ] Disk usage appropriate

### Responsiveness
- [ ] UI remains responsive during file operations
- [ ] No significant lag when switching between pages
- [ ] Application doesn't freeze or hang
- [ ] Smooth scrolling and animations

### Launch Performance
- [ ] Cold start (first launch after reboot) in <5 seconds
- [ ] Warm start (subsequent launches) in <3 seconds
- [ ] Window appears quickly (no long white screen)

## Deep Linking Testing (FR-012)

### Protocol Registration
- [ ] `fmaskeckit://` protocol registered with macOS
- [ ] Opening `fmaskeckit://case/123` in Terminal launches app
- [ ] Deep link brings existing window to front if app already running
- [ ] Deep link creates new window if no window exists

### Test Commands
```bash
# Test deep linking from Terminal
open "fmaskeckit://case/123"
open "fmaskeckit://client/456"
```

- [ ] App launches and navigates to correct location
- [ ] Deep link URLs are parsed correctly
- [ ] Error handling for invalid deep link URLs

## Multi-Monitor Support

- [ ] Application opens on primary display by default
- [ ] Can move window to secondary display
- [ ] Fullscreen works on both displays
- [ ] Window position remembered across launches

## Accessibility

- [ ] VoiceOver screen reader works with application
- [ ] Keyboard navigation works throughout app
- [ ] Contrast and text sizing appropriate
- [ ] Application supports system dark mode (if applicable)

## Uninstallation Testing

### Manual Uninstall
- [ ] Can drag application from Applications to Trash
- [ ] Application removed from Applications folder
- [ ] Application removed from Launchpad
- [ ] Dock icon removed when app is trashed

### Data Cleanup
- [ ] User data location: `~/Library/Application Support/fma-skeckit-app/`
- [ ] Logs location: `~/Library/Logs/fma-skeckit-app/`
- [ ] Preferences location: `~/Library/Preferences/com.fma.skeckit.plist`
- [ ] Verify what happens to user data after uninstall (preserved or removed based on design)

## Edge Cases & Error Scenarios

- [ ] Application handles network errors gracefully
- [ ] Application works offline (if offline mode supported)
- [ ] Application handles insufficient disk space
- [ ] Application recovers from crashes gracefully
- [ ] Force quit (⌘⌥⎋) works correctly
- [ ] Relaunch after force quit works

## Architecture-Specific Testing

### Intel x64
- [ ] DMG mounts on Intel Mac
- [ ] Application launches successfully
- [ ] All features work correctly
- [ ] Performance is acceptable

### Apple Silicon ARM64
- [ ] DMG mounts on M1/M2/M3 Mac
- [ ] Application launches natively (not via Rosetta)
- [ ] All features work correctly
- [ ] Performance is optimized for ARM

### Universal Binary (if applicable)
- [ ] Same DMG works on both Intel and Apple Silicon
- [ ] Correct architecture selected automatically

## Overall Assessment

### Success Rate
**Target**: 95% of users can install and launch successfully (SC-009)

**Installation Success**: [ ] Pass [ ] Fail
**Launch Success**: [ ] Pass [ ] Fail
**Functional Parity**: [ ] Pass [ ] Fail
**macOS Integration**: [ ] Pass [ ] Fail
**Performance**: [ ] Pass [ ] Fail

### Issues Found

**Critical Issues** (prevent usage):
1. _________________________________________________
2. _________________________________________________

**Major Issues** (significant impact):
1. _________________________________________________
2. _________________________________________________

**Minor Issues** (cosmetic or edge cases):
1. _________________________________________________
2. _________________________________________________

### Recommendations

- [ ] Ready for distribution
- [ ] Needs fixes before distribution
- [ ] Requires further testing
- [ ] Needs code signing before public release

### Notes

_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

---

**Sign-off**

Tester: _________________________ Date: _____________
Platform: [ ] Intel x64  [ ] Apple Silicon ARM64  [ ] Both
macOS Version: _____________
