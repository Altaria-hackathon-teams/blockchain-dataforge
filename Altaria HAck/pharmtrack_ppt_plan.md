# 📊 PharmTrack — Hackathon PPT Implementation Plan
### *Predictive Pharmaceutical Tracking — Slide-by-Slide Blueprint*

---

## Presentation Meta

| Property | Value |
|---|---|
| **Title** | PharmTrack: AI × Blockchain Pharmaceutical Intelligence |
| **Duration** | 5–7 minutes (12 slides) |
| **Theme** | Dark background (`#0A0F1E`), Cyan (`#00D4FF`) + Purple (`#A855F7`) accents |
| **Font** | Space Grotesk (headlines) + Inter (body) |
| **Tone** | High-tech, mission-critical, urgent |

---

## Slide-by-Slide Plan

---

### SLIDE 1 — Title / Cover

**Layout:** Full bleed dark background, centered content

**Content:**
```
⛓ PharmTrack
─────────────────────────────────
Predictive Pharmaceutical Tracking
AI × Blockchain Supply Chain Intelligence
─────────────────────────────────
[Team Name] | [Hackathon Name] | April 2026
```

**Design:**
- Deep navy background with animated grid lines (screenshot from the app or replicate)
- Large cyan glow behind the chain icon
- Subtitle in purple gradient text
- Bottom bar: `LIVE DEMO AVAILABLE` badge in green

**Speaker Note:** *"What if we could predict an antibiotic shortage before it happens — and reroute supply in real-time? That's PharmTrack."*

---

### SLIDE 2 — The Problem (The Hook)

**Layout:** Dark card, 2-column: bold stat on left, pain point text on right

**Content:**
```
700,000 people die annually from
antibiotic-resistant infections.

The supply chain is BLIND.

• No real-time tracking of critical antibiotics
• No demand forecasting for resistance hotspots
• Cold-chain failures go undetected for hours
• Counterfeit drugs enter the supply chain undetected
```

**Visual:** Red-tinted world map with blinking hotspot dots on India, Africa, SE Asia

**Design:** Red accent `#ef4444` for the stat number. Rest in white/grey text.

**Speaker Note:** *"The WHO calls AMR — Antimicrobial Resistance — a silent pandemic. The root problem is an invisible supply chain."*

---

### SLIDE 3 — The Market Gap

**Layout:** 3-column stat cards (glassmorphism style)

**Content:**
```
$1.27 Trillion        70%                  48 Hours
Global pharma         Hospitals report     Average delay
supply chain          stockouts of         before a supply
market size           critical antibiotics  failure is detected
```

**Design:**
- Each stat in a dark glass card with a colored border (cyan, purple, orange)
- Icon above each number (💊 🏥 ⏱)
- Bottom tag: `"We fix the 48-hour blindspot."`

**Speaker Note:** *"The market is massive, the failure rate is high, and the detection window is too slow. This is our opportunity."*

---

### SLIDE 4 — Our Solution

**Layout:** Full-width, headline + 4 feature blocks

**Content:**
```
PharmTrack — One platform. Three superpowers.

🧠 AI Demand Prediction      ⛓ Blockchain Provenance
   Analyzes regional health      Every batch cryptographically
   data to forecast antibiotic   logged. Tamper-proof. Forever.
   demand spikes 24h ahead.

📡 Real-Time Routing          🔴 Live Risk Monitoring
   Calculates optimal delivery   Continuous Firestore stream —
   routes based on urgency       dashboard updates the instant
   and resistance patterns.      a new threat is detected.
```

**Design:** 2×2 grid of glass cards. Each card has a neon-colored top border (cyan for AI, purple for blockchain, green for routing, orange for monitoring).

**Speaker Note:** *"We built a system that sees risk before it becomes a crisis, traces every pill on-chain, and reroutes supply automatically."*

---

### SLIDE 5 — Tech Stack

**Layout:** Architecture diagram — horizontal flow with icons

**Content:**
```
FRONTEND                BACKEND                 DATA LAYER
────────────            ────────────            ────────────
React + Vite     →→→   Node.js/Express  →→→   Firebase
                                               Firestore
Glassmorphism           POST /predict-route    (Real-time DB)
Dark UI                 1.5s ML simulation
                                               Firebase Auth
Stitch MCP              Ethers.js              (Email login)
Design System           Mock TX Hash
                                               Blockchain
Real-time               AMR Resistance         Ganache Testnet
Firestore               Algorithm              (Local EVM)
Listener
```

