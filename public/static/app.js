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
            fetch(`${backendUrl}/register`, { // Rota corrigida
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

    // Lógica do Dashboard e Rotas Protegidas (VERSÃO FINAL CORRIGIDA)
if (window.location.pathname.endsWith('dashboard.html')) {
    const token = sessionStorage.getItem('firebaseToken');
    // --- LÓGICA DO MODAL DE EDIÇÃO DE PERFIL ---

    const modal = document.getElementById('edit-profile-modal');
    const openModalBtn = document.getElementById('edit-profile-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const editProfileForm = document.getElementById('edit-profile-form');
    const formErrorMsg = document.getElementById('form-error-message');

    // Função para abrir o modal
if (openModalBtn) {
    openModalBtn.addEventListener('click', () => {
        const currentName = document.getElementById('user-name').textContent;
        const currentHandle = document.getElementById('user-email').textContent;
        
        document.getElementById('edit-name').value = currentName;
        // CORREÇÃO: Pega o nick do handle (remove o @)
        document.getElementById('edit-nick').value = currentHandle.substring(1);

        modal.classList.remove('hidden');
    });
}

// Função para fechar o modal
function closeModal() {
    modal.classList.add('hidden');
}

if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
// Fecha o modal se clicar fora dele
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// public/static/app.js

// Lógica para salvar o formulário (VERSÃO CORRIGIDA)
if (editProfileForm) {
    editProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        formErrorMsg.textContent = '';

        const newName = document.getElementById('edit-name').value;
        const newNick = document.getElementById('edit-nick').value;
        const token = sessionStorage.getItem('firebaseToken');

        fetch(`${backendUrl}/api/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: newName, nick: newNick })
        })
        .then(res => {
            if (!res.ok) {
                return res.json().catch(() => {
                    throw new Error(`Erro no servidor: ${res.statusText}`);
                });
            }
            return res.json();
        })
        .then(data => {
            if (data.error) {
                formErrorMsg.textContent = data.error;
            } else {
                // CORREÇÃO APLICADA AQUI:
                // O código agora lê de 'data.updatedData' conforme a resposta da API
                document.getElementById('user-name').textContent = data.updatedData.name;
                document.getElementById('user-email').textContent = `@${data.updatedData.nick}`;
                
                alert('Perfil atualizado com sucesso!');
                closeModal();
            }
        })
        .catch(err => {
            console.error('Erro ao salvar perfil:', err);
            formErrorMsg.textContent = err.message || 'Não foi possível salvar as alterações.';
        });
    });
}

    if (!token) {
        window.location.href = 'index.html';
    } else {
        fetch(`${backendUrl}/profile`, {
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
            const userNameElement = document.getElementById('user-name');
            const userEmailElement = document.getElementById('user-email');
            
            // CORREÇÃO 1: Adiciona verificações para evitar erros com dados nulos
            userNameElement.textContent = data.name || 'Usuário'; // Se data.name não existir, usa 'Usuário'
            userEmailElement.textContent = data.email ? `@${data.email.split('@')[0]}` : '@email'; // Se data.email existir, cria o handle, senão usa '@email'

            if (data.photo_url) {
                profilePicElement.src = data.photo_url;
            } else {
                profilePicElement.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NjYyI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyYzAgLjg4Ljc3IDEuNTQgMS41IDEuNTNoMTNjLjg4IDAgMS41LS43NyAxLjUtMS41NHYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz48L3N2Zz4=';
            }
        })
        .catch(error => {
            console.error('Erro ao buscar perfil:', error);
            // CORREÇÃO 2: Usa um elemento que existe para mostrar a mensagem de erro
            const userNameElement = document.getElementById('user-name');
            if (userNameElement) {
                userNameElement.textContent = 'Erro ao carregar perfil.';
            }
        });
    }

    // Lógica de Logout para AMBOS os botões
    const logoutButtons = document.querySelectorAll('#logout-button, #logout-button-header');
    logoutButtons.forEach(button => {
        if(button) {
            button.addEventListener('click', () => {
                auth.signOut().then(() => {
                    sessionStorage.removeItem('firebaseToken');
                    window.location.href = 'index.html';
                }).catch((error) => {
                    console.error('Erro no logout:', error);
                });
            });
        }
    });
}
});