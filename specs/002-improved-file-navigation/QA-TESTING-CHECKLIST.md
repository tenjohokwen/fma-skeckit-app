# QA Testing Checklist - Feature 002: Improved File Navigation UX

**Feature Version:** 1.0.0
**Test Date:** _________________
**Tester Name:** _________________
**Environment:** _________________

---

## Pre-Testing Setup

### Test Environment Preparation
- [ ] Dev server is running (`npm run dev`)
- [ ] Backend GAS deployment is accessible
- [ ] Test user has ROLE_ADMIN permissions
- [ ] Test data exists in Google Drive:
  - [ ] At least 3 client folders
  - [ ] At least 2 case folders per client
  - [ ] At least 5 files in various case folders
  - [ ] Mix of file types (PDF, images, docs, spreadsheets)

### Test Accounts
- [ ] Admin user credentials verified
- [ ] Non-admin user available for negative testing

---

## Phase 8: Breadcrumb Navigation (US6)

### FR-028: Breadcrumb Trail Display

#### Desktop Testing (Screen ≥ 600px)
- [ ] Navigate to File Management page
- [ ] Enter a folder ID and load folder contents
- [ ] **Verify:** Breadcrumb shows "Home" icon/link
- [ ] Click into a subfolder
- [ ] **Verify:** Breadcrumb shows "Home > Folder Name"
- [ ] Navigate 3+ levels deep
- [ ] **Verify:** All folder names appear in breadcrumb trail
- [ ] **Verify:** Path segments separated by chevron icon (>)

#### Mobile Testing (Screen < 600px)
- [ ] Resize browser to 375px width
- [ ] Navigate 4+ levels deep
- [ ] **Verify:** Breadcrumb shows ellipsis (...) + last 2 segments only
- [ ] **Verify:** No horizontal scrolling occurs
- [ ] Resize to 320px width (iPhone SE)
- [ ] **Verify:** Breadcrumbs still fit without overflow

### FR-029: Clickable Breadcrumb Navigation

- [ ] Navigate 3 levels deep
- [ ] **Verify:** Current location (last segment) is NOT clickable
- [ ] **Verify:** All parent segments ARE clickable
- [ ] Click on the first breadcrumb (Home)
- [ ] **Verify:** Navigates back to root level
- [ ] Navigate back to 3 levels deep
- [ ] Click on middle breadcrumb
- [ ] **Verify:** Navigates to that folder
- [ ] **Verify:** Folder contents update correctly
- [ ] **Verify:** Breadcrumb trail truncates after selected segment

### FR-030: Responsive Breadcrumb Rendering

- [ ] Test on 1920px desktop screen
- [ ] **Verify:** All breadcrumbs visible with full folder names
- [ ] Test on 1024px tablet screen
- [ ] **Verify:** Breadcrumbs render correctly
- [ ] Test on 768px tablet portrait
- [ ] **Verify:** Breadcrumbs adapt properly
- [ ] Test on 414px iPhone
- [ ] **Verify:** Shows ellipsis + last 2 breadcrumbs
- [ ] Test on 375px iPhone SE
- [ ] **Verify:** No horizontal scroll
- [ ] Test breadcrumb with very long folder name (50+ chars)
- [ ] **Verify:** Long names are truncated with tooltip on hover

### Edge Cases - Breadcrumbs
- [ ] Navigate directly to deep folder via URL/folder ID input
- [ ] **Verify:** Breadcrumb still works correctly
- [ ] Refresh page while viewing a folder
- [ ] **Verify:** Breadcrumb state persists or resets gracefully
- [ ] Navigate with browser back button
- [ ] **Verify:** Breadcrumb updates accordingly

---

## Phase 9: Browse and View Folder Contents (US7)

### FR-031: Display Folders and Files

#### Folder List Display
- [ ] Open a folder with subfolders
- [ ] **Verify:** "Folders" section appears first
- [ ] **Verify:** Folder icon is amber/yellow color
- [ ] **Verify:** Each folder shows:
  - [ ] Folder name
  - [ ] Last modified date and time
  - [ ] Item count (e.g., "5 items")
  - [ ] Chevron right icon (>)
  - [ ] Delete button (red)
