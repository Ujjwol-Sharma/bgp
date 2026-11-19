# BPG Academy — Decoupled Academic Sanctuary & Super Admin CMS

**Founder & Faculty Lead:** Bishnu Prasad Gautam (BPG Sir)  
*Over 12+ Years of Senior Secondary Academic Leadership • Decade-Long Higher Secondary Faculty Experience • Premier Engineering & Medical Entrance Mentorship*  
*M.Sc. Mathematics (Tribhuvan University, CGPA 3.9 / 4.0, Semester Topper with multiple 4.0 GPA semester records)*  
**Core Motto:** *"Focus on the **Concepts** Rather Than the **Problems**."*

---

## 1. Project Overview & Architecture

**BPG Academy** is an ultra-fast, decoupled educational platform designed for NEB Board Exams (SEE Class 10, Class 11, Class 12) and Engineering & Medical Entrances (After 12 IOE Pulchowk / CEE / KU).

The codebase is split into two independent applications operating under a unified schema:
1. **Public Student Sanctuary (`index.html`)**: Pure, distraction-free student portal with automated 6-digit Email OTP registration, tiered multi-class access gating, docked Automated KaTeX Concept Engine, mini Casio FX-991 scientific solver, and dedicated live class calendars. Zero admin code, secret hotkeys, or DOM clutter.
2. **Super Admin Command Center (`admin.html`)**: Isolated editorial dashboard with a soft, clean light palette (warm ivory `#FAF8F5`, crisp white cards `#FFFFFF`, subtle stone borders `#E8E1D7`, academic cobalt `#1E3A8A`, and warm amber `#B45309`). Features a visual theory editor with inline SVG diagrams, specification grid builder, scheduled live lecture engine, and a multi-class student pass manager. Accessible securely at `/admin` (Passkey: `bpg2026`).

```text
bpg-academy/
├── api/
│   ├── send-email-otp.js      # Serverless function: dispatches 6-digit OTP via Resend API (with local preview fallback)
│   └── verify-otp.js          # Serverless function: validates 6-digit OTP & issues signed session token
├── images/
│   └── bpg_sir.jpg            # High-resolution faculty portrait
├── index.html                 # Public Student Sanctuary (4 Portals, AI Concept Solver, Live Calendar)
├── admin.html                 # Super Admin CMS Command Center (Light Palette, Visual Studio, Pass Manager)
├── styles.css                 # Shared academic stylesheet (light ivory & dark slate themes)
├── script.js                  # Unified mathematical schema, SVG diagrams, and BroadcastChannel sync
├── server.js                  # Zero-dependency local Node.js HTTP server (serves static + API routes on :3000 & :5500)
├── vercel.json                # Production Vercel rewrites (/admin -> /admin.html) & security headers
├── package.json               # Minimal runtime scripts & dependencies
└── README.md                  # Comprehensive local run instructions & Vercel deployment manual
```

---

## 2. Core Features

### A. Tiered Multi-Class Access System
- **Single-Class Registration**: By default, student registration unlocks only their registered class (`Class 10`, `Class 11`, `Class 12`, or `After 12 Entrance`).
- **Additional Class Pass Gating**:
  - **2 Classes**: Rs. 50
  - **3 Classes**: Rs. 90
  - **All 4 Classes**: Rs. 100
- **Upgrade Modal**: Instant prompt with eSewa/Khalti (`984-1023889`) and direct WhatsApp verification link (`+977-9841023889`).
- **Super Admin Multi-Pass Management**: In Module 7 of `admin.html`, the admin can grant an **All-Access Pass (All 4 Classes)** or toggle individual class access per student with immediate real-time sync.

### B. After 12 (IOE Pulchowk / CEE / KU) Entrance Hub
- Full 5-tab academic portal:
  1. **Blueprint Grid**: 50-Marks IOE Pulchowk blueprint ($22 \times 1$ + $14 \times 2$ Marks).
  2. **Speed Hacks & Theory**: 10-second MCQ elimination rules, Wallis formula, L'Hôpital Maclaurin expansions, and King's definite integral property.
  3. **Live Class Calendar**: Interactive calendar filtering Free Community vs. Paid Distinction sessions.
  4. **Past Papers & Question Banks**: Downloadable formula sheets and 15-year Pulchowk past papers.
  5. **Ranker Batches**: Distinction and ranker membership tiers.

