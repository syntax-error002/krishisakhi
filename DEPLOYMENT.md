# Deployment Guide - Render

## Quick Deploy to Render

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your repository
   - Render will auto-detect `render.yaml` and configure everything

3. **That's it!** Render will:
   - Detect Python from `runtime.txt`
   - Install dependencies from `requirements.txt`
   - Start the server automatically

### Option 2: Manual Configuration

If you prefer manual setup in Render dashboard:

#### Step 1: Connect Repository
- Click "New +" → "Web Service"
- Connect your Git repository
- Select the branch (usually `main`)

#### Step 2: Configure Service

**Basic Settings:**
- **Name:** `krishi-backend` (or your preferred name)
- **Region:** Oregon (US West) or your preferred region
- **Branch:** `main`
- **Root Directory:** `krishi-backend` (if your repo has multiple folders)

**Build & Deploy:**
- **Environment:** `Python 3`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Environment Variables (Optional - defaults work):**
```
APP_NAME=Krishi Mitra API
APP_VERSION=1.0.0
DEBUG=false
LOG_LEVEL=INFO
CORS_ORIGINS=*
CORS_ALLOW_CREDENTIALS=true
```

#### Step 3: Deploy
- Click "Create Web Service"
- Render will build and deploy automatically
- Wait for "Live" status (usually 2-3 minutes)

### After Deployment

1. **Get your API URL:**
   - Render provides: `https://your-service-name.onrender.com`
   - Test: `https://your-service-name.onrender.com/health`

2. **Update Frontend:**
   - Update your frontend API base URL to the Render URL
   - Example: `https://krishi-backend.onrender.com/api/climate/simulate`

3. **Access Docs:**
   - Swagger UI: `https://your-service-name.onrender.com/docs`
   - ReDoc: `https://your-service-name.onrender.com/redoc`

## Important Notes

### Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds (cold start)
- For hackathon demos, consider:
  - Keeping the service active by pinging `/health` every 10 minutes
  - Or upgrading to paid plan for instant responses

### CORS Configuration
If your frontend is on a different domain, update CORS_ORIGINS:
```
CORS_ORIGINS=https://your-frontend-domain.com,https://another-domain.com
```

### Monitoring
- Check logs in Render dashboard
- Monitor service health at `/health` endpoint
- View metrics in Render dashboard

## Troubleshooting

### Build Fails
- Check Python version matches `runtime.txt`
- Verify `requirements.txt` is in root directory
- Check build logs in Render dashboard

### Service Won't Start
- Verify start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Check that `main.py` is in the root directory
- Review logs for error messages

### 502 Bad Gateway
- Service might be spinning up (wait 30 seconds)
- Check if service is "Live" in dashboard
- Verify PORT environment variable is set (Render sets this automatically)

### CORS Errors
- Update `CORS_ORIGINS` environment variable
- Include your frontend URL
- Restart service after changing env vars

## Alternative: Quick Test with ngrok (Local Development)

For quick testing without deploying:

```bash
# Terminal 1: Start backend
cd krishi-backend
uvicorn main:app --reload

# Terminal 2: Expose with ngrok
ngrok http 8000
```

Use the ngrok URL in your frontend.

