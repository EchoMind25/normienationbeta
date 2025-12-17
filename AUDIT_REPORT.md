# Normie Nation Beta - Security & Code Audit Report

**Date:** December 17, 2025
**Repository:** normienationbeta
**Stack:** React 18, TypeScript, Express, Drizzle ORM, PostgreSQL, Solana Web3.js

---

## Executive Summary

This audit identified **9 critical**, **12 high**, **15 medium**, and **8 low** severity issues across the codebase. The application has a solid foundation but requires immediate attention to TypeScript errors, security vulnerabilities, and performance optimizations before production deployment.

---

## Table of Contents
1. [Critical Issues](#critical-issues)
2. [High Severity Issues](#high-severity-issues)
3. [Medium Severity Issues](#medium-severity-issues)
4. [Low Severity Issues](#low-severity-issues)
5. [Performance Recommendations](#performance-recommendations)
6. [Testing Coverage](#testing-coverage)
7. [Prettification Steps](#prettification-steps)

---

## Critical Issues

### 1. TypeScript Compilation Errors (9 errors)

**Severity:** CRITICAL
**Impact:** Application may fail to build in strict type-checking environments

#### 1.1 Incorrect `apiRequest` Function Signature
**Files:**
- `client/src/components/ArtGallery.tsx:127, 256, 416`
- `client/src/pages/ResetPassword.tsx:56`

**Problem:** The `apiRequest` function is being called with an object as the second parameter, but it expects `(method: string, url: string, data?: unknown)`.

**Current (incorrect):**
```typescript
apiRequest("/api/gallery", {
  method: "POST",
  body: JSON.stringify(data),
});
```

**Fix:**
```typescript
apiRequest("POST", "/api/gallery", data);
```

#### 1.2 Unused Import - `SiPhantom` Does Not Exist
**File:** `client/src/components/AuthModal.tsx:6`

**Problem:** `SiPhantom` is not exported from `react-icons/si`

**Fix:** Remove the unused import or replace with `SiWallet` if a wallet icon is needed:
```typescript
// Remove this line:
import { SiPhantom } from "react-icons/si";
```

#### 1.3 Type Error in AuthContext Query
**File:** `client/src/contexts/AuthContext.tsx:46-47`

**Problem:** Accessing `.user` property on empty object type `{}`

**Fix:**
```typescript
const { data: userData, isLoading, refetch } = useQuery<{ user: User } | null>({
  queryKey: ["/api/auth/me"],
  retry: false,
  staleTime: 5 * 60 * 1000,
});
```

#### 1.4 Wallet Type Narrowing Issue
**File:** `client/src/lib/wallet.ts:91-92`

**Problem:** TypeScript cannot infer that `wallet.request` exists for Phantom wallet type

**Fix:**
```typescript
const wallet = getWallet(provider);
if (!wallet || !wallet.publicKey) return null;

// Type guard for Phantom wallet
if (provider === "phantom" && window.solana?.request) {
  const response = await window.solana.request({
    method: "signMessage",
    params: { message: messageBytes, display: "utf8" },
  });
  signature = response.signature;
} else {
  // ... existing fallback
}
```

---

### 2. Security: JWT Secret Fallback in Production
**File:** `server/auth.ts:8`

**Problem:** JWT secret falls back to random bytes if env var not set, causing session invalidation on server restart.

```typescript
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");
```

**Fix:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
```

---

### 3. Security: Missing CSRF Protection
**File:** `server/routes.ts`

**Problem:** POST/PATCH/DELETE routes lack CSRF token validation, making the app vulnerable to cross-site request forgery attacks.

**Fix:** Implement CSRF protection using `csurf` or similar middleware:
```typescript
import csrf from "csurf";
const csrfProtection = csrf({ cookie: true });
app.use("/api", csrfProtection);
```

---

### 4. Security: Email Enumeration via Timing Attack
**File:** `server/authRoutes.ts:321-325`

**Problem:** Password reset endpoint returns early before DB lookup if user doesn't exist, allowing timing-based email enumeration.

```typescript
res.json({ message: "If an account exists, a reset email has been sent" });
if (!user) return; // <-- Timing difference reveals if email exists
```

**Fix:** Always perform consistent operations regardless of user existence:
```typescript
const user = await storage.getUserByEmail(email);
// Always generate token and perform email send logic (or no-op)
if (user) {
  // Actual email sending
}
// Sleep for consistent response time
await new Promise(r => setTimeout(r, Math.random() * 200));
res.json({ message: "If an account exists, a reset email has been sent" });
```

---

### 5. Security: SQL Injection Risk in Dynamic Queries
**File:** `server/storage.ts:345`

**Problem:** Parameter name typo `oduserId` instead of `userId` could cause runtime issues.

```typescript
async removeChatRoomMember(roomId: string, oduserId: string): Promise<void> {
```

**Fix:**
```typescript
async removeChatRoomMember(roomId: string, userId: string): Promise<void> {
```

---

## High Severity Issues

### 6. Missing Input Sanitization for Gallery Items
**File:** `server/routes.ts:431-453`

**Problem:** Gallery submission accepts unsanitized `imageUrl` that could contain malicious URLs or JavaScript.

**Fix:** Add URL validation:
```typescript
import { z } from "zod";

const galleryInputSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().refine(
    url => /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url),
    "Must be a valid image URL"
  ),
  tags: z.array(z.string().max(30)).max(10).optional(),
  creatorName: z.string().max(100).optional(),
});
```

---

### 7. Missing Rate Limiting on Gallery/Comment Endpoints
**File:** `server/routes.ts:431-520`

**Problem:** Gallery submission and comment endpoints don't have rate limiting, enabling spam attacks.

**Fix:**
```typescript
const galleryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 submissions per 15 minutes
  message: { error: "Too many submissions, try again later" },
});

app.post("/api/gallery", galleryLimiter, async (req, res) => {...});
app.post("/api/gallery/:id/comments", galleryLimiter, async (req, res) => {...});
```

---

### 8. Deprecated String Method Usage
**File:** `client/src/components/ArtGallery.tsx:33`

**Problem:** `substr` is deprecated in favor of `substring`.

```typescript
visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
```

**Fix:**
```typescript
visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
```

---

### 9. No Password Complexity Validation on Change
**File:** `server/authRoutes.ts:533-536`

**Problem:** The password complexity regex allows weak passwords - doesn't require special characters.

**Fix:**
```typescript
body("newPassword")
  .isLength({ min: 8 })
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
  .withMessage("Must include lowercase, uppercase, number, and special character"),
```

---

### 10. Unhandled Promise Rejection in WebSocket/Polling
**File:** `client/src/components/CommunityHub.tsx:113-123`

**Problem:** Interval-based polling doesn't handle errors gracefully, causing potential UI freezes.

**Fix:** Wrap in try-catch and add error boundaries:
```typescript
useEffect(() => {
  fetchPolls().catch(console.error);
  fetchActivity().catch(console.error);

  const pollInterval = setInterval(() => fetchPolls().catch(console.error), 30000);
  const activityInterval = setInterval(() => fetchActivity().catch(console.error), 15000);

  return () => {
    clearInterval(pollInterval);
    clearInterval(activityInterval);
  };
}, [fetchPolls, fetchActivity]);
```

---

### 11. Admin Route Authorization Gap
**File:** `server/routes.ts:21-56`

**Problem:** The `requireAdmin` middleware checks token from `req.cookies?.token` but auth is set in `req.cookies?.authToken`.

```typescript
const token = authHeader?.startsWith("Bearer ")
  ? authHeader.substring(7)
  : req.cookies?.token; // <-- Should be authToken
```

**Fix:**
```typescript
const token = authHeader?.startsWith("Bearer ")
  ? authHeader.substring(7)
  : req.cookies?.authToken;
```

---

### 12. Missing Error Boundary Component
**File:** `client/src/App.tsx`

**Problem:** No React Error Boundary wrapping the app, causing full app crashes on component errors.

**Fix:** Add ErrorBoundary:
```typescript
import { Component, ErrorInfo, ReactNode } from "react";

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-center">Something went wrong. Please refresh.</div>;
    }
    return this.props.children;
  }
}
```

---

### 13. Database Connection Pool Leaks
**File:** `server/db.ts`

**Problem:** No connection error handling or pool cleanup on shutdown.

**Fix:**
```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

export const db = drizzle(pool);
```

---

### 14. Memory Leak in MemeGenerator Component
**File:** `client/src/components/MemeGenerator.tsx:394-429`

**Problem:** Image objects are created but never cleaned up, causing memory leaks with heavy usage.

**Fix:** Use cleanup function in useEffect:
```typescript
useEffect(() => {
  const allStickers = [...NORMIE_STICKERS, ...CRYPTO_STICKERS, ...BRAND_STICKERS];
  const loadedImages: HTMLImageElement[] = [];

  allStickers.forEach((sticker) => {
    if (!loadedStickerImages.has(sticker.url)) {
      const img = new Image();
      loadedImages.push(img);
      img.onload = () => {
        setLoadedStickerImages((prev) => new Map(prev).set(sticker.url, img));
      };
      img.src = sticker.url;
    }
  });

  return () => {
    loadedImages.forEach(img => {
      img.onload = null;
      img.src = '';
    });
  };
}, []);
```

---

### 15. Hardcoded Burn/Lock Values
**File:** `server/solana.ts:13-14`

**Problem:** Burned and locked token amounts are hardcoded instead of fetched from blockchain.

```typescript
const BURNED_TOKENS: number = 297000000;
const LOCKED_TOKENS: number = 230000000;
```

**Fix:** Consider fetching from Solana or using admin-configurable values.

---

### 16. XSS Vulnerability in Comment Display
**File:** `client/src/components/ArtGallery.tsx:388`

**Problem:** Comment content is rendered directly without sanitization.

```tsx
<p className="text-muted-foreground">{comment.content}</p>
```

**Fix:** Use a sanitization library:
```typescript
import DOMPurify from 'dompurify';

<p className="text-muted-foreground">{DOMPurify.sanitize(comment.content)}</p>
```

---

### 17. No Request Size Limits
**File:** `server/index.ts:15-21`

**Problem:** JSON body parser has no size limit, allowing DoS via large payloads.

**Fix:**
```typescript
app.use(express.json({
  limit: '1mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  },
}));
```

---

## Medium Severity Issues

### 18. Insecure Cookie Settings in Development
**File:** `server/authRoutes.ts:107-112`

**Problem:** Secure flag only enabled in production; SameSite should be "lax" for OAuth flows.

---

### 19. Missing Loading States
**Files:** Multiple components

**Problem:** Several API calls don't show loading indicators, causing poor UX.

---

### 20. Console.error Leaking to Production
**Files:** Multiple server files

**Problem:** Error details logged to console should be filtered in production.

---

### 21. No Request Timeout Configuration
**File:** `server/index.ts`

**Problem:** HTTP server has no timeout configuration for slow connections.

---

### 22. Inconsistent Error Response Format
**Files:** Multiple API routes

**Problem:** Some routes return `{ error: "..." }`, others return `{ errors: [...] }`.

---

### 23. Missing Helmet Security Headers
**File:** `server/index.ts`

**Problem:** No security headers (CSP, X-Frame-Options, etc.) configured.

**Fix:**
```typescript
import helmet from "helmet";
app.use(helmet());
```

---

### 24-32. Additional Medium Issues
- Missing pagination on gallery/activity endpoints
- No image URL validation for external images
- Wallet signature replay attack potential
- Session cleanup cron job needed for expired sessions
- Missing audit logging for admin actions
- No graceful shutdown handling
- ENV variable validation on startup
- Missing CORS configuration
- Potential race condition in vote counting

---

## Low Severity Issues

### 33. Unused Imports
**Files:** Various components have unused imports that should be removed.

### 34. Inconsistent Naming Conventions
**Files:** Mix of camelCase and snake_case in some areas.

### 35. Missing TypeScript Strict Null Checks
Some optional chaining could be added for safety.

### 36. Console Logs in Production Code
Development console.log statements should be removed.

### 37-40. Additional Low Issues
- Deprecated package usage warnings
- Missing alt text on some images
- Non-semantic HTML elements
- Missing aria labels for accessibility

---

## Performance Recommendations

### 1. Database Query Optimization
- Add indexes for frequently queried columns
- Use pagination for list endpoints
- Consider connection pooling tuning

### 2. React Component Optimization
- Memoize expensive computations
- Use `React.memo` for list items
- Implement virtualization for long lists

### 3. API Response Caching
- Add Redis caching for token metrics
- Cache gallery items with short TTL

### 4. Bundle Size Reduction
- Lazy load heavy components (MemeGenerator, Charts)
- Code split by route
- Tree shake unused Radix UI components

---

## Testing Coverage

### Current State
**No test files found in the project.**

### Recommended Test Setup

1. **Install testing dependencies:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom msw
```

2. **Priority test cases:**

| Component/Module | Test Type | Priority |
|------------------|-----------|----------|
| `auth.ts` | Unit | Critical |
| `authRoutes.ts` | Integration | Critical |
| `storage.ts` | Unit | High |
| `AuthContext.tsx` | Integration | High |
| `wallet.ts` | Unit | High |
| `CommunityHub.tsx` | Component | Medium |
| `MemeGenerator.tsx` | Component | Medium |

3. **Sample test file structure:**
```
/tests
  /unit
    auth.test.ts
    storage.test.ts
  /integration
    authRoutes.test.ts
    galleryRoutes.test.ts
  /components
    AuthModal.test.tsx
    Dashboard.test.tsx
```

---

## Prettification Steps

### Step 1: Install and Configure Prettier
```bash
npm install -D prettier
```

Create `.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Step 2: Install ESLint with TypeScript Support
```bash
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

### Step 3: Format All Files
```bash
npx prettier --write "client/src/**/*.{ts,tsx}"
npx prettier --write "server/**/*.ts"
npx prettier --write "shared/**/*.ts"
```

### Step 4: Fix All TypeScript Errors
Apply the fixes documented in this report.

### Step 5: Add Pre-commit Hooks
```bash
npm install -D husky lint-staged
npx husky install
```

---

## Summary of Required Fixes

| Severity | Count | Immediate Action Required |
|----------|-------|---------------------------|
| Critical | 9 | Yes - Blocking Issues |
| High | 12 | Yes - Before Production |
| Medium | 15 | Recommended |
| Low | 8 | Nice to Have |

**Total Issues: 44**

---

## Next Steps

1. Fix all Critical TypeScript errors (blocking deployment)
2. Address security vulnerabilities (CSRF, JWT, XSS)
3. Add rate limiting to remaining endpoints
4. Implement error boundaries and proper error handling
5. Set up testing framework and write critical tests
6. Apply Prettier formatting across codebase
7. Create preview branch with all fixes applied

---

*Report generated by Claude Code Audit*