**Design:**
- Three columns with dark glass panels
- Animated arrows (`→→→`) between layers in cyan
- Technology logos/icons beside each item
- Bottom: `"Fully modular — real ML / smart contracts can be swapped in"` in small italic text

**Speaker Note:** *"Every layer is intentionally modular. The simulated ML today becomes a real Python model tomorrow. The mock blockchain is Ganache today, Ethereum mainnet later."*

---

### SLIDE 6 — How It Works (The Happy Path)

**Layout:** Horizontal 5-step flow diagram

**Content (steps):**
```
1. HEALTH DATA INPUT       2. AI ANALYSIS              3. RISK SCORING
   Operator enters            Backend runs AMR-            0–100 Demand
   region, temperature,       Predict algorithm            Risk Score
   reported symptoms          (1.5s ML simulation)         calculated

                    ↓                        ↓

4. ROUTE OPTIMIZATION      5. LIVE LEDGER UPDATE
   Optimal antibiotic         Firestore push → React
   delivery path generated    real-time listener fires
   & logged to blockchain     → New card animates in
                               on left pane
```

**Design:**
- Horizontal numbered steps connected by arrows
- Step 5 has a `🔴 LIVE` badge
- Background: subtle circuit board pattern

**Speaker Note:** *"From health data to rerouted supply — in under 2 seconds. And every stakeholder sees it happen live."*

---

### SLIDE 7 — LIVE DEMO (The Show Stopper)

**Layout:** Full-screen screenshot of the running app OR a QR code to localhost

**Content:**
```
[ SCREENSHOT — Full Dashboard ]
Left Pane: Active Shipments Ledger
Right Pane: AI Command Center

↑ This is a live, working prototype.
```

**Key callouts (annotation arrows on screenshot):**
- Arrow 1 → `⛓ TX Hash` = Blockchain-logged
- Arrow 2 → Risk gauge = AI prediction (0–100)
- Arrow 3 → `🔴 LIVE` dot = Firestore real-time stream
- Arrow 4 → Gradient `ANALYZE` button = Backend API call

**Design:** Use the actual app screenshot. Add 4 annotation callout boxes in cyan.

> [!IMPORTANT]
> **Take a screenshot of your running app at `http://localhost:5173` after logging in and running one prediction. Use that as this slide's hero image.**

**Speaker Note:** *"Let me show you this live. [Open browser → submit health data → watch left pane update in real time]"*

---

### SLIDE 8 — The AI Engine (AMR-Predict Algorithm)

**Layout:** Dark code card on left, explanation on right

**Content (left — simplified pseudocode):**
```javascript
riskScore = 30  // baseline

if temperature > 35°C  → +20 (bacterial growth risk)
if symptoms include "resistant" → +30 (AMR flag)
if symptoms include "UTI/sepsis" → +18 (bacterial)
if urban/dense region  → +8

clamp(riskScore, 0, 100)

→ HIGH (>60): Air freight, expedited route
→ MEDIUM (31–60): Road freight, priority
→ LOW (≤30): Standard logistics
```

**Content (right):**
```
Why this matters:

✓ Resistance keywords trigger highest urgency
✓ Temperature models bacterial growth rates
✓ Urban density weights demand probability
✓ Designed to be swapped with real Python
  ML model (scikit-learn / TensorFlow)
```

**Design:** Left panel has JetBrains Mono font, green syntax highlighting, dark background. Right panel has bullet points with cyan check marks.

---

### SLIDE 9 — Blockchain Layer

**Layout:** 2-column: explanation left, mock transaction card right

**Content (left):**
```
Every shipment decision is
cryptographically logged.

• Batch ID generated on prediction
• Transaction hash via Ethers.js
  (Ganache testnet — free, instant)
• Immutable audit trail
• Tamper-proof chain of custody

Real-world upgrade path:
→ Deploy smart contract on Ethereum / Polygon
→ Each TX becomes a permanent on-chain record
→ Regulatory audit in seconds, not weeks
```

**Content (right — mock TX card):**
```
┌──────────────────────────────────────┐
│  BATCH-M7X2K-A3F                     │
│  ─────────────────────────────────   │
│  TX HASH                             │
│  0x4a7f3c9b...e8d2                  │
│                                      │
│  ROUTE  Mumbai → Delhi → District    │
│  RISK   87/100  ██████████ HIGH      │
│  STATUS ⚠ EXPEDITED                  │
│  TIME   14:47:32                     │
└──────────────────────────────────────┘
```

