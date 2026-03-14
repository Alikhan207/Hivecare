# HiveCare -- AI Rock Bee Conservation & Tribal Livelihood Platform

> **1st Place -- Department Level Innovation Challenge, CMRIT (Early 2026)**
> Problem statement issued by Gandhi Krishi Vignan Kendra (GKVK), University of Agricultural Sciences, Bengaluru
> Selected for institutional collaboration meeting with GKVK

---

## What It Does

HiveCare is India's first AI-powered conservation app for Apis dorsata (Rock Bees) -- serving three entirely different types of users on a single platform:

- **Urban citizens** who encounter hives near their homes
- **Tribal harvesters** who depend on wild honey for their livelihood
- **Researchers and government officials** studying bee migration and colony health

> A citizen scanning a hive on their balcony in Mumbai instantly feeds live ecological data to a researcher's command center in Delhi -- in real time, with no manual steps in between.

---

## The Three User Experiences

### Urban Citizen -- Hive Safety & Rescue
- 3-photo guided scan coached by the app (hive overview, bee close-up, location context)
- Gemini 1.5 Flash AI analysis via JSON-forced structured prompt engineering
- Species identification, colony behaviour assessment, color-coded safety verdict (Green / Yellow / Red)
- Precise safe distance in meters
- One-tap GPS-pinned ethical rescue dispatch -- no extermination, relocation only
- Citizen Scientist profile tracking every verified sighting contributed to the national database

### Tribal Harvester -- Livelihood & Market Access
- Dynamic brood-phase calendar cross-referencing GPS location, live weather API, and regional bloom data
- Identifies the precise safe harvest window -- prevents colony destruction during egg-laying season
- TRIFED price transparency screen: Rs.725/kg government floor vs Rs.850/kg certified sustainable premium
- Direct WhatsApp Connect button to nearest verified TRIFED collection center
- Eliminates middleman exploitation -- enables up to 4x income increase from the same harvest

### Researcher / Government -- Ecological Surveillance
- Live WebSocket-triggered sighting alerts the moment any citizen submits a scan
- 90-day migration heatmap tracking colony movement
- Colony status analytics: Calm / Agitated / Shimmering
- Human verification layer creating a citable ground-truth dataset for academic research
- CSV export pipeline for government and academic integration
- Geographic alert system for pushing safety warnings to citizens in specific zones

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Capacitor (Android) |
| Database | Supabase (real-time WebSocket) |
| AI | Gemini 1.5 Flash |
| Prompt Engineering | JSON-Forced Dictation (structured output) |
| Image Processing | HTML Canvas (Base64 compression) |
| Maps | GPS integration |
| Charts | CSS-native (zero heavy library imports) |
| Network Resilience | 3-strike retry loop |

---

## Architecture Highlights

- **Android OS hardware permission handshake** via Capacitor Core -- prevents camera blocking on Android devices
- **Base64 image compression** via HTML canvas before AI submission -- no gallery bloat, lightweight processing
- **JSON-Forced Dictation prompt** tells Gemini to respond only in a specific JSON format (species, confidence score, behaviour assessment, safe distance, environment description) -- forces structured output React can cleanly map to UI cards
- **WebSocket trigger** fires automatically when citizen saves a sighting -- live alert appears in Researcher Dashboard instantly, no manual refresh
- **3-strike network retry loop** -- waits 3 seconds and retries up to 3 times before showing error, built for poor-connectivity field conditions
- **CSS-native charts** -- migration heatmap and analytics built with CSS radial gradients and dynamic array mapping, no Chart.js or heavy charting library

---

## Awards & Recognition

- **1st Place** -- Department Level Innovation Challenge, CMRIT (Early 2026)
- Problem statement issued by **Gandhi Krishi Vignan Kendra (GKVK)**, University of Agricultural Sciences, Bengaluru
- Prototype approved and **selected for institutional collaboration meeting with GKVK**

---

## Team

- **Mohammed Ali Khan** (Founder & Lead) -- [github.com/Alikhan207](https://github.com/Alikhan207)
- **Tanvik** (Co-developer) -- [github.com/tanvik21](https://github.com/tanvik21)

---

## How To Run

```bash
# Clone the repo
git clone https://github.com/Alikhan207/hivecare-ak
cd hivecare-ak

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Gemini API key and Supabase credentials

# Run development server
npm run dev

# Build for Android
npx cap build android
```

## Environment Variables

```env
VITE_GEMINI_API_KEY=your_gemini_key_here
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

---

## The One-Line Summary

> HiveCare is an enterprise-grade ecological field surveillance system wrapped in a friendly, gamified interface -- where citizen science, tribal livelihood protection, and government-grade research infrastructure are unified in a single mobile app.
