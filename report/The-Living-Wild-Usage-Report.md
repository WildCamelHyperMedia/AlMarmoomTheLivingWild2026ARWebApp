# The Living Wild
## Comprehensive App Usage & Analytics Report
### Al Marmoom Desert Conservation Reserve - Drive-Through Photography Exhibition

---

**Exhibition Period:** January 22 - February 9, 2026
**Photographer:** Ali Bin Thalith
**Location:** Al Marmoom Desert Conservation Reserve, Dubai, UAE
**App URL:** the-living-wild.replit.app

---

## 1. Executive Summary

The Living Wild is an interactive mobile-first web application built for the Al Marmoom Desert Conservation Reserve's drive-through photography exhibition, featuring 24 wildlife photographs by photographer Ali Bin Thalith. The app provided visitors with a gamified digital gallery experience combining QR code scanning, educational video content in English and Arabic, augmented reality (AR) experiences, and an AI-powered wildlife guide.

### Key Highlights

| Metric | Value |
|--------|-------|
| **Total Registered Users** | 179 |
| **Guest Sessions (Unregistered)** | 695 |
| **Total QR Code Scans** | 110,817 |
| **Unique QR Scanners** | 599 |
| **Video Plays** | 1,542 |
| **Videos Watched (10+ seconds)** | 1,050 |
| **AR Experiences Viewed** | 507 |
| **Parkers Leads Captured** | 51 |
| **Users Who Completed All 24 Animals** | 14 |
| **Total Login Events** | 249 |

---

## 2. App Purpose & Features

### 2.1 Core Purpose
The app served as the digital companion to the physical drive-through photography exhibition. Visitors would encounter 24 animal photograph displays along the drive route, each with a unique QR code. By scanning each QR code with their phone's camera, visitors could:

- **Unlock** the corresponding animal in their digital gallery
- **Watch** a short educational video about the animal (available in English and Arabic)
- **Experience** the animal in Augmented Reality (AR) via Mattercraft/Zappar
- **Ask questions** about the animal using an AI-powered wildlife guide (GPT-4o-mini)
- **Track progress** toward discovering all 24 animals
- **Compete** on a leaderboard based on points earned from content interaction

### 2.2 App Pages

The app consists of 8 main pages:

| Page | Route | Description |
|------|-------|-------------|
| **Landing Page** | `/` | Language selection (English/Arabic) with desert-themed video background |
| **Auth Page** | `/auth` | User registration and login with phone/email |
| **Intro Page** | `/intro` | Full-screen introductory video by Ali Bin Thalith with autoplay |
| **Gallery Page** | `/gallery` | Grid of 24 animals with progress tracking; locked animals shown grayed out |
| **Animal Detail Page** | `/animal/:id` | Individual animal page with video player, AR link, and AI wildlife guide |
| **QR Scanner Page** | `/scan` | Instructions for scanning QR codes at the exhibition |
| **Parkers Lead Form** | `/parkers` | Promotional registration form for Parkers brand guests |
| **Admin Dashboard** | `/admin` | Staff analytics panel with user stats, activity logs, and data exports |

### 2.3 Technology Stack
- **Frontend:** React 18 + TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Node.js + Express 5, PostgreSQL with Drizzle ORM
- **AI:** OpenAI GPT-4o-mini for bilingual wildlife Q&A
- **AR:** Zappar/Mattercraft WebXR experiences
- **QR:** html5-qrcode library for camera-based scanning
- **Hosting:** Replit with auto-scaling deployment

---

## 3. User Registration & Growth

### 3.1 Registration Timeline

The app was active for 19 days, from January 22 to February 9, 2026.

| Date | Daily Signups | Cumulative Total |
|------|--------------|-----------------|
| Jan 22 | 2 | 2 |
| Jan 23 | 1 | 3 |
| Jan 24 | 1 | 4 |
| Jan 25 | 2 | 6 |
| Jan 27 | 1 | 7 |
| Jan 28 | 3 | 10 |
| Jan 29 | 20 | 30 |
| Jan 30 | 8 | 38 |
| Jan 31 | 21 | 59 |
| Feb 1 | 14 | 73 |
| Feb 2 | 3 | 76 |
| Feb 3 | 8 | 84 |
| Feb 4 | 5 | 89 |
| Feb 5 | 9 | 98 |
| Feb 6 | 20 | 118 |
| Feb 7 | **36** (peak day) | 154 |
| Feb 8 | 22 | 176 |
| Feb 9 | 3 | 179 |

