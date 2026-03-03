from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
import re

# Serve static files (index.html, app.js, styles.css) from this same folder
app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# ── Load schemes ──
def load_schemes():
    schemes_path = os.path.join(os.path.dirname(__file__), 'schemes.json')
    with open(schemes_path, 'r', encoding='utf-8') as f:
        return json.load(f)

SCHEMES = load_schemes()


def check_eligibility(user, scheme):
    elig = scheme.get("eligibility", {})

    age = user.get("age", 0)
    if age < elig.get("age_min", 0) or age > elig.get("age_max", 999):
        return False

    gender = user.get("gender", "").lower()
    scheme_gender = elig.get("gender", "all").lower()
    if scheme_gender != "all" and gender != scheme_gender:
        return False

    income = user.get("income", 0)
    if income > elig.get("income_max", 9999999):
        return False

    occupation = user.get("occupation", "").lower()
    scheme_occupations = [o.lower() for o in elig.get("occupation", ["all"])]
    if "all" not in scheme_occupations and occupation not in scheme_occupations:
        return False

    category = user.get("category", "").lower()
    scheme_categories = [c.lower() for c in elig.get("category", ["all"])]
    if "all" not in scheme_categories and category not in scheme_categories:
        return False

    disability = user.get("disability", "no").lower()
    scheme_disability = elig.get("disability", "all").lower()
    if scheme_disability == "yes" and disability != "yes":
        return False

    education = user.get("education", "").lower()
    scheme_education = [e.lower() for e in elig.get("education", ["all"])]
    if "all" not in scheme_education and education not in scheme_education:
        return False

    marital = user.get("marital_status", "").lower()
    scheme_marital = elig.get("marital_status", "all").lower()
    if scheme_marital != "all" and marital != scheme_marital:
        return False

    return True


# ── Serve frontend ──
@app.route("/")
def index():
    return send_from_directory('.', 'index.html')


# ── API Routes ──
@app.route("/api/schemes", methods=["GET"])
def get_all_schemes():
    sector = request.args.get("sector", "").strip()
    search = request.args.get("search", "").strip().lower()

    results = SCHEMES
    if sector:
        results = [s for s in results if s["sector"].lower() == sector.lower()]
    if search:
        results = [s for s in results if search in s["name"].lower() or search in s["description"].lower()]

    return jsonify({"schemes": results, "count": len(results)})


@app.route("/api/sectors", methods=["GET"])
def get_sectors():
    sectors = sorted(set(s["sector"] for s in SCHEMES))
    sector_counts = {}
    for s in SCHEMES:
        sector_counts[s["sector"]] = sector_counts.get(s["sector"], 0) + 1
    return jsonify({"sectors": sectors, "counts": sector_counts})


@app.route("/api/check", methods=["POST"])
def check():
    user_data = request.json
    if not user_data:
        return jsonify({"error": "No data provided"}), 400

    matched = []
    for scheme in SCHEMES:
        if check_eligibility(user_data, scheme):
            matched.append(scheme)

    return jsonify({
        "eligible_schemes": matched,
        "count": len(matched),
        "user_profile": user_data
    })


# ── Chatbot Logic ──
CHATBOT_RESPONSES = {
    "greeting": [
        "Hello! 👋 I'm your EligibleMe assistant. I can help you find government schemes. Try asking me about schemes for students, farmers, women, or any other category!",
    ],
    "help": [
        "I can help you with:\n• Finding schemes by sector (education, agriculture, startups, etc.)\n• Searching for specific schemes by name\n• Understanding eligibility criteria\n• Knowing required documents\n\nJust ask me something like 'Show me schemes for farmers' or 'What is PM Kisan?'"
    ],
    "thanks": [
        "You're welcome! 😊 Feel free to ask if you need more help finding government schemes."
    ],
    "fallback": [
        "I'm not sure I understand. Try asking about:\n• Schemes for a specific group (students, farmers, women, etc.)\n• A specific scheme by name\n• Schemes in a sector (education, health, startups)\n• Or type 'help' for more options."
    ]
}

