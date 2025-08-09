from flask import Flask, request, jsonify
import joblib
import numpy as np
import os

app = Flask(__name__)
model_path = os.path.join("modelo", "modelo_treinado.pkl")

# Carrega o modelo treinado
model = joblib.load(model_path)

@app.route("/")
def home():
    return "API de Previsão de Vendas Ativa!"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        features = np.array(data["features"]).reshape(1, -1)
        prediction = model.predict(features)
        return jsonify({"prediction": prediction.tolist()})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
