// public/static/app.js

document.addEventListener('DOMContentLoaded', function() {

    // --- LÓGICA DO MODO ESCURO ---
    const themeToggle = document.getElementById('theme-toggle');
    // VERIFICAÇÃO ADICIONADA: Só executa se o botão de tema existir
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // --- LÓGICA DA INTERFACE (UI) DA PÁGINA DE LOGIN ---
    const sign_in_btn = document.querySelector("#sign-in-btn");
    const sign_up_btn = document.querySelector("#sign-up-btn");
    const container = document.querySelector(".container");

    // VERIFICAÇÃO ADICIONADA: Só executa se o botão de registro existir
    if (sign_up_btn) {
        sign_up_btn.addEventListener("click", () => {
            container.classList.add("sign-up-mode");
        });
    }
    
    // VERIFICAÇÃO ADICIONADA: Só executa se o botão de login existir
    if (sign_in_btn) {
        sign_in_btn.addEventListener("click", () => {
            container.classList.remove("sign-up-mode");
        });
    }

    // --- LÓGICA DO FIREBASE ---
    const firebaseConfig = {
      apiKey: "AIzaSyB3uW1r5hULsraekWThMOqPsnKeMKzqMrM",
      authDomain: "testedelogin-3898d.firebaseapp.com",
      databaseURL: "https://testedelogin-3898d-default-rtdb.firebaseio.com",
      projectId: "testedelogin-3898d",
      storageBucket: "testedelogin-3898d.firebasestorage.app",
      messagingSenderId: "992858651157",
      appId: "1:992858651157:web:56108bafdde87a1bbaac1c"
    };
    
    // Evita reinicializar o Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();
    const backendUrl = '/api';

    // Elementos dos formulários
    const signInForm = document.querySelector('.sign-in-form');
    const signUpForm = document.querySelector('.sign-up-form');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const loginErrorMsg = document.getElementById('login-error-message');
    const registerErrorMsg = document.getElementById('register-error-message');

    // Lógica de Registro com Email/Senha
    if (signUpForm) {
        signUpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // ... (o resto da lógica de registro continua aqui, sem alterações)
            registerErrorMsg.innerText = "";
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            fetch(`${backendUrl}/api/register`, { // Rota corrigida
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    registerErrorMsg.innerText = data.error;
                } else {
                    const customToken = data.token;
                    auth.signInWithCustomToken(customToken)
                        .then((userCredential) => {
                            userCredential.user.getIdToken().then((idToken) => {
                                sessionStorage.setItem('firebaseToken', idToken);
                                window.location.href = 'dashboard.html';
                            });
                        })
                        .catch((error) => {
                            console.error("Erro no login automático:", error);
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
            // ... (o resto da lógica de login continua aqui, sem alterações)
            loginErrorMsg.innerText = "";
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    userCredential.user.getIdToken().then((token) => {
                        sessionStorage.setItem('firebaseToken', token);
                        window.location.href = 'dashboard.html';
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
            // ... (o resto da lógica do Google continua aqui, sem alterações)
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

    // Lógica do Dashboard e Rotas Protegidas
    if (window.location.pathname.endsWith('dashboard.html')) {
        const token = sessionStorage.getItem('firebaseToken');
        if (!token) {
            window.location.href = 'index.html';
        } else {
            // ... (o resto da lógica do dashboard continua aqui, sem alterações)
            fetch(`${backendUrl}/api/profile`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => {
                if (!response.ok) {
                    sessionStorage.removeItem('firebaseToken');
                    window.location.href = 'index.html';
                    throw new Error('Token inválido ou expirado.');
                }
                return response.json();
            })
            .then(data => {
                const profilePicElement = document.getElementById('profile-picture');
                const userInfoDiv = document.getElementById('user-info');
                if (data.photo_url) {
                    profilePicElement.src = data.photo_url;
                } else {
                    profilePicElement.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NjYyI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyYzAgLjg4Ljc3IDEuNTQgMS41IDEuNTNoMTNjLjg4IDAgMS41LS43NyAxLjUtMS41NHYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz48L3N2Zz4=';
                }
                userInfoDiv.innerHTML = `<p><strong>Nome:</strong> ${data.name}</p><p><strong>Email:</strong> ${data.email}</p>`;
            })
            .catch(error => {
                console.error('Erro ao buscar perfil:', error);
                const userInfoDiv = document.getElementById('user-info');
                userInfoDiv.innerText = "Não foi possível carregar os dados do perfil.";
            });
        }
        const logoutButton = document.getElementById('logout-button');
        if(logoutButton) {
            logoutButton.addEventListener('click', () => {
                auth.signOut().then(() => {
                    sessionStorage.removeItem('firebaseToken');
                    window.location.href = 'index.html';
                }).catch((error) => {
                    console.error('Erro no logout:', error);
                });
            });
        }
    }

});