# Troubleshooting Guide - React App Not Showing

## Quick Checks

### 1. Verify Development Server is Running
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

### 2. Check Browser Console
Open browser DevTools (F12) and check:
- **Console tab**: Look for red error messages
- **Network tab**: Check if files are loading (should see 200 status)
- **Elements tab**: Verify `<div id="root"></div>` exists

### 3. Verify Dependencies
```bash
cd frontend
npm install
```

### 4. Check Environment Variables
Create `frontend/.env` file:
```env
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here
VITE_API_URL=http://localhost:5000/api
```

**Note**: The app will work even without Supabase credentials (in demo mode).

## Common Issues

### Issue: Blank White Screen

**Solution 1**: Check browser console for errors
- Open DevTools (F12)
- Look for JavaScript errors
- Common errors:
  - `Cannot find module` → Run `npm install`
  - `Failed to fetch` → Check if backend is running
  - `Supabase error` → Check environment variables

**Solution 2**: Clear browser cache
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or clear cache in browser settings

**Solution 3**: Check if root element exists
- Open DevTools → Elements tab
- Search for `id="root"`
- Should see: `<div id="root"></div>`

### Issue: "Cannot find module" errors

**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port 3000 already in use

**Solution**: Change port in `vite.config.js`:
```js
server: {
  port: 3001, // Change to any available port
}
```

### Issue: Supabase Connection Errors

**Solution**: The app now works without Supabase! It will:
- Show a warning in console
- Run in demo mode
- Still display the UI (just without data)

To fix properly:
1. Create Supabase account
2. Create `.env` file with credentials
3. Restart dev server

### Issue: TailwindCSS not working

**Solution**:
```bash
cd frontend
npm install -D tailwindcss postcss autoprefixer
```

### Issue: React Router not working

**Solution**: Verify routes are set up correctly:
- Check `App.jsx` has `<Routes>` and `<Route>` components
- Verify `BrowserRouter` wraps the app in `main.jsx`

## Debug Steps

### Step 1: Test Basic React Render
Create a simple test file `frontend/src/Test.jsx`:
```jsx
export default function Test() {
  return <h1>React is working!</h1>
}
```

Import in `App.jsx` temporarily:
```jsx
import Test from './Test'
// ... in return:
<Test />
```

If this shows, React is working. If not, check:
- React/ReactDOM installation
- Browser console errors
- Build errors in terminal

### Step 2: Check Network Requests
1. Open DevTools → Network tab
2. Refresh page
3. Look for:
   - Failed requests (red)
   - 404 errors
   - CORS errors

### Step 3: Verify File Structure
```
frontend/
├── index.html          ← Must have <div id="root"></div>
├── src/
│   ├── main.jsx       ← Entry point
│   ├── App.jsx        ← Main component
│   └── index.css      ← Styles
```

## Still Not Working?

1. **Check terminal output** when running `npm run dev`
   - Look for compilation errors
   - Check for missing dependencies

2. **Try a different browser**
   - Chrome/Edge
   - Firefox
   - Safari

3. **Check Node.js version**
   ```bash
   node --version
   ```
   Should be 18+ for best compatibility

4. **Verify Vite is working**
   ```bash
   cd frontend
   npx vite --version
   ```

5. **Check for syntax errors**
   - Look for unclosed tags
   - Missing imports
   - Typos in component names

## Getting Help

If nothing works:
1. Share the browser console errors
2. Share the terminal output from `npm run dev`
3. Verify all files from the project are present
4. Check if you're in the correct directory (`frontend/`)
