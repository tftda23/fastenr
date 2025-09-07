# Social Login Setup Guide
## Google, Microsoft, and Apple OAuth Configuration

This guide will help you configure Google, Microsoft (Azure), and Apple OAuth for your Supabase project.

## 🎯 Why These Providers?

- **Google**: Most popular, highest conversion rates (~85% of users have Google accounts)
- **Microsoft**: Perfect for B2B SaaS, enterprise customers, Office 365 integration
- **Apple**: Required for iOS apps, growing user base, privacy-focused users

## 📋 Setup Overview

Your Supabase project: `evyxabieyhopiraiyrna`
Redirect URL: `https://evyxabieyhopiraiyrna.supabase.co/auth/v1/callback`

---

## 🔍 1. Google OAuth Setup

### A. Create Google OAuth Application

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select or create a project**:
   - Project name: `fastenr` or similar
   - Note your Project ID

3. **Enable APIs**:
   - Go to **APIs & Services** → **Library**
   - Search for and enable: **Google+ API** (or **People API**)

4. **Configure OAuth Consent Screen**:
   - Go to **APIs & Services** → **OAuth consent screen**
   - Choose **External** (unless you have Google Workspace)
   - Fill required fields:
     - App name: `fastenr`
     - User support email: your email
     - Developer contact: your email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if in development

5. **Create OAuth 2.0 Credentials**:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: `fastenr-web`
   - **Authorized redirect URIs**:
     ```
     https://evyxabieyhopiraiyrna.supabase.co/auth/v1/callback
     ```
   - For development, also add:
     ```
     http://localhost:3000/auth/callback
     ```

6. **Copy credentials**:
   - **Client ID**: `123456789-abc.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xyz...`

### B. Configure in Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/evyxabieyhopiraiyrna/auth/providers
2. Find **Google** and toggle **Enable**
3. Enter your **Client ID** and **Client Secret**
4. **Save** the configuration

---

## 🏢 2. Microsoft/Azure OAuth Setup

### A. Create Azure App Registration

1. **Go to Azure Portal**: https://portal.azure.com/
2. **Navigate to App Registrations**:
   - Search for "App registrations" in the top search bar
   - Click **New registration**

3. **Register Application**:
   - Name: `fastenr`
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URI: 
     - Type: **Web**
     - URI: `https://evyxabieyhopiraiyrna.supabase.co/auth/v1/callback`
   - Click **Register**

4. **Note Application Details**:
   - Copy **Application (client) ID**: `12345678-1234-1234-1234-123456789abc`
   - Copy **Directory (tenant) ID**: `87654321-4321-4321-4321-cba987654321`