- [ ] **Verify:** Folder count chip displays correct number

#### File List Display
- [ ] Open a folder with files
- [ ] **Verify:** "Files" section appears after folders
- [ ] **Verify:** Each file shows:
  - [ ] Appropriate file type icon (with color)
  - [ ] File name
  - [ ] File size (formatted: KB, MB, GB)
  - [ ] Last modified date and time
  - [ ] Download button (primary color)
  - [ ] Rename button (grey)
  - [ ] Delete button (red)
- [ ] **Verify:** File count chip displays correct number

### FR-032: File Type Icons and Metadata

Test each file type:
- [ ] PDF file shows red PDF icon
- [ ] Image file (JPG/PNG) shows purple image icon
- [ ] Word document shows blue document icon
- [ ] Excel spreadsheet shows green table icon
- [ ] PowerPoint shows amber slideshow icon
- [ ] Video file shows pink movie icon
- [ ] Audio file shows orange audio icon
- [ ] ZIP archive shows brown archive icon
- [ ] Unknown file type shows grey generic file icon

File Size Formatting:
- [ ] File < 1KB shows "X Bytes"
- [ ] File < 1MB shows "X KB"
- [ ] File < 1GB shows "X MB"
- [ ] File ≥ 1GB shows "X GB"
- [ ] **Verify:** Numbers are rounded to 2 decimal places

### FR-033: Folder Item Count Display

- [ ] Open empty folder
- [ ] **Verify:** Folder shows "0 items"
- [ ] Open folder with 1 file
- [ ] **Verify:** Folder shows "1 items" (or "1 item" if localized)
- [ ] Open folder with 10+ files and subfolders
- [ ] **Verify:** Count includes both files and subfolders
- [ ] **Verify:** Item count is accurate

### FR-034: Alphabetical Sorting

#### Folder Sorting
- [ ] Create test folders: "Zebra", "Apple", "Banana"
- [ ] **Verify:** Folders appear in order: Apple, Banana, Zebra
- [ ] Test with folders starting with numbers
- [ ] **Verify:** Numeric folders sort correctly

#### File Sorting
- [ ] Create test files: "report_z.pdf", "report_a.pdf", "report_m.pdf"
- [ ] **Verify:** Files appear in order: report_a, report_m, report_z
- [ ] **Verify:** Folders always appear before files
- [ ] Test with mixed case filenames
- [ ] **Verify:** Case-insensitive sorting works

### Empty States
- [ ] Navigate to completely empty folder
- [ ] **Verify:** Shows folder icon (grey)
- [ ] **Verify:** Shows "This folder is empty" message
- [ ] **Verify:** No error messages displayed
- [ ] **Verify:** Breadcrumb still works

### Loading States
- [ ] Open folder with many files (50+)
- [ ] **Verify:** Loading spinner displays while loading
- [ ] **Verify:** "Loading..." text appears
- [ ] **Verify:** Content replaces spinner when loaded

---

## Phase 10: Download Files (US8)

### FR-035: File Download Button

- [ ] Open folder with at least 3 files
- [ ] Hover over download button
- [ ] **Verify:** Tooltip shows "Download"
- [ ] **Verify:** Button is primary blue color
- [ ] **Verify:** Download icon is visible

### File Download Functionality

#### PDF Download
- [ ] Click download on PDF file
- [ ] **Verify:** New tab opens with Google Drive download URL
- [ ] **Verify:** File downloads or opens in browser
- [ ] **Verify:** Success notification appears
- [ ] **Verify:** Filename is correct

#### Image Download
- [ ] Click download on image file (JPG/PNG)
- [ ] **Verify:** File downloads successfully
- [ ] **Verify:** Correct file extension preserved

#### Document Download
- [ ] Click download on Word document
- [ ] **Verify:** File downloads successfully
- [ ] Click download on Excel spreadsheet
- [ ] **Verify:** File downloads successfully

#### Large File Download
- [ ] Download file > 10MB
- [ ] **Verify:** Download completes successfully
- [ ] **Verify:** No timeout errors

### Download Error Handling
- [ ] Delete a file from Google Drive backend
- [ ] Attempt to download the deleted file from UI
- [ ] **Verify:** Error notification displays
- [ ] **Verify:** Error message is user-friendly
- [ ] **Verify:** UI doesn't crash

