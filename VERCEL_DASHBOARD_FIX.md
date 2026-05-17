# Fix: Dashboard Not Showing Data on Vercel

## Problem
After successfully generating itineraries on Vercel, the dashboard shows no data. This works fine locally but fails on Vercel.

## Root Cause
The dashboard endpoint reads `metadata.json` files from the filesystem. On Vercel:
1. Files are stored in `/tmp` (only writable location)
2. `/tmp` is **ephemeral** - cleared between function invocations
3. Each serverless function invocation is isolated
4. Dashboard endpoint can't access files created by previous function calls

## Solution Applied ✅

### In-Memory Cache for Vercel

Added a simple in-memory cache that stores request metadata during the function's lifetime:

```javascript
// In-memory storage for Vercel (since /tmp is ephemeral)
const requestsCache = new Map();
```

### Updated `/api/visa/generate-complete-package`

When a request is processed, metadata is stored in the cache:

```javascript
// Store in cache for Vercel (since /tmp is ephemeral)
if (process.env.VERCEL) {
  requestsCache.set(requestId, metadata);
}
```

### Updated `/api/visa/dashboard`

Dashboard endpoint now checks if running on Vercel and uses cache:

```javascript
// For Vercel: use in-memory cache
if (process.env.VERCEL) {
  const requests = [];
  // ... read from requestsCache Map
  return res.json({ requests, ... });
}

// For local development: read from filesystem
// ... existing filesystem logic
```

## How It Works

### Local Development
- ✅ Metadata saved to `backend/public/downloads/req-*/metadata.json`
- ✅ Dashboard reads from filesystem
- ✅ Data persists across server restarts
- ✅ PDFs accessible via static file serving

### Vercel Production
- ✅ Metadata saved to `/tmp/downloads/req-*/metadata.json` (for logging)
- ✅ Metadata also stored in `requestsCache` Map
- ✅ Dashboard reads from in-memory cache
- ⚠️ Data cleared on function cold start
- ✅ PDFs returned as base64 in API response

## Limitations

### ⚠️ Data Persistence on Vercel

**Important:** The in-memory cache has limitations:

1. **Cold Starts**: Data is lost when the serverless function restarts
2. **Multiple Instances**: Each function instance has its own cache
3. **Not Suitable for Production**: This is a temporary solution

### When Data is Lost:
- Function hasn't been called for ~5-10 minutes (cold start)
- Vercel scales up and creates new function instances
- Deployment/redeployment occurs
- Manual function restart

## Better Solutions for Production

For a production application, consider these alternatives:

### 1. Database Storage (Recommended)
**Use a database to store request metadata:**

```javascript
// Example with MongoDB
const request = await Request.create({
  requestId,
  createdAt: new Date(),
  travelers: processedResults,
  summary
});
```

**Pros:**
- ✅ Persistent storage
- ✅ Scalable
- ✅ Query capabilities
- ✅ Works across all instances

**Options:**
- MongoDB Atlas (free tier available)
- PostgreSQL (Vercel Postgres)
- Supabase
- PlanetScale

### 2. Vercel KV (Redis)
**Use Vercel's built-in KV storage:**

```javascript
import { kv } from '@vercel/kv';

// Store
await kv.set(`request:${requestId}`, metadata);

// Retrieve
const metadata = await kv.get(`request:${requestId}`);
```

**Pros:**
- ✅ Native Vercel integration
- ✅ Fast (Redis-based)
- ✅ Simple API

**Cons:**
- ⚠️ Requires Vercel Pro plan
- ⚠️ Additional cost

### 3. External Storage (S3, etc.)
**Store metadata as JSON files in cloud storage:**

```javascript
// Upload to S3
await s3.putObject({
  Bucket: 'visa-requests',
  Key: `${requestId}/metadata.json`,
  Body: JSON.stringify(metadata)
});
```

**Pros:**
- ✅ Persistent
- ✅ Can store PDFs too
- ✅ Scalable

**Cons:**
- ⚠️ Additional service setup
- ⚠️ More complex
- ⚠️ Additional costs

## Current Workaround

For now, the in-memory cache works for:
- ✅ Demo/testing purposes
- ✅ Low-traffic applications
- ✅ Single-user scenarios
- ✅ Short-term data needs

**Best Practice:** Generate and download documents immediately. Don't rely on dashboard for historical data on Vercel.

## Implementation Steps

### Already Applied:
1. ✅ Added `requestsCache` Map
2. ✅ Store metadata in cache after generation
3. ✅ Dashboard reads from cache on Vercel
4. ✅ Maintains filesystem logic for local dev

### To Deploy:
```bash
git add .
git commit -m "Fix: Dashboard data persistence on Vercel using in-memory cache"
git push origin main
```

## Testing

### Test on Vercel:
1. Generate an itinerary
2. Immediately check dashboard - should show the request
3. Wait 10-15 minutes (cold start)
4. Check dashboard again - data may be gone
5. Generate another itinerary - should appear in dashboard

### Expected Behavior:
- ✅ Recent requests (within function lifetime) appear
- ⚠️ Old requests (before cold start) disappear
- ✅ New requests always appear immediately

## Monitoring

### Check Function Logs:
```
📊 Fetching dashboard data...
Found X visa requests (in-memory cache)
```

If you see this message, the cache is being used.

### Dashboard Response:
```json
{
  "success": true,
  "message": "Found 2 visa requests (in-memory cache)",
  "note": "Data stored in memory - will be cleared on function restart",
  "requests": [...]
}
```

The `note` field indicates data is from cache.

## Migration Path to Database

When ready to implement persistent storage:

### 1. Choose a Database
- MongoDB Atlas (easiest)
- Vercel Postgres
- Supabase

### 2. Update Schema
```javascript
const RequestSchema = {
  requestId: String,
  createdAt: Date,
  travelers: Array,
  summary: Object,
  files: Array // Store base64 or URLs
};
```

### 3. Update Endpoints
```javascript
// Save
await db.requests.create(metadata);

// Retrieve
const requests = await db.requests.find().sort({ createdAt: -1 });
```

### 4. Remove In-Memory Cache
Once database is working, remove the `requestsCache` Map.

## Summary

✅ **Fixed:** Dashboard now shows data on Vercel using in-memory cache  
⚠️ **Limitation:** Data cleared on cold starts  
🎯 **Recommendation:** Implement database storage for production  
✅ **Works for:** Demo, testing, immediate use cases  

The current solution allows the dashboard to work on Vercel while maintaining a path to upgrade to persistent storage when needed.

---

**Last Updated**: 2026-05-17  
**Status**: Temporary Fix Applied ✅  
**Production Ready**: ⚠️ Requires database for full production use