**Design:** Right card styled exactly like the app's ShipmentCard component (dark glass, cyan batch ID, purple TX hash).

---

### SLIDE 10 — Impact & Scale

**Layout:** 3 big impact statements + market expansion roadmap

**Content:**
```
What PharmTrack changes:

⏱ 48h → 2s    Detection of supply risk events
📍 Blind → Live  Full supply chain visibility
🔒 Paper → Chain  Counterfeit drug prevention

─────────────────────────────────────────

Roadmap:
Phase 1 (Now)   →  Prototype + Hackathon Demo
Phase 2 (3mo)   →  Real Python ML integration + Pilot with 1 hospital
Phase 3 (6mo)   →  Ethereum mainnet + Multi-region rollout
Phase 4 (12mo)  →  WHO / Government integration
```

**Design:**
- Top 3 stats use cyan color for the "after" number
- Roadmap is a horizontal timeline with milestone dots

---

### SLIDE 11 — Why We Win

**Layout:** Comparison table

**Content:**
```
                PharmTrack    Traditional ERP    Manual Tracking
─────────────────────────────────────────────────────────────────
Real-time data      ✅              ❌                  ❌
AI demand forecast  ✅              ❌                  ❌
Blockchain audit    ✅              ❌                  ❌
Sub-2s response     ✅              ❌                  ❌
Open/modular        ✅              ❌                  ❌
Cost               Low             $$$                 Free but blind
```

**Design:** Green checkmarks in cyan glow, red X marks, table header in purple. "PharmTrack" column has a glowing cyan left border.

---

### SLIDE 12 — Team + Call to Action

**Layout:** Centered, clean

**Content:**
```
Built in 10 hours. Deployable in 10 days.

[Team Member 1] — Full-Stack & Firebase
[Team Member 2] — AI/ML Algorithm Design
[Team Member 3] — UI/UX & Stitch Design System

─────────────────────────────────────────

🌐 Live Demo:  http://localhost:5173
📦 GitHub:     github.com/[your-repo]
📧 Contact:    bhanuprakaahs8@gmail.com

"Every delayed antibiotic shipment is a patient at risk.
 PharmTrack makes the invisible — visible."
```

**Design:**
- Quote in large italic cyan text at the bottom
- Team cards with initials in colored circles
- CTA links in glass pill badges

---

## Design System for Slides

Use these consistently in PowerPoint/Google Slides:

| Element | Value |
|---|---|
| **Background** | `#0A0F1E` (slide fill) |
| **Card fill** | `rgba(13,21,37,0.7)` → approximate as `#0D1525` at 80% opacity |
| **Primary accent** | `#00D4FF` (cyan) |
| **Secondary accent** | `#A855F7` (purple) |
| **Success** | `#22C55E` (green) |
| **Warning** | `#EF4444` (red) |
| **Body font** | Inter (download free from Google Fonts) |
| **Headline font** | Space Grotesk (download free from Google Fonts) |
| **Code font** | JetBrains Mono (for TX hashes, code blocks) |
| **Border style** | 1pt solid `#00D4FF` at 30% opacity |

---

## PowerPoint Build Order

1. Set slide background to `#0A0F1E` on all slides (Format Background → Solid Fill)
2. Download & install **Space Grotesk** and **Inter** from Google Fonts
3. Build slide 7 (Demo) first — take the app screenshot now while it's running
4. Use **rectangles with rounded corners** + **transparency** to simulate glass cards
5. Add a subtle **grid texture** as a background image (semi-transparent PNG)
6. Use **gradient fills** on buttons/key callouts (cyan → purple, left to right)
7. For the risk gauge on slide 8, use a **donut chart** in PowerPoint with custom colors

---

## Quick Execution Checklist

- [ ] Take app screenshot (login + dashboard + one prediction result)
- [ ] Download Space Grotesk + Inter fonts
- [ ] Set `#0A0F1E` background on master slide
- [ ] Build Title slide (Slide 1)
- [ ] Build Problem + Market slides (2, 3)
- [ ] Build Solution + Tech slides (4, 5, 6)
- [ ] Insert Demo screenshot (Slide 7) — **most important**
- [ ] Build AI + Blockchain deep-dives (8, 9)
- [ ] Build Impact + Comparison (10, 11)
- [ ] Build Team slide (12)
- [ ] Add transitions: **Fade** on all slides, **Wipe** on flow diagrams
- [ ] Practice the live demo segment (slide 7 → switch to browser)
