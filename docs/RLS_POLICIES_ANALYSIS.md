# RLS Policies Analysis

## Overview

This document analyzes all Row Level Security (RLS) policies related to the credit system and upload functionality.

---

## Tables with RLS Enabled

### 1. user_ai_budget

**Purpose:** Monthly AI spending limits per user

**RLS Status:** ✅ Enabled

**Policies:**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can read their own budget | SELECT | `auth.uid() = user_id` |
| Service role can manage budgets | ALL | `true` (service_role only) |

**Analysis:**
- ✅ Users can only see their own budget (privacy protected)
- ✅ Service role (edge functions) has full access
- ✅ No admin bypass needed here - admins use service role in edge functions
- ⚠️ Users **cannot write** to their own budget (prevents tampering)

**Potential Issues:**
- None identified

---

### 2. ai_cost_log

**Purpose:** Detailed cost tracking for all AI operations

**RLS Status:** ✅ Enabled

**Policies:**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can read their own cost logs | SELECT | `auth.uid() = user_id` |
| Service role can manage cost logs | ALL | `true` (service_role only) |

**Analysis:**
- ✅ Users can view their own cost history (transparency)
- ✅ Service role has full access for logging
- ✅ Users cannot tamper with logs (write-protected)

**Potential Issues:**
- None identified

---

### 3. ai_image_cache

**Purpose:** OCR and vision deduplication cache

**RLS Status:** ✅ Enabled

**Policies:**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Anyone can read image cache | SELECT | `true` (all authenticated users) |
| Service role can manage image cache | ALL | `true` (service_role only) |

**Analysis:**
- ⚠️ **WIDE OPEN READ ACCESS** - All authenticated users can read all cached images
- This is **intentional** for cache sharing across users
- Example: If User A uploads popular broker screenshot, User B can benefit from cache
- ✅ Only service role can write (prevents cache poisoning)

**Security Considerations:**
- Images hashed (SHA-256 + perceptual hash) before storage
- No PII stored in cache
- Cache entries expire after 30 days
- parsed_json contains trade data but no user_id

**Potential Privacy Issue:**
```sql
-- Any user can see ALL cached trades from ALL users
SELECT * FROM ai_image_cache;
-- Returns: All cached extractions regardless of user
```

**Recommendation:**
- ✅ Current design is acceptable IF:
  - No PII in cached trade data (symbols, prices only)
  - Users understand cache is shared
- ⚠️ Consider adding `user_id` column if privacy is a concern

---

### 4. ai_trade_cache

**Purpose:** Analysis results cache (per-user)

**RLS Status:** ✅ Enabled

**Policies:**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can read their own trade cache | SELECT | `auth.uid() = user_id` |
| Service role can manage trade cache | ALL | `true` (service_role only) |

**Analysis:**
- ✅ User-specific cache (unlike image cache)
- ✅ Properly isolated by user_id
- ✅ Service role manages writes

**Potential Issues:**
- None identified

---

### 5. user_ai_usage

**Purpose:** Feature usage tracking (images used, chat messages, etc.)

**RLS Status:** ✅ Enabled

**Policies:**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can read their own usage | SELECT | `auth.uid() = user_id` |
| Service role can manage usage | ALL | `true` (service_role only) |

**Analysis:**
- ✅ Users can see their own usage stats
- ✅ Service role tracks usage
- ✅ Users cannot manipulate usage counts

**Potential Issues:**
- None identified

---

### 6. user_roles

**Purpose:** Admin/user role management

**RLS Status:** ✅ Enabled

**Policies:**

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can view their own roles | SELECT | `auth.uid() = user_id` |
| Admins can view all roles | SELECT | `public.has_role(auth.uid(), 'admin')` |
| Admins can insert roles | INSERT | `public.has_role(auth.uid(), 'admin')` |
| Admins can update roles | UPDATE | `public.has_role(auth.uid(), 'admin')` |
| Admins can delete roles | DELETE | `public.has_role(auth.uid(), 'admin')` |

**Analysis:**
- ✅ Users can see their own role (needed for UI)
- ✅ Admins can manage all roles
- ✅ Regular users **cannot** promote themselves to admin

**Helper Function:**
```sql
CREATE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$ LANGUAGE SQL STABLE SECURITY DEFINER;
```

**Potential Issues:**
- None identified

---

### 7. profiles

**Purpose:** User profiles with subscription info

**RLS Status:** ✅ Enabled (assumed from schema)

**Relevant Columns:**
- `subscription_tier` ('free' | 'basic' | 'pro' | 'elite')
- `subscription_status` ('active' | 'inactive' | 'trial' | 'cancelled')
- `trial_end_date`

**Expected Policies:**
- Users can view/update their own profile
- Admins can view/update all profiles

**Analysis:**
- ✅ Subscription tier affects budget allocation
- ✅ Used in `user_has_access()` helper function

