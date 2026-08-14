    // ============================================================
    // COSTA CONFECÇÕES
    // SISTEMA DE LOGIN
    // Arquivo: login.js
    //
    // Responsável por:
    //
    // • Realizar login com email e senha.
    // • Criar/manter a sessão através do backend.
    // • Armazenar os dados básicos do usuário.
    // • Redirecionar clientes para a Home.
    // • Redirecionar administradores para o Dashboard.
    // • Preparar Google Login.
    // • Preparar Facebook Login.
    // • Preparar recuperação de senha.
    //
    // IMPORTANTE:
    //
    // O login NÃO acessa o SQLite diretamente.
    //
    // O login conversa com o server.js através da API.
    //
    // O server.js é responsável por:
    //
    // • Consultar o banco.
    // • Verificar a senha.
    // • Criar a sessão.
    // • Retornar os dados do usuário.
    //
    // O nome completo cadastrado pelo cliente será retornado
    // pelo backend através de dados.usuario.nome.
    // ============================================================

    // ============================================================
    // CONFIGURAÇÃO DA API
    // ============================================================

    // ------------------------------------------------------------
    // ENDEREÇO DO BACKEND
    // ------------------------------------------------------------
    //
    // Durante o desenvolvimento:
    //
    // http://127.0.0.1:3000
    //
    // Quando o projeto for publicado,
    // esse endereço deverá ser alterado para o endereço
    // definitivo do servidor.
    // ------------------------------------------------------------

    const API_URL = "http://127.0.0.1:3000";

    // ============================================================
    // CONFIGURAÇÃO DO GOOGLE
    // ============================================================

    // ------------------------------------------------------------
    // GOOGLE CLIENT ID
    // ------------------------------------------------------------
    //
    // Você só precisará substituir:
    //
    // COLOQUE_SUA_GOOGLE_CLIENT_ID_AQUI
    //
    // pela Client ID fornecida pelo Google.
    //
    // Exemplo:
    //
    // const GOOGLE_CLIENT_ID =
    //     "123456789-abc.apps.googleusercontent.com";
    //
    // NÃO coloque Client Secret neste arquivo.
    //
    // O Client Secret nunca deve ficar no JavaScript
    // executado pelo navegador.
    // ------------------------------------------------------------

    const GOOGLE_CLIENT_ID = "COLOQUE_SUA_GOOGLE_CLIENT_ID_AQUI";

    // ============================================================
    // CONFIGURAÇÃO DO FACEBOOK
    // ============================================================

    // ------------------------------------------------------------
    // FACEBOOK APP ID
    // ------------------------------------------------------------
    //
    // Você só precisará substituir:
    //
    // COLOQUE_SEU_FACEBOOK_APP_ID_AQUI
    //
    // pelo App ID fornecido pelo Facebook.
    //
    // Exemplo:
    //
    // const FACEBOOK_APP_ID =
    //     "123456789012345";
    //
    // Não coloque informações secretas neste arquivo.
    // ------------------------------------------------------------

    const FACEBOOK_APP_ID = "COLOQUE_SEU_FACEBOOK_APP_ID_AQUI";

    // ============================================================
    // ELEMENTOS DA PÁGINA
    // ============================================================

    // ------------------------------------------------------------
    // FORMULÁRIO
    // ------------------------------------------------------------

    // Localiza o formulário principal de login.
    const loginForm = document.getElementById("loginForm");

    // ------------------------------------------------------------
    // EMAIL
    // ------------------------------------------------------------

    // Localiza o campo de email.
    const campoEmail = document.getElementById("email");

    // ------------------------------------------------------------
    // SENHA
    // ------------------------------------------------------------

    // Localiza o campo de senha.
    const campoSenha = document.getElementById("senha");

    // ------------------------------------------------------------
    // GOOGLE
    // ------------------------------------------------------------

    // Localiza o botão de login com Google.
    const googleButton = document.getElementById("googlebutton");

    // ------------------------------------------------------------
    // FACEBOOK
    // ------------------------------------------------------------

    // Localiza o botão de login com Facebook.
    const facebookButton = document.getElementById("facebookbutton");

    // ------------------------------------------------------------
    // ESQUECI MINHA SENHA
    // ------------------------------------------------------------

    // O elemento pode ser um link ou botão.
    //
    // O HTML final deverá possuir:
    //
    // id="esqueci-senha"
    const esqueciSenha = document.getElementById("esqueci-senha");

    // ============================================================
    // FUNÇÃO AUXILIAR
    // ============================================================

    // ------------------------------------------------------------
    // REDIRECIONAR USUÁRIO
    // ------------------------------------------------------------
    //
    // Centraliza o redirecionamento depois do login.
    //
    // Administrador → Dashboard
    //
    // Cliente → Home
    // ------------------------------------------------------------

    function redirecionarUsuario(usuario) {
    // Verifica se o usuário retornado pelo backend
    // realmente existe.
    if (!usuario) {
        alert("Não foi possível identificar o usuário.");

        return;
    }

    // --------------------------------------------------------
    // ADMINISTRADOR
    // --------------------------------------------------------

    if (usuario.tipo === "admin") {
        window.location.href = "../Administacao/dashboard.html";

        return;
    }

    // --------------------------------------------------------
    // CLIENTE
    // --------------------------------------------------------

    window.location.href = "../Home/home.html";
    }

    // ============================================================
    // LOGIN NORMAL
    // ============================================================

    // ------------------------------------------------------------
    // REALIZAR LOGIN
    // ------------------------------------------------------------
    //
    // Envia:
    //
    // • email
    // • senha
    //
    // para:
    //
    // POST /login
    //
    // O server.js verifica os dados no banco.
    // ------------------------------------------------------------

    async function realizarLogin(event) {
    // Impede o formulário de recarregar
    // a página automaticamente.
    event.preventDefault();

    // ========================================================
    // OBTER DADOS
    // ========================================================

    // Obtém o email.
    //
    // trim() remove espaços extras.
    //
    // toLowerCase() evita problemas com
    // letras maiúsculas no email.
    const email = campoEmail ? campoEmail.value.trim().toLowerCase() : "";

    // Obtém a senha.
    //
    // Não utilizamos toLowerCase()
    // porque a senha diferencia maiúsculas
    // e minúsculas.
    const senha = campoSenha ? campoSenha.value : "";

    // ========================================================
    // VALIDAÇÃO
    // ========================================================

    // Verifica o email.
    if (!email) {
        alert("Informe seu email.");

        if (campoEmail) {
        campoEmail.focus();
        }

        return;
    }

    // Verifica a senha.
    if (!senha) {
        alert("Informe sua senha.");

        if (campoSenha) {
        campoSenha.focus();
        }

        return;
    }

    try {
        // ====================================================
        // ENVIAR PARA O SERVIDOR
        // ====================================================

        const resposta = await fetch(`${API_URL}/login`, {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
        },

        // Permite que o navegador
        // envie e receba o cookie
        // responsável pela sessão.
        credentials: "include",

        body: JSON.stringify({
            email: email,

            senha: senha,
        }),
        });

        // ====================================================
        // LER RESPOSTA
        // ====================================================

        const dados = await resposta.json();

        // ====================================================
        // VERIFICAR ERRO
        // ====================================================

        if (!resposta.ok) {
        alert(dados.mensagem || "Email ou senha incorretos.");

        return;
        }

        // ====================================================
        // VERIFICAR USUÁRIO
        // ====================================================

        if (!dados.usuario) {
        console.error("O servidor não retornou os dados do usuário.", dados);

        alert("Não foi possível concluir o login.");

        return;
        }

        // ====================================================
        // SALVAR USUÁRIO
        // ====================================================

        // Guarda informações básicas
        // para que outras páginas possam
        // mostrar o nome do usuário.
        //
        // IMPORTANTE:
        //
        // A autenticação verdadeira continua sendo
        // controlada pela sessão do backend.
        localStorage.setItem("usuarioLogado", JSON.stringify(dados.usuario));

        // ====================================================
        // LOGIN CONCLUÍDO
        // ====================================================

        alert("Login realizado com sucesso!");

        // Redireciona de acordo
        // com o tipo da conta.
        redirecionarUsuario(dados.usuario);
    } catch (erro) {
        // ====================================================
        // ERRO DE CONEXÃO
        // ====================================================

        console.error("Erro ao realizar login:", erro);

        alert(
        "Erro ao conectar com o servidor. Verifique se o sistema está funcionando.",
        );
    }
    }

    // ============================================================
    // RECUPERAÇÃO DE SENHA
    // ============================================================

    // ------------------------------------------------------------
    // ABRIR RECUPERAÇÃO DE SENHA
    // ------------------------------------------------------------
    //
    // O HTML deverá possuir:
    //
    // id="esqueci-senha"
    //
    // O link poderá apontar para:
    //
    // ../Login/redefinir-senha.html
    //
    // Caso essa página ainda não exista,
    // vamos criá-la posteriormente.
    // ------------------------------------------------------------

    function abrirRecuperacaoSenha(event) {
    // Impede o comportamento padrão
    // do link.
    if (event) {
        event.preventDefault();
    }

    window.location.href = "../Login/redefinir-senha.html";
    }

    // ============================================================
    // GOOGLE LOGIN
    // ============================================================

    // ------------------------------------------------------------
    // LOGIN COM GOOGLE
    // ------------------------------------------------------------
    //
    // IMPORTANTE:
    //
    // O código abaixo deixa a Client ID centralizada
    // em apenas um lugar.
    //
    // Porém, a autenticação OAuth precisa ser concluída
    // pelo backend para que o usuário possa ser criado
    // ou localizado no banco.
    //
    // Você NÃO deverá colocar Client Secret aqui.
    // ------------------------------------------------------------

    function loginComGoogle() {
    // --------------------------------------------------------
    // VERIFICAR CONFIGURAÇÃO
    // --------------------------------------------------------

    if (
        !GOOGLE_CLIENT_ID ||
        GOOGLE_CLIENT_ID === "COLOQUE_SUA_GOOGLE_CLIENT_ID_AQUI"
    ) {
        alert("Configure a Google Client ID antes de utilizar o login com Google.");

        return;
    }

    // --------------------------------------------------------
    // VERIFICAR BIBLIOTECA DO GOOGLE
    // --------------------------------------------------------

    // A biblioteca oficial do Google deverá estar
    // carregada no HTML quando a integração for ativada.
    //
    // Caso a biblioteca ainda não esteja disponível,
    // mostramos uma mensagem clara em vez de
    // gerar um erro JavaScript.
    if (!window.google || !window.google.accounts) {
        alert("A integração do Google ainda não foi carregada nesta página.");

        console.error("Google Identity Services não encontrado.");

        return;
    }

    // --------------------------------------------------------
    // INICIAR GOOGLE
    // --------------------------------------------------------

    // Inicializa o cliente do Google.
    //
    // O callback será chamado depois que
    // o Google autenticar o usuário.
    window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,

        callback: receberRespostaGoogle,
    });

    // --------------------------------------------------------
    // SOLICITAR AUTENTICAÇÃO
    // --------------------------------------------------------

    window.google.accounts.id.prompt();
    }

    // ------------------------------------------------------------
    // RECEBER RESPOSTA DO GOOGLE
    // ------------------------------------------------------------
    //
    // O Google entrega um credential/token.
    //
    // Esse token deve ser enviado ao backend.
    //
    // O backend será responsável por validar
    // a identidade do usuário e criar a sessão.
    // ------------------------------------------------------------

    async function receberRespostaGoogle(respostaGoogle) {
    // Verifica se o Google realmente
    // devolveu uma credencial.
    if (!respostaGoogle || !respostaGoogle.credential) {
        alert("Não foi possível realizar o login com Google.");

        return;
    }

    try {
        // Envia a credencial para o backend.
        const resposta = await fetch(`${API_URL}/auth/google`, {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
            credential: respostaGoogle.credential,
        }),
        });

        const dados = await resposta.json();

        // Verifica erro do backend.
        if (!resposta.ok) {
        alert(dados.mensagem || "Não foi possível entrar com Google.");

        return;
        }

        // Verifica usuário retornado.
        if (!dados.usuario) {
        alert("O servidor não retornou os dados do usuário.");

        return;
        }

        // Guarda os dados básicos.
        localStorage.setItem("usuarioLogado", JSON.stringify(dados.usuario));

        // Redireciona.
        redirecionarUsuario(dados.usuario);
    } catch (erro) {
        console.error("Erro no login Google:", erro);

        alert("Erro ao conectar com o servidor.");
    }
    }

    // ============================================================
    // FACEBOOK LOGIN
    // ============================================================

    // ------------------------------------------------------------
    // LOGIN COM FACEBOOK
    // ------------------------------------------------------------
    //
    // O App ID fica centralizado no início do arquivo.
    //
    // Quando o SDK oficial estiver carregado,
    // esta função poderá iniciar o processo de login.
    // ------------------------------------------------------------

    function loginComFacebook() {
    // --------------------------------------------------------
    // VERIFICAR CONFIGURAÇÃO
    // --------------------------------------------------------

    if (
        !FACEBOOK_APP_ID ||
        FACEBOOK_APP_ID === "COLOQUE_SEU_FACEBOOK_APP_ID_AQUI"
    ) {
        alert(
        "Configure o Facebook App ID antes de utilizar o login com Facebook.",
        );

        return;
    }

    // --------------------------------------------------------
    // VERIFICAR SDK
    // --------------------------------------------------------

    if (typeof FB === "undefined") {
        alert("A integração do Facebook ainda não foi carregada nesta página.");

        console.error("Facebook SDK não encontrado.");

        return;
    }

    // --------------------------------------------------------
    // INICIAR LOGIN
    // --------------------------------------------------------

    FB.login(receberRespostaFacebook, {
        scope: "public_profile,email",
    });
    }

    // ------------------------------------------------------------
    // RECEBER RESPOSTA DO FACEBOOK
    // ------------------------------------------------------------
    //
    // Depois da autenticação,
    // o Facebook fornece um access token.
    //
    // Esse token será enviado ao backend,
    // que será responsável por validar
    // e criar a sessão.
    // ------------------------------------------------------------

    async function receberRespostaFacebook(respostaFacebook) {
    // Verifica se o login foi autorizado.
    if (!respostaFacebook || !respostaFacebook.authResponse) {
        alert("O login com Facebook foi cancelado ou não foi autorizado.");

        return;
    }

    // Obtém o token.
    const accessToken = respostaFacebook.authResponse.accessToken;

    try {
        // ----------------------------------------------------
        // ENVIAR TOKEN AO BACKEND
        // ----------------------------------------------------

        const resposta = await fetch(`${API_URL}/auth/facebook`, {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
            accessToken: accessToken,
        }),
        });

        // Lê resposta.
        const dados = await resposta.json();

        // ----------------------------------------------------
        // VERIFICAR ERRO
        // ----------------------------------------------------

        if (!resposta.ok) {
        alert(dados.mensagem || "Não foi possível entrar com Facebook.");

        return;
        }

        // ----------------------------------------------------
        // USUÁRIO
        // ----------------------------------------------------

        if (!dados.usuario) {
        alert("O servidor não retornou os dados do usuário.");

        return;
        }

        // Guarda os dados básicos.
        localStorage.setItem("usuarioLogado", JSON.stringify(dados.usuario));

        // Redireciona.
        redirecionarUsuario(dados.usuario);
    } catch (erro) {
        console.error("Erro no login Facebook:", erro);

        alert("Erro ao conectar com o servidor.");
    }
    }

    // ============================================================
    // EVENTOS
    // ============================================================

    // ------------------------------------------------------------
    // FORMULÁRIO
    // ------------------------------------------------------------

    if (loginForm) {
    loginForm.addEventListener("submit", realizarLogin);
    }

    // ------------------------------------------------------------
    // GOOGLE
    // ------------------------------------------------------------

    if (googleButton) {
    googleButton.addEventListener("click", loginComGoogle);
    }

    // ------------------------------------------------------------
    // FACEBOOK
    // ------------------------------------------------------------

    if (facebookButton) {
    facebookButton.addEventListener("click", loginComFacebook);
    }

    // ------------------------------------------------------------
    // ESQUECEU A SENHA
    // ------------------------------------------------------------

    if (esqueciSenha) {
    esqueciSenha.addEventListener("click", abrirRecuperacaoSenha);
    }

    // ============================================================
    // INICIALIZAÇÃO
    // ============================================================

    // ------------------------------------------------------------
    // CONFIRMAÇÃO DE CARREGAMENTO
    // ------------------------------------------------------------
    //
    // Serve somente para confirmar no console
    // que o arquivo foi carregado corretamente.
    // ------------------------------------------------------------

    console.log("Login da Costa Confecções carregado.");
