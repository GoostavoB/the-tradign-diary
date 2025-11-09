# Credit System and Upload Flow Documentation

## Overview

This document maps the complete credit/budget system and image upload extraction flow for The Trading Diary application. It includes data flow diagrams, decision tables, database schemas, and edge cases.

---

## 1. Credit System Architecture

### 1.1 Core Components

**Files:**
- `supabase/functions/_shared/budgetChecker.ts` - Main budget checking logic
- `supabase/functions/_shared/aiRouter.ts` - AI model routing and token caps
- `src/hooks/useUserRole.ts` - User role and subscription management
- `supabase/migrations/20251022035756_c0b3d6e5-524c-4686-b588-004910f3cabc.sql` - Budget tables schema
- `supabase/migrations/20251022192939_aebd9ff4-b70a-4bf5-965a-2a5a748817f2.sql` - User roles and access control

**Database Tables:**
- `user_ai_budget` - Monthly spending limits per user
- `ai_cost_log` - Detailed cost tracking for all AI operations
- `user_ai_usage` - Feature usage tracking
- `ai_image_cache` - OCR and vision deduplication cache
- `ai_trade_cache` - Analysis results cache
- `user_roles` - User role management (admin/user)
- `profiles` - User subscription tiers and status

**Functions:**
- `checkBudget(supabase, userId)` - Check if user has available budget
- `logCost(supabase, userId, endpoint, ...)` - Log AI cost and update spend
- `checkRateLimit(supabase, userId, endpoint)` - Enforce rate limits
- `increment_ai_spend(p_user_id, p_month_start, p_cost_cents)` - Atomically increment monthly spend

---

### 1.2 Credit Rules (Plain English)

**Who Gets Credits:**
- **Starter Plan**: $0.75/month (75 cents) - Default for all new users
- **Pro Plan**: Higher budget (configured in `user_ai_budget.budget_cents`)
- **Elite Plan**: Highest budget (configured in `user_ai_budget.budget_cents`)
- **Admin**: Currently **NOT bypassed** ⚠️ (see Critical Issue below)

**When We Debit:**
1. After successful AI API call (OpenRouter/Lovable gateway)
2. Only if `cost_cents > 0`
3. Via `logCost()` function which calls `increment_ai_spend()` RPC
4. Atomic update to `user_ai_budget.spend_cents`

**When We Block:**
1. **100% budget used** → `budget.blocked = true`
   - Returns HTTP 402 (Payment Required)
   - Message: "Monthly AI budget exhausted. Upgrade your plan to continue using AI features."
2. **Rate limits exceeded**:
   - Image extraction: Max 10/hour, Max 5/minute
   - Returns HTTP 429 (Too Many Requests)

**When We Force Lite Model:**
- **80%+ budget used** → `budget.forceLite = true`
- All requests use lite model (`google/gemini-2.5-flash-lite`)
- Lower token caps applied
- Message: "Approaching budget limit. Using cost-efficient models."

**How We Reset:**
- Monthly reset on 1st of each month
- Handled by database default: `month_start = DATE trunc to month`
- New month = new row in `user_ai_budget` or reset via scheduled job

**⚠️ CRITICAL ISSUE - Admin Bypass:**
```typescript
// Current code in budgetChecker.ts does NOT check admin status
export async function checkBudget(
  supabase: SupabaseClient,
  userId: string
): Promise<BudgetStatus> {
  // ... checks budget only, NO admin bypass logic
  if (percentUsed >= 100) {
    return { blocked: true, ... }; // Admins get blocked!
  }
}
```

**Expected Admin Behavior:**
- Admins should **NEVER** be blocked, even at 0 balance
- Should have `allowed: true, blocked: false` always
- No deduction from personal budget (or unlimited budget)

---

### 1.3 Call Graph: Request → Decision → Debit

