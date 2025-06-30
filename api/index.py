# api/index.py
import os
import json # Importa a biblioteca JSON
from firebase_admin import credentials, auth, firestore
import firebase_admin
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Habilita o CORS

# --- LÓGICA DE INICIALIZAÇÃO ADAPTADA PARA VERCEL ---
# Verifica se o app já foi inicializado
if not firebase_admin._apps:
    # Pega o conteúdo da variável de ambiente
    firebase_creds_json = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
    if not firebase_creds_json:
        raise ValueError("A variável de ambiente FIREBASE_SERVICE_ACCOUNT_JSON não está definida.")
    
    # Converte a string JSON em um dicionário Python
    creds_dict = json.loads(firebase_creds_json)
    
    # Inicializa o SDK do Firebase
    cred = credentials.Certificate(creds_dict)
    firebase_admin.initialize_app(cred)

db = firestore.client()
# ---------------------------------------------------


# Suas rotas (/register, /profile) continuam exatamente as mesmas aqui...
# ... (copie e cole as funções @app.route('/register') e @app.route('/profile') aqui)
@app.route('/register', methods=['POST'])
def register():
    # ... seu código da rota de registro
    pass

@app.route('/profile', methods=['GET'])
def profile():
    # ... seu código da rota de perfil
    pass