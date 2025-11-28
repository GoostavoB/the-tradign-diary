# Simulation Examples: Admin vs Non-Admin Requests

## Prerequisites

To run these simulations, you need:
1. Two test users:
   - Admin user: `admin@test.com` with role `admin` in `user_roles` table
   - Regular user: `user@test.com` with no admin role
2. Both users with `spend_cents = 80` and `budget_cents = 75` (106.67% used)

## Setup Test Data

```sql
-- Create admin user role
INSERT INTO user_roles (user_id, role)
VALUES ('abc-123-admin-user-id', 'admin');

-- Set budget for both users (exhausted)
INSERT INTO user_ai_budget (user_id, plan, month_start, spend_cents, budget_cents)
VALUES
  ('abc-123-admin-user-id', 'starter', '2025-01-01', 80, 75),
  ('def-456-regular-user-id', 'starter', '2025-01-01', 80, 75)
ON CONFLICT (user_id)
DO UPDATE SET
  spend_cents = 80,
  budget_cents = 75,
  blocked_at_100_percent = true;
```

---

## Simulation 1: Admin Request with Zero Balance

### Expected Behavior
- Admin should **NEVER** be blocked
- Budget check should return `{ allowed: true, blocked: false, isAdmin: true }`
- Request should proceed to AI processing

### Execution Path

```
1. POST https://your-supabase-url.supabase.co/functions/v1/extract-trade-info
   Headers:
     Authorization: Bearer <admin-jwt-token>
   Body:
     {
       "imageBase64": "data:image/png;base64,iVBORw0KG...",
       "broker": "Binance"
     }

2. Edge Function: extract-trade-info
   ↓
3. Auth Check
   → supabaseClient.auth.getUser(token)
   → Returns: { id: "abc-123-admin-user-id", email: "admin@test.com" }
   ✅ Authorized

4. Rate Limit Check
   → checkRateLimit(supabase, "abc-123-admin-user-id", "extract-trade-info")
   → SELECT COUNT(*) FROM ai_cost_log WHERE user_id = ? AND created_at >= ?
   → Returns: { allowed: true } (2/10 this hour)
   ✅ Rate limit OK

5. Budget Check (CRITICAL POINT)
   → checkBudget(supabase, "abc-123-admin-user-id", "admin@test.com")

   Step 5a: Check if admin
   → SELECT role FROM user_roles WHERE user_id = ? AND role = 'admin'
   → Returns: { role: "admin" }
   → isAdmin = true

   Step 5b: Admin bypass logic
   → ✅ RETURNS:
     {
       "allowed": true,
       "forceLite": false,
       "blocked": false,
       "spendCents": 0,
       "budgetCents": 999999,
       "percentUsed": 0,
       "isAdmin": true,
       "message": "Admin access - unlimited budget"
     }

6. Structured Log Output:
   {
     "type": "budget_check",
     "timestamp": "2025-01-09T12:34:56.789Z",
     "userId": "abc-123-admin-user-id",
     "emailNormalized": "admin@test.com",
     "isAdmin": true,
     "availableCreditsBefore": 999999,
     "decision": "allow",
     "reason": "admin_bypass"
   }

7. Request Continues
   → Route selection: deep (admin not forced to lite)
   → AI API call succeeds
   → Cost logged (but not deducted from admin budget)
   → ✅ Returns: { trades: [...], cached: false }

8. Final Response
   Status: 200 OK
   Body: {
     "trades": [
       {
         "symbol": "BTCUSDT",
         "side": "long",
         "entry_price": 42000,
         ...
       }
     ],
     "cached": false
   }
```

### Log Lines (Console Output)

```json
{
  "type": "budget_check",
  "timestamp": "2025-01-09T12:34:56.789Z",
  "userId": "abc-123-admin-user-id",
  "emailNormalized": "admin@test.com",
  "isAdmin": true,
  "availableCreditsBefore": 999999,
  "decision": "allow",
  "reason": "admin_bypass"
}

{
  "type": "cost_deduction",
  "timestamp": "2025-01-09T12:35:02.456Z",
  "userId": "abc-123-admin-user-id",
  "endpoint": "extract-trade-info",
  "route": "deep",
  "modelId": "google/gemini-2.5-flash",
  "debitAmount": 12,
  "tokensIn": 1500,
  "tokensOut": 400,
  "latencyMs": 3200,
  "cacheHit": false,
  "success": true
}
```

---

## Simulation 2: Non-Admin with Zero Balance

### Expected Behavior
- Regular user should be **BLOCKED**
- Budget check should return `{ allowed: false, blocked: true }`
- Request should return HTTP 402 Payment Required

### Execution Path

