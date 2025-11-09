/**
 * Integration tests for budget system
 * Run with: deno test --allow-net --allow-env
 */

import { assertEquals, assertExists, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'http://localhost:54321';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const ADMIN_JWT = Deno.env.get('TEST_ADMIN_JWT') || '';
const USER_JWT = Deno.env.get('TEST_USER_JWT') || '';

// Test user IDs (create these in your test database)
const ADMIN_USER_ID = 'admin-test-user-id';
const REGULAR_USER_ID = 'regular-test-user-id';

let supabase: SupabaseClient;

// Setup
Deno.test("Setup: Initialize Supabase client", () => {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  assertExists(supabase);
});

// Test 1: Admin never blocked
Deno.test("Admin with 0 balance should NOT be blocked", async () => {
  // Set admin budget to exhausted
  await supabase.from('user_ai_budget').upsert({
    user_id: ADMIN_USER_ID,
    plan: 'starter',
    month_start: new Date().toISOString().slice(0, 7) + '-01',
    spend_cents: 80,
    budget_cents: 75 // 106% used
  });

  // Ensure admin role exists
  await supabase.from('user_roles').upsert({
    user_id: ADMIN_USER_ID,
    role: 'admin'
  });

  // Call extract-trade-info endpoint as admin
  const response = await fetch(`${SUPABASE_URL}/functions/v1/extract-trade-info`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ADMIN_JWT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAUA...',
      broker: 'Test Broker'
    })
  });

  // Should NOT be blocked (not 402)
  assert(response.status !== 402, `Admin was blocked! Status: ${response.status}`);
});

// Test 2: Regular user blocked at 100%
Deno.test("Regular user with 0 balance should be blocked", async () => {
  // Set regular user budget to exhausted
  await supabase.from('user_ai_budget').upsert({
    user_id: REGULAR_USER_ID,
    plan: 'starter',
    month_start: new Date().toISOString().slice(0, 7) + '-01',
    spend_cents: 80,
    budget_cents: 75 // 106% used
  });

  // Make sure user is NOT admin
  await supabase.from('user_roles').delete().eq('user_id', REGULAR_USER_ID);

  // Call extract-trade-info endpoint as regular user
  const response = await fetch(`${SUPABASE_URL}/functions/v1/extract-trade-info`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${USER_JWT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAUA...',
      broker: 'Test Broker'
    })
  });

  // Should be blocked (402 Payment Required)
  assertEquals(response.status, 402, 'Regular user should be blocked with 402');

  const body = await response.json();
  assert(body.error.toLowerCase().includes('budget'), 'Error should mention budget');
});

// Test 3: Credits debit once per successful extraction
Deno.test("Credits should debit once per successful extraction", async () => {
  // Reset user budget
  const monthStart = new Date().toISOString().slice(0, 7) + '-01';
  await supabase.from('user_ai_budget').upsert({
    user_id: REGULAR_USER_ID,
    plan: 'starter',
    month_start: monthStart,
    spend_cents: 0,
    budget_cents: 75
  });

  // Get initial spend
  const { data: before } = await supabase
    .from('user_ai_budget')
    .select('spend_cents')
    .eq('user_id', REGULAR_USER_ID)
    .eq('month_start', monthStart)
    .single();

  const spendBefore = before?.spend_cents || 0;

  // Make request (mock successful extraction)
  // In real test, this would actually process an image
  // For now, we'll directly call logCost with idempotency

  const { checkBudget, logCost } = await import('../_shared/budgetChecker.ts');

  const testImageHash = 'test-hash-' + Date.now();
  await logCost(
    supabase,
    REGULAR_USER_ID,
    'extract-trade-info',
    'lite',
    'test-model',
    100,
    50,
    1, // 1 cent cost
    1000,
    { imageHash: testImageHash }
  );

  // Get spend after first call
  const { data: after1 } = await supabase
    .from('user_ai_budget')
    .select('spend_cents')
    .eq('user_id', REGULAR_USER_ID)
    .eq('month_start', monthStart)
    .single();

  const spendAfter1 = after1?.spend_cents || 0;
  assertEquals(spendAfter1, spendBefore + 1, 'Spend should increase by 1 cent');

  // Make same request again (idempotent retry)
  const result2 = await logCost(
    supabase,
    REGULAR_USER_ID,
    'extract-trade-info',
    'lite',
    'test-model',
    100,
    50,
    1,
    1000,
    { imageHash: testImageHash }
  );

  // Should detect duplicate
  assertEquals(result2.alreadyExists, true, 'Should detect idempotent retry');

  // Get spend after retry
  const { data: after2 } = await supabase
    .from('user_ai_budget')
    .select('spend_cents')
    .eq('user_id', REGULAR_USER_ID)
    .eq('month_start', monthStart)
    .single();

  const spendAfter2 = after2?.spend_cents || 0;
  assertEquals(spendAfter2, spendAfter1, 'Spend should NOT increase on retry');
});