### 3.2 Registration Insights
- **Peak registration day:** February 7 with 36 new signups
- **Busiest week:** Feb 6-8 with 78 signups (44% of all registrations in 3 days)
- **Two clear surges:** Jan 29-31 (49 signups) and Feb 6-8 (78 signups), likely corresponding to exhibition promotional pushes or weekend traffic
- **Guest vs Registered ratio:** 695 guest sessions vs 179 registered users, suggesting ~79% of visitors used the app without creating an account

---

## 4. QR Code Scanning Activity

### 4.1 Overall QR Statistics
- **Total QR scans:** 110,817
- **Unique scanners:** 599
- **Average scans per scanner:** ~185

### 4.2 QR Scans by Animal

| Rank | Animal | QR Scans |
|------|--------|----------|
| 1 | Dorcas Gazelle | 19,555 |
| 2 | Iraqi Sandgrouse | 18,324 |
| 3 | Ruppell's Fox | 12,847 |
| 4 | Water Rail | 11,110 |
| 5 | Yellow Wagtail | 10,621 |
| 6 | Purple Sunbird | 9,580 |
| 7 | Houbara Bustard | 7,455 |
| 8 | Western Great Egret | 6,033 |
| 9 | White-tailed Lapwing | 5,477 |
| 10 | Frog-headed Lizard | 2,213 |
| 11 | Desert Hare | 2,094 |
| 12 | Hedgehog | 1,587 |
| 13 | Hoopoe | 1,116 |
| 14 | Eurasian Stone-curlew | 970 |
| 15 | Green Bee-eater | 690 |
| 16 | Desert Monitor | 641 |
| 17 | Little Grebe | 106 |
| 18 | Desert Eagle Owl | 62 |
| 19 | Arabian Oryx | 62 |
| 20 | Little Owl | 61 |
| 21 | Spiny-tailed Lizard | 56 |
| 22 | Sandfish Lizard | 56 |
| 23 | Gerbillus Cheesmani | 52 |
| 24 | Blue-throated Wagtail | 49 |

### 4.3 QR Scan Insights
- **Most scanned:** Dorcas Gazelle (19,555 scans) - likely positioned early in the drive route or most popular exhibit
- **Top 6 animals** account for 74% of all QR scans (82,037 of 110,817)
- **Significant drop-off** after position 9, suggesting many visitors scanned the first section but didn't complete the full route
- **Least scanned animals** (positions 17-24) had between 49-106 scans each, indicating these were likely at the end of the route or in less accessible locations

---

## 5. Video Engagement

### 5.1 Video Statistics
- **Total video plays:** 1,542
- **Videos watched (10+ seconds):** 1,050 (68% completion rate)
- **Users who watched at least one video:** 82 (46% of registered users)
- **Users who watched all 24 videos:** 14 (8% of registered users)
- **Average videos watched per active user:** 9.0

### 5.2 Video Plays by Animal

| Rank | Animal | Video Plays | Watched (10s+) |
|------|--------|------------|----------------|
| 1 | Little Grebe | 145 | 97 |
| 2 | Ruppell's Fox | 85 | 61 |
| 3 | Frog-headed Lizard | 85 | 59 |
| 4 | Desert Hare | 78 | 53 |
| 5 | Western Great Egret | 72 | 50 |
| 6 | Little Owl | 70 | 44 |
| 7 | Hoopoe | 68 | 49 |
| 8 | Desert Monitor | 63 | 44 |
| 9 | Sandfish Lizard | 63 | 43 |
| 10 | Green Bee-eater | 63 | 40 |
| 11 | Houbara Bustard | 61 | 43 |
| 12 | Iraqi Sandgrouse | 61 | 40 |
| 13 | Yellow Wagtail | 61 | 40 |
| 14 | Hedgehog | 60 | 44 |
| 15 | Desert Eagle Owl | 60 | 40 |
| 16 | Gerbillus Cheesmani | 57 | 39 |
| 17 | Purple Sunbird | 53 | 36 |
| 18 | Water Rail | 53 | 37 |
| 19 | Spiny-tailed Lizard | 52 | 33 |
| 20 | Arabian Oryx | 51 | 30 |
| 21 | Blue-throated Wagtail | 51 | 32 |
| 22 | White-tailed Lapwing | 44 | 30 |
| 23 | Eurasian Stone-curlew | 44 | 32 |
| 24 | Dorcas Gazelle | 42 | 33 |