SECTOR_KEYWORDS = {
    "education": ["student", "scholarship", "education", "study", "college", "university", "school", "exam", "learn"],
    "women welfare": ["women", "woman", "girl", "female", "mahila", "beti", "matru", "mother", "pregnant", "lady"],
    "agriculture": ["farmer", "farm", "agriculture", "crop", "kisan", "krishi", "soil", "irrigation", "dairy", "fish", "livestock"],
    "startups": ["startup", "business", "entrepreneur", "msme", "loan", "mudra", "enterprise", "company"],
    "employment": ["job", "employ", "worker", "labour", "pension", "insurance", "skill", "apprentice", "career", "shram"],
    "senior citizens": ["senior", "old age", "elderly", "vayoshri", "retired", "retirement", "60 years"],
    "health": ["health", "hospital", "medical", "doctor", "ayushman", "treatment", "disease", "dialysis", "mental health", "immunization"],
    "disability": ["disability", "disabled", "handicap", "differently abled", "blind", "deaf", "wheelchair"]
}

def chatbot_respond(message):
    msg = message.lower().strip()

    if any(w in msg for w in ["hello", "hi", "hey", "namaste", "good morning", "good evening"]):
        return CHATBOT_RESPONSES["greeting"][0]

    if msg in ["help", "?", "what can you do", "options"]:
        return CHATBOT_RESPONSES["help"][0]

    if any(w in msg for w in ["thank", "thanks", "dhanyavaad", "shukriya"]):
        return CHATBOT_RESPONSES["thanks"][0]

    for scheme in SCHEMES:
        scheme_name_lower = scheme["name"].lower()
        if scheme_name_lower in msg or any(word in msg for word in scheme_name_lower.split() if len(word) > 4):
            return format_scheme_response(scheme)

    for sector, keywords in SECTOR_KEYWORDS.items():
        if any(kw in msg for kw in keywords):
            sector_schemes = [s for s in SCHEMES if s["sector"].lower() == sector]
            if sector_schemes:
                response = f"📋 **{sector.title()} Schemes** ({len(sector_schemes)} found):\n\n"
                for s in sector_schemes[:8]:
                    response += f"• **{s['name']}**: {s['benefits'][:80]}...\n"
                if len(sector_schemes) > 8:
                    response += f"\n...and {len(sector_schemes) - 8} more! Use the Browse section to see all."
                response += "\n\n💡 Click on any scheme card for full details, or ask me about a specific scheme!"
                return response

    if any(w in msg for w in ["eligible", "eligibility", "qualify", "can i get", "am i eligible"]):
        return "To check your eligibility, please use the **Check Eligibility** form above. Fill in your details like age, income, occupation, and category – I'll match you with the best schemes! 🔍"

    if any(w in msg for w in ["document", "documents", "papers", "required", "what do i need"]):
        return "📄 Most government schemes require these common documents:\n\n• Aadhaar Card\n• Income Certificate\n• Bank Account/Passbook\n• Passport-size Photos\n• Caste Certificate (if applicable)\n• Address Proof\n\nSpecific documents vary by scheme. Click on any scheme card to see its exact requirements!"

    if any(w in msg for w in ["how to apply", "apply", "application", "register", "sign up"]):
        return "📝 **How to Apply for Government Schemes:**\n\n1. Check your eligibility using our form above\n2. Click on the scheme card to see details\n3. Click 'Apply Now' to go to the official portal\n4. Register on the portal with Aadhaar/mobile\n5. Fill in the application form\n6. Upload required documents\n7. Submit and save the reference number\n\n💡 You can also visit your nearest CSC (Common Service Centre) for help!"

    return CHATBOT_RESPONSES["fallback"][0]


def format_scheme_response(scheme):
    response = f"📌 **{scheme['name']}**\n"
    response += f"🏷️ Sector: {scheme['sector']}\n\n"
    response += f"📝 {scheme['description']}\n\n"
    response += f"💰 **Benefits:** {scheme['benefits']}\n\n"
    response += f"📄 **Documents needed:** {', '.join(scheme['documents'])}\n\n"
    if scheme.get('last_date'):
        response += f"📅 **Last Date:** {scheme['last_date']}\n\n"
    response += f"🔗 **Apply:** {scheme['apply_link']}"
    return response


@app.route("/api/chatbot", methods=["POST"])
def chatbot():
    data = request.json
    message = data.get("message", "")
    if not message:
        return jsonify({"error": "No message provided"}), 400

    response = chatbot_respond(message)
    return jsonify({"response": response})


if __name__ == "__main__":
    print("EligibleMe is running at http://localhost:5000")
    app.run(debug=True, port=5000)
