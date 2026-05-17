# Quick Deploy to Vercel - TL;DR

Fast track guide to deploy your app to Vercel in 5 minutes.

## 🚀 Quick Steps

### 1. Prepare Your Repository

```bash
cd bob-devday-hackathon-ava
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

### 2. Deploy Backend (2 minutes)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your repository
3. **Set Root Directory**: `bob-devday-hackathon-ava/backend`
4. Add Environment Variables:
   ```
   WATSONX_API_KEY=your_key
   WATSONX_PROJECT_ID=your_project_id
   WATSONX_URL=https://us-south.ml.cloud.ibm.com
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
5. Click Deploy
6. **Copy the backend URL** (e.g., `https://visa-backend-xyz.vercel.app`). 



ibm-hackathon-ava.vercel.app

ibm-hackathon-ava-1ndn.vercel.app

### 3. Deploy Frontend (2 minutes)

1. Go to [vercel.com/new](https://vercel.com/new) again
2. Import the same repository
3. **Set Root Directory**: `bob-devday-hackathon-ava/frontend`
4. Add Environment Variable:
   ```
   VITE_API_BASE_URL=https://visa-backend-xyz.vercel.app
   ```
   (Use your backend URL from step 2)
5. Click Deploy
6. **Copy the frontend URL**

### 4. Update Backend CORS (1 minute)

1. Go back to backend project in Vercel
2. Settings → Environment Variables
3. Update `FRONTEND_URL` with your frontend URL
4. Deployments → Redeploy latest

## ✅ Done!

Your app is live at your frontend URL!

## 📝 Environment Variables Needed

**Backend:**
- `WATSONX_API_KEY` - Get from IBM Cloud
- `WATSONX_PROJECT_ID` - Get from watsonx.ai project
- `WATSONX_URL` - Use `https://us-south.ml.cloud.ibm.com`
- `NODE_ENV` - Set to `production`
- `FRONTEND_URL` - Your frontend Vercel URL

**Frontend:**
- `VITE_API_BASE_URL` - Your backend Vercel URL

## 🐛 Common Issues

**CORS Error?**
- Make sure `FRONTEND_URL` in backend matches your frontend URL exactly
- Redeploy backend after updating

**API Not Working?**
- Check backend logs in Vercel dashboard
- Verify IBM Cloud credentials are correct

**Build Failed?**
- Check you set the correct root directory for each project
- Backend: `bob-devday-hackathon-ava/backend`
- Frontend: `bob-devday-hackathon-ava/frontend`

## 📚 Need More Details?

See [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) for comprehensive instructions.