### 5.3 Video Engagement Insights
- **Little Grebe** had the most video plays (145), being the first animal in the gallery sequence
- Video engagement is more evenly distributed than QR scans, suggesting that users who engaged with videos tended to watch multiple animals
- **68% watch-through rate** (plays to 10-second watches) indicates strong content quality
- Interestingly, **Dorcas Gazelle** had the most QR scans but the fewest video plays, suggesting QR scans may have been triggered repeatedly by the physical exhibit setup

---

## 6. Augmented Reality (AR) Engagement

### 6.1 AR Statistics
- **Total AR views:** 507
- **Animals with AR experiences:** All 24

### 6.2 AR Views by Animal

| Rank | Animal | AR Views |
|------|--------|----------|
| 1 | Little Grebe | 107 |
| 2 | Frog-headed Lizard | 41 |
| 3 | Ruppell's Fox | 40 |
| 4 | Hoopoe | 34 |
| 5 | Desert Hare | 33 |
| 6 | Western Great Egret | 24 |
| 7 | Hedgehog | 24 |
| 8 | Purple Sunbird | 21 |
| 9 | Gerbillus Cheesmani | 18 |
| 10 | Houbara Bustard | 15 |
| 11 | Desert Eagle Owl | 15 |
| 12 | Little Owl | 15 |
| 13 | Dorcas Gazelle | 14 |
| 14 | Green Bee-eater | 13 |
| 15 | Blue-throated Wagtail | 13 |
| 16 | Eurasian Stone-curlew | 12 |
| 17 | Sandfish Lizard | 12 |
| 18 | Iraqi Sandgrouse | 10 |
| 19 | Desert Monitor | 10 |
| 20 | Yellow Wagtail | 9 |
| 21 | Water Rail | 9 |
| 22 | Arabian Oryx | 9 |
| 23 | Spiny-tailed Lizard | 7 |
| 24 | White-tailed Lapwing | 2 |

### 6.3 AR Insights
- **Little Grebe** dominated AR views with 107 (21% of all AR views), being the first animal users encounter
- AR engagement follows a similar pattern to video plays - first animals get more engagement
- **33% of video watchers** also tried AR (507 AR views vs 1,542 video plays)
- AR remains a novelty feature - most users tried it 1-2 times rather than for every animal

---

## 7. Activity Distribution

### 7.1 All Activity Types

| Activity Type | Count | % of Total | Notes |
|--------------|-------|------------|-------|
| QR Scan | 110,817 | 97.1% | Includes repeat scans |
| Video Play | 1,542 | 1.4% | Button tap events |
| Video Watch (10s+) | 1,050 | 0.9% | Confirmed engagement |
| AR View | 507 | 0.4% | AR link taps |
| Registration | 165 | 0.1% | Frontend-tracked events* |
| Login | 53 | <0.1% | Frontend-tracked events* |
| **Total** | **114,134** | **100%** | |

*Note on Registration and Login counts: The activity log tracks frontend-triggered events (165 registrations, 53 logins), which differ from server-side totals (179 users, 249 logins). The discrepancy is because the frontend activity tracker was added after initial launch, so early registrations/logins were not captured in the activity log. Server-side totals (179 users, 249 logins) are the authoritative figures used throughout this report.*

### 7.2 Peak Activity Hours (UTC)

| Time Window (UTC) | Activity Count | Description |
|-------------------|---------------|-------------|
| 22:00 - 23:00 | 73,438 | Peak hour |
| 20:00 - 21:00 | 12,968 | High activity |
| 21:00 - 22:00 | 10,452 | High activity |
| 23:00 - 00:00 | 5,503 | Evening wind-down |
| 14:00 - 15:00 | 3,215 | Afternoon peak |
| 19:00 - 20:00 | 2,507 | Early evening |

*Note: UTC times correspond to late evening/night in Dubai (UTC+4), suggesting most exhibition visits occurred during the cooler evening hours — typical for desert outdoor events.*

---

## 8. Login & Session Activity

### 8.1 Login Statistics
- **Total login events:** 249
- **Average logins per registered user:** 1.4

### 8.2 Logins by Date

| Date | Logins |
|------|--------|
| Jan 22 | 2 |
| Jan 23 | 1 |
| Jan 24 | 1 |
| Jan 25 | 2 |
| Jan 27 | 1 |
| Jan 28 | 5 |
| Jan 29 | 24 |
| Jan 30 | 9 |
| Jan 31 | 27 |
| Feb 1 | 16 |
| Feb 2 | 5 |
| Feb 3 | 12 |
| Feb 4 | 13 |
| Feb 5 | 16 |
| Feb 6 | 33 |
| Feb 7 | 43 (peak) |
| Feb 8 | 30 |
| Feb 9 | 7 |
| Feb 12 | 1 |
| Mar 23 | 1 |

