<p align="center">
  <img src="./img.png" alt="EligibleMe Banner" width="100%">
</p>

# EligibleMe 🎯

## Basic Details

### Team Name: TinkerHub

### Team Members
- Member 1: Arshina - [Your College]
- Member 2: [Name] - [College]

### Hosted Project Link
[https://github.com/Arshina014/EligibleMe](https://github.com/Arshina014/EligibleMe)

### Project Description
EligibleMe is a web application that helps Indian citizens instantly discover government welfare schemes they are eligible for. Users fill in their personal profile — age, income, gender, occupation, category — and the app matches them with relevant central government schemes from a database of 89+ schemes across 8 sectors.

### The Problem Statement
Millions of Indians miss out on government welfare schemes they are legally entitled to — because they don't know these schemes exist, don't know if they qualify, or can't navigate complex government portals. Awareness is the biggest barrier between citizens and their benefits.

### The Solution
EligibleMe solves this with a simple eligibility checker — enter your details, get matched schemes instantly. It also includes a sector-wise scheme browser, an AI chatbot for queries in plain language, and a WhatsApp notification widget to alert users about upcoming deadlines and new schemes.

---

## Technical Details

### Technologies/Components Used

**For Software:**
- **Languages used:** Python, JavaScript, HTML5, CSS3
- **Frameworks used:** Flask (Python backend)
- **Libraries used:** flask-cors, Inter (Google Fonts)
- **Tools used:** VS Code, Git, GitHub, Python venv

---

## Features

- 🔍 **Eligibility Checker** — Fill in your profile and instantly see all matching government schemes
- 📋 **Browse & Filter Schemes** — Explore 89+ schemes filtered by sector (Education, Agriculture, Health, Women Welfare, Startups, Employment, Senior Citizens, Disability)
- 🔎 **Smart Search** — Search schemes by name or keyword in real time
- 🤖 **AI Chatbot Assistant** — Ask questions about schemes in plain language (e.g. "schemes for farmers", "what is PM Kisan?")
- 📱 **WhatsApp Alerts Widget** — Subscribe with your phone number to get deadline & new scheme notifications on WhatsApp
- 🗂️ **Scheme Detail Modal** — View full details: benefits, eligibility criteria, required documents, deadlines, and official apply link
- 🌐 **Fully Responsive** — Works seamlessly on mobile and desktop

---

## Implementation

### For Software:

#### Installation
```bash
# 1. Clone the repository
git clone https://github.com/Arshina014/EligibleMe.git
cd EligibleMe

# 2. Create and activate a virtual environment
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt
```

#### Run
```bash
python main.py
```
Then open **http://localhost:5000** in your browser.

> **Note:** Always open via `http://localhost:5000`, not by double-clicking `index.html`, so the API calls work correctly.

---

## Project Documentation

### For Software:

#### Screenshots (Add at least 3)

![Screenshot1](screenshots/homepage.png)
*Homepage — EligibleMe landing page with emerald green dark theme, hero section and stats*

![Screenshot2](screenshots/eligibility_checker.png)
*Eligibility Checker — User form with profile fields; results show matched schemes instantly*

![Screenshot3](screenshots/browse_schemes.png)
*Browse Schemes — Sector filter chips, search bar, and scheme cards with benefits and apply button*

![Screenshot4](screenshots/scheme_modal.png)
*Scheme Detail Modal — Full scheme info including eligibility criteria, required documents and last date*

![Screenshot5](screenshots/whatsapp_widget.png)
*WhatsApp Alert Widget — Subscribe with a phone number to get deadline & scheme notifications*

#### Diagrams

**System Architecture:**

```
User Browser
     │
     ▼
┌─────────────────────────────┐
│        Flask Server         │
│       (main.py :5000)       │
│                             │
│  ┌─────────┐  ┌──────────┐  │
│  │  Static │  │   API    │  │
│  │  Files  │  │  Routes  │  │
│  │(HTML/JS/│  │/api/check│  │
│  │  CSS)   │  │/api/schem│  │
│  └─────────┘  │/api/chat │  │
│               └────┬─────┘  │
│                    │        │
│            ┌───────▼──────┐ │
│            │ schemes.json │ │
│            │ (89 schemes) │ │
│            └──────────────┘ │
└─────────────────────────────┘
```

**Application Workflow:**

```
User Visits http://localhost:5000
           │
           ▼
    Flask serves index.html
           │
           ▼
   ┌───────────────────┐
   │  Fill Eligibility │
   │  Form (age,income,│
   │  gender, etc.)    │
   └─────────┬─────────┘
             │ POST /api/check
             ▼
   ┌───────────────────┐
   │  check_eligibility│
   │  loops through 89 │
   │  schemes, matches │
   │  against criteria │
   └─────────┬─────────┘
             │
             ▼
   ┌───────────────────┐
   │ Display matched   │
   │ scheme cards with │
   │ benefits + links  │
   └───────────────────┘
```

---

## Additional Documentation

### API Documentation

**Base URL:** `http://localhost:5000`

#### Endpoints

**GET /**
- **Description:** Serves the main HTML page (index.html)
- **Response:** HTML page

---

**GET /api/schemes**
- **Description:** Returns all schemes, with optional filtering
- **Parameters:**
  - `sector` (string, optional): Filter by sector name (e.g. `Education`, `Agriculture`)
  - `search` (string, optional): Keyword search in name and description
- **Response:**
```json
{
  "schemes": [...],
  "count": 89
}
```

---

**GET /api/sectors**
- **Description:** Returns all available sectors with scheme counts
- **Response:**
```json
{
  "sectors": ["Agriculture", "Disability", "Education", "..."],
  "counts": { "Education": 15, "Agriculture": 12, "..." }
}
```

---

**POST /api/check**
- **Description:** Checks user profile against all schemes and returns eligible ones
- **Request Body:**
```json
{
  "age": 22,
  "gender": "female",
  "income": 200000,
  "occupation": "student",
  "category": "obc",
  "disability": "no",
  "education": "graduate",
  "marital_status": "single",
  "state": "Maharashtra"
}
```
- **Response:**
```json
{
  "eligible_schemes": [...],
  "count": 14,
  "user_profile": { "age": 22, "..." }
}
```

---

**POST /api/chatbot**
- **Description:** Processes a natural language query and returns a relevant scheme response
- **Request Body:**
```json
{
  "message": "schemes for farmers"
}
```
- **Response:**
```json
{
  "response": "📋 **Agriculture Schemes** (12 found):\n\n• **PM Kisan**: ..."
}
```

---

## Project Demo

### Video
[Add your demo video link here — YouTube or Google Drive]

*Demo shows the eligibility checker in action: user fills the form, matched schemes appear, chatbot answers a query, and the WhatsApp widget subscribes a number successfully.*

### Live Site
[https://github.com/Arshina014/EligibleMe](https://github.com/Arshina014/EligibleMe)

---

## AI Tools Used

**Tool Used:** Antigravity (Google DeepMind AI Coding Assistant)

**Purpose:** Assisted with development across the full project
- Built the Flask backend with eligibility matching logic
- Designed the emerald green dark UI theme with glassmorphism
- Implemented the chatbot, WhatsApp widget, and scheme modal
- Refactored the project from frontend/backend subfolders to a flat single-folder structure
- Generated the `.gitignore`, `requirements.txt`, and this `README.md`

**Percentage of AI-assisted code:** ~60%

**Human Contributions:**
- Project concept and problem statement
- Schemes dataset curation (`schemes.json` — 89 schemes)
- Design direction (emerald green theme, branding as EligibleMe)
- Feature decisions (WhatsApp widget, chatbot prompts)
- Testing and feedback

---

## Team Contributions

- **Arshina:** Project lead, ideation, schemes dataset, UI/UX direction, testing and deployment
- **[Member 2]:** [Contributions]

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ at TinkerHub