// Test 4: Cache hits return 0 cost
Deno.test("Cache hits should return 0 cost", async () => {
  const monthStart = new Date().toISOString().slice(0, 7) + '-01';

  // Get initial spend
  const { data: before } = await supabase
    .from('user_ai_budget')
    .select('spend_cents')
    .eq('user_id', REGULAR_USER_ID)
    .eq('month_start', monthStart)
    .single();

  const spendBefore = before?.spend_cents || 0;

  const { logCost } = await import('../_shared/budgetChecker.ts');

  // Log cache hit (0 cost)
  await logCost(
    supabase,
    REGULAR_USER_ID,
    'extract-trade-info',
    'cached',
    'cached',
    0,
    0,
    0, // 0 cost
    500,
    { cacheHit: true }
  );

  // Get spend after cache hit
  const { data: after } = await supabase
    .from('user_ai_budget')
    .select('spend_cents')
    .eq('user_id', REGULAR_USER_ID)
    .eq('month_start', monthStart)
    .single();

  const spendAfter = after?.spend_cents || 0;
  assertEquals(spendAfter, spendBefore, 'Spend should NOT increase for cache hit');
});

// Test 5: Upload tests
Deno.test("Upload: reject oversize images", async () => {
  // Create 25MB file (over 20MB limit)
  const largeFile = new Uint8Array(25 * 1024 * 1024);
  const base64 = btoa(String.fromCharCode(...largeFile));

  const response = await fetch(`${SUPABASE_URL}/functions/v1/extract-trade-info`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${USER_JWT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      imageBase64: base64,
      broker: 'Test'
    })
  });

  assertEquals(response.status, 400, 'Should reject oversize image with 400');
});

// Test 6: Audit log created on budget change
Deno.test("Audit log should record budget changes", async () => {
  // Update budget via admin endpoint
  const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-manage-budgets`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ADMIN_JWT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'update_budget',
      params: {
        userId: REGULAR_USER_ID,
        budgetCents: 100,
        reason: 'Test budget increase'
      }
    })
  });

  assertEquals(response.status, 200, 'Budget update should succeed');

  // Check audit log
  const { data: audits } = await supabase
    .from('budget_audit_log')
    .select('*')
    .eq('user_id', REGULAR_USER_ID)
    .eq('new_budget_cents', 100)
    .order('created_at', { ascending: false })
    .limit(1);

  assertExists(audits, 'Audit log should exist');
  assertEquals(audits.length, 1, 'Should have 1 audit entry');
  assertEquals(audits[0].action, 'admin_override', 'Action should be admin_override');
  assert(audits[0].reason.includes('Test budget increase'), 'Reason should be logged');
});

// Cleanup
Deno.test("Cleanup: Remove test data", async () => {
  // Clean up test users' data
  await supabase.from('user_ai_budget').delete().eq('user_id', ADMIN_USER_ID);
  await supabase.from('user_ai_budget').delete().eq('user_id', REGULAR_USER_ID);
  await supabase.from('ai_cost_log').delete().eq('user_id', ADMIN_USER_ID);
  await supabase.from('ai_cost_log').delete().eq('user_id', REGULAR_USER_ID);
  await supabase.from('budget_audit_log').delete().eq('user_id', ADMIN_USER_ID);
  await supabase.from('budget_audit_log').delete().eq('user_id', REGULAR_USER_ID);

  console.log('✅ Test cleanup complete');
});