```
1. POST https://your-supabase-url.supabase.co/functions/v1/extract-trade-info
   Headers:
     Authorization: Bearer <user-jwt-token>
   Body:
     {
       "imageBase64": "data:image/png;base64,iVBORw0KG...",
       "broker": "Binance"
     }

2. Edge Function: extract-trade-info
   ↓
3. Auth Check
   → supabaseClient.auth.getUser(token)
   → Returns: { id: "def-456-regular-user-id", email: "user@test.com" }
   ✅ Authorized

4. Rate Limit Check
   → checkRateLimit(supabase, "def-456-regular-user-id", "extract-trade-info")
   → SELECT COUNT(*) FROM ai_cost_log WHERE user_id = ? AND created_at >= ?
   → Returns: { allowed: true } (3/10 this hour)
   ✅ Rate limit OK

5. Budget Check (CRITICAL POINT)
   → checkBudget(supabase, "def-456-regular-user-id", "user@test.com")

   Step 5a: Check if admin
   → SELECT role FROM user_roles WHERE user_id = ? AND role = 'admin'
   → Returns: null (no admin role)
   → isAdmin = false

   Step 5b: Regular user budget check
   → SELECT * FROM user_ai_budget WHERE user_id = ? AND month_start = '2025-01-01'
   → Returns: { spend_cents: 80, budget_cents: 75 }
   → percentUsed = (80 / 75) * 100 = 106.67%

   Step 5c: Block at 100%
   → ❌ RETURNS:
     {
       "allowed": false,
       "forceLite": true,
       "blocked": true,
       "spendCents": 80,
       "budgetCents": 75,
       "percentUsed": 106.67,
       "isAdmin": false,
       "message": "Monthly AI budget exhausted. Upgrade your plan to continue using AI features."
     }

6. Structured Log Output:
   {
     "type": "budget_check",
     "timestamp": "2025-01-09T12:36:10.123Z",
     "userId": "def-456-regular-user-id",
     "emailNormalized": "user@test.com",
     "isAdmin": false,
     "availableCreditsBefore": -5,
     "decision": "block",
     "reason": "budget_exhausted_100_percent"
   }

7. Request Blocked
   → ❌ Edge function returns early (does NOT call AI)

8. Final Response
   Status: 402 Payment Required
   Body: {
     "error": "Monthly AI budget exhausted. Upgrade your plan to continue using AI features."
   }
```

### Log Lines (Console Output)

```json
{
  "type": "budget_check",
  "timestamp": "2025-01-09T12:36:10.123Z",
  "userId": "def-456-regular-user-id",
  "emailNormalized": "user@test.com",
  "isAdmin": false,
  "availableCreditsBefore": -5,
  "decision": "block",
  "reason": "budget_exhausted_100_percent"
}
```

**Note:** No `cost_deduction` log because the AI was never called.

---

## Simulation 3: Non-Admin at 85% Budget (Force Lite)

### Expected Behavior
- Request allowed but forced to use lite model
- Budget check should return `{ allowed: true, forceLite: true, blocked: false }`
- Uses `google/gemini-2.5-flash-lite` instead of deep model

### Setup
```sql
UPDATE user_ai_budget
SET spend_cents = 64, budget_cents = 75
WHERE user_id = 'def-456-regular-user-id';
-- percentUsed = (64/75)*100 = 85.33%
```

### Execution Path

```
1-4. [Same as Simulation 2]

5. Budget Check
   → checkBudget(supabase, "def-456-regular-user-id", "user@test.com")
   → percentUsed = 85.33% (≥ 80%, < 100%)
   → ✅ RETURNS:
     {
       "allowed": true,
       "forceLite": true,
       "blocked": false,
       "spendCents": 64,
       "budgetCents": 75,
       "percentUsed": 85.33,
       "isAdmin": false,
       "message": "Approaching budget limit. Using cost-efficient models."
     }

6. Structured Log:
   {
     "type": "budget_check",
     "timestamp": "2025-01-09T12:37:15.456Z",
     "userId": "def-456-regular-user-id",
     "emailNormalized": "user@test.com",
     "isAdmin": false,
     "availableCreditsBefore": 11,
     "decision": "force_lite",
     "reason": "budget_warning_80_percent"
   }

7. Route Selection
   → selectRoute(complexity, forceLite=true)
   → Always returns ROUTES.lite
   → Model: google/gemini-2.5-flash-lite
   → maxTokens: 500

8. AI API Call
   → POST to Lovable gateway with lite model
   → Lower cost (e.g., 3 cents vs 12 cents)

9. Cost Logged
   {
     "type": "cost_deduction",
     "timestamp": "2025-01-09T12:37:18.789Z",
     "userId": "def-456-regular-user-id",
     "endpoint": "extract-trade-info",
     "route": "lite",
     "modelId": "google/gemini-2.5-flash-lite",
     "debitAmount": 3,
     "tokensIn": 800,
     "tokensOut": 250,
     "latencyMs": 1800,
     "cacheHit": false,
     "success": true
   }

10. Final Response
    Status: 200 OK
    Body: {
      "trades": [...],
      "cached": false
    }
```

---

## Comparison Table

