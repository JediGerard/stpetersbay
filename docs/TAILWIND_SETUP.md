# Tailwind CSS Setup Guide
## St. Peter's Bay Ordering System

**Date:** 2025-11-10
**Tailwind Version:** 3.4.17

---

## ⚠️ IMPORTANT: Never Use Tailwind CDN in Production

**DO NOT use:**
```html
<script src="https://cdn.tailwindcss.com"></script>
```

**Reasons:**
1. The CDN includes the entire Tailwind library (~3MB uncompressed)
2. No optimization or tree-shaking
3. Slower page load times
4. Not suitable for production environments
5. Official warning from Tailwind team

---

## ✅ Proper Tailwind Setup (Current Implementation)

### 1. Installation

Tailwind CSS is installed as a dev dependency:

```bash
npm install -D tailwindcss@3.4.17 postcss autoprefixer
```

### 2. Configuration Files

**tailwind.config.js:**
```javascript
module.exports = {
  content: [
    "./*.html",
    "./scripts/**/*.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

This tells Tailwind to scan all HTML files and JavaScript files in the `/scripts` directory for Tailwind classes.

### 3. Source CSS File

**css/input.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom animations and styles here */
```

This file includes Tailwind directives and any custom CSS needed for the project.

### 4. Build Scripts

**package.json:**
```json
{
  "scripts": {
    "build:css": "tailwindcss -i ./css/input.css -o ./css/output.css",
    "watch:css": "tailwindcss -i ./css/input.css -o ./css/output.css --watch"
  }
}
```

- **build:css** - One-time build (use before deployment)
- **watch:css** - Watch mode for development (auto-rebuilds on changes)

### 5. HTML Files

All HTML files reference the compiled CSS:

```html
<link rel="stylesheet" href="./css/output.css">
```

---

## 🔨 Development Workflow

### During Development

If you're actively editing HTML or adding new Tailwind classes:

```bash
npm run watch:css
```

This watches for changes and automatically rebuilds `css/output.css` whenever you modify HTML or CSS files.

### Before Deployment

Always rebuild the CSS before uploading to GoDaddy:

```bash
npm run build:css
```

This ensures you have the latest compiled CSS with only the classes you're actually using.

---

## 📦 Files to Upload to GoDaddy

When deploying to your production server, upload:

✅ **Required:**
- `/css/output.css` (compiled Tailwind CSS)
- All `.html` files
- `/scripts/*.js` files
- `/data/*.json` files

❌ **NOT Required (development only):**
- `/node_modules/` (NEVER upload this)
- `/css/input.css` (source file, not needed on server)
- `package.json`
- `package-lock.json`
- `tailwind.config.js`

---

## 🎨 Custom Styles

Custom animations and styles are defined in `/css/input.css` and compiled into `output.css`:

### Ordering Page Animations:
- `.fade-in` - Smooth fade-in effect
- `.cart-badge` - Pulsing animation for cart icon

### Dashboard Animations:
- `.new-order-flash` - Yellow flash for new orders
- `.modifier-add` - Green text for additions
- `.modifier-remove` - Red italic text for removals
- `.pulse` - Subtle pulse animation

To add new custom styles, edit `/css/input.css` and run `npm run build:css`.

---

## 🔄 Updating Tailwind Classes

If you add new Tailwind classes to your HTML files:

1. Save the HTML file
2. Run `npm run build:css` (or keep `watch:css` running)
3. Refresh your browser
4. The new styles will appear

Tailwind automatically includes only the classes you actually use, keeping the CSS file size small.

---

## 🐛 Troubleshooting

### Issue: Styles not applying

**Solution:**
1. Check that `css/output.css` exists
2. Run `npm run build:css`
3. Clear browser cache (Cmd+Shift+R)
4. Verify HTML has: `<link rel="stylesheet" href="./css/output.css">`

### Issue: New Tailwind classes not working

**Solution:**
1. Make sure the file is listed in `tailwind.config.js` content array
2. Run `npm run build:css`
3. Check for typos in class names

### Issue: CSS file too large

**Solution:**
Tailwind automatically removes unused classes. If the file is large, it means:
1. You're using many different Tailwind utilities (normal)
2. You need to run `npm run build:css` to purge unused styles

---

## 📊 File Size Comparison

### Using CDN (Bad):
- **Initial Load:** ~3MB (entire Tailwind library)
- **Unoptimized:** Includes thousands of unused classes

### Using Build Process (Good):
- **Production Build:** ~10-50KB (only what you use)
- **Optimized:** Only includes classes present in your HTML/JS

**Result:** 60-300x smaller file size! 🚀

---

## 🚀 Quick Reference Commands

```bash
# Install dependencies (one time)
npm install

# Build CSS for production
npm run build:css

# Watch CSS during development
npm run watch:css

# Start local server for testing
python3 -m http.server 8000
```

---

## 📝 Version History

- **v3.4.17** (Current) - Stable, production-ready
- Installed: 2025-11-10
- Last rebuilt: Check `css/output.css` timestamp

---

## 🔒 Best Practices Summary

1. ✅ **ALWAYS** use the build process, never CDN
2. ✅ **ALWAYS** run `npm run build:css` before deploying
3. ✅ **ALWAYS** upload `css/output.css` to production
4. ✅ **NEVER** upload `node_modules/` to production
5. ✅ Keep `tailwind.config.js` content array up to date
6. ✅ Use `npm run watch:css` during active development
7. ✅ Add custom styles to `css/input.css`, not inline

---

## 📞 Need Help?

If you encounter issues with Tailwind:
1. Check this document first
2. Verify `css/output.css` exists and is up to date
3. Run `npm run build:css` to regenerate CSS
4. Clear browser cache
5. Check browser console for errors