---

## Phase 11: Delete Files (US9)

### FR-036: File Delete Button

- [ ] Open folder with files
- [ ] Hover over delete button
- [ ] **Verify:** Tooltip shows "Delete"
- [ ] **Verify:** Button is negative/red color
- [ ] **Verify:** Delete icon (trash) is visible

### FR-037: Delete Confirmation Dialog

- [ ] Click delete button on a file
- [ ] **Verify:** Confirmation dialog appears
- [ ] **Verify:** Dialog title: "Delete File"
- [ ] **Verify:** Dialog shows filename being deleted
- [ ] **Verify:** Warning message about permanent deletion
- [ ] **Verify:** Two buttons: "Cancel" and "Delete"
- [ ] Click "Cancel"
- [ ] **Verify:** Dialog closes
- [ ] **Verify:** File is NOT deleted

### File Deletion Process

- [ ] Click delete on a file
- [ ] Click "Delete" in confirmation dialog
- [ ] **Verify:** Loading spinner appears on delete button
- [ ] **Verify:** File disappears from list immediately
- [ ] **Verify:** Success notification: "File deleted successfully"
- [ ] Check Google Drive
- [ ] **Verify:** File is in Trash folder (not permanently deleted)

### FR-038: File List Update After Deletion

- [ ] Note the file count before deletion (e.g., "5 files")
- [ ] Delete 1 file
- [ ] **Verify:** File count updates (e.g., "4 files")
- [ ] **Verify:** Deleted file removed from UI
- [ ] **Verify:** Other files remain visible
- [ ] **Verify:** No page refresh required

### Multiple File Deletions
- [ ] Delete 3 files in succession
- [ ] **Verify:** Each deletion shows individual confirmation
- [ ] **Verify:** File count updates after each deletion
- [ ] **Verify:** UI remains responsive

### Delete Error Handling
- [ ] Mock a network error (disconnect internet)
- [ ] Attempt to delete a file
- [ ] **Verify:** Error notification appears
- [ ] **Verify:** File remains in list
- [ ] Reconnect internet
- [ ] Retry deletion
- [ ] **Verify:** Deletion succeeds

---

## Phase 12: Delete Folders (US10)

### FR-040: Folder Delete Button

- [ ] Open folder containing subfolders
- [ ] **Verify:** Each folder has a delete button
- [ ] Hover over folder delete button
- [ ] **Verify:** Tooltip shows "Delete Folder"
- [ ] **Verify:** Button is negative/red color
- [ ] **Verify:** Delete icon visible

### FR-041: Typed "DELETE" Confirmation

#### Dialog Display
- [ ] Click delete on a folder
- [ ] **Verify:** Dialog title shows warning icon + "Delete Folder"
- [ ] **Verify:** Warning message about permanent deletion
- [ ] **Verify:** Folder name is displayed
- [ ] **Verify:** Item count is shown (e.g., "8 items")
- [ ] **Verify:** Instruction: "Type DELETE to confirm"
- [ ] **Verify:** Text input field with placeholder
- [ ] **Verify:** Cancel and Delete Folder buttons present
- [ ] **Verify:** Delete button is DISABLED initially

#### Validation Testing
- [ ] Type "delete" (lowercase)
- [ ] **Verify:** Delete button remains disabled
- [ ] Type "DELETE " (with space)
- [ ] **Verify:** Delete button remains disabled
- [ ] Type "DELET" (incomplete)
- [ ] **Verify:** Delete button remains disabled
- [ ] Clear input and type "DELETE" (exact match)
- [ ] **Verify:** Delete button becomes ENABLED
- [ ] Press Enter key
- [ ] **Verify:** Deletion proceeds (same as clicking button)

#### Cancellation
- [ ] Open delete folder dialog
- [ ] Type "DELETE"
- [ ] Click "Cancel"
- [ ] **Verify:** Dialog closes
- [ ] **Verify:** Folder is NOT deleted
- [ ] **Verify:** Input field is cleared

### FR-042: Recursive Folder Deletion

