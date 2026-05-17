# Fix: Frontend Still Calling Localhost on Vercel

## Problem
After deploying to Vercel and setting `VITE_API_BASE_URL`, the frontend still calls `localhost:3001` instead of the production backend URL.

## Root Cause
The hardcoded API URLs in the frontend components were not using the environment variable.

## Solution Applied ✅

Updated the following files to use `import.meta.env.VITE_API_BASE_URL`:

1. **`frontend/src/components/Dashboard.jsx`** (Line 26)
2. **`frontend/src/components/ItineraryWizard/AIGenerationStep.jsx`** (Line 6)

Changed from:
```javascript
const API_BASE_URL = 'http://localhost:3001/api/visa';
```

To:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/api/visa`
  : 'http://localhost:3001/api/visa';
```

## Steps to Deploy the Fix

### 1. Commit and Push Changes
```bash
cd bob-devday-hackathon-ava
git add .
git commit -m "Fix: Use environment variable for API URL"
git push origin main
```

### 2. Vercel Will Auto-Deploy
Vercel will automatically detect the push and redeploy your frontend.

### 3. Verify Environment Variable in Vercel

Go to your frontend project in Vercel dashboard:
1. Navigate to **Settings** → **Environment Variables**
2. Ensure `VITE_API_BASE_URL` is set correctly:
   ```
   VITE_API_BASE_URL=https://your-backend-url.vercel.app
   ```
   ⚠️ **Important**: Do NOT include `/api/visa` at the end - just the base URL

### 4. Force Rebuild (If Needed)

If auto-deploy doesn't trigger:
1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Select **"Redeploy"**
4. Check **"Use existing Build Cache"** = OFF (to ensure fresh build)

## Verification

After deployment, check the browser console:
1. Open your Vercel frontend URL
2. Open browser DevTools (F12)
3. Go to **Network** tab
4. Try to generate an itinerary
5. Check the API calls - they should now go to your Vercel backend URL, not localhost

## Important Notes

### Environment Variable Format
✅ **Correct:**
```
VITE_API_BASE_URL=https://visa-backend-xyz.vercel.app
```

❌ **Incorrect:**
```
VITE_API_BASE_URL=https://visa-backend-xyz.vercel.app/api/visa  # Don't include /api/visa
VITE_API_BASE_URL=http://visa-backend-xyz.vercel.app            # Use https, not http
VITE_API_BASE_URL=https://visa-backend-xyz.vercel.app/          # No trailing slash
```

### Why This Happens

Vite environment variables are **build-time** variables, not runtime. This means:
- They are embedded into the JavaScript bundle during build
- Changing them in Vercel requires a **rebuild**, not just a redeploy
- The `import.meta.env.VITE_*` values are replaced with actual values at build time

### Local Development

The fallback to `localhost:3001` ensures local development still works:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/api/visa`
  : 'http://localhost:3001/api/visa';  // ← Fallback for local dev
```

## Troubleshooting

### Still seeing localhost calls?

1. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Or open in incognito/private window

2. **Check build logs:**
   - Go to Vercel dashboard → Deployments → Click deployment
   - Look for environment variable values in build logs
   - Should see: `VITE_API_BASE_URL: "https://your-backend.vercel.app"`

3. **Verify the built code:**
   - In browser DevTools, go to Sources tab
   - Find the JavaScript bundle
   - Search for "localhost" - should not find any API URLs

4. **Force a clean build:**
   ```bash
   # In Vercel dashboard
   Settings → General → Clear Build Cache
   # Then redeploy
   ```

### Environment variable not working?

1. **Check variable name:**
   - Must start with `VITE_` prefix
   - Case-sensitive: `VITE_API_BASE_URL` not `vite_api_base_url`

2. **Check scope:**
   - Set for "Production", "Preview", and "Development" environments
   - Or at least for "Production"

3. **Redeploy after setting:**
   - Environment variables require a rebuild to take effect
   - Just saving them is not enough

## Additional Files to Check

If you add more API calls in the future, make sure to use the environment variable:

```javascript
// ✅ Good
const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/visa/endpoint`);

// ❌ Bad
const response = await axios.get('http://localhost:3001/api/visa/endpoint');
```

## Summary

The issue has been fixed by:
1. ✅ Updating hardcoded URLs to use environment variables
2. ✅ Adding fallback for local development
3. ✅ Maintaining the same API structure

After pushing these changes and redeploying, your frontend will correctly call the production backend URL on Vercel.

---

**Last Updated**: 2026-05-17  
**Status**: Fixed ✅