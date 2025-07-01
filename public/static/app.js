// public/static/app.js - VERSÃO FINAL E DEFINITIVA

document.addEventListener('DOMContentLoaded', function() {

    // --- LÓGICA DO MODO ESCURO ---
    const themeToggle = document.getElementById('theme-toggle');
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

    if (sign_up_btn) {
        sign_up_btn.addEventListener("click", () => container.classList.add("sign-up-mode"));
    }
    if (sign_in_btn) {
        sign_in_btn.addEventListener("click", () => container.classList.remove("sign-up-mode"));
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
    
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();
    // A VARIÁVEL backendUrl FOI REMOVIDA

    // Elementos dos formulários
    const signInForm = document.querySelector('.sign-in-form');
    const signUpForm = document.querySelector('.sign-up-form');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const loginErrorMsg = document.getElementById('login-error-message');
    const registerErrorMsg = document.getElementById('register-error-message');

    // Lógica de Registro
    if (signUpForm) {
        signUpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            registerErrorMsg.innerText = "";
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            
            // CORREÇÃO: URL completa e correta
            fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    registerErrorMsg.innerText = data.error;
                } else {
                    auth.signInWithCustomToken(data.token)
                        .then(userCredential => userCredential.user.getIdToken())
                        .then(idToken => {
                            sessionStorage.setItem('firebaseToken', idToken);
                            window.location.href = 'dashboard.html';
                        });
                }
            })
            .catch(error => {
                console.error('Erro no registro:', error);
                registerErrorMsg.innerText = 'Ocorreu um erro ao registrar.';
            });
        });
    }

    // Lógica de Login
    if (signInForm) {
        signInForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            auth.signInWithEmailAndPassword(email, password)
                .then(userCredential => userCredential.user.getIdToken())
                .then(token => {
                    sessionStorage.setItem('firebaseToken', token);
                    window.location.href = 'dashboard.html';
                })
                .catch(() => loginErrorMsg.innerText = "Email ou senha inválidos.");
        });
    }

    // Lógica de Login com Google
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const provider = new firebase.auth.GoogleAuthProvider();
            auth.signInWithPopup(provider)
                .then(result => result.user.getIdToken())
                .then(token => {
                    sessionStorage.setItem('firebaseToken', token);
                    window.location.href = 'dashboard.html';
                })
                .catch(() => loginErrorMsg.innerText = "Falha ao autenticar com Google.");
        });
    }

    // Lógica do Dashboard
    if (window.location.pathname.endsWith('dashboard.html')) {
        const token = sessionStorage.getItem('firebaseToken');
        if (!token) {
            window.location.href = 'index.html';
        } else {
            // CORREÇÃO: URL completa e correta
            fetch('/api/profile', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => response.ok ? response.json() : Promise.reject('Token inválido'))
            .then(data => {
                document.getElementById('user-name').textContent = data.name || 'Usuário';
                document.getElementById('user-email').textContent = data.nick ? `@${data.nick}` : (data.email ? `@${data.email.split('@')[0]}` : '@email');
                const profilePic = document.getElementById('profile-picture');
                profilePic.src = data.photo_url || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NjYyI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyYzAgLjg4Ljc3IDEuNTQgMS41IDEuNTNoMTNjLjg4IDAgMS41LS43NyAxLjUtMS41NHYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz48L3N2Zz4=';
            })
            .catch(() => {
                sessionStorage.removeItem('firebaseToken');
                window.location.href = 'index.html';
            });
        }
        
        // Lógica do Modal de Edição
        const modal = document.getElementById('edit-profile-modal');
        const openModalBtn = document.getElementById('edit-profile-btn');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const editProfileForm = document.getElementById('edit-profile-form');
        const formErrorMsg = document.getElementById('form-error-message');

        if (openModalBtn) {
            openModalBtn.addEventListener('click', () => {
                document.getElementById('edit-name').value = document.getElementById('user-name').textContent;
                document.getElementById('edit-nick').value = document.getElementById('user-email').textContent.substring(1);
                modal.classList.remove('hidden');
            });
        }

        function closeModal() { if (modal) modal.classList.add('hidden'); }
        if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
        if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

        if (editProfileForm) {
            editProfileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const newName = document.getElementById('edit-name').value;
                const newNick = document.getElementById('edit-nick').value;
                const token = sessionStorage.getItem('firebaseToken');
                
                // CORREÇÃO: URL completa e correta
                fetch('/api/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ name: newName, nick: newNick })
                })
                .then(res => res.ok ? res.json() : Promise.reject(res.json()))
                .then(data => {
                    if (data.error) {
                        formErrorMsg.textContent = data.error;
                    } else {
                        document.getElementById('user-name').textContent = data.updatedData.name;
                        document.getElementById('user-email').textContent = `@${data.updatedData.nick}`;
                        alert('Perfil atualizado com sucesso!');
                        closeModal();
                    }
                })
                .catch(errPromise => {
                     errPromise.then(err => {
                        formErrorMsg.textContent = err.error || 'Não foi possível salvar.';
                     }).catch(() => {
                        formErrorMsg.textContent = 'Erro de comunicação com o servidor.';
                     })
                });
            });
        }

        // Lógica de Logout
        const logoutButtons = document.querySelectorAll('#logout-button, #logout-button-header');
        logoutButtons.forEach(button => {
            if(button) {
                button.addEventListener('click', () => {
                    auth.signOut().then(() => {
                        sessionStorage.removeItem('firebaseToken');
                        window.location.href = 'index.html';
                    });
                });
            }
        });
    }

});