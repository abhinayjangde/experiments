# Clawdbot Setup Guide for GitHub Codespaces

This guide helps you set up and troubleshoot Clawdbot in GitHub Codespaces environments.

## Problem: Gateway Unreachable / Disconnected (1008): Pairing Required

### Step 1: Check Gateway Status
```bash
clawdbot status
```

**Expected Issue:** Gateway shows "unreachable (connect failed: connect ECONNREFUSED 127.0.0.1:18789)"

### Step 2: Understand the Environment Limitation
GitHub Codespaces dev containers **don't support systemd**, so the gateway won't auto-start.

Verify this:
```bash
clawdbot gateway start
# Will show: "systemd not installed" or similar error
```

### Step 3: Start Gateway Manually
Since systemd isn't available, start the gateway directly in the background:

```bash
clawdbot gateway run &
```

Wait 2-3 seconds for it to initialize, then verify:
```bash
clawdbot status
```

**Expected Output:** Gateway should now show "reachable" with response time (e.g., "17ms")

### Step 4: Get Dashboard Access URL
Generate the tokenized dashboard URL:

```bash
clawdbot dashboard
```

**Output Example:**
```
Dashboard URL: http://127.0.0.1:18789/?token=b7da479bc4c733b80eaf30aa8cac0d78928fb438365bf97e
```

### Step 5: Access Dashboard via Codespaces
GitHub Codespaces automatically forwards port 18789. You'll get a URL like:
```
https://your-codespace-name.app.github.dev/?token=YOUR_TOKEN_HERE
```

**Important:** Open this URL in your browser.

### Step 6: Fix "Pairing Required" Error
When you open the dashboard, you'll see:
```
disconnected (1008): pairing required
```

This happens because Codespaces uses a proxy, and Clawdbot requires device pairing for remote connections.

### Step 7: List Pending Device Pairing Requests
Back in the terminal, run:
```bash
clawdbot devices list
```

**Expected Output:**
```
Pending (1)
┌──────────────────────────────────────┬───────────┬──────────┬────────────┬────────┐
│ Request                              │ Device    │ Role     │ IP         │ Age    │
├──────────────────────────────────────┼───────────┼──────────┼────────────┼────────┤
│ 182856e5-2b08-4970-8d0e-5f04ea6b0ba8 │ e69a3a... │ operator │ 27.60.8.26 │ 2m ago │
└──────────────────────────────────────┴───────────┴──────────┴────────────┴────────┘
```

### Step 8: Approve the Device Pairing
Copy the **Request ID** from the pending list and approve it:

```bash
clawdbot devices approve <REQUEST_ID>
```

**Example:**
```bash
clawdbot devices approve 182856e5-2b08-4970-8d0e-5f04ea6b0ba8
```

**Expected Output:**
```
Approved e69a3af30196991afece999d587a70fbb25aa11f276199c1098b2257e0890310
```

### Step 9: Reconnect Dashboard
Go back to your browser and:
1. **Refresh the page** or
2. Click the **"Connect"** button in the dashboard

✅ **Success!** The dashboard should now connect without errors.

---

## Quick Reference Commands

### Start Gateway (Background)
```bash
clawdbot gateway run &
```

### Check Status
```bash
clawdbot status
```

### Get Dashboard URL
```bash
clawdbot dashboard
```

### List Pending Device Pairings
```bash
clawdbot devices list
```

### Approve Device Pairing
```bash
clawdbot devices approve <REQUEST_ID>
```

### View Gateway Logs
```bash
clawdbot logs --follow
```

### Stop Gateway (if needed)
```bash
pkill -f "clawdbot gateway"
```

---

## Important Notes

1. **Gateway won't auto-start** in Codespaces - you must run `clawdbot gateway run &` manually each time
2. **Keep terminal open** or the gateway will stop when terminal closes
3. **Device pairing** is required for each new browser/device accessing via Codespaces
4. **Token is sensitive** - don't share the tokenized dashboard URL publicly

---

## Common Issues

### Gateway keeps stopping
**Solution:** Run in background with nohup:
```bash
nohup clawdbot gateway run > /tmp/gateway.log 2>&1 &
```

### Can't find pending pairing request
**Solution:** Try opening the dashboard URL again to trigger a new pairing request, then check:
```bash
clawdbot devices list
```

### Port already in use
**Solution:** Stop existing gateway processes:
```bash
pkill -f "clawdbot gateway"
sleep 2
clawdbot gateway run &
```

---

## Summary
The key difference in Codespaces is:
1. No systemd = manual gateway start
2. Proxy connection = device pairing required

Follow steps 1-9 above and you'll have Clawdbot running successfully! 🦞
