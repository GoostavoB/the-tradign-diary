# XP Tier Monetization System - Phase 1 Tracker

**Start Date:** TBD  
**Target Completion:** TBD (4 weeks)  
**Status:** 🟡 Planned  
**Priority:** 🔴 Critical (Revenue-generating)

---

## 📊 Overall Progress

- [ ] Week 1: Database & Tier Logic (0/7 tasks)
- [ ] Week 2: Locked Widget UI + Emotion Tagging (0/4 tasks)
- [ ] Week 3: Daily Mission Bar + XP Cap Enforcement (0/4 tasks)
- [ ] Week 4: Upload Credits + Tier 3 Preview (0/4 tasks)
- [ ] Analytics Integration (1/8 tasks) ✅ PostHog SDK installed

**Overall Completion:** 1/27 tasks (4%)

---

## 🗓️ Week 1: Database & Tier Logic

### Database Migrations

- [ ] **Migration 1: `user_xp_tiers` table**
  - [ ] Create table with columns: `id`, `user_id`, `current_tier`, `xp_to_next_tier`, `daily_xp_earned`, `daily_xp_cap`, `last_reset_at`, `created_at`, `updated_at`
  - [ ] Add RLS policies (users can view/update own tier)
  - [ ] Add indexes on `user_id`, `current_tier`
  - [ ] Status: Not started

- [ ] **Migration 2: Enhance `subscriptions` table**
  - [ ] Add `daily_xp_cap` column (numeric, default 750)
  - [ ] Add `daily_upload_limit` column (integer, default 1)
  - [ ] Backfill existing records with tier-appropriate values
  - [ ] Status: Not started

- [ ] **Migration 3: `trade_emotions` junction table**
  - [ ] Create table with columns: `id`, `trade_id`, `emotion`, `created_at`
  - [ ] Add foreign key to `trades` table
  - [ ] Add RLS policies (users can CRUD own trade emotions)
  - [ ] Add index on `trade_id`
  - [ ] Status: Not started

- [ ] **Migration 4: `tier_preview_unlocks` table**
  - [ ] Create table with columns: `id`, `user_id`, `tier_previewed`, `previewed_at`, `converted_at`, `created_at`
  - [ ] Add RLS policies (users can view own previews)
  - [ ] Add unique constraint on `user_id`, `tier_previewed`
  - [ ] Status: Not started

- [ ] **Migration 5: Daily reset function**
  - [ ] Create `reset_daily_xp_limits()` function
  - [ ] Reset `daily_xp_earned` to 0 for all users at midnight UTC
  - [ ] Update `last_reset_at` timestamp
  - [ ] Schedule with pg_cron or edge function
  - [ ] Status: Not started

### Backend Logic

- [ ] **Task: Tier calculation engine (`xpEngine.ts`)**
  - [ ] Add `calculateTier(totalXP: number)` function
  - [ ] Add tier thresholds: [0, 1000, 4000, 10000, 25000]
  - [ ] Add `getTierName(tier: number)` function
  - [ ] Add `getXPToNextTier(currentXP: number)` function
  - [ ] Add `getDailyXPCap(tier: number)` function
  - [ ] Add `getDailyUploadLimit(tier: number)` function
  - [ ] Add unit tests
  - [ ] Status: Not started

- [ ] **Task: `useXPTier` hook**
  - [ ] Fetch `user_xp_tiers` data
  - [ ] Calculate current tier from total XP
  - [ ] Return: `tier`, `tierName`, `xpToNextTier`, `dailyXPEarned`, `dailyXPCap`, `canEarnXP`, `uploadCreditsRemaining`
  - [ ] Add loading state
  - [ ] Add refresh function
  - [ ] Status: Not started

---

## 🗓️ Week 2: Locked Widget UI + Emotion Tagging

### UI Components

- [ ] **Component: `LockedWidgetOverlay`**
  - [ ] Accept props: `requiredTier`, `userTier`, `widgetName`
  - [ ] Show blurred content with lock icon
  - [ ] Display "Unlock at Tier X" message
  - [ ] Add "Upgrade Now" button → triggers `UpgradePrompt`
  - [ ] Add hover effect with pulse animation
  - [ ] Track click: `analytics.trackWidgetLocked(widgetName, requiredTier)`
  - [ ] Status: Not started

- [ ] **Task: Assign `tier_required` to widgets**
  - [ ] Update `custom_dashboard_widgets` table schema (add `tier_required` column)
  - [ ] Assign tier requirements to 18 widgets:
    - Tier 0 (Free): Win Rate, Total Trades, Recent Trades List (3 widgets)
    - Tier 1 (1K XP): Profit/Loss Chart, Streak Tracker (2 widgets)
    - Tier 2 (4K XP): Emotion Analysis, Risk/Reward Heatmap, Tag Performance (3 widgets)
    - Tier 3 (10K XP): AI Trade Insights, Advanced Metrics Dashboard (2 widgets)
    - Tier 4 (25K XP): Custom SQL Queries, Predictive Analytics, Multi-Account View (3 widgets)
    - Elite Only: 5 additional premium widgets
  - [ ] Status: Not started

