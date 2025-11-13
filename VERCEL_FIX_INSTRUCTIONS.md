# Vercel Environment Variable Fix Instructions

## Problem Identified

The admin panel at https://spbgazebo.com/admin.html is failing with an "unexpected token 'A'" error because the Firebase Admin Key stored in Vercel's environment variables has unescaped newline characters in the JSON string.

## Root Cause

When JSON containing newlines (like private keys) is pasted directly into Vercel's environment variable UI, the newlines are preserved as actual newline characters instead of being escaped as `\n`. This breaks JSON parsing.

## Solution Implemented

I've updated the `/api/_firebase.js` file to handle multiple formats of the Firebase Admin Key:

1. **Properly escaped JSON** (works as-is)
2. **JSON with unescaped newlines** (automatically fixes them)
3. **Base64 encoded JSON** (automatically decodes)

## Steps to Deploy the Fix

### Option 1: Deploy Code Fix (Recommended)

1. **Commit and push the changes:**
   ```bash
   git add api/_firebase.js api/verify-auth.js api/stats.js
   git commit -m "Fix Firebase Admin Key parsing in Vercel environment"
   git push origin main
   ```

2. **Wait for Vercel auto-deployment** (usually 30-60 seconds)

3. **Test the admin panel** at https://spbgazebo.com/admin.html

### Option 2: Fix the Environment Variable in Vercel (Alternative)

If you prefer to fix the environment variable itself instead of relying on the code fix:

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Find `FIREBASE_ADMIN_KEY`** and click Edit

3. **Replace the current value** with one of these formats:

   **Format A: Properly Escaped JSON (Recommended)**

   Copy the entire contents from your local `.env` file's `FIREBASE_ADMIN_KEY` value (it's already properly formatted).

   **Format B: Base64 Encoded (Alternative)**

   Run this command locally to get a base64 version:
   ```bash
   cat firebase-admin-key.json | base64 | tr -d '\n'
   ```

   Then paste the base64 string as the value in Vercel.

4. **Also ensure these environment variables are set:**
   - `GOOGLE_CLIENT_ID`: `61610908293-qne996f7iqqo4121jp626mqov2s3cj1s.apps.googleusercontent.com`
   - `ADMIN_EMAILS`: `John.vujicic68@gmail.com,timnye2020@gmail.com,Jimmymarshall432@gmail.com`

5. **Redeploy** to apply the environment variable changes

## Verification Steps

After deploying, verify the fix works:

1. Open https://spbgazebo.com/admin.html
2. Click "Sign in with Google"
3. Use an authorized admin email (timnye2020@gmail.com)
4. You should see the admin dashboard with menu stats

## What the Code Fix Does

The updated `api/_firebase.js` now:

1. **Tries to parse the key as-is** (for properly formatted JSON)
2. **If that fails**, checks if it's base64 encoded and decodes it
3. **If still failing**, fixes unescaped newlines and tries again
4. **Provides detailed error logging** to help diagnose issues

## Debugging

If issues persist after deployment:

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Functions tab
   - Look for errors in `/api/stats` or `/api/verify-auth` logs

2. **Expected log messages:**
   - Success: "Firebase Admin SDK initialized successfully"
   - If fixing newlines: "Successfully parsed after fixing newlines"
   - If base64: "Attempting to decode from base64..."

3. **Common errors and fixes:**
   - "Missing GOOGLE_CLIENT_ID" → Add the environment variable in Vercel
   - "Missing ADMIN_EMAILS" → Add the environment variable in Vercel
   - "Invalid Firebase Admin Key format" → The key is corrupted, re-add it

## Testing Locally

To test the fix locally before deploying:

```bash
# Run the test script
node test-firebase-fix.js

# Or test the admin panel locally
npm run dev-server
# Then open http://localhost:3000/admin.html
```

## Summary

The code has been updated to handle various formats of the Firebase Admin Key, making it more robust against environment variable formatting issues. Deploy the code changes and the admin panel should work correctly.