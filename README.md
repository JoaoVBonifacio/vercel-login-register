```markdown
# JoaoVBonifacio/vercel-login-register

> Projeto de autenticação com login e registro moderno 🚀  
> Utilizando uma interface responsiva e integração com Firebase e Flask

---

## Introdução

Este projeto é uma aplicação web que oferece **login** e **registro** de usuários com uma interface moderna e responsiva. A aplicação é dividida em duas partes principais:  
• Uma API backend escrita em Python utilizando o framework **Flask** para gerenciamento de usuários, autenticação via Firebase Admin e integração com Firestore (fileciteturn0file2).  
• Um frontend com arquivos HTML, CSS e JavaScript que implementa páginas de **login**, **registro**, **dashboard** e funcionalidades interativas como **modo escuro** e **edição de perfil** (fileciteturn0file0, fileciteturn0file7).

A aplicação foi configurada para ser implantada no ambiente **Vercel**, utilizando os arquivos de configuração adequados, como o "vercel.json" que define as rotas para a API e arquivos estáticos (fileciteturn0file2).

---

## Uso

Após a implantação, o fluxo de uso da aplicação ocorre da seguinte forma:
 
1. **Login e Registro:**  
   - O usuário pode efetuar login utilizando email e senha ou por meio de login com o Google.  
   - Em caso de registro, os dados (nome, email e senha) são enviados para a API, que cria o usuário no Firebase e gera um token personalizado, permitindo o redirecionamento para a página de dashboard (fileciteturn0file1).

2. **Dashboard:**  
   - A página de dashboard exibe informações do perfil do usuário, como seu nome, email (ou nick) e foto de perfil.  
   - O usuário pode editar seu perfil utilizando um modal interativo que valida as informações e atualiza os dados via chamada PUT para a rota `/api/profile` (fileciteturn0file8).

3. **Modo Escuro:**  
   - A interface inclui uma funcionalidade de alternância de tema (claro/escuro) que é ativada por meio de um botão e salva a preferência do usuário no Local Storage (fileciteturn0file0).

4. **Autenticação Segura:**  
   - Todas as requisições críticas, como atualização de perfil ou obtenção de informações, utilizam tokens de autenticação para garantir a segurança dos dados.

---

## Funcionalidades

A aplicação inclui diversas funcionalidades que visam oferecer uma experiência de usuário rica e segura:

- **Autenticação Completa:**  
  • Login com email/senha  
  • Registro de novos usuários  
  • Login com Google

- **Dashboard de Usuário:**  
  • Exibição de perfil com foto e dados  
  • Edição de perfil através de modal interativo

- **Interface Responsiva:**  
  • Páginas de login e registro com design moderno  
  • Suporte para modo escuro

- **Segurança e Integridade:**  
  • Uso de tokens personalizados para autenticação  
  • Integração com o Firebase Admin para gerenciamento de usuários

- **Configuração Simplificada para Implantação:**  
  • Arquivo "vercel.json" para definições de rotas e build (fileciteturn0file2)

---

## Configuração

Para configurar corretamente a aplicação, siga as orientações abaixo:

- **Variáveis de Ambiente:**  
  Defina a variável de ambiente `FIREBASE_SERVICE_ACCOUNT_JSON` com o JSON contendo as credenciais do serviço do Firebase. Essa variável é utilizada na inicialização do Firebase Admin na API (fileciteturn0file2).

- **CORS:**  
  A API está configurada com CORS para permitir requisições originadas do frontend. A variável `FRONTEND_URL` pode ser definida para especificar a origem permitida.

- **Configuração do Vercel:**  
  O arquivo `vercel.json` indica que a API será tratada como uma função serverless utilizando `@vercel/python` e que os arquivos estáticos do diretório `public/` serão servidos utilizando `@vercel/static`.

---

## Requisitos

### Backend
- **Linguagem:** Python  
- **Framework:** Flask  
- **Dependências:**  
  • firebase-admin  
  • flask  
  • flask-cors  
  • google-cloud-firestore  

Esta lista completa está disponível no arquivo `requirements.txt` (fileciteturn0file2).

### Frontend
- HTML, CSS e JavaScript  
- **CDNs:**  
  • Firebase (firebase-app-compat.js e firebase-auth-compat.js)  
  • Font Awesome para ícones  
  • Google Fonts para tipografia  

---

## Contribuindo

A contribuição para este projeto é bem-vinda! Siga os passos abaixo para colaborar:

1. Faça um fork deste repositório.
2. Clone o seu fork para sua máquina local.
3. Crie uma branch para a sua feature ou correção:  
   ```bash
   git checkout -b minha-feature
   ```
4. Faça as alterações necessárias e realize commits bem descritivos.
5. Envie sua branch para o repositório remoto:
   ```bash
   git push origin minha-feature
   ```
6. Abra um Pull Request detalhando as alterações realizadas.

Agradecemos sua colaboração e empenho! ⭐

---

## Instalação

Siga os passos abaixo para instalar e rodar o projeto localmente:

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/JoaoVBonifacio/vercel-login-register.git
   cd vercel-login-register
   ```

2. **Instale as dependências do backend:**  
   Certifique-se de ter o Python instalado e utilize o pip para instalar as bibliotecas:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configuração das Variáveis de Ambiente:**  
   Defina a variável `FIREBASE_SERVICE_ACCOUNT_JSON` com suas credenciais do Firebase. Você pode criar um arquivo `.env` para facilitar a configuração local.

4. **Execução da API Backend:**  
   Inicie a aplicação Flask:
   ```bash
   python api/index.py
   ```

5. **Executando o Frontend:**  
   Abra o arquivo `public/index.html` em seu navegador. Alternativamente, se preferir rodar um servidor local, você pode utilizar uma extensão ou servidor HTTP leve.

6. **Implantação no Vercel:**  
   Se você deseja implantar a aplicação no Vercel, basta configurar sua conta Vercel, conectar seu repositório e garantir que o arquivo `vercel.json` esteja presente. O Vercel distinguirá automaticamente a função Python e os arquivos estáticos conforme definido (fileciteturn0file2).

---

Aproveite e divirta-se desenvolvendo! 🎉
```