### C. Supercharged Visual Editor & Diagram Presets (`admin.html`)
- Inline embedding of vector SVG diagrams, KaTeX display formulas, and alert callouts:
  - `[IMAGE:align=center|caption=...|src=...]` with presets for **Circle Tangent Condition**, **First-Principle Convergence**, **3D Skew Lines**, and **3-Set Venn Diagram**.
  - `[TRAP:Common Examiner Mistake: ...]` red-pen warning callouts.
  - `[TIP:BPG Sir Concept Tip: ...]` amber concept tips.
- Real-time split-pane preview rendering KaTeX and rich markdown.

### D. Automated KaTeX Website & Concept Guide
- Docked at the bottom-right corner (`<button id="btnKaTexGuide">`): Instant-response guide covering how to use the website, where specific features are located, and how enrollment works.
- Features 6 ready-made interactive question chips with textbook-grade KaTeX mathematical formulas:
  1. 🧭 *Where can I find IOE Entrance past papers & speed hacks?*
  2. 💳 *How do I unlock 2 or more classes for Rs. 50 / Rs. 100?*
  3. 🎥 *Where is the live Zoom class schedule?*
  4. 📄 *Why is a paid PDF or recording locked?*
  5. 👨‍🏫 *Where can I verify BPG Sir's academic qualifications?*
  6. 🔑 *How does automated student ID verification work?*
- Also includes a built-in Casio FX-991 mini scientific calculator.

---

## 3. Local Execution Guide

The platform runs out-of-the-box with **zero external dependencies** using standard Node.js:

```bash
# Clone or navigate to the repository directory
cd bpg-academy

# Start the full-stack server
npm start
# or
node server.js
```

The server automatically initializes on two local ports:
- **Port 3000**: [http://localhost:3000/](http://localhost:3000/)
- **Port 5500**: [http://localhost:5500/](http://localhost:5500/)

### Local URLs:
- **Student Portal**: [http://localhost:3000/](http://localhost:3000/)
- **Super Admin CMS**: [http://localhost:3000/admin](http://localhost:3000/admin) (or `http://localhost:3000/admin.html`)
  - **Admin Email**: `admin@bpgmaths.edu.np`
  - **Master Passkey**: `bpg2026`

---

## 4. Automated Vercel Deployment Manual

Deploy to Vercel in 1 click or via the Vercel CLI:

### Option 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally (if not installed)
npm install -g vercel

# Deploy to preview
vercel

# Deploy directly to production
vercel --prod
```

### Option 2: GitHub / Vercel Git Integration
1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "BPG Academy complete decoupled build"
   git remote add origin https://github.com/<your-username>/bpg-academy.git
   git branch -M main
   git push -u origin main
   ```
2. Open [Vercel Dashboard](https://vercel.com/new).
3. Import the `bpg-academy` repository.
4. Framework Preset: **Other** (Root directory: `./`).
5. Click **Deploy**.

### Environment Variables (Optional for Live Production Email OTP):
In **Project Settings → Environment Variables** on Vercel:
- `RESEND_API_KEY`: Your Resend API key (e.g. `re_123456789`).
- `RESEND_FROM_EMAIL`: (Optional) Verified sender email (e.g. `BPG Academy <admissions@bpgmaths.edu.np>`).
- `OTP_SECRET`: (Optional) HMAC signing secret for session tokens.

> **Note:** If `RESEND_API_KEY` is not provided, the API automatically falls back to **Local Preview Mode** and displays a one-click **"Auto-Fill 6 Digits"** banner so students can test the full verification process seamlessly.

---

## 5. Security & Browser Data Protocol

- **Zero Admin Leaks**: No admin components, keydown listeners (`Ctrl+Shift+A`), or credentials exist inside `index.html`.
- **Live Sync Protocol**: State updates in the Super Admin CMS synchronize with all active student tabs immediately via the HTML5 `BroadcastChannel` (`bpg_maths_academy_live_sync`) and `localStorage` (`bpg_maths_academy_cms_v8`).
- **Security Headers**: Configured in `vercel.json` with `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, and strict `X-Robots-Tag: noindex, nofollow` on `/admin`.

---

&copy; 2026 BPG Academy &bull; Founded by Bishnu Prasad Gautam (BPG Sir).