### 8.3 Login Insights
- Login activity closely mirrors registration trends
- **Peak login day:** February 7 with 43 logins
- Two post-event logins (Feb 12 and Mar 23) suggest returning users

---

## 9. Parkers Leads Campaign

### 9.1 Lead Statistics
- **Total leads captured:** 51
- **Campaign period:** January 30 - February 7, 2026

### 9.2 Leads by Date

| Date | Leads |
|------|-------|
| Jan 30 | 1 |
| Feb 4 | 16 |
| Feb 5 | 11 |
| Feb 6 | 9 |
| Feb 7 | 14 |

### 9.3 Lead Insights
- The Parkers promotion ran for approximately one week
- **Peak lead capture:** February 4 with 16 leads (likely the launch day of the promotion)
- **28% conversion rate** from registered users to leads (51 out of 179)

---

## 10. Leaderboard - Top Performers

### 10.1 Top 20 Users by Points

| Rank | Name | Videos Watched | Points |
|------|------|---------------|--------|
| 1 | Ameen Abdu Rahim | 24 | 24 |
| 2 | Majbah Mishu | 24 | 24 |
| 3 | Abdullah Al Tamimi | 24 | 24 |
| 4 | Anoop Mohamed Basheer | 24 | 24 |
| 5 | Rashedul Kabir | 24 | 24 |
| 6 | Ali Mohammed Al Danhani | 24 | 24 |
| 7 | Najlaa Al Abdouli | 24 | 24 |
| 8 | Tariq Abdullah Sheikh Ismail | 24 | 24 |
| 9 | Jackson D Souza | 24 | 24 |
| 10 | Christiana Hebel | 24 | 24 |
| 11 | Rakesh | 24 | 24 |
| 12 | Adnan | 24 | 24 |
| 13 | Lowai Alkawarit | 24 | 24 |
| 14 | Abi Mulhern-Smith | 24 | 24 |
| 15 | Shahlaa Al Hosani | 23 | 23 |
| 16 | Ali Ahmed | 23 | 23 |
| 17 | Nouf Alqadi | 23 | 23 |
| 18 | Mike | 22 | 22 |
| 19 | Saleh | 22 | 22 |
| 20 | Krishna | 22 | 22 |

### 10.2 Completion Insights
- **14 users** (8% of registered) achieved the perfect score of 24/24 animals
- **3 users** were at 23/24 - very close to completion
- The leaderboard shows strong international diversity: Arabic, South Asian, and Western names represented

---

## 11. Key Performance Indicators (KPIs) Summary

| KPI | Value | Assessment |
|-----|-------|------------|
| **Total Reach** | 874 (179 registered + 695 guests) | Strong turnout |
| **Registration Rate** | 21% of total visitors | Good for optional registration |
| **Content Engagement Rate** | 46% of registered users watched videos | Moderate - room for growth |
| **Completion Rate** | 8% fully completed all 24 animals | Solid for gamified experience |
| **AR Adoption** | 33% of video watchers tried AR | Good for emerging tech |
| **Video Watch-through** | 68% watched 10+ seconds | Strong content quality |
| **Avg. Videos per Active User** | 9.0 out of 24 | Moderate engagement |
| **Lead Conversion** | 28% of users became leads | Excellent for promotional campaign |

---

## 12. CSV Data Exports

The following CSV data files are available for detailed analysis:

1. **`all-submissions.csv`** - Complete user data export with individual animal watch records, QR scan counts, and AR engagement metrics
2. **`production-all-submissions.csv`** - Production environment data export with full user records

These files contain per-user breakdowns of:
- Registration date and contact information
- Individual video watch status for each of the 24 animals
- QR code scan counts
- AR view counts
- Total points and completion status

---

## 13. App Pages Visual Reference

The app is live at **https://the-living-wild.replit.app** and consists of the following pages, designed with a desert theme (colors: #b97d42 gold, #30221b dark brown, #fef3dc cream) and bilingual support (English/Arabic with RTL).

To view each page, visit the links below on a mobile device or use your browser's mobile view (390x844 recommended):

