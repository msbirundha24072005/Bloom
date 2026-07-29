import numpy as np
import pandas as pd

np.random.seed(42)  # ensures same results every time you run it

n_samples = 500

# Generate random feature values within realistic ranges
stress = np.random.randint(0, 11, n_samples)          # 0 to 10
sleep = np.round(np.random.uniform(3, 9, n_samples), 1)  # 3 to 9 hours
sentiment = np.round(np.random.uniform(-1, 1, n_samples), 2)  # -1 to 1

def assign_category(stress_val, sleep_val, sentiment_val):
    # Add small random noise so it's not perfectly clean logic
    noise = np.random.uniform(-0.5, 0.5)
    score = stress_val - sleep_val + (sentiment_val * -3) + noise

    if score >= 2:
        return "High"
    elif score >= -2:
        return "Moderate"
    else:
        return "Low"

labels = [
    assign_category(stress[i], sleep[i], sentiment[i])
    for i in range(n_samples)
]

df = pd.DataFrame({
    "stress": stress,
    "sleep": sleep,
    "sentiment": sentiment,
    "stress_category": labels
})

df.to_csv("stress_data.csv", index=False)
print("Dataset created: stress_data.csv")
print(df["stress_category"].value_counts())