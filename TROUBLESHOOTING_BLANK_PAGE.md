# Troubleshooting Blank Page Issue

## Quick Fixes

### 1. Check Browser Console
- Press **F12** to open Developer Tools
- Go to **Console** tab
- Look for any red error messages
- Share the errors if you see any

### 2. Verify Dev Server is Running
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 3. Install Dependencies
If you haven't installed dependencies yet:
```bash
# In frontend folder
npm install

# In backend folder (if needed)
cd ../backend
npm install
```

### 4. Clear Browser Cache
- Press **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac)
- Or clear browser cache manually

### 5. Check for JavaScript Errors
Open browser console (F12) and look for:
- Import errors
- Module not found errors
- Syntax errors

### 6. Verify Environment Variables
Create `frontend/.env` file with:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_API_URL=http://localhost:5000/api
```

### 7. Check Network Tab
- Open Developer Tools (F12)
- Go to **Network** tab
- Refresh the page
- Check if any files are failing to load (red status)

### 8. Try Hard Refresh
- **Windows/Linux**: `Ctrl + F5` or `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

## Common Issues

### Issue: "Cannot find module"
**Solution**: Run `npm install` in the frontend folder

### Issue: "Port 3000 already in use"
**Solution**: 
```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in vite.config.js
```

### Issue: Tailwind CSS not loading
**Solution**: 
- Verify `postcss.config.js` exists
- Verify `tailwind.config.js` exists
- Restart dev server

### Issue: API errors blocking render
**Solution**: The app should still render even if API fails. Check console for specific errors.

## Still Not Working?

1. Check the browser console for specific error messages
2. Verify all files are saved
3. Try restarting the dev server
4. Check if `index.html` exists in `frontend` folder
5. Verify `main.jsx` is in `frontend/src` folder

## Debug Information

The app now includes console logs:
- `🚀 Starting React application...`
- `✅ Root element found`
- `📦 Rendering React app...`
- `✅ React app rendered successfully!`
- `📱 App component rendering...`
- `🏠 Home component rendering...`

If you don't see these in the console, React isn't loading at all.
