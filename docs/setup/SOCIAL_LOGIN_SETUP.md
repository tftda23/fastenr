# Social Login Setup Guide

This guide will help you configure Google and GitHub OAuth for your Supabase project.

## 🎯 Why This Setup is Perfect for You

- **FREE**: Supabase social auth is included in the free tier
- **No Additional Costs**: Unlike Auth0 ($23/month) or Firebase Auth ($0.02/user)
- **Already Integrated**: Uses your existing Supabase setup
- **Scalable**: Handles thousands of users on free tier

## 📋 Setup Steps

### 1. Configure Supabase Dashboard

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `evyxabieyhopiraiyrna`
3. Navigate to **Authentication** → **Providers**

### 2. Setup Google OAuth

#### A. Create Google OAuth App
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Set Application type: **Web application**
6. Add Authorized redirect URIs:
   ```
   https://evyxabieyhopiraiyrna.supabase.co/auth/v1/callback
   ```
7. Copy the **Client ID** and **Client Secret**

#### B. Configure in Supabase
1. In Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google** and click **Enable**
3. Enter your Google **Client ID** and **Client Secret**
4. Save the configuration

### 3. Setup GitHub OAuth

#### A. Create GitHub OAuth App
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the details:
   - **Application name**: `fastenr`
   - **Homepage URL**: `http://localhost:3005` (for dev) or your production URL
   - **Authorization callback URL**: 
     ```
     https://evyxabieyhopiraiyrna.supabase.co/auth/v1/callback
     ```
4. Click **Register application**
5. Copy the **Client ID** and generate a **Client Secret**

#### B. Configure in Supabase
1. In Supabase Dashboard → **Authentication** → **Providers**
2. Find **GitHub** and click **Enable**
3. Enter your GitHub **Client ID** and **Client Secret**
4. Save the configuration

### 4. Update Environment Variables (Optional)

Add these to your `.env.local` for additional configuration:

```env
# OAuth Redirect URLs (for production)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 5. Test the Integration

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3005/auth/login`
3. You should see Google and GitHub login buttons
4. Test both providers

## 🔧 Additional Providers (Optional)

You can easily add more providers:

### Discord (Popular for developer tools)
- Free and easy to setup
- Great for developer-focused apps

### Microsoft/Azure AD (For enterprise)
- Good for B2B SaaS
- Supports organization domains

### Apple (For mobile-first apps)
- Required if you have iOS app
- Good for consumer apps

## 🚀 Production Checklist

Before going live:

1. ✅ Update OAuth redirect URLs to production domain
2. ✅ Test all social login flows
3. ✅ Verify user profile creation works
4. ✅ Test onboarding flow for new social users
5. ✅ Configure email templates in Supabase

## 🛡️ Security Notes

- OAuth redirect URLs are validated by Supabase
- User emails are automatically verified for social logins
- No additional security configuration needed
- Supabase handles all OAuth security best practices

## 💰 Cost Comparison

| Service | Cost | Notes |
|---------|------|-------|
| **Supabase** | **FREE** | ✅ What you're using |
| Auth0 | $23/month | ❌ Expensive |
| Firebase Auth | $0.02/user | ❌ Adds up quickly |
| AWS Cognito | $0.0055/user | ❌ Complex setup |

## 🎉 You're All Set!

Once configured, users can:
- Sign up with Google/GitHub instantly
- Skip email verification (auto-verified)
- Get redirected to onboarding for profile setup
- Enjoy seamless authentication experience

Need help? The social login buttons are already integrated into your login and signup forms!