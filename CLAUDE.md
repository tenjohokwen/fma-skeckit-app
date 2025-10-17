# fma-skeckit-app Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-13

## Active Technologies
- JavaScript ES6+ (frontend), Google Apps Script JavaScript (backend) + Vue 3, Quasar 2, Vue Router, Pinia (state management), Vite (build tool), Vitest + Vue Test Utils (testing) (001-use-the-information)
- JavaScript ES6+ (frontend), Google Apps Script JavaScript (backend) + Vue 3, Quasar 2, Vue Router, Pinia (state management), Vite (build tool), Fuse.js (fuzzy search) (002-improved-file-navigation)
- Google Sheets (client metadata), Google Drive (file storage) (002-improved-file-navigation)

## Project Structure
```
src/
tests/
```

## Commands
npm test [ONLY COMMANDS FOR ACTIVE TECHNOLOGIES][ONLY COMMANDS FOR ACTIVE TECHNOLOGIES] npm run lint

## Code Style
JavaScript ES6+ (frontend), Google Apps Script JavaScript (backend): Follow standard conventions

## Recent Changes
- 004-read-only-non-admin: Added role-based access control (RBAC) patterns, useRoleAccess composable for frontend, admin-only enforcement for all write operations
- 003-as-a-user: Added @vuelidate/core, @vuelidate/validators for client information editing, inline edit forms
- 002-improved-file-navigation: Added JavaScript ES6+ (frontend), Google Apps Script JavaScript (backend) + Vue 3, Quasar 2, Vue Router, Pinia (state management), Vite (build tool), Fuse.js (fuzzy search)
- 001-use-the-information: Added JavaScript ES6+ (frontend), Google Apps Script JavaScript (backend) + Vue 3, Quasar 2, Vue Router, Pinia (state management), Vite (build tool), Vitest + Vue Test Utils (testing)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
