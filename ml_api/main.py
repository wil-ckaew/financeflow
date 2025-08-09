from fastapi import FastAPI

app = FastAPI(title="Financial Predictions API")

@app.get("/api/v1/predict")
async def predict():
    return {"message": "Previsão de gastos e receitas vai aqui."}
