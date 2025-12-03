# Weather App - Quick Start Guide

## 🚀 Quick Setup (3 Steps)

### 1. Get API Key
- Visit https://openweathermap.org/api
- Sign up for free account
- Copy your API key from "API keys" section

### 2. Add API Key
- With your key: `8cdab3da013f0f5842b2eeae466dc39d;`

### 3. Run App
- Double-click `index.html` to open in browser
- OR use local server: `python -m http.server 8000`

## 📝 Project Files

| File | Size | Purpose |
|------|------|---------|
| index.html | ~250 lines | Page structure |
| styles.css | ~650 lines | Responsive styling |
| app.js | ~400 lines | Logic & API calls |
| README.md | ~500 lines | Full documentation |

## ✨ Key Features

- 🌍 Search any city worldwide
- 📍 One-click geolocation
- 🌡️ Celsius/Fahrenheit toggle
- 📊 Detailed weather metrics
- 📱 Fully responsive
- ⚡ Fast and efficient
- ❌ Comprehensive error handling

## 🎯 What You Can Do

✅ Search for weather by city name
✅ Get weather for current location
✅ Switch temperature units
✅ View detailed weather information
✅ Handle errors gracefully
✅ Use on any device/browser

## 🔧 Customization

### Change Colors
Edit CSS variables in `styles.css` (lines 7-16):
```css
--primary-color: #2c3e50;      /* Main color */
--secondary-color: #3498db;    /* Accent color */
--accent-color: #e74c3c;       /* Error color */
```

### Adjust Request Throttle
In `app.js` line 11:
```javascript
const DELAY_THRESHOLD = 5000;  // milliseconds between requests
```

### Change Temperature Display
Default is Celsius. The toggle switches to Fahrenheit.

## 📱 Screen Sizes Supported

- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (480px - 767px)
- Small Mobile (<480px)

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Enter | Search |
| Ctrl+Enter | Quick search |
| Esc | Close error |

## 🐛 Need Help?

1. Check browser console (F12)
2. Verify API key is added
3. Ensure internet connection
4. Try different city name spelling
5. See README.md for troubleshooting

## 📊 API Information

- **Provider**: OpenWeatherMap
- **Endpoint**: Current Weather API
- **Free Tier**: 1,000 calls/day
- **Rate**: 60 calls/minute
- **Response**: JSON format

## 💡 Tips

- Free API key works great for testing
- No credit card needed for free tier
- Responses come in ~500-800ms
- Emoji icons update with weather
- All data displayed in metric units

## 🎓 Learning Topics

This project covers:
- HTML5 semantics
- CSS3 responsive design
- JavaScript async/await
- REST API integration
- Error handling
- Geolocation API
- DOM manipulation
- Browser APIs

---

**Ready to use! Just add your API key and go! 🌤️**
