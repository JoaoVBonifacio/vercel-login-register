# api/index.py
import os
import json # Importa a biblioteca JSON
from firebase_admin import credentials, auth, firestore
import firebase_admin
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# --- NOVA CONFIGURAÇÃO DE CORS ---
# Pega a URL do frontend a partir das variáveis de ambiente da Vercel
frontend_url = os.getenv('FRONTEND_URL')

# Se a variável não estiver definida (para testes locais), define um padrão.
# No ambiente da Vercel, essa variável PRECISA estar configurada.
if not frontend_url:
    frontend_url = "http://127.0.0.1:5500" 

# Configura o CORS para permitir requisições apenas da sua URL de frontend
# para todas as rotas que começam com /api/
CORS(app, resources={r"/api/*": {"origins": frontend_url}})
# --- FIM DA NOVA CONFIGURAÇÃO ---


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
@app.route('/api/register', methods=['POST'])
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

@app.route('/api/profile', methods=['GET'])
def profile():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Token de autorização não encontrado"}), 401
        
        id_token = auth_header.split(' ').pop()
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']

        # --- NOVA LÓGICA AQUI ---
        
        # 1. Busca os dados do usuário no serviço de Autenticação para pegar a foto
        auth_user = auth.get_user(uid)
        photo_url = auth_user.photo_url

        # 2. Busca os dados do nosso banco de dados Firestore
        user_doc = db.collection('users').document(uid).get()

        if user_doc.exists:
            firestore_data = user_doc.to_dict()
            
            # 3. Combina os dados do Firestore com a URL da foto
            response_data = {
                "name": firestore_data.get("name"),
                "email": firestore_data.get("email"),
                "photo_url": photo_url # Adiciona a URL da foto à resposta
            }
            return jsonify(response_data), 200
        else:
            # Lógica para criar perfil de usuário de primeira viagem (como no login com Google)
            # já inclui a foto na resposta.
            new_user_data = {
                "name": decoded_token.get("name", "Nome não fornecido"),
                "email": decoded_token["email"],
                "created_at": firestore.SERVER_TIMESTAMP,
            }
            db.collection('users').document(uid).set(new_user_data)

            # Adiciona a foto na resposta de criação também
            new_user_data["photo_url"] = photo_url
            # Remove o created_at da resposta JSON para não dar erro de serialização
            if "created_at" in new_user_data:
                new_user_data.pop("created_at")

            return jsonify(new_user_data), 200

    except auth.InvalidIdTokenError:
        return jsonify({"error": "Token inválido"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500