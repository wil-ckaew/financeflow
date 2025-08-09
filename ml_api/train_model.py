import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
import joblib
import os

# Simulando dataset
# Substitua com leitura de dados reais, ex: pd.read_csv('dados.csv')
data = pd.DataFrame({
    "estoque": [10, 20, 30, 40, 50],
    "preco": [100, 90, 80, 70, 60],
    "vendas": [1, 2, 3, 4, 5]
})

# Separando dados
X = data[["estoque", "preco"]]
y = data["vendas"]

# Treinamento
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
modelo = LinearRegression()
modelo.fit(X_train, y_train)

# Salvando modelo
os.makedirs("modelo", exist_ok=True)
joblib.dump(modelo, os.path.join("modelo", "modelo_treinado.pkl"))

print("Modelo treinado e salvo com sucesso.")
