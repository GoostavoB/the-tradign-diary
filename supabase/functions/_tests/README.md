# Edge Function Tests

## Setup

### 1. Create Test Users

Run this SQL in your Supabase dashboard or via `psql`:

```sql
-- Create test admin user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'admin-test-user-id',
  'admin@test.com',
  '$2a$10$placeholder', -- Use actual hash or create via Supabase Auth
  NOW(),
  NOW(),
  NOW()
);

-- Create test regular user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'regular-test-user-id',
  'user@test.com',
  '$2a$10$placeholder',
  NOW(),
  NOW(),
  NOW()
);

-- Add admin role
INSERT INTO user_roles (user_id, role)
VALUES ('admin-test-user-id', 'admin');

-- Create profiles
INSERT INTO profiles (id, email, full_name)
VALUES
  ('admin-test-user-id', 'admin@test.com', 'Test Admin'),
  ('regular-test-user-id', 'user@test.com', 'Test User');
```

### 2. Get Test JWTs

Option A: Via Supabase Dashboard
1. Go to Authentication → Users
2. Click on test user
3. Copy JWT from "User UID" section

Option B: Via API
```bash
# Login as admin
ADMIN_JWT=$(curl -X POST https://your-supabase-url.supabase.co/auth/v1/token \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"your-password"}' \
  | jq -r '.access_token')

# Login as regular user
USER_JWT=$(curl -X POST https://your-supabase-url.supabase.co/auth/v1/token \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"your-password"}' \
  | jq -r '.access_token')
```

### 3. Set Environment Variables

Create `.env.test` file:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
TEST_ADMIN_JWT=eyJhbGciOiJIUzI1...
TEST_USER_JWT=eyJhbGciOiJIUzI1...
```

Load variables:
```bash
export $(cat .env.test | xargs)
```

---

## Running Tests

### All Tests
```bash
deno test --allow-net --allow-env supabase/functions/_tests/budget.test.ts
```

### Specific Test
```bash
deno test --allow-net --allow-env --filter "Admin with 0 balance" supabase/functions/_tests/budget.test.ts
```

### With Watch Mode
```bash
deno test --allow-net --allow-env --watch supabase/functions/_tests/budget.test.ts
```

### With Coverage
```bash
deno test --allow-net --allow-env --coverage=coverage supabase/functions/_tests/budget.test.ts
deno coverage coverage
```

---

## Test Scenarios

### 1. Admin Bypass
- ✅ Admin with 0 balance should NOT be blocked
- ✅ Admin budget check returns `isAdmin: true`

### 2. Regular User Budget Enforcement
- ✅ Regular user with 0 balance should be blocked (402)
- ✅ Regular user at 85% uses lite model

### 3. Idempotency
- ✅ Credits debit once per successful extraction
- ✅ Retry with same imageHash doesn't double charge

### 4. Cache Hits
- ✅ Cache hits return 0 cost
- ✅ Spend doesn't increase on cache hit

### 5. Upload Validation
- ✅ Reject oversize images (>20MB)
- ✅ Reject wrong MIME types
- ✅ Allow re-upload with new key

### 6. Audit Trail
- ✅ Audit log created on budget change
- ✅ Audit includes admin user ID and reason

---

## Expected Results

```
test Setup: Initialize Supabase client ... ok (5ms)
test Admin with 0 balance should NOT be blocked ... ok (1234ms)
test Regular user with 0 balance should be blocked ... ok (987ms)
test Credits should debit once per successful extraction ... ok (654ms)
test Cache hits should return 0 cost ... ok (321ms)
test Upload: reject oversize images ... ok (456ms)
test Audit log should record budget changes ... ok (789ms)
test Cleanup: Remove test data ... ok (234ms)

test result: ok. 8 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out (4s)
```

---

## Troubleshooting

### Test Fails: "Unauthorized"
- Check JWT tokens are valid and not expired
- Ensure test users exist in auth.users
- Verify anon key is correct

### Test Fails: "Forbidden: Admin access required"
- Ensure admin user has role in user_roles table
- Check RLS policies are enabled

### Test Fails: "No such table: user_ai_budget"
- Run migrations: `supabase db push`
- Verify migration `20250109000001_add_idempotency_and_audit.sql` applied

### Test Hangs
- Check Supabase is running: `supabase status`
- Verify `SUPABASE_URL` is correct
- Check network connectivity

---

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x

      - name: Run tests
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          TEST_ADMIN_JWT: ${{ secrets.TEST_ADMIN_JWT }}
          TEST_USER_JWT: ${{ secrets.TEST_USER_JWT }}
        run: |
          deno test --allow-net --allow-env supabase/functions/_tests/budget.test.ts
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
test:
  image: denoland/deno:latest
  script:
    - deno test --allow-net --allow-env supabase/functions/_tests/budget.test.ts
  variables:
    SUPABASE_URL: $SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY: $SUPABASE_SERVICE_ROLE_KEY
    TEST_ADMIN_JWT: $TEST_ADMIN_JWT
    TEST_USER_JWT: $TEST_USER_JWT
```

---

## Manual Testing Checklist

- [ ] Admin user can extract trades with 0 balance
- [ ] Regular user blocked at 100% budget
- [ ] Regular user uses lite model at 85% budget
- [ ] Duplicate requests don't double charge
- [ ] Cache hits cost 0 cents
- [ ] Oversize images rejected
- [ ] Audit log shows all budget changes
- [ ] Admin can view/modify user budgets
- [ ] Virus scan logs to upload_audit_log

---

## Performance Benchmarks

Target response times:

- Budget check: < 50ms
- Rate limit check: < 30ms
- Cost logging: < 100ms
- Admin get budget: < 200ms
- Admin update budget: < 300ms

Run benchmarks:
```bash
deno bench --allow-net --allow-env supabase/functions/_tests/budget.bench.ts
```

---

## Load Testing

Use `wrk` or `ab` for load testing:

```bash
# Test 100 concurrent requests
ab -n 1000 -c 100 \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -p test-payload.json \
  https://your-supabase-url.supabase.co/functions/v1/extract-trade-info
```

Expected:
- Throughput: > 100 req/sec
- P99 latency: < 5s
- Error rate: < 1%

---

**Last Updated:** 2025-01-09