```
Client Request
    ↓
Edge Function (e.g., extract-trade-info)
    ↓
1. Auth Check (supabaseClient.auth.getUser)
    ↓
2. checkRateLimit(supabase, userId, endpoint)
    → If not allowed: Return 429
    ↓
3. checkBudget(supabase, userId)
    → Query: user_ai_budget (user_id, month_start)
    → Calculate: percentUsed = spend_cents / budget_cents * 100
    → Decision:
       - percentUsed >= 100 → { blocked: true } → Return 402
       - percentUsed >= 80 → { forceLite: true }
       - else → { allowed: true }
    ↓
4. Route Selection (aiRouter.ts)
    → classifyComplexity(params) → 'simple' | 'complex'
    → selectRoute(complexity, forceLite) → 'lite' | 'deep'
    ↓
5. AI API Call (OpenRouter/Lovable Gateway)
    → POST to ai.gateway.lovable.dev/v1/chat/completions
    → Model: google/gemini-2.5-flash-lite OR google/gemini-2.5-flash
    → Response includes: tokens_in, tokens_out
    ↓
6. Calculate Cost
    → costCents = (tokens_in * input_rate + tokens_out * output_rate) * 100
    ↓
7. logCost(supabase, userId, endpoint, route, ...)
    → Insert: ai_cost_log (user_id, endpoint, cost_cents, ...)
    → If cost_cents > 0:
       → Call: increment_ai_spend(userId, month_start, cost_cents)
          → UPDATE user_ai_budget SET spend_cents += cost_cents
          → UPDATE force_lite_at_80_percent, blocked_at_100_percent
    ↓
Response to Client
```

---

## 2. Image Upload and Extraction Flow

### 2.1 Components

**Client Side:**
- `src/pages/Upload.tsx` - Main upload UI component
- `src/components/upload/EnhancedFileUpload.tsx` - File upload widget
- `src/components/upload/MultiImageUpload.tsx` - Batch upload
- `src/components/upload/ImageAnnotator.tsx` - Manual area marking
- `src/utils/ocrPipeline.ts` - Client-side OCR (Tesseract.js)

**Server Side:**
- `supabase/functions/extract-trade-info/index.ts` - Trade extraction endpoint
- `supabase/functions/process-multi-upload/index.ts` - Batch processing

**Storage:**
- Supabase Storage bucket (configured in Supabase dashboard)
- Images stored as base64 in request body (not permanent storage)
- Cache stored in `ai_image_cache` table

---

### 2.2 Upload Flow Step-by-Step

```
1. User selects image file (drag-drop or file picker)
    ↓
2. Client-side validation:
   - File size < 20MB
   - File type: image/*
    ↓
3. Image compression (compressAndResizeImage)
   - Resize for OCR optimization
   - Convert to base64
    ↓
4. Client-side OCR (runOCR via Tesseract.js)
   - Extract text from image
   - Calculate confidence score
   - Generate image hash (SHA-256) and perceptual hash
   - Quality score calculation
    ↓
5. User confirms extraction (selects broker, adds annotations)
    ↓
6. POST to supabase.functions.invoke('extract-trade-info')
   Body: {
     imageBase64: string,
     broker: string | null,
     annotations: Annotation[] | null,
     ocrText: string (from step 4),
     ocrConfidence: number,
     imageHash: string,
     perceptualHash: string
   }
    ↓
7. Edge Function Processing:
   a. Auth check
   b. Rate limit check (10/hour, 5/min)
   c. Budget check (may block at 402)
   d. Image size validation (< 10MB base64)
   e. Cache lookup (ai_image_cache by imageHash)
      → If cache hit: Return cached result (0 cost)
      → If cache miss: Continue to AI
   f. Estimate trade count from OCR text
   g. Route decision:
      - High OCR quality (≥0.80) + not forceLite → Use OCR + Lite model
      - Low OCR quality or forceLite → Use Vision + Deep model
   h. AI API call with appropriate model
   i. Parse JSON response (extract trades array)
   j. Store in cache (ai_image_cache)
   k. Log cost (ai_cost_log + increment_ai_spend)
    ↓
8. Response to client: { trades: ExtractedTrade[], cached: boolean }
    ↓
9. Client displays extracted trades for user review
    ↓
10. User edits/confirms trades
    ↓
11. Save to database (trades table via Supabase client)
```