### Emotion Tagging

- [ ] **Update: `ManualTradeForm` component**
  - [ ] Add emotion multi-select dropdown
  - [ ] Options: Confident, Fearful, Greedy, Disciplined, Impulsive, Patient, Anxious, Calm, FOMO, Revenge, Overconfident
  - [ ] Allow selecting 0-3 emotions per trade
  - [ ] Display selected emotions as tags
  - [ ] Status: Not started

- [ ] **Backend: Save emotions to `trade_emotions`**
  - [ ] Update trade mutation to save emotions
  - [ ] Insert multiple rows for each selected emotion
  - [ ] Delete old emotions when trade is edited
  - [ ] Status: Not started

---

## 🗓️ Week 3: Daily Mission Bar + XP Cap Enforcement

### Daily Mission Bar

- [ ] **Component: `DailyMissionBar`**
  - [ ] Fetch `dailyXPEarned` and `dailyXPCap` from `useXPTier`
  - [ ] Display horizontal progress bar (e.g., "450 / 750 XP today")
  - [ ] Color gradient: green → yellow → red as cap approaches
  - [ ] Add sparkle animation when milestones hit (25%, 50%, 75%, 100%)
  - [ ] Show "Daily cap reached!" message when capped
  - [ ] Add "Upgrade for more XP" button when capped
  - [ ] Status: Not started

- [ ] **Integration: Add to Dashboard**
  - [ ] Place `DailyMissionBar` above main dashboard widgets
  - [ ] Make it sticky on scroll (optional)
  - [ ] Ensure mobile responsiveness
  - [ ] Status: Not started

### XP Cap Enforcement

- [ ] **Update: `useXPSystem.addXP()` function**
  - [ ] Check `dailyXPEarned` before awarding XP
  - [ ] If capped, show toast: "Daily XP limit reached! Upgrade to earn more."
  - [ ] Track event: `analytics.trackDailyXPCapReached(tier)`
  - [ ] Trigger `UpgradePrompt` modal
  - [ ] Status: Not started

- [ ] **Update: `UpgradePrompt` component**
  - [ ] Add new variant for "daily cap" scenario
  - [ ] Highlight Pro/Elite daily caps in comparison table
  - [ ] Show "Continue earning XP" CTA
  - [ ] Track: `analytics.trackUpgradeModalOpened('daily_cap')`
  - [ ] Status: Not started

---

## 🗓️ Week 4: Upload Credits + Tier 3 Preview

### Upload Credits System

- [ ] **Edge Function: `check-upload-credits`**
  - [ ] Accept `user_id` as input
  - [ ] Query `user_xp_tiers` for `daily_upload_count`
  - [ ] Query `subscriptions` for `daily_upload_limit`
  - [ ] Return `{ canUpload: boolean, remaining: number, limit: number }`
  - [ ] Increment `daily_upload_count` if upload proceeds
  - [ ] Reset daily count at midnight (via daily reset function)
  - [ ] Status: Not started

- [ ] **Update: Upload flow**
  - [ ] Call `check-upload-credits` before allowing upload
  - [ ] Show paywall if limit exceeded: "You've used X/Y uploads today"
  - [ ] Display "Upgrade to upload more" prompt
  - [ ] Track: `analytics.track('upload_blocked_by_limit', { tier, limit })`
  - [ ] Status: Not started

### Tier 3 Preview Modal

- [ ] **Component: `Tier3PreviewModal`**
  - [ ] Trigger when user reaches 2000 XP (one-time only)
  - [ ] Show sneak peek of Tier 3 locked widgets
  - [ ] Animate preview cards with "coming soon" shimmer effect
  - [ ] Display: "You're halfway to Tier 3! Here's what you'll unlock..."
  - [ ] Add "Keep grinding" and "Upgrade now" CTAs
  - [ ] Track: `analytics.trackTier3PreviewOpened()`
  - [ ] Save to `tier_preview_unlocks` table to prevent re-triggering
  - [ ] Status: Not started

- [ ] **Integration: Trigger in `useXPSystem`**
  - [ ] Check if `totalXP >= 2000` after XP award
  - [ ] Check if `tier_preview_unlocks` already has entry for Tier 3
  - [ ] If not, show `Tier3PreviewModal`
  - [ ] Status: Not started

---

## 📈 Analytics Integration

