# Google & Supabase Production OAuth Branding Guide

When deploying LynDesk to production, follow these steps to replace the default Supabase project domain (`dsqkxedafwzkjtcupzwx.supabase.co`) with your custom branded domain (e.g., `auth.lyndesk.com`) on the Google account login prompts.

---

## 1. Google Cloud Console Configuration
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **APIs & Services > OAuth consent screen**.
3. Edit your App Registration:
   - Set **App name** to `LynDesk`.
   - Upload the LynDesk logo.
   - Enter your **User support email** and **Developer contact email**.
   - Under **Authorized domains**, add your root domain (e.g., `lyndesk.com`).
4. Click **Save and Continue**.

---

## 2. Supabase Custom Domain Routing
To mask the raw Supabase URL on redirect:
1. Log into the **Supabase Dashboard**.
2. Select your project and go to **Settings > Custom Domains** (requires a Pro tier project or custom proxy setup).
3. Set your custom auth subdomain (e.g., `auth.lyndesk.com`).
4. Add the generated CNAME and TXT verification records to your DNS provider (Cloudflare, GoDaddy, etc.).
5. Wait for SSL certification validation to complete.

---

## 3. Update Redirect Credentials
Once your custom domain (`auth.lyndesk.com`) is active:
1. Return to the **Google Cloud Console > Credentials > OAuth 2.0 Client IDs**.
2. Edit your Web Client Credentials.
3. Update the **Authorized redirect URIs**:
   - Change: `https://dsqkxedafwzkjtcupzwx.supabase.co/auth/v1/callback`
   - To: `https://auth.lyndesk.com/auth/v1/callback`
4. Update the **Site URL** settings in your Supabase Auth Settings console to point to `https://lyndesk.com`.
5. Update your frontend environment variables in `.env.local` or Vercel:
   - Change `NEXT_PUBLIC_SUPABASE_URL` to your custom domain endpoint.