---

### 2.3 Size/Type Checks

**Client Side (Upload.tsx):**
```typescript
// File size limit: 20MB
if (file.size > 20 * 1024 * 1024) {
  toast.error('Image file is too large');
  return;
}

// File type check
if (file && file.type.startsWith('image/')) {
  // Process
} else {
  toast.error('Please drop an image file');
}
```

**Server Side (extract-trade-info/index.ts):**
```typescript
// Validate image size (max 10MB base64)
const base64Size = imageBase64.length * 0.75;
const maxSize = 10 * 1024 * 1024;
if (base64Size > maxSize) {
  return new Response(
    JSON.stringify({ error: 'Image size exceeds 10MB limit' }),
    { status: 400 }
  );
}
```

**Virus Scan:**
- ❌ **NOT IMPLEMENTED** - No virus scanning currently in place

**Metadata Storage:**
- `ai_image_cache` table stores:
  - `image_hash` (SHA-256)
  - `perceptual_hash` (pHash for similar images)
  - `ocr_text`, `ocr_confidence`, `ocr_quality_score`
  - `parsed_json` (extraction result)
  - `model_id`, `model_version`, `preprocessing_version`, `prompt_version`
  - `route_used` ('ocr_lite' | 'vision_deep')
  - `tokens_saved`, `created_at`, `expires_at` (30 days TTL)

---

## 3. Environment Variables and Feature Flags

### 3.1 Environment Variables

**Server Side (Deno Edge Functions):**
```typescript
SUPABASE_URL                 // Supabase project URL
SUPABASE_SERVICE_ROLE_KEY    // Service role key (full access)
LOVABLE_API_KEY              // OpenRouter API key for AI gateway
```

**Client Side (.env):**
```typescript
VITE_SUPABASE_URL            // Supabase project URL
VITE_SUPABASE_ANON_KEY       // Anon key (RLS enforced)
```

### 3.2 Defaults and Fallbacks

**Budget Defaults (budgetChecker.ts):**
```typescript
// If no user_ai_budget row exists:
return {
  allowed: true,
  forceLite: false,
  blocked: false,
  spendCents: 0,
  budgetCents: 75,  // Default: $0.75 for starter
  percentUsed: 0
};
```

**Model Defaults (aiRouter.ts):**
```typescript
ROUTES = {
  lite: {
    model: "google/gemini-2.5-flash-lite",
    maxTokens: 500,
    dollarCap: 0.01
  },
  deep: {
    model: "google/gemini-2.5-flash",
    maxTokens: 1000,
    dollarCap: 0.10
  }
};

TOKEN_CAPS = {
  chat: 500,
  tradeAnalysis: 300,
  psychology: 400,
  reports: 800,
  widgets: 250,
  clarify: 300,
};
```

**Rate Limit Defaults (budgetChecker.ts):**
```typescript
// Image extraction only
if (endpoint === 'extract-trade-info') {
  // Hourly limit: max 10 images/hour
  // Minute limit: max 5 images/minute
}
```

### 3.3 Feature Flags

**None currently implemented** - All features controlled by:
- Budget thresholds (80%, 100%)
- Rate limits (hard-coded)
- Subscription tier (from `profiles.subscription_tier`)

---

## 4. Database Schema Used

### 4.1 user_ai_budget