5. **Create Client Secret**:
   - Go to **Certificates & secrets**
   - Click **New client secret**
   - Description: `fastenr-secret`
   - Expires: **24 months** (recommended)
   - Click **Add**
   - **Copy the secret VALUE immediately** (you won't see it again)

6. **Configure API Permissions**:
   - Go to **API permissions**
   - Click **Add a permission**
   - **Microsoft Graph** → **Delegated permissions**
   - Add: `email`, `openid`, `profile`
   - Click **Grant admin consent** (if you're admin)

### B. Configure in Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/evyxabieyhopiraiyrna/auth/providers
2. Find **Azure** and toggle **Enable**
3. Enter:
   - **Client ID**: Your Application (client) ID
   - **Secret**: Your client secret value
   - **URL**: Leave default or use `https://login.microsoftonline.com/common/v2.0`
4. **Save** the configuration

---

## 🍎 3. Apple OAuth Setup

### A. Create Apple App ID and Services ID

1. **Go to Apple Developer**: https://developer.apple.com/account/
   - You need a **paid Apple Developer account** ($99/year)

2. **Create App ID**:
   - Go to **Certificates, Identifiers & Profiles**
   - **Identifiers** → **App IDs** → **+**
   - App ID Prefix: Use your Team ID
   - Description: `fastenr`
   - Bundle ID: `com.yourcompany.fastenr` (reverse domain)
   - Capabilities: Check **Sign In with Apple**
   - Click **Continue** → **Register**

3. **Create Services ID**:
   - Go to **Identifiers** → **Services IDs** → **+**
   - Description: `fastenr Web`
   - Identifier: `com.yourcompany.fastenr.web`
   - Check **Sign In with Apple**
   - Click **Configure**:
     - Primary App ID: Select the App ID you created
     - Domains: `evyxabieyhopiraiyrna.supabase.co`
     - Return URLs: `https://evyxabieyhopiraiyrna.supabase.co/auth/v1/callback`
   - Click **Save** → **Continue** → **Register**

4. **Create Private Key**:
   - Go to **Keys** → **+**
   - Key Name: `fastenr Sign In Key`
   - Check **Sign In with Apple**
   - Click **Configure** → Select your App ID
   - Click **Save** → **Continue** → **Register**
   - **Download the .p8 file** (you can't download it again)
   - Note the **Key ID**

### B. Configure in Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/evyxabieyhopiraiyrna/auth/providers
2. Find **Apple** and toggle **Enable**
3. Enter:
   - **Services ID**: `com.yourcompany.fastenr.web`
   - **Team ID**: Your Apple Developer Team ID
   - **Key ID**: From the key you created
   - **Private Key**: Contents of the .p8 file (remove header/footer lines, keep only the base64 content)
4. **Save** the configuration

---

## ⚙️ 4. Enable Social Login in Your App

Once you've configured the providers in Supabase:

1. **Update auth config** in `lib/auth-config.ts`:
   ```typescript
   export const authConfig = {
     socialLogin: {
       enabled: true, // Enable social login
       providers: {
         google: {
           enabled: true, // Enable Google
           displayName: 'Google'
         },
         azure: {
           enabled: true, // Enable Microsoft
           displayName: 'Microsoft'
         },
         apple: {
           enabled: true, // Enable Apple (optional)
           displayName: 'Apple'
         }
       }
     }
   }
   ```

2. **Deploy and test** your application

---

## 🧪 5. Testing Your Integration

### Test Checklist:
- [ ] Google login works and creates user profile
- [ ] Microsoft login works and creates user profile  
- [ ] Apple login works (if enabled) and creates user profile
- [ ] Email verification is skipped for social logins
- [ ] Users are redirected to dashboard after login
- [ ] User data (name, email) is populated correctly

### Common Test Scenarios:
1. **New user signup** via each provider
2. **Existing user login** via each provider
3. **Account linking** (same email, different providers)
4. **Error handling** (denied permissions, network issues)

---

## 🚀 6. Production Deployment

### Before Going Live:

1. **Update redirect URIs** in all provider consoles to your production domain
2. **Remove test/development URIs** from production apps
3. **Enable production mode** in Google OAuth consent screen
4. **Test all providers** on production domain
5. **Monitor auth errors** in Supabase logs

### Security Notes:
- **Never commit** client secrets to version control
- **Rotate secrets** regularly (every 6-12 months)
- **Monitor failed login attempts** in provider dashboards
- **Set up alerts** for unusual authentication patterns

---

## 💰 Cost Summary

| Provider | Setup Cost | Ongoing Cost | Notes |
|----------|------------|--------------|-------|
| **Google** | Free | Free | ✅ Always free |
| **Microsoft** | Free | Free | ✅ Free for personal accounts |
| **Apple** | $99/year | Free | ⚠️ Requires Developer account |
| **Supabase Auth** | Free | Free | ✅ 50,000 MAU free tier |

---

## 🔧 Troubleshooting

### Common Issues:

**Google "redirect_uri_mismatch"**:
- Check exact match of redirect URI in Google Console
- Ensure HTTPS in production

**Microsoft "invalid_client"**:
- Verify Client ID and Secret are correct
- Check tenant ID configuration

**Apple "invalid_client"**:
- Verify Services ID matches exactly
- Check private key format (no headers/footers)
- Ensure domains are configured correctly

**Supabase "provider not enabled"**:
- Check provider is toggled ON in Supabase dashboard
- Verify credentials are saved correctly

---

## 📞 Need Help?

- **Google OAuth**: [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- **Microsoft OAuth**: [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- **Apple OAuth**: [Sign in with Apple](https://developer.apple.com/documentation/sign_in_with_apple)
- **Supabase Auth**: [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)

Once configured, your users will have a seamless login experience with their preferred provider!