- [x] **PostHog SDK installed** ✅
- [ ] **User identification on auth**
  - [ ] Call `analytics.identify(userId, { tier, totalXP, subscription })` on login
  - [ ] Status: Not started (partially done in AuthContext)

### Event Tracking (PostHog)

- [ ] `xp_awarded` - Track every XP gain
  - [ ] Properties: `amount`, `source`, `tier`, `dailyTotal`, `cappedOut`
  - [ ] Status: Partially implemented in `useXPSystem`

- [ ] `tier_unlocked` - When user reaches new tier
  - [ ] Properties: `newTier`, `tierName`, `totalXP`, `timeSinceLastTier`
  - [ ] Status: Not started

- [ ] `daily_xp_cap_reached` - When user hits daily limit
  - [ ] Properties: `tier`, `dailyCap`, `totalXPEarned`
  - [ ] Status: Not started

- [ ] `widget_locked_clicked` - When user clicks locked widget
  - [ ] Properties: `widgetName`, `requiredTier`, `userTier`, `xpGap`
  - [ ] Status: Not started

- [ ] `tier_3_preview_opened` - When 2K XP modal shows
  - [ ] Properties: `totalXP`, `currentTier`, `daysActive`
  - [ ] Status: Not started

- [ ] `upgrade_modal_opened` - When upgrade prompt shows
  - [ ] Properties: `trigger`, `tier`, `context`
  - [ ] Status: Not started

- [ ] `upgrade_completed` - When user subscribes
  - [ ] Properties: `fromTier`, `toTier`, `plan`, `amount`
  - [ ] Status: Not started

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] `xpEngine.ts` - Tier calculation functions
- [ ] `useXPTier` hook - Tier data fetching
- [ ] `useXPSystem` - XP cap enforcement

### Integration Tests
- [ ] Daily XP reset function runs at midnight
- [ ] Upload credits decrement correctly
- [ ] Locked widgets block non-eligible users
- [ ] Emotion tagging saves to database
- [ ] Tier 3 preview triggers once at 2K XP

### E2E Tests
- [ ] Free user hits 750 XP cap → sees upgrade prompt
- [ ] Free user tries 2nd upload → blocked by paywall
- [ ] User unlocks Tier 1 → sees celebration animation
- [ ] Pro user hits 1500 XP cap → sees Elite upgrade
- [ ] User clicks locked Tier 3 widget → sees upgrade modal

---

## 🚧 Blockers & Issues

| Date | Blocker | Status | Resolution |
|------|---------|--------|------------|
| TBD | Example blocker | 🟡 In Progress | TBD |

---

## 📝 Notes & Decisions

### Architecture Decisions
- **Tier calculation:** Client-side with server validation
- **Daily reset:** Edge function scheduled via Supabase cron
- **Upload credits:** Server-side enforcement to prevent tampering
- **Analytics:** PostHog primary, Mixpanel optional (disabled for now)

### Design Decisions
- **Locked widget UX:** Blur + overlay (not complete removal)
- **XP cap messaging:** Friendly, not punishing ("Upgrade to keep growing!")
- **Emotion tagging:** Optional, max 3 per trade
- **Tier 3 preview:** One-time modal at 2K XP (50% to unlock)

---

## 🎯 Success Metrics

### Quantitative Targets
- [ ] 100% of widgets have `tier_required` assigned
- [ ] Free users hit 750 XP/day cap within 7 days of signup
- [ ] 80%+ of trades include at least 1 emotion tag
- [ ] Tier 3 preview triggers for 90%+ of users reaching 2K XP
- [ ] Upload credit paywall prevents 100% of over-limit uploads
- [ ] Zero errors in tier calculation across 1000+ test cases

### Qualitative Targets
- [ ] Users understand tier progression (measured via support tickets)
- [ ] Upgrade prompts feel motivating, not frustrating
- [ ] Locked widgets create curiosity, not anger
- [ ] Daily mission bar drives daily engagement

---

## 🔄 Daily Standup Template

**Today's Focus:**  
_What are you working on today?_

**Completed Yesterday:**  
_What tasks did you finish?_

**Blockers:**  
_Any issues preventing progress?_

**Next Up:**  
_What's coming after today's work?_

---

## 📚 Resources

- [GAMIFICATION_SYSTEM.md](./GAMIFICATION_SYSTEM.md) - Full system overview
- [POSTHOG_INTEGRATION.md](./POSTHOG_INTEGRATION.md) - Analytics implementation
- [xpEngine.ts](./src/utils/xpEngine.ts) - XP calculation logic
- [useXPSystem.ts](./src/hooks/useXPSystem.ts) - XP system hook
- [useUserTier.ts](./src/hooks/useUserTier.ts) - User tier hook (currently grants elite to all)

---

**Last Updated:** 2025-10-28  
**Next Review:** TBD