```sql
CREATE TABLE user_ai_budget (
  user_id UUID PRIMARY KEY,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'pro', 'elite')),
  month_start DATE NOT NULL,
  spend_cents INTEGER DEFAULT 0 CHECK (spend_cents >= 0),
  budget_cents INTEGER NOT NULL CHECK (budget_cents > 0),
  force_lite_at_80_percent BOOLEAN DEFAULT FALSE,
  blocked_at_100_percent BOOLEAN DEFAULT FALSE,
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies:**
- Users can read their own budget
- Service role can manage all budgets

### 4.2 ai_cost_log

```sql
CREATE TABLE ai_cost_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  route TEXT NOT NULL CHECK (route IN ('lite', 'deep', 'cached')),
  model_id TEXT NOT NULL,
  tokens_in INTEGER NOT NULL DEFAULT 0,
  tokens_out INTEGER NOT NULL DEFAULT 0,
  cost_cents INTEGER NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  cache_hit BOOLEAN DEFAULT FALSE,
  canary BOOLEAN DEFAULT FALSE,
  ocr_quality_score NUMERIC(5,2),
  complexity TEXT CHECK (complexity IN ('simple', 'complex')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies:**
- Users can read their own cost logs
- Service role can manage all logs

**Indexes:**
- `idx_cost_log_user_date` on (user_id, created_at)
- `idx_cost_log_endpoint` on (endpoint)
- `idx_cost_log_canary` on (canary) WHERE canary = TRUE

### 4.3 ai_image_cache

```sql
CREATE TABLE ai_image_cache (
  image_hash TEXT PRIMARY KEY,
  perceptual_hash TEXT,
  model_id TEXT NOT NULL,
  model_version TEXT NOT NULL,
  preprocessing_version TEXT NOT NULL DEFAULT 'v1',
  prompt_version TEXT NOT NULL DEFAULT 'v1',
  ocr_text TEXT,
  ocr_confidence NUMERIC(5,2),
  ocr_quality_score NUMERIC(5,2),
  parsed_json JSONB NOT NULL,
  route_used TEXT NOT NULL CHECK (route_used IN ('ocr_lite', 'vision_deep')),
  tokens_saved INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);
```

**RLS Policies:**
- Anyone (authenticated) can read image cache
- Service role can manage all cache entries

### 4.4 user_roles

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,  -- 'admin' | 'user'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);
```

**RLS Policies:**
- Users can view their own roles
- Admins can view/insert/update/delete all roles

**Helper Function:**
```sql
CREATE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$ LANGUAGE SQL STABLE SECURITY DEFINER;
```

### 4.5 profiles (subset)

```sql
ALTER TABLE profiles
ADD COLUMN subscription_tier TEXT DEFAULT 'free'
  CHECK (subscription_tier IN ('free', 'basic', 'pro', 'elite'));

ADD COLUMN subscription_status TEXT DEFAULT 'inactive'
  CHECK (subscription_status IN ('active', 'inactive', 'trial', 'cancelled'));

