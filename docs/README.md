# Documentation - Credit System and Upload Flow

## 📚 Overview

This directory contains comprehensive documentation for The Trading Diary's credit/budget system and image upload extraction flow. The documentation was created as part of a deep-dive analysis to map every component, decision point, and data flow in the system.

---

## 📁 Documents

### 1. [CREDITS_AND_UPLOADS.md](./CREDITS_AND_UPLOADS.md)
**Main technical documentation**

Contains:
- Complete credit system architecture
- Data flow diagrams (Mermaid)
- Database schema documentation
- Environment variables and defaults
- Edge cases and error handling
- Critical issues identified (including admin bypass bug)

**Start here for:** Understanding how credits work, database tables, and system architecture

---

### 2. [SIMULATION_EXAMPLES.md](./SIMULATION_EXAMPLES.md)
**Execution path examples**

Contains:
- Step-by-step execution paths for admin vs non-admin requests
- Expected log output for each scenario
- Testing commands (cURL and automated scripts)
- Comparison tables
- Monitoring guide

**Start here for:** Testing the system, debugging issues, or understanding request flow

---

### 3. [RLS_POLICIES_ANALYSIS.md](./RLS_POLICIES_ANALYSIS.md)
**Row Level Security analysis**

Contains:
- RLS policy documentation for all tables
- Security model explanation
- How edge functions bypass RLS
- Potential vulnerabilities and mitigations
- RLS testing examples
- Recommendations for improvements

**Start here for:** Security audit, understanding database permissions, or RLS troubleshooting

---

## 🔥 Critical Findings

### Issue #1: Admin Bypass Missing (FIXED ✅)

**Problem:** Admins were being blocked when budget reached 100%, same as regular users.

**Fix:** Modified `supabase/functions/_shared/budgetChecker.ts` to check user role first and bypass budget checks for admins.

**Files Changed:**
- `supabase/functions/_shared/budgetChecker.ts` - Added admin role check
- `supabase/functions/extract-trade-info/index.ts` - Pass email to checkBudget
- `supabase/functions/ai-trade-analysis/index.ts` - Pass email to checkBudget

**Verification:**
```bash
# Test admin with exhausted budget
curl -X POST .../functions/v1/extract-trade-info \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -d '{"imageBase64":"...","broker":"Binance"}'
# Expected: 200 OK (not 402)
```

---

## 📊 Key Metrics

**Database Tables Documented:** 7
- user_ai_budget
- ai_cost_log
- ai_image_cache
- ai_trade_cache
- user_ai_usage
- user_roles
- profiles

**Edge Functions Analyzed:** 2
- extract-trade-info
- ai-trade-analysis

**RLS Policies Reviewed:** 15+

**Environment Variables:** 4
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- LOVABLE_API_KEY
- VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY

---

## 🚀 Quick Start

### For Developers

1. **Read the main docs first:**
   ```bash
   open docs/CREDITS_AND_UPLOADS.md
   ```

2. **Understand request flow:**
   ```bash
   open docs/SIMULATION_EXAMPLES.md
   ```

3. **Review RLS security:**
   ```bash
   open docs/RLS_POLICIES_ANALYSIS.md
   ```

### For Testing

1. **Set up test users:**
   ```sql
   -- See SIMULATION_EXAMPLES.md for setup scripts
   ```

2. **Run simulations:**
   ```bash
   # Admin test
   npm run test:admin-bypass

   # Regular user test
   npm run test:budget-block
   ```

3. **Monitor logs:**
   ```bash
   supabase functions logs extract-trade-info --filter "budget_check"
   ```

---

## 🛠️ Code Changes

### Added Features

1. **Structured Logging**
   - Budget checks now log: userId, email, isAdmin, decision, reason
   - Cost deductions now log: debitAmount, tokens, latency, success

2. **Admin Bypass**
   - Admins never blocked (unlimited budget)
   - Budget check returns `{ isAdmin: true, allowed: true }`

3. **Enhanced Error Messages**
   - Clear indication when admin vs regular user
   - Detailed reason codes for debugging

### Modified Files

```
supabase/functions/_shared/budgetChecker.ts (+170 lines)
├── Added logBudgetCheck() function
├── Added logCostDeduction() function
├── Added admin role check
└── Added structured logging

supabase/functions/extract-trade-info/index.ts (+1 line)
└── Pass user.email to checkBudget()

supabase/functions/ai-trade-analysis/index.ts (+1 line)
└── Pass user.email to checkBudget()
```

### ESLint Fixes (Bonus)

Fixed TypeScript linting errors in several files:
- `src/components/leverage-stop/index.ts` - Changed `any` to `Record<string, unknown>`
- `src/hooks/useBadgeNotifications.ts` - Added `LucideIcon` type
- `src/hooks/useCustomWidgets.ts` - Created `CustomWidget` interface
- `src/hooks/useDailyChallenges.ts` - Added `LucideIcon` type
- `src/utils/portfolioPerformance.ts` - Changed `let` to `const`

---

## 📝 Log Output Examples

### Admin Request (Successful)
```json
{
  "type": "budget_check",
  "timestamp": "2025-01-09T12:34:56.789Z",
  "userId": "abc-123",
  "emailNormalized": "admin@test.com",
  "isAdmin": true,
  "availableCreditsBefore": 999999,
  "decision": "allow",
  "reason": "admin_bypass"
}
```

### Regular User (Blocked)
```json
{
  "type": "budget_check",
  "timestamp": "2025-01-09T12:36:10.123Z",
  "userId": "def-456",
  "emailNormalized": "user@test.com",
  "isAdmin": false,
  "availableCreditsBefore": -5,
  "decision": "block",
  "reason": "budget_exhausted_100_percent"
}
```

### Cost Deduction
```json
{
  "type": "cost_deduction",
  "timestamp": "2025-01-09T12:35:02.456Z",
  "userId": "abc-123",
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

## ⚠️ Important Notes

### DO NOT Ship to Production Without

1. ✅ Testing admin bypass with real admin account
2. ✅ Verifying regular users are still blocked at 100%
3. ✅ Checking logs are appearing correctly
4. ⚠️ Running integration tests (see SIMULATION_EXAMPLES.md)
5. ⚠️ Load testing with high concurrent requests
6. ⚠️ Backup database before migration

### Known Limitations

1. **No Virus Scanning** - Uploaded images are not scanned for malware
2. **No Idempotency** - Duplicate requests may debit credits twice
3. **Shared Image Cache** - All users can see all cached image results
4. **No Audit Log** - Budget modifications not tracked

See CREDITS_AND_UPLOADS.md section 7 for detailed recommendations.

---

## 🧪 Testing Checklist

- [ ] Admin with 0 balance can extract trades
- [ ] Regular user with 0 balance gets 402 error
- [ ] Regular user at 85% uses lite model
- [ ] Cache hits return 0 cost
- [ ] Rate limits enforced (10/hour, 5/min)
- [ ] Structured logs appear in console
- [ ] Cost deductions update user_ai_budget
- [ ] RLS policies prevent unauthorized access

---

## 📞 Support

**Questions?** Contact the development team or open an issue in the repository.

**Found a bug?** Create a bug report with:
- Log output (from Supabase functions logs)
- Request details (userId, endpoint, timestamp)
- Expected vs actual behavior

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-09 | Initial documentation and admin bypass fix |

---

**Maintained By:** Development Team
**Last Updated:** 2025-01-09
**Branch:** `docs/trace-credits-uploads`