#### Empty Folder
- [ ] Delete an empty folder (0 items)
- [ ] Type "DELETE" and confirm
- [ ] **Verify:** Folder deleted successfully
- [ ] **Verify:** Success message includes item count

#### Folder with Files Only
- [ ] Delete folder containing 5 files
- [ ] Type "DELETE" and confirm
- [ ] **Verify:** Success message: "Folder deleted (5 items removed)"
- [ ] Check Google Drive Trash
- [ ] **Verify:** Folder and all 5 files are in trash

#### Folder with Subfolders
- [ ] Delete folder containing 2 subfolders + 3 files
- [ ] Type "DELETE" and confirm
- [ ] **Verify:** Success message shows correct item count (5+ items)
- [ ] **Verify:** All contents moved to trash

#### Nested Folder Structure
- [ ] Create folder with nested structure: A > B > C > files
- [ ] Delete folder A
- [ ] **Verify:** Item count includes all nested items
- [ ] **Verify:** Entire hierarchy deleted

### FR-043 & FR-044: Folder List Update

- [ ] Note folder count before deletion
- [ ] Delete a folder
- [ ] **Verify:** Folder count decreases
- [ ] **Verify:** Deleted folder removed from list immediately
- [ ] **Verify:** Success notification shows item count
- [ ] **Verify:** No page refresh needed
- [ ] Navigate to parent folder
- [ ] **Verify:** Deleted folder not visible

### Root Folder Protection
- [ ] Attempt to delete the "cases" root folder
- [ ] Type "DELETE" and confirm
- [ ] **Verify:** Error message: "Cannot delete the root cases folder"
- [ ] **Verify:** Folder NOT deleted
- [ ] **Verify:** Appropriate error notification

### Folder Delete Error Handling
- [ ] Mock network error
- [ ] Attempt folder deletion
- [ ] **Verify:** Error notification appears
- [ ] **Verify:** Folder remains in list
- [ ] Restore connection and retry
- [ ] **Verify:** Deletion succeeds

---

## Phase 13: Rename Files (US11)

### FR-045: File Rename Button

- [ ] Open folder with files
- [ ] Hover over rename button (pencil icon)
- [ ] **Verify:** Tooltip shows "Rename"
- [ ] **Verify:** Button is grey color
- [ ] **Verify:** Edit icon visible

### FR-046: Rename Dialog Display

- [ ] Click rename on a file named "report.pdf"
- [ ] **Verify:** Dialog title: "Rename File"
- [ ] **Verify:** Current filename displayed: "report.pdf"
- [ ] **Verify:** Input field is pre-filled with "report.pdf"
- [ ] **Verify:** Input field has autofocus (cursor blinking)
- [ ] **Verify:** Hint text shows invalid characters
- [ ] **Verify:** Cancel and Rename buttons present
- [ ] **Verify:** Input field has file icon prepend

### FR-047: Invalid Character Validation

