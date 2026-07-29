# MediMind - Symptom Logger
# Day 1: Basic input and file saving

def log_symptom():
    name = input("Your name: ")
    date = input("Date (DD-MM-YYYY): ")
    symptom = input("Symptom today (e.g. fever, cough, fatigue): ")
    severity = input("Severity (mild/moderate/severe): ")
    
    entry = f"{date} | {name} | {symptom} | {severity}\n"
    
    with open("health_log.txt", "a") as file:
        file.write(entry)
    
    print("✅ Symptom logged successfully!")

log_symptom()
