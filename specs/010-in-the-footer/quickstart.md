# Quickstart Guide: Footer Branding and Copyright

**Feature**: 010-in-the-footer
**Date**: 2025-10-21

## What This Feature Does

Adds consistent footer branding and copyright information ("Powered by Virtues Cafe | Copyright © [current year]") to all pages of the application by modifying the MainLayout and EmptyLayout components.

## Files Modified

1. **src/layouts/MainLayout.vue** - Add footer to authenticated pages (dashboard, search, files, etc.)
2. **src/layouts/EmptyLayout.vue** - Add footer to public pages (login, signup, password reset)
3. **src/layouts/MainLayout.spec.js** - Add tests for footer rendering (if test file exists)
4. **src/layouts/EmptyLayout.spec.js** - Add tests for footer rendering (if test file exists)

## Quick Implementation Summary

### MainLayout.vue & EmptyLayout.vue Changes

**Add to template** (before closing `</q-layout>`):
```vue
<!-- Footer -->
<q-footer elevated class="bg-grey-2 text-grey-7">
  <div class="row items-center justify-center q-pa-sm">
    <span class="text-caption">
      Powered by Virtues Cafe | Copyright © {{ currentYear }}
    </span>
  </div>
</q-footer>
```

**Add to script** (within `<script setup>`):
```javascript
import { computed } from 'vue'

// Footer year
const currentYear = computed(() => new Date().getFullYear())
```

### Test Changes

**Add to MainLayout.spec.js** (and EmptyLayout.spec.js):
```javascript
it('should render footer with branding and copyright', () => {
  const wrapper = mount(MainLayout)
  const footer = wrapper.find('footer')

  expect(footer.exists()).toBe(true)
  expect(footer.text()).toContain('Powered by Virtues Cafe')
  expect(footer.text()).toContain('Copyright ©')
  expect(footer.text()).toContain(new Date().getFullYear().toString())
})
```

## Development Workflow

### Step 1: Start Development Server

```bash
npm run dev
```

### Step 2: Verify Footer on Login Page (EmptyLayout)

1. Navigate to `http://localhost:9000/#/login` (or current dev port)
2. Scroll to bottom of page
3. Verify footer displays: "Powered by Virtues Cafe | Copyright © 2025"
4. Check responsiveness by resizing browser window

### Step 3: Verify Footer on Authenticated Pages (MainLayout)

1. Log in to the application
2. Navigate to dashboard, search, or files pages
3. Scroll to bottom of each page
4. Verify footer displays consistently

### Step 4: Run Tests

```bash
# Run all tests
npm test

# Run specific layout tests
npm test -- MainLayout.spec.js
npm test -- EmptyLayout.spec.js
```

### Step 5: Manual Testing Checklist

- [ ] Footer visible on login page
- [ ] Footer visible on signup page (if exists)
- [ ] Footer visible on password reset page (if exists)
- [ ] Footer visible on dashboard
- [ ] Footer visible on search page
- [ ] Footer visible on files page
- [ ] Footer visible on any other authenticated pages
- [ ] Footer text is readable (not too small)
- [ ] Footer has appropriate contrast (WCAG AA)
- [ ] Year displays current year (e.g., 2025)
- [ ] Footer looks good on mobile (320px width)
- [ ] Footer looks good on tablet (768px width)
- [ ] Footer looks good on desktop (1920px width)

## Acceptance Criteria

✅ **FR-001**: Footer displays "Powered by Virtues Cafe" text on all pages
✅ **FR-002**: Footer displays "Copyright ©" followed by current year
✅ **FR-003**: Year updates automatically (uses `computed` property)
✅ **FR-004**: Footer appears on authenticated AND unauthenticated pages
✅ **FR-005**: Footer readable on all screen sizes (320px - 1920px)
✅ **FR-006**: Proper spacing between branding and copyright (pipe separator)

## Troubleshooting

### Footer Not Visible

**Problem**: Footer doesn't appear on pages
**Solution**: Check that `<q-footer>` is inside `<q-layout>` and before `</q-layout>` closing tag

### Footer Text Cut Off on Mobile

**Problem**: Text wraps awkwardly or is cut off on small screens
**Solution**: Verify using `text-caption` class and that container has proper padding (`q-pa-sm`)

### Year Shows Wrong Value

**Problem**: Year displays as [object Object] or undefined
**Solution**: Ensure `currentYear` is a `computed` property and uses `new Date().getFullYear()`

### Tests Failing

**Problem**: Footer tests fail with "footer not found"
**Solution**:
1. Check that test mounts the component properly
2. Ensure `find('footer')` selector matches actual rendered element
3. May need to use `wrapper.find('[role="contentinfo"]')` or Quasar-specific selector

## Design System Reference

### Colors Used
- **Background**: `bg-grey-2` = Light Gray (#f1f5f9)
- **Text**: `text-grey-7` = Muted Gray
- **Contrast Ratio**: Meets WCAG AA requirements

### Typography
- **Font Size**: `text-caption` = 12px (per constitution Body Small)
- **Font Weight**: 400 (normal)
- **Line Height**: 1.5 (per constitution body text)

### Spacing
- **Padding**: `q-pa-sm` = 8px (from Quasar spacing scale)
- **Footer Height**: Auto (content-based, aligns with 60px specification from constitution)

## Next Steps After Implementation

1. Run full test suite: `npm test`
2. Run linter: `npm run lint`
3. Test on actual mobile device (not just browser responsive mode)
4. Take screenshots for documentation (optional)
5. Commit changes with descriptive message
6. Create pull request referencing spec: `specs/010-in-the-footer/spec.md`

## Estimated Time

- **Implementation**: 15-20 minutes
- **Testing**: 10-15 minutes
- **Total**: ~30 minutes
