# TBO OneSearch — Trip Orchestration Platform

> **Recommendation-first travel platform** that uses TBO Air & Hotel APIs to generate intelligent, complete trip recommendations — not just search results.

---

## 🎯 Problem Statement

Traditional travel search engines bombard users with **thousands of disconnected results** (flights on one page, hotels on another). Users are left to manually compare, calculate totals, and guess which combination is "best" — leading to decision fatigue and suboptimal bookings.

## 💡 Our Solution

**TBO OneSearch** accepts minimal input (origin, destination, dates, budget, traveler type) and returns **3–4 complete, ranked trip packages** — each combining outbound flights, return flights, and hotel stays — scored intelligently on:

- 💰 **Budget Elasticity** — How well does it fit your wallet? What trade-offs exist?
- 🛌 **Comfort Score** — Hotel star rating as a comfort proxy
- ⏰ **Time Utilization** — Does the flight schedule waste vacation days?
- 😴 **Fatigue Index** — Red-eye penalties, layover stress, transit time
- 🏷️ **Decision Tags** — "Safest Overall", "Best Value", "Most Comfortable", "Premium Choice"

Each trip card includes **risk summaries** and **budget elasticity insights** so the user can make an informed choice in seconds.

---

## 🏗️ Architecture

```
User Input (Origin, Destination, Dates, Budget, Persona)
           │
           ▼
   ┌───────────────────────────┐
   │   /api/orchestrate (POST) │  ← Next.js API Route
   │                           │
   │  1. fetchTBOAirData()     │  → TBO Air API (Auth + Search)
   │  2. fetchTBOHotelData()   │  → TBO Hotel API (Basic Auth + Search)
   │  3. Combine Flight×Hotel  │
   │  4. Score Combinations    │  → Persona Weights × Budget × Fatigue × Timing
   │  5. Rank & Tag Top 4      │  → Decision Simplifier
   │  6. Return JSON           │
   └───────────────────────────┘
           │
           ▼
   Frontend renders Trip Cards with scores, insights, and CTA
```

### Tech Stack

| Layer      | Technology                     |
|------------|--------------------------------|
| Frontend   | Next.js 16, React 19, Tailwind CSS 4 |
| Backend    | Next.js API Routes (Node.js)   |
| APIs       | TBO India Air API, TBO Hotel API v2.1 |
| Icons      | Lucide React                   |
| Deployment | Vercel (or localhost)          |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ installed
- **npm** v9+

### 1. Clone & Install

```bash
cd tbo-onesearch
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
TBO_AIR_USERNAME=tbohackathonnew
TBO_AIR_PASSWORD=Tboagency@123
TBO_HOTEL_URL=http://api.tbotechnology.in/TBOHolidays_HotelAPI/search
TBO_HOTEL_USERNAME=hackathontest
TBO_HOTEL_PASSWORD=Hac@98147521
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
npm run start
```

---

## 🧠 Orchestration Engine — Key Algorithms

### 1. Persona Weight Matrix

| Persona       | Budget | Comfort | Timing | Fatigue | Hotel |
|---------------|--------|---------|--------|---------|-------|
| Student       | 35%    | 15%     | 10%    | 10%     | 30%   |
| Family        | 20%    | 30%     | 20%    | 20%     | 10%   |
| Professional  | 15%    | 20%     | 35%    | 20%     | 10%   |
| Bachelors     | 25%    | 15%     | 25%    | 10%     | 25%   |

### 2. Fatigue Index

Penalizes flights departing before 6 AM (-15), arriving after 11 PM (-15), having layovers (-10 each), and long transit times >8h (-10).

### 3. Time Utilization Score

Deducts 20 points when arrival is after 3 PM (wastes Day 1) and 20 points when return departs before noon (cuts last day short).

### 4. Budget Elasticity

- Within budget → 100 score
- Up to 10% over → 80 score
- Beyond 10% → Heavy exponential penalty

Generates natural-language insights like: *"For ₹2,000 more, your comfort improves significantly."*

### 5. Confidence Match Score

```
ConfidenceScore = (BudgetScore × BudgetWeight) + (ComfortScore × ComfortWeight)
                + (TimingScore × TimingWeight) + (FatigueScore × FatigueWeight)
                + (HotelRating × HotelWeight)
```

### 6. Decision Simplifier Tags

- **Safest Overall** → Rank #1 by confidence
- **Best Value** → Under budget + 90%+ budget score
- **Most Comfortable** → 90%+ comfort OR fatigue score
- **Premium Choice** → 5-star hotel, over budget

---

## 📂 Project Structure

```
tbo-onesearch/
├── src/
│   └── app/
│       ├── api/
│       │   └── orchestrate/
│       │       └── route.ts        ← Orchestration engine (all scoring logic)
│       ├── page.tsx                ← Frontend UI (search form + trip cards)
│       ├── layout.tsx              ← Root layout with metadata
│       └── globals.css             ← Theme + design tokens
├── public/                         ← Static assets
├── .env.local                      ← API credentials (gitignored)
├── package.json                    ← Dependencies
├── tsconfig.json                   ← TypeScript config
├── next.config.ts                  ← Next.js config
└── README.md                       ← This file
```

---

## 🔌 TBO API Integration

| API               | Endpoint                                                    | Auth Method        |
|--------------------|-------------------------------------------------------------|--------------------|
| Air Authentication | `http://api.tektravels.com/Authenticate/ValidateAgency`     | JSON body credentials |
| Air Search         | `http://api.tektravels.com/Search/`                         | TokenId from auth  |
| Hotel Search       | `http://api.tbotechnology.in/TBOHolidays_HotelAPI/search`  | HTTP Basic Auth    |

**Fallback Pipeline:** If staging credentials return empty inventory or IP-based blocks, the engine gracefully falls back to test data so the UI never breaks.

---

## 🏆 Innovation Highlights

1. **Recommendation-first** — Not a search engine, but a trip advisor
2. **Persona intelligence** — Different weights for Students vs Families vs Professionals
3. **Fatigue-aware** — Penalizes red-eye flights and exhausting layovers
4. **Budget elasticity** — Doesn't just say "over budget" — explains the trade-off
5. **Decision-simplified** — Tags like "Safest Overall" eliminate analysis paralysis
6. **Risk transparency** — Every trip shows what can go wrong

---

## 🔮 Future Roadmap

- Real-time FareQuote + FareRule integration
- Multi-city trip orchestration
- AI-generated trip narratives
- Price prediction and booking timing suggestions
- User preference learning across sessions

---

## 📄 License

Built for the **TBO Hackathon 2026**. All API integrations use TBO-provided staging credentials.
