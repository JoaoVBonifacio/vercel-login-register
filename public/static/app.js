// --- LÓGICA DO MODO ESCURO ---
const themeToggle = document.getElementById('theme-toggle');

themeToggle.addEventListener('click', () => {
    // Adiciona ou remove a classe 'dark-mode' do body
    document.body.classList.toggle('dark-mode');

    // Salva a preferência do usuário no localStorage
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

// --- LÓGICA DA INTERFACE (UI) ---
const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");


sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});


// --- LÓGICA DO FIREBASE ---

// Cole aqui a configuração do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB3uW1r5hULsraekWThMOqPsnKeMKzqMrM",
  authDomain: "testedelogin-3898d.firebaseapp.com",
  databaseURL: "https://testedelogin-3898d-default-rtdb.firebaseio.com",
  projectId: "testedelogin-3898d",
  storageBucket: "testedelogin-3898d.firebasestorage.app",
  messagingSenderId: "992858651157",
  appId: "1:992858651157:web:56108bafdde87a1bbaac1c"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const backendUrl = '/api';

// Elementos dos formulários
const signInForm = document.querySelector('.sign-in-form');
const signUpForm = document.querySelector('.sign-up-form');
const googleLoginBtn = document.getElementById('google-login-btn');

// Mensagens de erro
const loginErrorMsg = document.getElementById('login-error-message');
const registerErrorMsg = document.getElementById('register-error-message');

// Lógica de Registro com Email/Senha (ATUALIZADA)
if (signUpForm) {
    signUpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        registerErrorMsg.innerText = "";

        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        fetch(`${backendUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                registerErrorMsg.innerText = data.error;
            } else {
                // SUCESSO! O backend enviou um token.
                const customToken = data.token;

                // Usa o token personalizado para fazer o login
                auth.signInWithCustomToken(customToken)
                    .then((userCredential) => {
                        // Login automático bem-sucedido! Agora pega o ID Token padrão.
                        userCredential.user.getIdToken().then((idToken) => {
                            sessionStorage.setItem('firebaseToken', idToken);
                            window.location.href = 'dashboard.html'; // Redireciona para o painel
                        });
                    })
                    .catch((error) => {
                        console.error("Erro no login automático após registro:", error);
                        // Se o login automático falhar, redireciona para a tela de login manual
                        container.classList.remove("sign-up-mode");
                    });
            }
        })
        .catch(error => {
            console.error('Erro no registro:', error);
            registerErrorMsg.innerText = 'Ocorreu um erro ao registrar.';
        });
    });
}

// Lógica de Login com Email/Senha
if (signInForm) {
    signInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        loginErrorMsg.innerText = ""; // Limpa erros antigos

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                userCredential.user.getIdToken().then((token) => {
                    sessionStorage.setItem('firebaseToken', token);
                    window.location.href = 'dashboard.html'; // Redireciona para o painel
                });
            })
            .catch((error) => {
                loginErrorMsg.innerText = "Email ou senha inválidos.";
                console.error("Erro no login:", error.message);
            });
    });
}

// Lógica de Login com Google
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then((result) => {
                result.user.getIdToken().then((token) => {
                    sessionStorage.setItem('firebaseToken', token);
                    window.location.href = 'dashboard.html';
                });
            })
            .catch((error) => {
                console.error("Erro no login com Google:", error);
                loginErrorMsg.innerText = "Falha ao autenticar com Google.";
            });
    });
}