ADD COLUMN trial_end_date TIMESTAMP WITH TIME ZONE;
```

---

## 5. Edge Cases and Error Handling

### 5.1 Budget Edge Cases

1. **User has no budget row**: Default to starter plan (75 cents)
2. **Budget exactly at 80%**: Force lite model
3. **Budget exactly at 100%**: Block all requests
4. **Cost calculation overflow**: Use INTEGER type (max ~21M cents = $210K)
5. **Negative budget**: Prevented by CHECK constraint
6. **Month boundary**: New month = new row or reset (requires scheduled job)

### 5.2 Upload Edge Cases

1. **Image too large (>20MB client, >10MB server)**: Return 400 error
2. **Invalid image format**: Client-side validation catches early
3. **OCR fails**: Fall back to vision model (no error to user)
4. **Cache hit with wrong trade count**: Bypass cache if estimate > cached count
5. **Duplicate image upload**: Cache returns previous result (0 cost)
6. **Perceptual hash collision**: Rare, but would return similar image result
7. **Rate limit exceeded**: Return 429 with clear message
8. **Budget exhausted mid-request**: Return 402 before AI call
9. **AI API failure**: Log error, return 500 with error_message
10. **JSON parse error**: Retry logic or return parse error to user

### 5.3 Admin Edge Cases

**⚠️ CURRENT BEHAVIOR (WRONG):**
- Admin with 0 budget → BLOCKED (returns 402)
- Admin at 100% → BLOCKED (returns 402)

**EXPECTED BEHAVIOR:**
- Admin with any budget → ALLOWED (always)
- Admin should have `allowed: true, blocked: false` regardless of spend

---

## 6. Mermaid Diagrams

### 6.1 Credit Check + Debit Flow

\`\`\`mermaid
sequenceDiagram
    participant Client
    participant EdgeFunction
    participant BudgetChecker
    participant Database
    participant AI_API
    participant CostLogger

    Client->>EdgeFunction: POST /extract-trade-info
    EdgeFunction->>EdgeFunction: Validate auth token
    EdgeFunction->>BudgetChecker: checkRateLimit(userId, endpoint)
    BudgetChecker->>Database: SELECT COUNT(*) FROM ai_cost_log<br/>WHERE user_id = ? AND created_at >= ?
    Database-->>BudgetChecker: count
    alt Rate limit exceeded
        BudgetChecker-->>EdgeFunction: { allowed: false, message }
        EdgeFunction-->>Client: 429 Too Many Requests
    end

    EdgeFunction->>BudgetChecker: checkBudget(userId)
    BudgetChecker->>Database: SELECT * FROM user_ai_budget<br/>WHERE user_id = ? AND month_start = ?
    Database-->>BudgetChecker: { spend_cents, budget_cents }
    BudgetChecker->>BudgetChecker: percentUsed = spend_cents / budget_cents * 100

    alt percentUsed >= 100
        BudgetChecker-->>EdgeFunction: { blocked: true, message }
        EdgeFunction-->>Client: 402 Payment Required
    else percentUsed >= 80
        BudgetChecker-->>EdgeFunction: { forceLite: true }
    else
        BudgetChecker-->>EdgeFunction: { allowed: true }
    end

    EdgeFunction->>EdgeFunction: Select route (lite/deep)
    EdgeFunction->>AI_API: POST /v1/chat/completions
    AI_API-->>EdgeFunction: { content, usage: { tokens_in, tokens_out } }
    EdgeFunction->>EdgeFunction: Calculate cost_cents
    EdgeFunction->>CostLogger: logCost(userId, endpoint, cost_cents, ...)
    CostLogger->>Database: INSERT INTO ai_cost_log (...)
    CostLogger->>Database: CALL increment_ai_spend(userId, month_start, cost_cents)
    Database->>Database: UPDATE user_ai_budget<br/>SET spend_cents += cost_cents
    CostLogger-->>EdgeFunction: Success
    EdgeFunction-->>Client: 200 OK { trades }
\`\`\`

### 6.2 Upload + Extraction + Result Flow

\`\`\`mermaid
sequenceDiagram
    participant Browser
    participant UploadComponent
    participant OCRPipeline
    participant EdgeFunction
    participant Cache
    participant AI_API
    participant CostLogger
    participant Database

    Browser->>UploadComponent: User selects image file
    UploadComponent->>UploadComponent: Validate size (<20MB)
    UploadComponent->>UploadComponent: Compress & resize image
    UploadComponent->>UploadComponent: Convert to base64
    UploadComponent->>OCRPipeline: runOCR(file)
    OCRPipeline->>OCRPipeline: Tesseract.js extract text
    OCRPipeline->>OCRPipeline: Calculate confidence & quality
    OCRPipeline->>OCRPipeline: Generate imageHash + perceptualHash
    OCRPipeline-->>UploadComponent: { text, confidence, imageHash, perceptualHash }
    UploadComponent->>Browser: Display preview + "Confirm" button

    Browser->>UploadComponent: User clicks "Confirm"
    UploadComponent->>EdgeFunction: supabase.functions.invoke('extract-trade-info')<br/>{ imageBase64, ocrText, imageHash, ... }
    EdgeFunction->>EdgeFunction: Auth check
    EdgeFunction->>EdgeFunction: Rate limit check
    EdgeFunction->>EdgeFunction: Budget check
    alt Budget blocked
        EdgeFunction-->>UploadComponent: 402 Payment Required
        UploadComponent-->>Browser: Show error toast
    end

    EdgeFunction->>EdgeFunction: Validate image size (<10MB)
    EdgeFunction->>Cache: SELECT * FROM ai_image_cache<br/>WHERE image_hash = ?
    alt Cache hit
        Cache-->>EdgeFunction: { parsed_json, route_used }
        EdgeFunction->>CostLogger: logCost(..., cost_cents=0, cache_hit=true)
        EdgeFunction-->>UploadComponent: { trades, cached: true }
    else Cache miss
        EdgeFunction->>EdgeFunction: Estimate trade count from ocrText
        EdgeFunction->>EdgeFunction: Route decision (OCR quality ≥ 0.80 → lite, else deep)
        EdgeFunction->>AI_API: POST /v1/chat/completions<br/>{ model, messages, max_tokens }
        AI_API-->>EdgeFunction: { content: "JSON", usage }
        EdgeFunction->>EdgeFunction: Parse JSON (extractJSON)
        EdgeFunction->>Cache: INSERT INTO ai_image_cache (...)
        EdgeFunction->>EdgeFunction: Calculate cost_cents
        EdgeFunction->>CostLogger: logCost(..., cost_cents, cache_hit=false)
        CostLogger->>Database: INSERT ai_cost_log + increment_ai_spend
        EdgeFunction-->>UploadComponent: { trades, cached: false }
    end

    UploadComponent->>Browser: Display extracted trades
    Browser->>UploadComponent: User edits/confirms trades
    UploadComponent->>Database: INSERT INTO trades (...)
    Database-->>UploadComponent: Success
    UploadComponent-->>Browser: Show success feedback
\`\`\`

---

## 7. Critical Issues Identified

### 7.1 No Admin Bypass in Budget Check

**Location:** `supabase/functions/_shared/budgetChecker.ts`

**Problem:**
The `checkBudget()` function does NOT check if the user is an admin. Admins are blocked when their budget reaches 100%, which is incorrect behavior.

**Current Code:**
```typescript
export async function checkBudget(
  supabase: SupabaseClient,
  userId: string
): Promise<BudgetStatus> {
  // ... budget calculations
  if (percentUsed >= 100) {
    return { blocked: true, ... }; // ❌ Blocks admin too!
  }
}
```

**Expected Code:**
```typescript
export async function checkBudget(
  supabase: SupabaseClient,
  userId: string
): Promise<BudgetStatus> {
  // Check if user is admin first
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .single();

  if (roleData?.role === 'admin') {
    return {
      allowed: true,
      forceLite: false,
      blocked: false,
      spendCents: 0,
      budgetCents: 999999, // Unlimited for admin
      percentUsed: 0,
      message: 'Admin access - unlimited budget'
    };
  }

  // ... rest of budget check logic
}
```

### 7.2 No Virus Scanning

**Location:** Image upload flow (client and server)

**Problem:**
No virus or malware scanning is performed on uploaded images. Malicious files could be processed by OCR/AI systems.

**Recommendation:**
- Integrate ClamAV or cloud-based scanning (e.g., VirusTotal API)
- Scan before processing
- Store scan results in metadata

### 7.3 No Idempotency for Credit Deduction

**Location:** `supabase/functions/_shared/budgetChecker.ts` → `logCost()`

**Problem:**
If a request is retried (e.g., network failure after AI call but before response), credits could be deducted twice for the same operation.

**Recommendation:**
- Add `idempotency_key` to `ai_cost_log` table
- Check for duplicate key before inserting
- Use request ID or image hash as key

---

## 8. Testing Recommendations

### 8.1 Unit Tests for Budget Logic

```typescript
describe('checkBudget', () => {
  it('should allow admin even at 0 balance', async () => {
    const result = await checkBudget(supabase, adminUserId);
    expect(result.blocked).toBe(false);
    expect(result.allowed).toBe(true);
  });

  it('should block non-admin at 0 balance', async () => {
    const result = await checkBudget(supabase, regularUserId);
    expect(result.blocked).toBe(true);
    expect(result.allowed).toBe(false);
  });

  it('should debit credits once per successful extraction', async () => {
    // Mock AI call
    // Call logCost
    // Verify ai_cost_log insert
    // Verify user_ai_budget increment
  });

  it('should handle retries idempotently', async () => {
    // Call logCost twice with same idempotency key
    // Verify only one debit
  });
});
```

### 8.2 Integration Tests for Upload Flow

```typescript
describe('Image Upload', () => {
  it('should reject oversize images', async () => {
    const largeFile = createFile(25 * 1024 * 1024); // 25MB
    const response = await uploadImage(largeFile);
    expect(response.status).toBe(400);
  });

  it('should reject wrong MIME types', async () => {
    const pdfFile = createFile(1024, 'application/pdf');
    const response = await uploadImage(pdfFile);
    expect(response.status).toBe(400);
  });

  it('should prevent double submission', async () => {
    const file = createFile(1024);
    const hash = await generateHash(file);

    // First upload
    const response1 = await uploadImage(file);
    expect(response1.data.cached).toBe(false);

    // Second upload (same hash)
    const response2 = await uploadImage(file);
    expect(response2.data.cached).toBe(true);
    expect(response2.costDeducted).toBe(0);
  });

  it('should allow re-upload with new key', async () => {
    const file1 = createFile(1024);
    const file2 = createFile(1024); // Different content

    const response1 = await uploadImage(file1);
    const response2 = await uploadImage(file2);

    expect(response1.data.imageHash).not.toBe(response2.data.imageHash);
  });
});
```

---

## 9. Execution Path Examples

### 9.1 Admin Request with Zero Balance

```
1. Request: POST /extract-trade-info
2. Auth: ✅ admin@example.com (userId: abc-123)
3. Rate Limit: ✅ 2/10 images this hour
4. Budget Check:
   - Query user_ai_budget: { spend_cents: 80, budget_cents: 75 }
   - percentUsed: 106.67%
   - ❌ CURRENT: Returns { blocked: true } → 402 Payment Required
   - ✅ EXPECTED: Check user_roles → admin → Returns { allowed: true }
