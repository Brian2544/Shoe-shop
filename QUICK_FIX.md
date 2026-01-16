# Quick Fix for Blank Page

## Step 1: Check Browser Console
1. Open your browser
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Look for any **red error messages**
5. **Take a screenshot** or copy the errors

## Step 2: Verify Dev Server is Running

Open a terminal and run:
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

If you see errors, share them.

## Step 3: Check if Files are Loading

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Refresh the page (F5)
4. Look for files with **red status codes** (404, 500, etc.)
5. Check if `main.jsx` is loading

## Step 4: Clear Cache and Restart

```bash
# Stop the dev server (Ctrl+C)
# Then:
cd frontend
rm -rf node_modules/.vite  # Clear Vite cache
npm run dev
```

## Step 5: Check Dependencies

```bash
cd frontend
npm install
```

## Common Issues:

### Issue: "Cannot find module 'react'"
**Fix**: Run `npm install` in the frontend folder

### Issue: "Port 3000 already in use"
**Fix**: 
- Close other terminals running the dev server
- Or change port in `vite.config.js`

### Issue: White screen with no errors
**Possible causes**:
1. JavaScript is disabled (check browser settings)
2. React isn't mounting (check console for errors)
3. CSS isn't loading (check Network tab)

## What to Share:

1. **Browser console errors** (screenshot or copy/paste)
2. **Terminal output** from `npm run dev`
3. **Network tab** showing failed requests (if any)

## Quick Test:

If nothing works, try this minimal test:

1. Edit `frontend/src/App.jsx`
2. Replace everything with:
```jsx
function App() {
  return <div style={{padding: '50px', fontSize: '24px'}}>Hello World - React is Working!</div>
}
export default App
```

3. Save and refresh
4. If you see "Hello World", React is working and the issue is in the components
5. If you still see blank, React isn't mounting (check console errors)
