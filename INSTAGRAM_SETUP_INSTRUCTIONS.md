# Instagram OAuth Setup Instructions

## The Issue
The "Invalid platform app" error means your Instagram App isn't configured for OAuth login.

## Your OAuth Redirect URI
Your app's redirect URI is:
```
https://d306cb34-7ff8-4c43-be3f-5bc3dc3bf3fc-00-2tsp72f1ce0rb.sisko.replit.dev/api/auth/instagram/callback
```

## Steps to Fix

### 1. Check Your App Type
- Go to [Meta for Developers](https://developers.facebook.com/apps/)
- Click on your app (ID: 1446343329866001)
- Check if it's a "Consumer" or "Business" app
- **Instagram Login only works with Consumer apps**

### 2. If You Have a Business App
You'll need to create a new Consumer app:
1. Click "Create App"
2. Choose "Consumer" as the app type
3. Fill in the app details

### 3. Add Instagram Login Product
1. In your app dashboard, click "+ Add Product" in the left menu
2. Find "Instagram Login" and click "Set Up"
3. Choose "Instagram Login" (NOT "Instagram Basic Display")

### 4. Configure Valid OAuth Redirect URIs
1. Go to Instagram Login > Settings
2. Add this exact URL to "Valid OAuth Redirect URIs":
   ```
   https://d306cb34-7ff8-4c43-be3f-5bc3dc3bf3fc-00-2tsp72f1ce0rb.sisko.replit.dev/api/auth/instagram/callback
   ```
3. Click "Save Changes"

### 5. Update App Settings
1. Go to Settings > Basic
2. Add to "App Domains":
   ```
   d306cb34-7ff8-4c43-be3f-5bc3dc3bf3fc-00-2tsp72f1ce0rb.sisko.replit.dev
   ```
3. Make sure "App ID" and "App Secret" match what you provided

### 6. Alternative Solution: Use Instagram Basic Display
If Instagram Login isn't available for your app, we can switch to Instagram Basic Display API. Let me know if you'd like to use that instead.

## Quick Test
After configuring, the login flow should work. The app will:
1. Redirect to Instagram
2. User authorizes the app
3. Instagram redirects back to your app
4. User is logged in

Please update your Meta Developer settings and try again!