Test each invalid character:
- [ ] Try to enter `<` in filename
- [ ] **Verify:** Error message appears immediately
- [ ] **Verify:** Rename button becomes disabled
- [ ] Try: `>`, `:`, `"`, `/`, `\`, `|`, `?`, `*`
- [ ] **Verify:** Each shows validation error
- [ ] **Verify:** Error message: "File name contains invalid characters"

Valid Character Testing:
- [ ] Enter: "my-file_v2.pdf"
- [ ] **Verify:** No error (hyphens, underscores allowed)
- [ ] Enter: "file (copy).pdf"
- [ ] **Verify:** No error (parentheses allowed)
- [ ] Enter: "file-2024.pdf"
- [ ] **Verify:** No error (numbers allowed)

### Additional Validation Tests

#### Empty Name
- [ ] Clear the input field completely
- [ ] **Verify:** Error: "File name is required"
- [ ] **Verify:** Rename button disabled

#### Same as Current Name
- [ ] Leave filename unchanged
- [ ] Click Rename
- [ ] **Verify:** Error: "New name must be different from current name"
- [ ] **Verify:** Rename button disabled

#### Whitespace Handling
- [ ] Enter: "  report.pdf  " (spaces before/after)
- [ ] Click Rename
- [ ] **Verify:** Whitespace is trimmed automatically
- [ ] **Verify:** File renamed to "report.pdf"

### FR-048: File List Update After Rename

- [ ] Rename "old_name.pdf" to "new_name.pdf"
- [ ] **Verify:** Loading spinner on Rename button
- [ ] **Verify:** Success notification appears
- [ ] **Verify:** File list updates immediately
- [ ] **Verify:** File now shows "new_name.pdf"
- [ ] **Verify:** File remains in same position (sort order updates if needed)
- [ ] **Verify:** File icon/metadata unchanged

### Rename with Extension Change

- [ ] Rename "document.txt" to "document.pdf"
- [ ] **Verify:** Rename succeeds
- [ ] **Verify:** File icon updates to PDF icon
- [ ] **Verify:** Extension change warning (if implemented)

### Multiple Consecutive Renames
- [ ] Rename file A
- [ ] Immediately rename file B
- [ ] Immediately rename file C
- [ ] **Verify:** Each rename completes successfully
- [ ] **Verify:** No conflicts or race conditions

### Rename Error Handling

#### Network Error
- [ ] Disconnect network
- [ ] Attempt rename
- [ ] **Verify:** Error notification
- [ ] **Verify:** Dialog stays open
- [ ] **Verify:** Can retry after reconnecting

#### Permission Error
- [ ] Test as non-admin user (if possible)
- [ ] **Verify:** Error: "Admin access required"

#### File Not Found Error
- [ ] Delete file from backend
- [ ] Attempt rename from UI
- [ ] **Verify:** Error notification
- [ ] **Verify:** User-friendly error message

### Keyboard Shortcuts
- [ ] Open rename dialog
- [ ] Press Escape key
- [ ] **Verify:** Dialog closes (cancel)
- [ ] Open rename dialog again
- [ ] Enter valid new name
- [ ] Press Enter key
- [ ] **Verify:** Rename executes (same as clicking Rename)

---

## Phase 14: Polish & Integration

### Loading States

#### Folder Content Loading
- [ ] Enter folder ID and click refresh
- [ ] **Verify:** Spinner appears immediately
- [ ] **Verify:** "Loading..." text visible
- [ ] **Verify:** Content appears after loading
- [ ] **Verify:** Smooth transition (no flicker)

#### Operation Loading States
- [ ] Test each operation (download, delete, rename)
- [ ] **Verify:** Button shows loading spinner
- [ ] **Verify:** Button is disabled during operation
- [ ] **Verify:** Loading state clears after completion

### Error States with Retry

#### Network Error Handling
- [ ] Disconnect network
- [ ] Load folder contents
- [ ] **Verify:** Error banner appears (red)
- [ ] **Verify:** Error message is clear
- [ ] **Verify:** "Retry" button is visible
- [ ] Reconnect network
- [ ] Click "Retry" button
- [ ] **Verify:** Content loads successfully

#### API Error Handling
- [ ] Test with invalid folder ID
- [ ] **Verify:** Error message: "Folder not found"
- [ ] **Verify:** Retry button available
- [ ] Enter valid folder ID
- [ ] **Verify:** Can recover without page refresh

### Empty States

- [ ] Navigate to empty folder
- [ ] **Verify:** Large folder icon (grey)
- [ ] **Verify:** "This folder is empty" message
- [ ] **Verify:** Message is centered
- [ ] **Verify:** No error styling (not red)

### UI Consistency

#### Button Styling
- [ ] Check all primary action buttons are same color
- [ ] Check all destructive buttons are red/negative
- [ ] Check all cancel buttons are grey
- [ ] **Verify:** Consistent button sizes
- [ ] **Verify:** Consistent icon sizes

#### Spacing and Alignment
- [ ] Review folder list spacing
- [ ] Review file list spacing
- [ ] **Verify:** Consistent padding between sections
- [ ] **Verify:** Items align properly
- [ ] **Verify:** Icons align with text

#### Typography
- [ ] **Verify:** Headings use consistent font sizes
- [ ] **Verify:** Body text is readable (not too small)
- [ ] **Verify:** Metadata text uses grey color consistently

---

## Mobile Responsiveness Testing

### Screen Sizes to Test
- [ ] 1920px (Desktop large)
- [ ] 1366px (Desktop standard)
- [ ] 1024px (Tablet landscape)
- [ ] 768px (Tablet portrait)
- [ ] 414px (iPhone Plus)
- [ ] 375px (iPhone standard)
- [ ] 320px (iPhone SE)

### Mobile-Specific Tests

#### Breadcrumb Navigation (< 600px)
- [ ] **Verify:** Shows ellipsis on small screens
- [ ] **Verify:** No horizontal scrolling
- [ ] **Verify:** Breadcrumbs are tappable (44px min touch target)

#### Folder/File Lists
- [ ] **Verify:** Lists stack vertically on small screens
- [ ] **Verify:** Action buttons are thumb-friendly
- [ ] **Verify:** No content cutoff
- [ ] **Verify:** Scrolling is smooth

#### Dialogs on Mobile
- [ ] Open delete confirmation on 375px screen
- [ ] **Verify:** Dialog fits within viewport
- [ ] **Verify:** All buttons accessible without scrolling
- [ ] **Verify:** Text is readable (not too small)

#### Touch Interactions
- [ ] Test tap on folders (no hover state)
- [ ] Test tap on buttons
- [ ] **Verify:** No accidental double-taps
- [ ] **Verify:** Ripple effect works on touch

### Landscape Mode Testing
- [ ] Rotate device to landscape (or resize browser)
- [ ] **Verify:** Layout adapts properly
- [ ] **Verify:** Breadcrumbs still work
- [ ] **Verify:** Dialogs fit in viewport

---

## Cross-Browser Testing

Test on each browser:

### Chrome (Latest)
- [ ] All features work correctly
- [ ] No console errors
- [ ] Performance is acceptable

### Firefox (Latest)
- [ ] All features work correctly
- [ ] No console errors
- [ ] Icons render properly

### Safari (Latest)
- [ ] All features work correctly
- [ ] Date formatting correct
- [ ] File uploads work (if applicable)

### Edge (Latest)
- [ ] All features work correctly
- [ ] No console errors

### Mobile Browsers
- [ ] Safari iOS
- [ ] Chrome Android
- [ ] **Verify:** Touch interactions work
- [ ] **Verify:** Dialogs display correctly

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] **Verify:** Focus indicators visible
- [ ] **Verify:** Tab order is logical
- [ ] Press Enter on focused button
- [ ] **Verify:** Button activates
- [ ] Use Shift+Tab to navigate backwards
- [ ] **Verify:** Focus moves correctly

### Screen Reader Testing (Optional)
- [ ] Test with NVDA/JAWS/VoiceOver
- [ ] **Verify:** Buttons have meaningful labels
- [ ] **Verify:** File names are announced
- [ ] **Verify:** Error messages are announced

### Color Contrast
- [ ] Use browser accessibility tools
- [ ] **Verify:** All text meets WCAG AA standards (4.5:1 ratio)
- [ ] **Verify:** Icons are distinguishable
- [ ] **Verify:** Error states use more than just color

### Focus Management
- [ ] Open dialog
- [ ] **Verify:** Focus moves to dialog (autofocus works)
- [ ] Close dialog
- [ ] **Verify:** Focus returns to trigger button
- [ ] Complete an action (delete, rename)
- [ ] **Verify:** Focus is managed logically

---

## Performance Testing

### Load Time
- [ ] Open folder with 100+ files
- [ ] **Verify:** Loads in < 3 seconds
- [ ] **Verify:** UI remains responsive during load
- [ ] **Verify:** No browser freezing

### Interaction Responsiveness
- [ ] Click buttons rapidly
- [ ] **Verify:** No double-submissions
- [ ] **Verify:** Buttons disable during processing
- [ ] **Verify:** No race conditions

### Memory Leaks
- [ ] Navigate between folders 20+ times
- [ ] Open/close dialogs 20+ times
- [ ] Check browser memory usage
- [ ] **Verify:** No significant memory growth

---

## Security & Authorization Testing

### Admin-Only Access
- [ ] Log in as non-admin user
- [ ] Attempt to access file management page
- [ ] **Verify:** Redirected or access denied
- [ ] **Verify:** Error message shown

### API Endpoint Security
- [ ] Attempt to call `file.deleteFile` as non-admin
- [ ] **Verify:** 403 Forbidden error
- [ ] Attempt to call `folder.delete` as non-admin
- [ ] **Verify:** 403 Forbidden error

### Input Validation
- [ ] Attempt SQL injection in rename field
- [ ] **Verify:** Blocked by validation
- [ ] Attempt XSS in folder name
- [ ] **Verify:** Properly escaped/sanitized

---

## Edge Cases & Error Scenarios

### Concurrent Operations
- [ ] Open two browser tabs
- [ ] Delete a file in tab 1
- [ ] Attempt to rename same file in tab 2
- [ ] **Verify:** Error handling is graceful

### Network Issues
- [ ] Start operation with slow network (throttle in DevTools)
- [ ] **Verify:** Timeout handling works
- [ ] **Verify:** User gets feedback

### Large Data Sets
- [ ] Folder with 500+ files
- [ ] **Verify:** List renders (may be slow but shouldn't crash)
- [ ] **Verify:** Sorting works correctly

### Special Characters in Names
- [ ] File with emoji in name
- [ ] File with accented characters (é, ñ, ü)
- [ ] File with spaces and special chars
- [ ] **Verify:** All display and rename correctly

### Boundary Conditions
- [ ] File with 255 character name (max length)
- [ ] File with 1 character name
- [ ] Folder with 0 items
- [ ] Folder with 1000+ items

---

## Integration Testing

### Full User Workflow
- [ ] Log in as admin
- [ ] Navigate to File Management
- [ ] Enter a client folder ID
- [ ] Click into a case folder (breadcrumb updates)
- [ ] Click into a subfolder (breadcrumb updates)
- [ ] Download a file (success notification)
- [ ] Rename a file (list updates)
- [ ] Delete a file (list updates, count decreases)
- [ ] Click breadcrumb to go back 2 levels
- [ ] Delete a folder (with typed confirmation)
- [ ] **Verify:** All operations completed successfully
- [ ] **Verify:** No errors in console
- [ ] **Verify:** UI remained responsive throughout

---

## Final Checks

### Documentation
- [ ] Feature works as described in specification
- [ ] All acceptance scenarios pass
- [ ] All user stories satisfied

### Code Quality
- [ ] No console errors in browser
- [ ] No console warnings (except known third-party)
- [ ] Network tab shows reasonable request count
- [ ] No 4xx/5xx errors (except intentional tests)

### User Experience
- [ ] Feature is intuitive to use
- [ ] Error messages are helpful
- [ ] Success feedback is clear
- [ ] Loading states prevent confusion
- [ ] Mobile experience is usable

---

## Bug Tracking

### Found Issues
| # | Severity | Description | Steps to Reproduce | Status |
|---|----------|-------------|-------------------|--------|
| 1 |          |             |                   |        |
| 2 |          |             |                   |        |
| 3 |          |             |                   |        |

**Severity Levels:**
- **Critical:** Feature broken, blocks testing
- **High:** Major functionality impaired
- **Medium:** Minor functionality issue
- **Low:** Cosmetic or edge case

---

## Sign-Off

### Test Summary
- **Total Test Cases:** _______
- **Passed:** _______
- **Failed:** _______
- **Blocked:** _______
- **Pass Rate:** _______%

### Recommendations
- [ ] **APPROVED** - Ready for production
- [ ] **APPROVED WITH MINOR ISSUES** - Can deploy with known issues documented
- [ ] **NOT APPROVED** - Critical issues must be fixed

### Comments
```
[Tester notes and observations]
```

---

**QA Tester Signature:** ___________________
**Date:** ___________________
**Developer Sign-Off:** ___________________
**Product Owner Sign-Off:** ___________________

---

## Notes for Testers

1. **Take Screenshots:** Capture any bugs or unexpected behavior
2. **Check Console:** Always have browser DevTools console open
3. **Test Thoroughly:** Don't rush - this is a critical feature
4. **Report Clearly:** Use bug template with steps to reproduce
5. **Test Realistically:** Use realistic folder structures and filenames
6. **Ask Questions:** If acceptance criteria unclear, ask before marking as fail

**Estimated Testing Time:** 6-8 hours for complete checklist