5. ❌ Request fails (should succeed)

Log lines (expected):
{
  "requestId": "req-789",
  "userId": "abc-123",
  "emailNormalized": "admin@example.com",
  "isAdmin": true,
  "availableCreditsBefore": -5,
  "debitAmount": 0,
  "decision": "allow",
  "uploadId": "img-456",
  "fileSize": 2048000,
  "mime": "image/png",
  "storageKey": "cache-hit-hash123"
}
```

### 9.2 Non-Admin with Zero Balance

```
1. Request: POST /extract-trade-info
2. Auth: ✅ user@example.com (userId: def-456)
3. Rate Limit: ✅ 3/10 images this hour
4. Budget Check:
   - Query user_ai_budget: { spend_cents: 75, budget_cents: 75 }
   - percentUsed: 100%
   - ✅ Returns { blocked: true, message: "Monthly AI budget exhausted..." }
5. ✅ Return 402 Payment Required

Log lines (expected):
{
  "requestId": "req-790",
  "userId": "def-456",
  "emailNormalized": "user@example.com",
  "isAdmin": false,
  "availableCreditsBefore": 0,
  "debitAmount": 0,
  "decision": "block",
  "reason": "budget_exhausted",
  "uploadId": null,
  "fileSize": null,
  "mime": null,
  "storageKey": null
}
```

---

## 10. Next Steps

1. **Fix admin bypass** in `budgetChecker.ts`
2. **Add structured logging** for all credit checks and uploads
3. **Implement idempotency** for credit deduction
4. **Add virus scanning** for uploaded images
5. **Write comprehensive tests** for budget and upload logic
6. **Create monitoring dashboard** for budget usage and errors
7. **Document cost estimation** formulas and pricing tiers

---

**Document Version:** 1.0
**Last Updated:** 2025-01-09
**Maintained By:** Development Team