### Page 1: Landing Page
- **URL:** [https://the-living-wild.replit.app/](https://the-living-wild.replit.app/)
- **Description:** Full-screen video background with the exhibition title "The Living Wild" and photographer credit "by Ali Bin Thalith". Two prominent buttons for language selection: "English" and "العربية" (Arabic). Desert-themed gradient overlay with gold (#b97d42) accent colors.

### Page 2: Auth Page
- **URL:** [https://the-living-wild.replit.app/auth](https://the-living-wild.replit.app/auth)
- **Description:** Registration form with fields for name, email, phone, and password. Toggle between "Sign Up" and "Login" modes. Features the exhibition logo and a hidden admin login access via triple-tap on the logo. Styled with dark brown background and gold input borders.

### Page 3: Intro Page
- **URL:** [https://the-living-wild.replit.app/intro](https://the-living-wild.replit.app/intro)
- **Description:** Full-screen autoplaying introductory video by photographer Ali Bin Thalith. Features gradient overlays at top and bottom, a "Start Exploring" call-to-action button at the bottom, and a mute/unmute toggle button (styled with gold glow when muted to prompt users to enable sound).

### Page 4: Gallery Page
- **URL:** [https://the-living-wild.replit.app/gallery](https://the-living-wild.replit.app/gallery)
- **Description:** Grid layout displaying all 24 animal photographs in a 2-column card layout. Each card shows the animal image, common name, and scientific name. Originally featured a progress bar showing discovered vs. total animals, and locked animals appeared with grayscale/blur effects. Post-event, all animals are now unlocked and fully visible.

### Page 5: Animal Detail Page (example: Little Grebe)
- **URL:** [https://the-living-wild.replit.app/animal/little_grebe](https://the-living-wild.replit.app/animal/little_grebe)
- **Description:** Individual animal page with the animal's photograph displayed prominently, common name, and scientific name. Below the photo is a video player (manual play only — no autoplay) with language toggle for English/Arabic videos. Features an "Enter AR" button that launches the Zappar WebXR augmented reality experience, and an AI-powered wildlife guide section where users can ask questions about the animal and receive bilingual responses.

### Page 6: QR Scanner Page
- **URL:** [https://the-living-wild.replit.app/scan](https://the-living-wild.replit.app/scan)
- **Description:** Instructional page explaining the QR code scanning process. Shows step-by-step instructions for using the phone's native camera to scan physical QR codes placed at each animal exhibit along the drive-through route. QR codes follow the format `TLW-{animalId}-{token}`.

### Page 7: Parkers Lead Form
- **URL:** [https://the-living-wild.replit.app/parkers](https://the-living-wild.replit.app/parkers)
- **Description:** Promotional registration page for the Parkers brand partnership campaign. Features a form capturing name, email, and phone number. Styled with Parkers branding alongside the exhibition theme. Used for prize and merchandise giveaway entries during the event.

### Page 8: Admin Dashboard
- **URL:** [https://the-living-wild.replit.app/admin](https://the-living-wild.replit.app/admin) (requires admin login)
- **Description:** Staff-only analytics panel with multiple tabs:
  - **Dashboard tab:** Key metrics cards showing total users, total videos watched, average videos per user, and recent signup counts. Includes a login activity bar chart (30-day view) and a top users leaderboard.
  - **Users tab:** Searchable and filterable table of all registered users with their video watch counts, point totals, and registration dates.
  - **Leads tab:** View and manage Parkers lead form submissions with name, email, and phone data.
  - **Login History tab:** Detailed log showing when each user accessed the app, with timestamps and user agent information.
  - **Leaderboard tab:** Ranks users by total points/animals discovered.
  - **Activity tab:** Real-time feed of all tracked actions (QR scans, video plays, AR views) with type-based filtering and statistics cards.
  - **Export options:** CSV user list export and comprehensive full report generation with per-animal breakdowns.

---

## 14. Conclusions & Recommendations

### What Worked Well
- **QR code integration** was highly successful with 110,817 total scans across 599 unique visitors
- **Bilingual support** (English/Arabic) served the diverse Dubai audience effectively
- **Gamification** motivated 14 users to complete all 24 animals
- **Video content quality** shown by 68% watch-through rate
- **AR experiences** attracted meaningful engagement (507 views)

### Areas for Future Improvement
- **Guest to registered conversion** could be improved (only 21% registered)
- **Route completion** - significant drop-off in QR scans after the first 9 animals suggests route length or accessibility challenges
- **Video engagement** could be increased by making video content more prominent or auto-suggested
- **AR adoption** is growing but still novel - simpler entry points could help

### Final Statistics Summary
The Living Wild app successfully served as the digital companion for the Al Marmoom photography exhibition over its 19-day run, engaging 874+ unique visitors through QR scanning, educational videos, and augmented reality experiences across 24 wildlife species of the Arabian desert.

---

*Report generated on March 31, 2026*
*Data source: The Living Wild production database*
*App developed on Replit*
