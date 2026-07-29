import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

# 1. Load the synthetic dataset
df = pd.read_csv("stress_data.csv")

# 2. Separate features (X) and label (y)
X = df[["stress", "sleep", "sentiment"]]
y = df["stress_category"]

# 3. Train/test split (80/20), stratify keeps class ratios balanced in both sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 4. Build the Random Forest
#    n_estimators = number of trees ("friends") voting
model = RandomForestClassifier(n_estimators=100, random_state=42)

# 5. Train
model.fit(X_train, y_train)

# 6. Predict on unseen test data
y_pred = model.predict(X_test)

# 7. Evaluate
print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# 8. Feature importance — which factor drives stress prediction most
importances = pd.Series(model.feature_importances_, index=X.columns)
print("\nFeature Importance:\n", importances.sort_values(ascending=False))

# 9. Save the trained model for Flask to load later
joblib.dump(model, "stress_model.pkl")
print("\nModel saved as stress_model.pkl")