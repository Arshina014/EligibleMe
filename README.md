<div align="center">

# EligibleMe

### *Know Your Rights, Claim Your Benefits*

**EligibleMe** is a government scheme eligibility checker that helps Indian citizens instantly discover central government schemes they qualify for — based on age, income, gender, occupation, category, education, and more.

[![Python](https://img.shields.io/badge/Python-3.x-blue?style=flat-square&logo=python)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1-black?style=flat-square&logo=flask)](https://flask.palletsprojects.com)
[![HTML5](https://img.shields.io/badge/HTML5-CSS3-orange?style=flat-square&logo=html5)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![GitHub Repo](https://img.shields.io/badge/GitHub-EligibleMe-green?style=flat-square&logo=github)](https://github.com/Arshina014/EligibleMe)

</div>

---

## Features

- **Eligibility Checker** — Enter your profile details and instantly see all matching government schemes
- **Browse Schemes** — Explore 89+ schemes filtered by sector (Education, Agriculture, Health, Women Welfare, etc.)
- **Smart Search** — Search schemes by name or keyword in real time
- **Scheme Detail Modal** — View full scheme info: benefits, eligibility criteria, required documents, deadlines, and apply link
- **AI Chatbot Assistant** — Ask questions about schemes in plain language
- **WhatsApp Alert Widget** — Subscribe with your phone number to receive scheme deadline & update notifications
- **Responsive Design** — Works on desktop and mobile
- **Emerald Green Dark Theme** — Premium UI with smooth animations and glassmorphism

---

## Project Structure

```
EligibleMe/
├── main.py            # Flask backend — serves frontend + all API routes
├── index.html         # Main UI (single page)
├── app.js             # Frontend JavaScript logic
├── styles.css         # Styling — emerald green dark theme
├── schemes.json       # Dataset of 89 government schemes
├── requirements.txt   # Python dependencies
├── .gitignore         # Git ignore rules (venv, pycache, .env, etc.)
└── venv/              # Python virtual environment (not committed to Git)
```

---

## Setup & Run

### 1. Clone the repository
```bash
git clone https://github.com/Arshina014/EligibleMe.git
cd EligibleMe
```

### 2. Create and activate a virtual environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the app
```bash
python main.py
```

### 5. Open in your browser
```
http://localhost:5000
```

> **Note:** Always open via `http://localhost:5000` — not by double-clicking `index.html` — so the API calls work correctly.

---

## API Endpoints

| Method | Endpoint        | Description                                      |
|--------|-----------------|--------------------------------------------------|
| GET    | `/`             | Serves the main HTML page                        |
| GET    | `/api/schemes`  | List all schemes (optional `sector` / `search` query params) |
| GET    | `/api/sectors`  | List all sectors with scheme counts              |
| POST   | `/api/check`    | Check eligibility — send user profile as JSON    |
| POST   | `/api/chatbot`  | Chatbot — send `{ "message": "..." }` as JSON    |

### Example — Check Eligibility
```bash
curl -X POST http://localhost:5000/api/check \
  -H "Content-Type: application/json" \
  -d '{
    "age": 22,
    "gender": "female",
    "income": 200000,
    "occupation": "student",
    "category": "obc",
    "disability": "no",
    "education": "graduate",
    "marital_status": "single",
    "state": "Maharashtra"
  }'
```

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Backend    | Python 3 + Flask + flask-cors     |
| Frontend   | HTML5, Vanilla CSS, Vanilla JS    |
| Data       | JSON (89 central government schemes) |
| UI Theme   | Emerald green dark mode, glassmorphism |
| Font       | Inter (Google Fonts)              |

---

## Eligibility Criteria Supported

The checker matches users against scheme-specific criteria including:

- Age range (min / max)
- Gender (`male`, `female`, `all`)
- Annual income (maximum threshold)
- Occupation (`student`, `farmer`, `salaried`, `self-employed`, etc.)
- Category (`general`, `obc`, `sc`, `st`, `minority`)
- Disability status
- Education level (`10th pass`, `12th pass`, `graduate`, `post-graduate`, etc.)
- Marital status

---

## Sectors Covered

| Sector | Examples |
|---|---|
| Education | NSP, PM Scholarship, INSPIRE, Vidyalakshmi |
| Agriculture | PM Kisan, Fasal Bima Yojana, PM Krishi Sinchai |
| Women Welfare | Beti Bachao, Pradhan Mantri Matru Vandana |
| Health | Ayushman Bharat, PM Jan Arogya Yojana |
| Startups | Startup India, MUDRA Loan, Stand-Up India |
| Employment | PM Mudra, MGNREGA, Skill India |
| Senior Citizens | Vayoshri, Indira Gandhi Pension |
| Disability | ADIP, Deen Dayal Divyangjan |

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
Made with love for India
</div>