**Helper Function:**
```sql
CREATE FUNCTION public.user_has_access(_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles p
    LEFT JOIN user_roles ur ON ur.user_id = p.id
    WHERE p.id = _user_id
      AND (
        ur.role = 'admin'
        OR p.subscription_status = 'active'
        OR (p.subscription_status = 'trial' AND p.trial_end_date > now())
      )
  )
$$ LANGUAGE SQL STABLE SECURITY DEFINER;
```

**Potential Issues:**
- None identified

---

## RLS Bypass in Edge Functions

### How Edge Functions Bypass RLS

Edge functions use **service_role key** which:
- Has **FULL DATABASE ACCESS**
- Bypasses **ALL RLS policies**
- Can read/write any table without restrictions

### Code Example

```typescript
// In supabase/functions/extract-trade-info/index.ts

// Service role client (bypasses RLS)
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // 🔑 Magic key
);

// This query ignores RLS policies
const { data } = await supabaseClient
  .from('user_ai_budget')
  .select('*')
  .eq('user_id', userId);
// ✅ Returns data even if RLS would normally block it
```

### Why This Works

1. User calls edge function with **anon key JWT**
2. Edge function validates JWT: `supabaseClient.auth.getUser(token)`
3. Edge function extracts `user.id` from validated JWT
4. Edge function uses **service_role** to query database
5. Database sees **service_role** → skips RLS checks
6. Edge function returns data to user

### Security Model

```
┌─────────────────────────────────────────────────┐
│ Client (Browser)                                │
│  - Has: Anon Key JWT                           │
│  - Can: Call edge functions                    │
│  - Cannot: Query database directly with RLS   │
└────────────────┬────────────────────────────────┘
                 │
                 │ POST /functions/v1/extract-trade-info
                 │ Authorization: Bearer <jwt>
                 ▼
┌─────────────────────────────────────────────────┐
│ Edge Function                                   │
│  - Validates JWT → gets user.id                │
│  - Uses service_role key                       │
│  - Queries database (bypasses RLS)             │
│  - Returns ONLY data for authenticated user    │
└────────────────┬────────────────────────────────┘
                 │
                 │ Uses service_role key
                 │ (bypasses RLS)
                 ▼
┌─────────────────────────────────────────────────┐
│ Database                                        │
│  - Sees: service_role                          │
│  - Skips: All RLS policies                    │
│  - Returns: Whatever function requests         │
└─────────────────────────────────────────────────┘
```

**Key Point:** Edge functions must implement their own authorization logic (e.g., checking `auth.uid() = user_id`) because RLS is bypassed.

---

## Potential RLS Failures

### 1. Edge Function Forgets to Filter by user_id

**Vulnerable Code:**
```typescript
// 🚨 BAD: Returns ALL users' budgets
const { data } = await supabaseClient
  .from('user_ai_budget')
  .select('*');
// No .eq('user_id', user.id) filter!

return new Response(JSON.stringify(data));
```

**Impact:** User could see all budgets from all users

**Mitigation:**
- Always filter by `user.id` from validated JWT
- Code review all edge function queries
- Add unit tests to verify filtering

---

### 2. Client Attempts Direct Database Query

**Attack:**
```javascript
// Client code trying to bypass edge function
const supabase = createClient(SUPABASE_URL, ANON_KEY);

// 🚨 Attempt to read all budgets
const { data, error } = await supabase
  .from('user_ai_budget')
  .select('*');
// RLS policy: "Users can read their own budget"
// auth.uid() = user_id
// Result: Returns ONLY current user's budget (or empty if none)
```

**Impact:** ✅ Blocked by RLS - user only sees their own data

**Mitigation:** RLS policies are correctly configured

---

### 3. Admin Tries to View Another User's Budget via Client

**Attack:**
```javascript
// Admin user trying to view another user's budget from browser
const supabase = createClient(SUPABASE_URL, ANON_KEY);

const { data, error } = await supabase
  .from('user_ai_budget')
  .select('*')
  .eq('user_id', 'some-other-user-id');
// RLS policy: auth.uid() = user_id
// Admin's auth.uid() ≠ 'some-other-user-id'
// Result: 🚫 BLOCKED (returns empty)
```

**Impact:** ✅ Admins cannot abuse anon key to view other users

**Mitigation:**
- Admins must use **edge function** or **service_role**
- Create admin-specific edge function if needed:
  ```typescript
  // supabase/functions/admin-view-user-budget/index.ts
  const isAdmin = await checkIsAdmin(supabaseClient, user.id);
  if (!isAdmin) throw new Error('Forbidden');

  const { data } = await supabaseClient
    .from('user_ai_budget')
    .select('*')
    .eq('user_id', requestedUserId); // OK because using service_role
  ```

---

## RLS Policy Testing

### Test 1: User Reads Own Budget

