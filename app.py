from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from textblob import TextBlob
from google import genai
from dotenv import load_dotenv
import os
import joblib
import numpy as np

# Load environment variables from .env
load_dotenv()

DB_HOST = os.environ.get("DB_HOST")
DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_NAME = os.environ.get("DB_NAME")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

app = Flask(__name__)
CORS(app)

# Gemini setup
client = genai.Client(api_key=GEMINI_API_KEY)

# Load trained ML model (Phase 7)
stress_model = joblib.load("stress_model.pkl")

def get_db():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )

@app.route('/')
def home():
    return jsonify({"message": "Bloom Backend Running! 🌸"})

@app.route('/api/log', methods=['POST'])
def log_health():
    data = request.json
    
    mood = data.get('mood', '')
    stress = data.get('stress', 0)
    sleep = data.get('sleep', 0)
    symptoms = ', '.join(data.get('symptoms', []))
    journal = data.get('journal', '')

    # NLP Sentiment Analysis
    sentiment = 0.0
    if journal:
        blob = TextBlob(journal)
        sentiment = blob.sentiment.polarity
        print(f"Journal sentiment: {sentiment}")
    
    # Gemini AI tip
    try:
        prompt = f"""
        You are a compassionate mental wellness coach.
        A user has logged their daily health check-in:
        - Mood: {mood}
        - Stress level: {stress}/10
        - Sleep: {sleep} hours
        - Symptoms: {symptoms}
        - Journal: {journal}
        - Sentiment score: {sentiment}
        
        Give a short, warm, personalized wellness tip in 2-3 sentences.
        Be empathetic, practical, and encouraging.
        Write naturally like a caring friend. No bullet points.
        """
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )
        tip = response.text
        print("Gemini tip:", tip)
    except Exception as e:
        print("Gemini error:", e)
        if stress >= 8 or sentiment < -0.5:
            tip = "🔴 High stress detected! Try 10 mins deep breathing."
        elif stress >= 6 or sentiment < -0.2:
            tip = "🟡 Moderate stress. Take breaks, drink water!"
        elif stress >= 4:
            tip = "🟠 Mild stress. You're managing well!"
        else:
            tip = "🟢 You're doing great! Keep it up!"
    
    # Save to MySQL
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("""
            INSERT INTO health_logs 
            (mood, stress, sleep, symptoms, journal, ai_tip, sentiment)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (mood, stress, sleep, symptoms, journal, tip, sentiment))
        db.commit()
        cursor.close()
        db.close()
        saved = True
    except Exception as e:
        print("DB Error:", e)
        saved = False
    
    return jsonify({
        "status": "success",
        "message": "Health logged!",
        "ai_tip": tip,
        "sentiment": sentiment,
        "saved_to_db": saved
    })

# NEW ROUTE — Phase 7 ML integration
@app.route('/api/predict-stress', methods=['POST'])
def predict_stress():
    data = request.json
    stress = data.get('stress', 0)
    sleep = data.get('sleep', 0)
    sentiment = data.get('sentiment', 0.0)

    features = np.array([[stress, sleep, sentiment]])
    prediction = stress_model.predict(features)[0]

    return jsonify({
        "status": "success",
        "stress_category": prediction
    })

@app.route('/api/history', methods=['GET'])
def get_history():
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM health_logs ORDER BY created_at DESC LIMIT 7")
        logs = cursor.fetchall()
        cursor.close()
        db.close()
        return jsonify({"status": "success", "logs": logs})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

if __name__ == '__main__':
    app.run(debug=True, port=5000)