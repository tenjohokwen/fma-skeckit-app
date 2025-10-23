# Windows Desktop Application - Manual Testing Checklist

**Target Platform**: Windows 10/11 (64-bit)
**Test Date**: _____________
**Tested By**: _____________
**Build Version**: _____________

## Pre-Installation Testing

### Build Artifacts
- [ ] `FMA Skeckit App Setup <version>.exe` file exists in `dist-desktop/`
- [ ] `FMA Skeckit App Setup <version>.msi` file exists in `dist-desktop/`
- [ ] Installer file size is under 150MB (Success Criterion SC-002)
- [ ] Build process completed in under 10 minutes (Success Criterion SC-001)

## Installation Testing (NSIS .exe)

### Installer Execution
- [ ] Double-click .exe installer runs without errors
- [ ] Security warning displayed (expected for unsigned package)
- [ ] User can proceed past security warning by clicking "More info" → "Run anyway"
- [ ] Installer UI displays correctly with product name "FMA Skeckit App"

### Installation Options
- [ ] "Choose installation location" option is available (NSIS oneClick: false)
- [ ] User can change installation directory
- [ ] "Create desktop shortcut" checkbox is checked by default
- [ ] "Create Start Menu shortcut" checkbox is checked by default

### Installation Process
- [ ] Installation completes successfully
- [ ] Installation takes under 2 minutes (Success Criterion SC-005)
- [ ] Desktop shortcut created (if selected)
- [ ] Start Menu entry created in "FMA Skeckit App" folder
- [ ] Application installed to selected directory (default: `%LOCALAPPDATA%\Programs\fma-skeckit-app\`)

## Application Launch Testing

### First Launch
- [ ] Application launches from desktop shortcut
- [ ] Application launches from Start Menu
- [ ] Application window appears in under 3 seconds (Success Criterion SC-003)
- [ ] Window has correct title "FMA Skeckit App"
- [ ] Window opens at 1400x900 resolution
- [ ] Window is centered on screen

### Window Controls
- [ ] Minimize button works correctly
- [ ] Maximize/Restore button works correctly
- [ ] Close (X) button works correctly
- [ ] Window can be resized by dragging edges
- [ ] Minimum window size is 800x600 (enforced)
- [ ] Window can be moved by dragging title bar

## Functional Parity Testing (FR-004)

**All web features must work identically in desktop version**

### Authentication
- [ ] Login page loads correctly
- [ ] User can authenticate successfully
- [ ] Session persists across app restarts

### Navigation
- [ ] All menu items accessible
- [ ] Navigation between pages works
- [ ] Browser back/forward buttons work (if applicable)

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

### Analytics Dashboard (if applicable)
- [ ] Charts render correctly
- [ ] Data displays accurately
- [ ] Interactive features work

## Desktop-Specific Features

### Window Behavior
- [ ] Application quits cleanly when window is closed
- [ ] No background processes remain after quit (check Task Manager)
- [ ] Application icon appears in taskbar when running
- [ ] Alt+Tab shows application correctly

### Deep Linking (if implemented)
- [ ] `fmaskeckit://` protocol registered with Windows
- [ ] Opening `fmaskeckit://case/123` launches app and navigates to case
- [ ] Deep link brings existing window to front if app already running

### System Integration
- [ ] Application appears in Windows "Apps & Features"
- [ ] Uninstaller is available in "Apps & Features"
- [ ] Application icon displays correctly in Start Menu
- [ ] Application icon displays correctly on Desktop

## Performance Testing

### Resource Usage
- [ ] Application uses less than 500MB RAM during normal operation (Success Criterion SC-008)
- [ ] CPU usage is reasonable (<25% on modern hardware)
- [ ] No memory leaks during extended use (monitor over 30 minutes)

### Responsiveness
- [ ] UI remains responsive during file operations
- [ ] No significant lag when switching between pages
- [ ] Application doesn't freeze or hang

## Uninstallation Testing

### Uninstall Process
- [ ] Can uninstall from "Apps & Features"
- [ ] Uninstaller runs successfully
- [ ] Desktop shortcut removed after uninstall
- [ ] Start Menu entry removed after uninstall
- [ ] Application files removed from installation directory
- [ ] User data handling (check if preserved or removed based on design)

## Edge Cases & Error Scenarios

- [ ] Application handles network errors gracefully
- [ ] Application works offline (if offline mode supported)
- [ ] Application handles insufficient disk space warning
- [ ] Application recovers from crashes gracefully
- [ ] Multiple monitor setup: window opens on primary display

## Security & Permissions

- [ ] Application runs without requiring administrator privileges (per-user install)
- [ ] Security warnings are clear and accurate (unsigned package)
- [ ] Application data stored in appropriate user directory
- [ ] No sensitive data exposed in logs

## Overall Assessment

### Success Rate
**Target**: 95% of users can install and launch successfully (SC-009)

**Installation Success**: [ ] Pass [ ] Fail
**Launch Success**: [ ] Pass [ ] Fail
**Functional Parity**: [ ] Pass [ ] Fail
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

### Notes

_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

---

**Sign-off**

Tester: _________________________ Date: _____________
