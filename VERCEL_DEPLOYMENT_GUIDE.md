# Vercel Deployment Guide

Complete guide to deploy the Agentic VISA Assistant System on Vercel (both frontend and backend).

## 📋 Prerequisites

- Vercel account (sign up at [vercel.com](https://vercel.com))
- GitHub/GitLab/Bitbucket account (for repository connection)
- IBM Cloud API Key and watsonx.ai Project ID
- Vercel CLI (optional, for command-line deployment)

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

#### Step 1: Deploy Backend

1. **Push Code to Git Repository**
   ```bash
   git add .
   git commit -m "Add Vercel configuration"
   git push origin main
   ```

2. **Import Backend Project to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your Git repository
   - **Important**: Set the root directory to `bob-devday-hackathon-ava/backend`
   - Click "Continue"

3. **Configure Backend Project**
   - **Project Name**: `visa-assistant-backend` (or your preferred name)
   - **Framework Preset**: Other
   - **Root Directory**: `bob-devday-hackathon-ava/backend`
   - **Build Command**: Leave empty (not needed for Node.js)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

4. **Set Environment Variables**
   Click "Environment Variables" and add:
   
   ```
   WATSONX_API_KEY=your_ibm_cloud_api_key_here
   WATSONX_PROJECT_ID=your_watsonx_project_id_here
   WATSONX_URL=https://us-south.ml.cloud.ibm.com
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
   
   **Note**: You'll update `FRONTEND_URL` after deploying the frontend.

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy the deployment URL (e.g., `https://visa-assistant-backend.vercel.app`)

#### Step 2: Deploy Frontend

1. **Import Frontend Project to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select the same Git repository
   - **Important**: Set the root directory to `bob-devday-hackathon-ava/frontend`
   - Click "Continue"

2. **Configure Frontend Project**
   - **Project Name**: `visa-assistant-frontend` (or your preferred name)
   - **Framework Preset**: Vite
   - **Root Directory**: `bob-devday-hackathon-ava/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Set Environment Variables**
   Click "Environment Variables" and add:
   
   ```
   VITE_API_BASE_URL=https://visa-assistant-backend.vercel.app
   ```
   
   Replace with your actual backend URL from Step 1.

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy the deployment URL (e.g., `https://visa-assistant-frontend.vercel.app`)

#### Step 3: Update Backend CORS Configuration

1. Go back to your backend project in Vercel dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Update `FRONTEND_URL` with your frontend URL:
   ```
   FRONTEND_URL=https://visa-assistant-frontend.vercel.app
   ```
4. Go to "Deployments" tab
5. Click "..." on the latest deployment and select "Redeploy"

### Option 2: Deploy via Vercel CLI

#### Install Vercel CLI

```bash
npm install -g vercel
```

#### Deploy Backend

```bash
# Navigate to backend directory
cd bob-devday-hackathon-ava/backend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? visa-assistant-backend
# - Directory? ./
# - Override settings? No

# Set environment variables
vercel env add WATSONX_API_KEY
vercel env add WATSONX_PROJECT_ID
vercel env add WATSONX_URL
vercel env add NODE_ENV
vercel env add FRONTEND_URL

# Deploy to production
vercel --prod
```

#### Deploy Frontend

```bash
# Navigate to frontend directory
cd ../frontend

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? visa-assistant-frontend
# - Directory? ./
# - Override settings? No

# Set environment variable
vercel env add VITE_API_BASE_URL

# Deploy to production
vercel --prod
```

## 🔧 Post-Deployment Configuration

### 1. Verify Backend Deployment

Test your backend API:

```bash
curl https://your-backend-url.vercel.app/api/visa/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Agentic VISA Assistant API is running"
}
```

### 2. Verify Frontend Deployment

1. Open your frontend URL in a browser
2. Navigate through the form
3. Test document generation
4. Verify PDF downloads work correctly

### 3. Custom Domain (Optional)

#### For Backend:
1. Go to backend project in Vercel dashboard
2. Navigate to "Settings" → "Domains"
3. Add your custom domain (e.g., `api.yourdomain.com`)
4. Update DNS records as instructed
5. Update `VITE_API_BASE_URL` in frontend environment variables

#### For Frontend:
1. Go to frontend project in Vercel dashboard
2. Navigate to "Settings" → "Domains"
3. Add your custom domain (e.g., `visa.yourdomain.com`)
4. Update DNS records as instructed
5. Update `FRONTEND_URL` in backend environment variables

## 📝 Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `WATSONX_API_KEY` | IBM Cloud API Key | `your_api_key_here` |
| `WATSONX_PROJECT_ID` | watsonx.ai Project ID | `your_project_id_here` |
| `WATSONX_URL` | watsonx.ai API URL | `https://us-south.ml.cloud.ibm.com` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (optional) | `3001` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-frontend.vercel.app` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `https://your-backend.vercel.app` |

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to your Git repository:

1. **Production Deployments**: Push to `main` branch
2. **Preview Deployments**: Push to any other branch or create a pull request

### Disable Auto-Deployment (Optional)

If you want manual control:
1. Go to project settings in Vercel dashboard
2. Navigate to "Git" section
3. Disable "Production Branch" or "Preview Branches"

## 🐛 Troubleshooting

### Backend Issues

**Problem**: 500 Internal Server Error

**Solution**:
1. Check Vercel function logs: Project → Deployments → Click deployment → View Function Logs
2. Verify environment variables are set correctly
3. Ensure IBM Cloud API key is valid
4. Check watsonx.ai project ID is correct

**Problem**: CORS errors

**Solution**:
1. Verify `FRONTEND_URL` environment variable matches your frontend URL exactly
2. Include protocol (https://) in the URL
3. Don't include trailing slash
4. Redeploy backend after updating environment variables

**Problem**: File upload/download issues

**Solution**:
- Vercel serverless functions have a 50MB payload limit
- For large files, consider using external storage (AWS S3, Cloudinary, etc.)
- Current implementation should work for typical PDF sizes

### Frontend Issues

**Problem**: API calls failing

**Solution**:
1. Check `VITE_API_BASE_URL` is set correctly
2. Verify backend is deployed and accessible
3. Check browser console for CORS errors
4. Ensure backend URL includes protocol (https://)

**Problem**: Build fails

**Solution**:
1. Check build logs in Vercel dashboard
2. Verify all dependencies are in `package.json`
3. Ensure `vite.config.js` is properly configured
4. Check for TypeScript errors if using TypeScript

**Problem**: Environment variables not working

**Solution**:
1. Ensure variables start with `VITE_` prefix
2. Redeploy after adding/updating environment variables
3. Clear browser cache and hard refresh

## 📊 Monitoring and Logs

### View Logs

1. Go to Vercel dashboard
2. Select your project
3. Click "Deployments"
4. Click on a deployment
5. View "Build Logs" or "Function Logs"

### Monitor Performance

1. Navigate to project in Vercel dashboard
2. Click "Analytics" tab
3. View metrics:
   - Page views
   - Response times
   - Error rates
   - Geographic distribution

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Use Vercel environment variables
2. **Rotate API keys regularly** - Update in Vercel dashboard
3. **Use environment-specific variables** - Different keys for preview/production
4. **Enable HTTPS only** - Vercel provides this by default
5. **Monitor API usage** - Check IBM Cloud dashboard regularly
6. **Set up alerts** - Use Vercel integrations for error notifications

## 💰 Cost Considerations

### Vercel Pricing

- **Hobby Plan** (Free):
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Serverless function execution: 100 GB-hours
  - Good for development and small projects

- **Pro Plan** ($20/month):
  - 1 TB bandwidth/month
  - Unlimited deployments
  - Serverless function execution: 1000 GB-hours
  - Custom domains
  - Team collaboration

### IBM watsonx.ai Pricing

- Check current pricing at [IBM Cloud Pricing](https://www.ibm.com/cloud/pricing)
- Monitor token usage in IBM Cloud dashboard
- Set up billing alerts to avoid surprises

## 🔄 Updating Your Deployment

### Update Code

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically deploys the changes
```

### Update Environment Variables

1. Go to Vercel dashboard
2. Select project
3. Navigate to "Settings" → "Environment Variables"
4. Update or add variables
5. Redeploy from "Deployments" tab

### Rollback Deployment

1. Go to "Deployments" tab
2. Find a previous successful deployment
3. Click "..." menu
4. Select "Promote to Production"

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [IBM watsonx.ai Documentation](https://www.ibm.com/docs/en/watsonx-as-a-service)
- [Node.js on Vercel](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

## ✅ Deployment Checklist

- [ ] Backend code pushed to Git repository
- [ ] Backend deployed to Vercel
- [ ] Backend environment variables configured
- [ ] Backend API tested and working
- [ ] Frontend code pushed to Git repository
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables configured
- [ ] Frontend connects to backend successfully
- [ ] CORS configured correctly
- [ ] Document generation tested
- [ ] PDF downloads working
- [ ] Custom domains configured (if applicable)
- [ ] Monitoring and alerts set up
- [ ] Documentation updated with production URLs

## 🎉 Success!

Your Agentic VISA Assistant System is now live on Vercel!

**Frontend URL**: `https://your-frontend.vercel.app`  
**Backend URL**: `https://your-backend.vercel.app`

Share your application and start helping travelers with their visa documentation!

---

**Last Updated**: 2026-05-17  
**Version**: 1.0.0