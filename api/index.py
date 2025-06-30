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
    """
    Endpoint para registrar um novo usuário.
    Cria o usuário, um documento no Firestore e retorna um token de login personalizado.
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not all([email, password, name]):
        return jsonify({"error": "Dados incompletos"}), 400

    try:
        # Cria o usuário no Firebase Authentication
        user = auth.create_user(
            email=email,
            password=password,
            display_name=name  # Adiciona o nome ao perfil de autenticação também
        )

        # Cria um documento para o usuário no Firestore
        user_data = {
            "name": name,
            "email": email,
            "created_at": firestore.SERVER_TIMESTAMP
        }
        db.collection('users').document(user.uid).set(user_data)

        # NOVO: Gera um token de login personalizado para o novo usuário
        custom_token = auth.create_custom_token(user.uid)

        # Retorna o token junto com a mensagem de sucesso
        return jsonify({
            "message": f"Usuário {user.uid} criado com sucesso!",
            "token": custom_token.decode('utf-8')  # Decodifica o token para string
        }), 201

    except auth.EmailAlreadyExistsError:
        return jsonify({"error": "Este e-mail já está em uso."}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/profile', methods=['GET'])
def profile():
    # ... seu código da rota de perfil
    pass