| Scenario | User Type | Budget Used | Admin Bypass | Decision | HTTP Status | AI Called | Cost Deducted |
|----------|-----------|-------------|--------------|----------|-------------|-----------|---------------|
| Sim 1    | Admin     | 106.67%     | ✅ Yes       | Allow    | 200 OK      | ✅ Yes    | ❌ No (admin) |
| Sim 2    | Regular   | 106.67%     | ❌ No        | Block    | 402         | ❌ No     | ❌ No         |
| Sim 3    | Regular   | 85.33%      | ❌ No        | Force Lite | 200 OK    | ✅ Yes    | ✅ Yes (3¢)   |

---

## Testing Commands

### Manual Test via cURL

```bash
# 1. Get JWT token for admin
ADMIN_JWT=$(curl -X POST https://your-supabase-url.supabase.co/auth/v1/token \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin-password"}' \
  | jq -r '.access_token')

# 2. Call extract-trade-info as admin
curl -X POST https://your-supabase-url.supabase.co/functions/v1/extract-trade-info \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"imageBase64":"iVBORw0KGgoAAAANSUhEUgAAAAUA...","broker":"Binance"}'

# Expected: 200 OK (even with exhausted budget)

# 3. Get JWT token for regular user
USER_JWT=$(curl -X POST https://your-supabase-url.supabase.co/auth/v1/token \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"user-password"}' \
  | jq -r '.access_token')

# 4. Call extract-trade-info as regular user
curl -X POST https://your-supabase-url.supabase.co/functions/v1/extract-trade-info \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"imageBase64":"iVBORw0KGgoAAAANSUhEUgAAAAUA...","broker":"Binance"}'

# Expected: 402 Payment Required
```

### Automated Test Script

```typescript
// test-budget-enforcement.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function testAdminBypass() {
  // Set admin budget to exhausted
  await supabase.from('user_ai_budget').upsert({
    user_id: ADMIN_USER_ID,
    plan: 'starter',
    month_start: '2025-01-01',
    spend_cents: 80,
    budget_cents: 75
  });

  // Make request as admin
  const response = await fetch(`${SUPABASE_URL}/functions/v1/extract-trade-info`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ADMIN_JWT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ imageBase64: TEST_IMAGE, broker: 'Binance' })
  });

  console.assert(response.status === 200, 'Admin should not be blocked');
  console.log('✅ Admin bypass test passed');
}

async function testRegularUserBlock() {
  // Set regular user budget to exhausted
  await supabase.from('user_ai_budget').upsert({
    user_id: REGULAR_USER_ID,
    plan: 'starter',
    month_start: '2025-01-01',
    spend_cents: 80,
    budget_cents: 75
  });

  // Make request as regular user
  const response = await fetch(`${SUPABASE_URL}/functions/v1/extract-trade-info`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${USER_JWT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ imageBase64: TEST_IMAGE, broker: 'Binance' })
  });

  console.assert(response.status === 402, 'Regular user should be blocked');
  const body = await response.json();
  console.assert(body.error.includes('budget exhausted'), 'Error message should mention budget');
  console.log('✅ Regular user block test passed');
}

// Run tests
await testAdminBypass();
await testRegularUserBlock();
```

---

## Monitoring Logs in Production

### View Budget Check Logs
```bash
# Supabase Dashboard → Edge Functions → extract-trade-info → Logs
# Filter by: "budget_check"

# Or via CLI
supabase functions logs extract-trade-info --filter "budget_check"
```

### Expected Log Patterns

**Admin request (successful):**
```
{"type":"budget_check","timestamp":"2025-01-09T12:34:56.789Z","userId":"abc-123","emailNormalized":"admin@test.com","isAdmin":true,"availableCreditsBefore":999999,"decision":"allow","reason":"admin_bypass"}
{"type":"cost_deduction","timestamp":"2025-01-09T12:35:02.456Z","userId":"abc-123","endpoint":"extract-trade-info","route":"deep","modelId":"google/gemini-2.5-flash","debitAmount":12,"tokensIn":1500,"tokensOut":400,"latencyMs":3200,"cacheHit":false,"success":true}
```

**Regular user (blocked):**
```
{"type":"budget_check","timestamp":"2025-01-09T12:36:10.123Z","userId":"def-456","emailNormalized":"user@test.com","isAdmin":false,"availableCreditsBefore":-5,"decision":"block","reason":"budget_exhausted_100_percent"}
```

---

## Rollback Plan

If the admin bypass causes issues:

1. **Quick Fix:** Set admin budget to high value
```sql
UPDATE user_ai_budget
SET budget_cents = 9999900, spend_cents = 0
WHERE user_id IN (SELECT user_id FROM user_roles WHERE role = 'admin');
```

2. **Revert Code:** Checkout previous commit
```bash
git checkout main
git revert docs/trace-credits-uploads
```

3. **Monitor:** Check logs for any budget-related errors
```bash
supabase functions logs --filter "budget_check" --since "1 hour ago"
```

---

**Document Version:** 1.0
**Last Updated:** 2025-01-09
**Maintained By:** Development Team
