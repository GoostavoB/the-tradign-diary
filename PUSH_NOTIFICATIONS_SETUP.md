# Push Notifications Setup Guide

## Current Status
Push notifications are **partially implemented** but require VAPID keys for full functionality.

## What's Already Done ✅
- Service worker with push notification handlers (`public/sw.js`)
- Basic notification permission request flow
- Notification UI components
- Database table for storing push subscriptions

## What's Needed 🔧

### 1. Generate VAPID Keys
You need to generate VAPID (Voluntary Application Server Identification) keys for web push notifications.

**Option A: Using web-push npm package**
```bash
npm install -g web-push
web-push generate-vapid-keys
```

**Option B: Using online generator**
Visit: https://vapidkeys.com/

This will give you:
- Public Key (share with client)
- Private Key (keep secret on server)

### 2. Add VAPID Keys to Environment
Add these to your Supabase secrets or environment variables:

```bash
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

### 3. Update Push Subscription Code
In `src/hooks/usePushNotifications.ts`, replace the placeholder subscription with real VAPID implementation:

```typescript
// Replace lines 41-48 with:
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
});

// Add helper function:
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

### 4. Create Backend Endpoint for Sending Notifications
Create an edge function to send push notifications:

**File: `supabase/functions/send-push-notification/index.ts`**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { userId, title, body, url } = await req.json()
  
  // Get user's push subscriptions from database
  const subscriptions = await fetchUserSubscriptions(userId)
  
  // Send to each subscription
  for (const sub of subscriptions) {
    await webPush.sendNotification(
      sub.push_subscription,
      JSON.stringify({ title, body, url }),
      {
        vapidDetails: {
          subject: 'mailto:your@email.com',
          publicKey: Deno.env.get('VAPID_PUBLIC_KEY'),
          privateKey: Deno.env.get('VAPID_PRIVATE_KEY')
        }
      }
    )
  }
  
  return new Response(JSON.stringify({ success: true }))
})
```

### 5. Test Push Notifications

1. **Request permission**: Call `subscribeToPush()` from settings page
2. **Send test notification**: Use the edge function to send a test
3. **Verify**: Check that notification appears on desktop/mobile

## Browser Support
- ✅ Chrome/Edge (Desktop & Android)
- ✅ Firefox (Desktop & Android)  
- ✅ Safari 16+ (Desktop & iOS 16.4+)
- ❌ Older browsers (graceful degradation included)

## Security Notes
- Never expose VAPID private key in client-side code
- Always use HTTPS in production
- Respect user's notification preferences
- Implement daily notification caps (already done in LSR alerts)

## Testing Checklist
- [ ] Generate VAPID keys
- [ ] Add keys to environment variables
- [ ] Update subscription code with real keys
- [ ] Create send-notification edge function
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari (if available)
- [ ] Test on mobile devices
- [ ] Verify database storage
- [ ] Test notification click behavior

## Resources
- [Web Push Notifications Guide](https://web.dev/push-notifications-overview/)
- [MDN Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [VAPID Specification](https://datatracker.ietf.org/doc/html/rfc8292)
