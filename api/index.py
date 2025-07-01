# api/index.py
import os
import json
from firebase_admin import credentials, auth, firestore
import firebase_admin
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Configuração de CORS
frontend_url = os.getenv('FRONTEND_URL', "http://127.0.0.1:5500")
CORS(app, resources={r"/api/*": {"origins": frontend_url}})

# Inicialização do Firebase
if not firebase_admin._apps:
    firebase_creds_json = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
    if not firebase_creds_json:
        raise ValueError("A variável de ambiente FIREBASE_SERVICE_ACCOUNT_JSON não está definida.")
    creds_dict = json.loads(firebase_creds_json)
    cred = credentials.Certificate(creds_dict)
    firebase_admin.initialize_app(cred)

db = firestore.client()

# --- ROTAS ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not all([email, password, name]):
        return jsonify({"error": "Dados incompletos"}), 400

    try:
        user = auth.create_user(
            email=email,
            password=password,
            display_name=name
        )
        user_data = {
            "name": name,
            "email": email,
            "created_at": firestore.SERVER_TIMESTAMP
        }
        db.collection('users').document(user.uid).set(user_data)
        custom_token = auth.create_custom_token(user.uid)
        return jsonify({
            "message": f"Usuário {user.uid} criado com sucesso!",
            "token": custom_token.decode('utf-8')
        }), 201

    except auth.EmailAlreadyExistsError:
        return jsonify({"error": "Este e-mail já está em uso."}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/profile', methods=['GET'])
def profile():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Token de autorização não encontrado"}), 401
        
        id_token = auth_header.split(' ').pop()
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']

        # --- LÓGICA FINAL E COMPLETA PARA BUSCAR TODOS OS DADOS ---
        
        # 1. Busca o usuário no serviço de Autenticação para pegar a URL da foto
        auth_user = auth.get_user(uid)
        photo_url = auth_user.photo_url

        # 2. Busca os dados que salvamos no nosso banco de dados Firestore
        user_doc = db.collection('users').document(uid).get()

        if user_doc.exists:
            firestore_data = user_doc.to_dict()
            
            # 3. Combina os dados do Firestore com a URL da foto para a resposta final
            response_data = {
                "name": firestore_data.get("name"),
                "email": firestore_data.get("email"),
                "photo_url": photo_url 
            }
            return jsonify(response_data), 200
        else:
            # Lógica para criar perfil de usuário de primeira viagem (como no login com Google)
            new_user_data = {
                "name": decoded_token.get("name", "Nome não fornecido"),
                "email": decoded_token["email"],
                "created_at": firestore.SERVER_TIMESTAMP,
            }
            db.collection('users').document(uid).set(new_user_data)

            new_user_data["photo_url"] = photo_url
            if "created_at" in new_user_data:
                new_user_data.pop("created_at")

            return jsonify(new_user_data), 200

    except auth.InvalidIdTokenError:
        return jsonify({"error": "Token inválido"}), 401
    except Exception as e:
        print(f"Erro inesperado no endpoint /api/profile: {e}")
        return jsonify({"error": "Ocorreu um erro interno no servidor."}), 500

# ... (todo o seu código anterior, incluindo a rota /api/profile com GET, continua aqui) ...

@app.route('/api/profile', methods=['PUT'])
def update_profile():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Token de autorização não encontrado"}), 401
        
        id_token = auth_header.split(' ').pop()
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']

        data = request.get_json()
        name = data.get('name')
        nick = data.get('nick')

        # Validação simples dos dados recebidos
        if not name or not nick:
            return jsonify({"error": "Nome e Nick são obrigatórios."}), 400
        
        # Validação do nick (somente letras minúsculas e números)
        if not nick.isalnum() or not nick.islower():
            return jsonify({"error": "O Nick deve conter apenas letras minúsculas e números, sem espaços."}), 400

        # Prepara os dados para atualização
        update_data = {
            "name": name,
            "nick": nick
        }

        # Atualiza o documento no Firestore
        db.collection('users').document(uid).update(update_data)

        return jsonify({"message": "Perfil atualizado com sucesso!", "updatedData": update_data}), 200

    except Exception as e:
        print(f"Erro ao atualizar perfil: {e}")
        return jsonify({"error": "Ocorreu um erro interno ao atualizar o perfil."}), 500