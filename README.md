# SiteAudit Pro - AI Website Analytics

SiteAudit Pro is a modern React application that provides comprehensive website audits, traffic analysis, and SEO health checks using the Google Gemini API.

🔗 Live Demo: https://siteaudit-pro.vercel.app/

## Features
- 📊 **Traffic Analysis**: Visualize monthly visits and user engagement trends.
- 🌍 **Geo Distribution**: See where your traffic comes from.
- 🔍 **SEO Health**: Identify critical technical issues using real-time PageSpeed data.
- 🤖 **AI-Powered**: Uses Gemini Pro for intelligent market analysis and competitor insights.

## Getting Started

### 1. Download the Project
You can download the project files directly from the GitHub repository.
```bash
git clone https://github.com/your-username/siteaudit-pro.git
cd siteaudit-pro
```

### 2. Install Dependencies
Make sure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory of the project. You need a Google Gemini API Key.
```bash
# .env
API_KEY=your_google_gemini_api_key_here
```
*Note: Ensure your API key has access to the Gemini 1.5 Pro or similar models.*

### 4. Run Development Server
Start the local development server to view the app in your browser.
```bash
npm run dev
```
The app should now be running at `http://localhost:5173` (or similar port).

## Building for Production

To create an optimized production build:
```bash
npm run build
```
The output files will be generated in the `dist/` folder.

## Deployment

You can deploy the contents of the `dist/` folder to any static hosting service.

**Vercel:**
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root.
3. Add your `API_KEY` in the Vercel project settings.

**Netlify:**
1. Drag and drop the `dist` folder to Netlify Drop, or connect your GitHub repo.
2. Add `API_KEY` in Site Settings > Environment Variables.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS
- **AI**: Google Gemini API (@google/genai)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite

## License
MIT
