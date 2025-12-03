# Environment Configuration for Render Deployment

## Setup Instructions for Render Deployment

### Step 1: Connect GitHub Repository
1. Go to https://dashboard.render.com
2. Click "New Web Service"
3. Select "Build and deploy from a Git repository"
4. Connect your GitHub account
5. Select the "WeatherApp" repository

### Step 2: Configure Deployment Settings

Use the following configuration values:

```
Name: weather-app
Region: Singapore (Southeast Asia)
Branch: main
Runtime: Static Site
Build Command: echo "Static site ready"
Start Command: python3 -m http.server 8000
Instance Type: Starter ($7/month - for hobby projects)
```

### Step 3: Add Environment Variables

In the Render dashboard, add the following environment variable:

**Key:** `OPENWEATHER_API_KEY`
**Value:** `8cdab3da013f0f5842b2eeae466dc39d`

Or follow these steps:
1. Go to your Web Service dashboard
2. Click "Environment"
3. Click "Add Environment Variable"
4. Enter the key and value
5. Click "Save"

### Step 4: Configure Build Settings

**Root Directory:** (Leave empty - not needed for static sites)

**Build Command:**
```bash
echo "Static site ready"
```

**Start Command:**
```bash
python3 -m http.server 8000
```

### Step 5: Deploy

1. Click "Deploy Web Service"
2. Wait for the build to complete (usually 2-3 minutes)
3. Once deployed, you'll get a public URL like: `https://weather-app-xxx.onrender.com`

---

## Important Security Notes

### 🔐 Protecting Your API Key

Since your API key is exposed in the HTML/JavaScript file, consider these options:

**Option 1: Environment Variables (Recommended)**
- Move the API key to environment variables
- Use a backend proxy to make API calls
- The frontend requests data from your backend, not directly from OpenWeatherMap

**Option 2: Create a Backend Proxy**
- Create a simple Node.js/Python backend
- Backend holds the API key
- Frontend communicates with your backend only

**Option 3: Current Setup (if key has low quota)**
- If this key is for testing/demo purposes
- Keep usage monitoring to prevent unexpected charges
- Consider rotating the key regularly

### Creating a Simple Node.js Proxy (Advanced)

If you want to protect your API key, create a simple Express server:

```javascript
// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const API_KEY = process.env.OPENWEATHER_API_KEY;

app.get('/api/weather', async (req, res) => {
    const { q } = req.query;
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${q}&units=metric&appid=${API_KEY}`
    );
    const data = await response.json();
    res.json(data);
});

app.listen(8000, () => console.log('Proxy server running on port 8000'));
```

---

## Troubleshooting Deployment

### Issue: Build Fails
**Solution:** Check the build logs in Render dashboard for errors

### Issue: Service Shows as "Crashed"
**Solution:** 
1. Check logs in Render dashboard
2. Ensure Python 3 is available (it's included by default)
3. Verify environment variables are set

### Issue: API Requests Fail After Deployment
**Solution:**
1. Check if the API key is valid
2. Verify CORS is enabled on OpenWeatherMap API
3. Check browser console for errors
4. Monitor API usage in OpenWeatherMap dashboard

### Issue: Static Files Not Loading
**Solution:**
1. Ensure all files are committed to GitHub
2. Check file paths in HTML (use relative paths)
3. Verify .gitignore doesn't exclude necessary files

---

## Monitoring After Deployment

### Check Service Status
- Visit: https://dashboard.render.com
- Select your "weather-app" service
- View real-time logs and metrics

### View Application Logs
```
Render Dashboard → Your Service → Logs
```

### Monitor API Usage
```
OpenWeatherMap Dashboard → API Keys → Usage
```

---

## Cost Information

- **Instance Type:** Starter ($7/month)
- **Region:** Singapore (Southeast Asia)
- **Auto-sleeping:** Services sleep after 15 minutes of inactivity on free tier
- **No sleeping on Starter plan:** Always running ($7/month)

---

## Next Steps

1. ✅ Commit this configuration to GitHub
2. ✅ Go to https://dashboard.render.com
3. ✅ Create new Web Service
4. ✅ Configure with values above
5. ✅ Deploy!

Your Weather App will be live at: `https://weather-app-xxx.onrender.com` 🚀

---

## Support

For Render support: https://render.com/docs
For OpenWeatherMap API: https://openweathermap.org/api
