# Samvidha Event Deep Linking & Landing Portal 🚀

This is the official lightweight web landing page and deep-linking bridge for **Samvidha IARE**. It is built with vanilla HTML5, CSS3, and JavaScript, designed to be deployed to **Vercel** with 0 configuration.

---

## 🌟 How Deep Linking Works:

1. **When opened on Mobile (Android / iOS)**:
   - The web page automatically attempts to trigger the native Android app using:
     - `samvidha://event?id=<EVENT_ID>`
     - `intent://event?id=<EVENT_ID>#Intent;scheme=samvidha;package=com.zyratech.samvidha;end`
   - If the app is installed, it opens directly to the Event Details page!
   - If not installed, it shows the event details in a high-end web view and provides a 1-tap **"Get Android App"** button.

2. **When opened on Desktop / WhatsApp Web**:
   - Renders a responsive glassmorphic event card with all details (Date, Venue, Category, Club, Team format).
   - Generates an interactive **QR Code** on screen so the user can scan it with their phone camera to instantly jump to the event on mobile.

3. **Android App Links (`.well-known/assetlinks.json`)**:
   - `vercel.json` serves `/.well-known/assetlinks.json` with the required `application/json` headers so verified App Links work out of the box.

---

## 📦 How to Deploy to Vercel in 1 Minute:

### Option 1: Via Vercel CLI
```bash
# In the project directory:
cd web_portal
npx vercel
```
Follow the prompts (choose default settings). Vercel will give you a domain like `https://samvidha-events.vercel.app` (or your chosen project name).

### Option 2: Via GitHub & Vercel Dashboard
1. Push this `web_portal` directory to GitHub (or push the entire repo).
2. Go to [vercel.com](https://vercel.com) > **Add New Project**.
3. Set the **Root Directory** to `web_portal`.
4. Click **Deploy**.

---

## ⚙️ Custom Domain Configuration
Once deployed, if you have a custom domain (e.g. `events.samvidha.in` or `yourname-events.vercel.app`):
1. In `lib/widgets/event_share_modal.dart`:
   Update `EventShareService.vercelWebDomain = 'https://YOUR_VERCEL_DOMAIN.vercel.app';`
