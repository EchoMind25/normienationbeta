# Normie Nation Beta - Preview Instructions

## Overview
This document provides instructions for previewing the cleaned-up version of the Normie Nation application after the code audit and fixes have been applied.

## Changes Applied

### Critical Fixes (TypeScript)
- ✅ Fixed `apiRequest` function calls in `ArtGallery.tsx` (lines 127, 253, 410)
- ✅ Fixed `apiRequest` function call in `ResetPassword.tsx` (line 56)
- ✅ Removed unused `SiPhantom` import from `AuthModal.tsx`
- ✅ Added proper TypeScript generic to useQuery in `AuthContext.tsx`
- ✅ Fixed type narrowing for wallet.request in `wallet.ts`

### Security Fixes
- ✅ Fixed JWT_SECRET to throw error in production if not set (`auth.ts`)
- ✅ Fixed admin token cookie name mismatch (`routes.ts` - changed `token` to `authToken`)
- ✅ Fixed parameter name typo in `storage.ts` (`oduserId` → `userId`)
- ✅ Added request body size limit (1MB) in `server/index.ts`

### Code Quality
- ✅ Fixed deprecated `substr` → `substring` in `ArtGallery.tsx`
- ✅ Added Prettier configuration (`.prettierrc`, `.prettierignore`)

## How to Preview

### 1. Verify TypeScript Compilation
```bash
npm run check
```
This should complete with no errors.

### 2. Start Development Server
```bash
npm run dev
```
The server will start on port 5000 (or PORT environment variable).

### 3. Test Key Features

#### Authentication
1. Open http://localhost:5000
2. Click "Connect" button
3. Test wallet connection (Phantom/Solflare)
4. Test email login/registration

#### Gallery Feature
1. Navigate to the Art Gallery section
2. Submit new artwork
3. Vote on existing items
4. Add comments

#### Dashboard
1. View live token metrics
2. Check price charts
3. Verify community polls

### 4. Production Build Test
```bash
npm run build
npm run start
```

## Remaining Recommendations

### To Install Prettier (Optional)
```bash
npm install -D prettier
npx prettier --write "client/src/**/*.{ts,tsx}" "server/**/*.ts" "shared/**/*.ts"
```

### To Add Testing Framework
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom msw
```

### Environment Variables Required
```env
DATABASE_URL=postgres://...
JWT_SECRET=your-secret-key-at-least-32-chars
ADMIN_WALLET_ADDRESS=your-admin-solana-wallet
SENDGRID_API_KEY=your-sendgrid-key  # For password reset emails
```

## Files Modified

| File | Changes |
|------|---------|
| `client/src/components/ArtGallery.tsx` | Fixed apiRequest calls, deprecated substr |
| `client/src/components/AuthModal.tsx` | Removed unused SiPhantom import |
| `client/src/contexts/AuthContext.tsx` | Added TypeScript generic type |
| `client/src/lib/wallet.ts` | Fixed type narrowing |
| `client/src/pages/ResetPassword.tsx` | Fixed apiRequest call |
| `server/auth.ts` | JWT_SECRET production check |
| `server/routes.ts` | Fixed cookie name |
| `server/storage.ts` | Fixed parameter typo |
| `server/index.ts` | Added body size limit |

## Files Created

| File | Purpose |
|------|---------|
| `AUDIT_REPORT.md` | Full audit findings |
| `plan.md` | Audit plan |
| `.prettierrc` | Prettier configuration |
| `.prettierignore` | Prettier ignore patterns |
| `PREVIEW_INSTRUCTIONS.md` | This file |

## Known Issues Not Fixed (Require User Decisions)

1. **CSRF Protection** - Needs user input on implementation strategy
2. **Helmet Security Headers** - Requires `npm install helmet`
3. **DOMPurify for XSS** - Requires `npm install dompurify`
4. **Test Coverage** - No tests exist; setup requires package installation

## Contact

For questions about the audit or fixes, refer to the detailed `AUDIT_REPORT.md` file.
