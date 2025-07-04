# Instagram Basic Display API Setup

Since Instagram Login is not available, we'll use Instagram Basic Display API which is designed for consumer apps.

## Steps to Add Instagram Basic Display

1. **In Meta Developer Dashboard:**
   - Scroll down in the products list
   - Look for "Instagram Basic Display" (not "Instagram Login")
   - If you don't see it, click "View All Products" at the bottom
   - Click "Set up" on Instagram Basic Display

2. **Configure Instagram Basic Display:**
   - Add a new Instagram App ID
   - Set Display Name: "TicketBazaar"
   - Add Valid OAuth Redirect URIs:
     ```
     https://d306cb34-7ff8-4c43-be3f-5bc3dc3bf3fc-00-2tsp72f1ce0rb.sisko.replit.dev/api/auth/instagram/callback
     ```
   - Add Deauthorize Callback URL:
     ```
     https://d306cb34-7ff8-4c43-be3f-5bc3dc3bf3fc-00-2tsp72f1ce0rb.sisko.replit.dev/api/auth/instagram/deauth
     ```
   - Add Data Deletion Request URL:
     ```
     https://d306cb34-7ff8-4c43-be3f-5bc3dc3bf3fc-00-2tsp72f1ce0rb.sisko.replit.dev/api/auth/instagram/delete
     ```

3. **Get App Credentials:**
   - After setup, you'll get:
     - Instagram App ID (different from Facebook App ID)
     - Instagram App Secret
   - Use these in your .env file

4. **Required Permissions:**
   - user_profile
   - user_media (to check if user has posts)

## If Instagram Basic Display is Also Not Available

We can use Facebook Login instead, since it's available in your app. Users can link their Instagram accounts through Facebook. Would you like me to implement that instead?