```sql
-- Set session to user
SET request.jwt.claims = '{"sub": "user-123"}';

-- Query budget
SELECT * FROM user_ai_budget WHERE user_id = 'user-123';
-- ✅ Returns user-123's budget

SELECT * FROM user_ai_budget WHERE user_id = 'user-456';
-- 🚫 Returns empty (RLS blocks)
```

### Test 2: User Attempts to Write Budget

```sql
-- Set session to user
SET request.jwt.claims = '{"sub": "user-123"}';

-- Attempt to increase budget
UPDATE user_ai_budget
SET budget_cents = 9999900
WHERE user_id = 'user-123';
-- 🚫 ERROR: Policy violation (no write policy for users)
```

### Test 3: Admin Views All Roles

```sql
-- Set session to admin
SET request.jwt.claims = '{"sub": "admin-123"}';

-- Query all user roles
SELECT * FROM user_roles;
-- ✅ Returns all roles (has_role(admin-123, 'admin') = true)
```

### Test 4: Regular User Views All Roles

```sql
-- Set session to regular user
SET request.jwt.claims = '{"sub": "user-123"}';

-- Query all user roles
SELECT * FROM user_roles;
-- 🚫 Returns only user-123's role (policy: auth.uid() = user_id)
```

---

## Recommendations

### 1. Add User ID to Image Cache (Optional)

**Current:**
```sql
CREATE TABLE ai_image_cache (
  image_hash TEXT PRIMARY KEY,
  -- No user_id column
  parsed_json JSONB NOT NULL,
  ...
);
```

**Proposed:**
```sql
ALTER TABLE ai_image_cache
ADD COLUMN cached_by_user_id UUID;

-- Update policy
CREATE POLICY "Users can read their own cached images"
ON ai_image_cache FOR SELECT
TO authenticated
USING (auth.uid() = cached_by_user_id OR cached_by_user_id IS NULL);
-- NULL = legacy shared cache
```

**Benefit:** Better privacy isolation

---

### 2. Create Admin Edge Function for Budget Management

**Purpose:** Allow admins to view/edit user budgets from admin panel

**Implementation:**
```typescript
// supabase/functions/admin-manage-budgets/index.ts

serve(async (req) => {
  const supabaseClient = createClient(...);
  const { data: { user } } = await supabaseClient.auth.getUser(token);

  // Check if admin
  const { data: roleData } = await supabaseClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .single();

  if (!roleData || roleData.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: 'Forbidden' }),
      { status: 403 }
    );
  }

  // Admin operations (view all budgets, modify, etc.)
  const { userId, action, params } = await req.json();

  if (action === 'get_budget') {
    const { data } = await supabaseClient
      .from('user_ai_budget')
      .select('*')
      .eq('user_id', userId);
    return new Response(JSON.stringify(data));
  }

  if (action === 'set_budget') {
    await supabaseClient
      .from('user_ai_budget')
      .update({ budget_cents: params.budgetCents })
      .eq('user_id', userId);
    return new Response(JSON.stringify({ success: true }));
  }

  // ... other admin operations
});
```

---

### 3. Audit Log for Budget Modifications

**Purpose:** Track all changes to user budgets for compliance

**Schema:**
```sql
CREATE TABLE budget_audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  modified_by UUID NOT NULL,
  old_budget_cents INTEGER,
  new_budget_cents INTEGER,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger on user_ai_budget changes
CREATE OR REPLACE FUNCTION log_budget_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO budget_audit_log (
    user_id,
    modified_by,
    old_budget_cents,
    new_budget_cents,
    reason
  ) VALUES (
    NEW.user_id,
    current_setting('app.modified_by_user_id', true)::UUID,
    OLD.budget_cents,
    NEW.budget_cents,
    'Budget modified'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER budget_change_audit
AFTER UPDATE OF budget_cents ON user_ai_budget
FOR EACH ROW
EXECUTE FUNCTION log_budget_change();
```

---

## Summary

| Table | RLS | Correct? | Concern |
|-------|-----|----------|---------|
| user_ai_budget | ✅ | ✅ | None |
| ai_cost_log | ✅ | ✅ | None |
| ai_image_cache | ✅ | ⚠️ | Shared cache (intentional) |
| ai_trade_cache | ✅ | ✅ | None |
| user_ai_usage | ✅ | ✅ | None |
| user_roles | ✅ | ✅ | None |
| profiles | ✅ | ✅ | None (assumed) |

**Overall Assessment:** ✅ RLS policies are well-designed and secure

**Action Items:**
1. ✅ Admin bypass implemented in budgetChecker.ts
2. ⚠️ Consider user_id in image cache for privacy
3. ⚠️ Create admin edge function for budget management
4. ⚠️ Add audit logging for compliance

---

**Document Version:** 1.0
**Last Updated:** 2025-01-09
**Maintained By:** Development Team
