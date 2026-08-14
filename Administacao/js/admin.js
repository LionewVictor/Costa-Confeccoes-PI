// ============================================================
// COSTA CONFECÇÕES
// ÁREA ADMINISTRATIVA
// Arquivo: admin.js
//
// Este arquivo contém as funções compartilhadas entre
// todas as páginas da área administrativa.
//
// Responsabilidades:
//
// • Verificar a sessão do administrador
// • Navegar entre as páginas administrativas
// • Acessar o site público sem sair da conta
// • Realizar logout
// • Configurar o menu administrativo
// • Exibir mensagens do sistema
// • Formatar preços
// • Confirmar ações importantes
//
// IMPORTANTE:
//
// A lógica específica de cada página permanece no seu
// respectivo arquivo JavaScript.
//
// Exemplos:
//
// dashboard.html          → dashboard.js
// produtos.html           → produtos.js
// cadastrar-produto.html  → cadastrar-produto.js
// editar-produto.html     → editar-produto.js
//
// Este arquivo contém somente funcionalidades
// compartilhadas pela área administrativa.
// ============================================================

// ============================================================
// CONFIGURAÇÃO DA API
// ============================================================

// Define o endereço do backend.
//
// Todas as páginas administrativas utilizam esta variável
// para conversar com o server.js.
//
// Caso futuramente o endereço do servidor seja alterado,
// basta modificar esta variável.
const API_URL = "http://127.0.0.1:3000";

// ============================================================
// NAVEGAÇÃO ADMINISTRATIVA
// ============================================================

// ------------------------------------------------------------
// ABRIR DASHBOARD
// ------------------------------------------------------------

// Esta função leva o administrador para o Dashboard.
//
// O Dashboard é a página inicial da área administrativa.
function abrirDashboard() {
  window.location.href = "dashboard.html";
}

// ------------------------------------------------------------
// ABRIR PRODUTOS
// ------------------------------------------------------------

// Esta função leva o administrador para a página
// que contém a lista de produtos cadastrados.
function abrirProdutos() {
  window.location.href = "produtos.html";
}

// ------------------------------------------------------------
// ABRIR CADASTRO DE PRODUTO
// ------------------------------------------------------------

// Esta função abre a página responsável
// pelo cadastro de novos produtos.
function abrirCadastroProduto() {
  window.location.href = "cadastrar-produto.html";
}

// ------------------------------------------------------------
// ABRIR EDIÇÃO DE PRODUTO
// ------------------------------------------------------------

// Recebe o ID do produto que será editado.
//
// O ID é colocado na URL.
//
// Exemplo:
//
// editar-produto.html?id=15
//
// O arquivo editar-produto.js utiliza esse ID
// para buscar o produto correto na API.
function abrirEditarProduto(id) {
  // Verifica se o ID foi informado.
  if (!id) {
    mostrarMensagem("Produto inválido.");

    return;
  }

  // Redireciona para a página de edição.
  window.location.href = `editar-produto.html?id=${id}`;
}

// ------------------------------------------------------------
// ABRIR SITE
// ------------------------------------------------------------

// Permite que o administrador visualize
// o site público sem realizar logout.
//
// IMPORTANTE:
//
// Não fazemos nenhuma requisição ao /logout aqui.
//
// Portanto, a sessão continua ativa.
//
// Isso permite que o administrador navegue pelo site
// e continue autenticado.
function abrirSite() {
  window.location.href = "../Home/home.html";
}

// ============================================================
// AUTENTICAÇÃO E SESSÃO
// ============================================================

// ------------------------------------------------------------
// VERIFICAR ADMINISTRADOR
// ------------------------------------------------------------

// Esta função consulta o backend para verificar:
//
// 1. Se existe uma sessão.
// 2. Se existe um usuário autenticado.
// 3. Se o usuário possui o tipo "admin".
//
// A segurança não depende do JavaScript.
//
// O server.js também protege todas as rotas administrativas
// utilizando o middleware exigirAdministrador().
async function verificarAdministrador() {
  try {
    // ----------------------------------------------------
    // CONSULTAR SESSÃO
    // ----------------------------------------------------

    // Solicita ao backend os dados da sessão atual.
    //
    // credentials: "include" é obrigatório porque a sessão
    // utiliza um cookie enviado pelo navegador.
    const resposta = await fetch(`${API_URL}/sessao`, {
      credentials: "include",
    });

    // ----------------------------------------------------
    // VERIFICAR RESPOSTA
    // ----------------------------------------------------

    // Caso o servidor informe que não existe
    // uma sessão válida, o usuário volta para o login.
    if (!resposta.ok) {
      window.location.href = "../Login/login.html";

      return false;
    }

    // Converte a resposta para objeto JavaScript.
    const dados = await resposta.json();

    // ----------------------------------------------------
    // VERIFICAR AUTENTICAÇÃO
    // ----------------------------------------------------

    // Mesmo que a requisição tenha sido processada,
    // verificamos se o backend informou que existe
    // uma sessão autenticada.
    if (!dados.autenticado) {
      window.location.href = "../Login/login.html";

      return false;
    }

    // ----------------------------------------------------
    // VERIFICAR TIPO DA CONTA
    // ----------------------------------------------------

    // Somente usuários com tipo "admin"
    // podem acessar a área administrativa.
    if (!dados.usuario || dados.usuario.tipo !== "admin") {
      mostrarMensagem("Acesso negado.");

      // Usuário comum é enviado para o site.
      window.location.href = "../Home/home.html";

      return false;
    }

    // ----------------------------------------------------
    // ADMINISTRADOR AUTORIZADO
    // ----------------------------------------------------

    // Se chegou aqui, a sessão existe
    // e o usuário é administrador.
    return true;
  } catch (erro) {
    // Mostra o erro técnico no console.
    console.error("Erro ao verificar sessão:", erro);

    // Por segurança, se não conseguimos
    // confirmar a sessão, não permitimos
    // o acesso à área administrativa.
    mostrarMensagem("Não foi possível verificar sua sessão.");

    window.location.href = "../Login/login.html";

    return false;
  }
}

// ============================================================
// LOGOUT
// ============================================================

// ------------------------------------------------------------
// SAIR DA CONTA
// ------------------------------------------------------------

// Esta função encerra a sessão no servidor.
//
// Depois disso:
//
// • A sessão é destruída.
// • O cookie da sessão é removido.
// • Os dados do localStorage são apagados.
// • O usuário volta para o login.
async function sair() {
  try {
    // ----------------------------------------------------
    // CONFIRMAÇÃO
    // ----------------------------------------------------

    // Evita que o administrador saia da conta
    // acidentalmente.
    const confirmar = confirm("Deseja realmente sair da conta?");

    if (!confirmar) {
      return;
    }

    // ----------------------------------------------------
    // ENCERRAR SESSÃO NO SERVIDOR
    // ----------------------------------------------------

    const resposta = await fetch(`${API_URL}/logout`, {
      method: "POST",

      credentials: "include",
    });

    // ----------------------------------------------------
    // VERIFICAR RESPOSTA
    // ----------------------------------------------------

    if (!resposta.ok) {
      let dados = {};

      try {
        dados = await resposta.json();
      } catch (erro) {
        console.error("Erro ao interpretar resposta do logout:", erro);
      }

      mostrarMensagem(dados.mensagem || "Não foi possível sair da conta.");

      return;
    }

    // ----------------------------------------------------
    // LIMPAR DADOS LOCAIS
    // ----------------------------------------------------

    // Remove os dados que foram armazenados
    // pelo login no navegador.
    localStorage.removeItem("usuarioLogado");

    // ----------------------------------------------------
    // VOLTAR PARA LOGIN
    // ----------------------------------------------------

    window.location.href = "../Login/login.html";
  } catch (erro) {
    // Mostra o erro técnico no console.
    console.error("Erro ao sair da conta:", erro);

    mostrarMensagem("Erro ao conectar com o servidor.");
  }
}

// ============================================================
// MENU LATERAL
// ============================================================

// ------------------------------------------------------------
// CONFIGURAR MENU
// ------------------------------------------------------------

// Localiza os botões existentes no menu administrativo
// e associa cada um à sua função.
//
// Dessa maneira, não precisamos repetir
// a mesma lógica em cada página.
function configurarMenu() {
  // --------------------------------------------------------
  // BOTÃO DASHBOARD
  // --------------------------------------------------------

  const menuDashboard = document.getElementById("menu-dashboard");

  // --------------------------------------------------------
  // BOTÃO PRODUTOS
  // --------------------------------------------------------

  const menuProdutos = document.getElementById("menu-produtos");

  // --------------------------------------------------------
  // BOTÃO CADASTRAR PRODUTO
  // --------------------------------------------------------

  const menuCadastrar = document.getElementById("menu-cadastrar");

  // --------------------------------------------------------
  // BOTÃO VER SITE
  // --------------------------------------------------------

  // Este botão permite ao administrador
  // visualizar o restante do site sem sair da conta.
  const menuVerSite = document.getElementById("menu-ver-site");

  // --------------------------------------------------------
  // BOTÃO SAIR
  // --------------------------------------------------------

  const menuSair = document.getElementById("menu-sair");

  // ========================================================
  // CONFIGURAR EVENTOS
  // ========================================================

  // --------------------------------------------------------
  // DASHBOARD
  // --------------------------------------------------------

  // Só adiciona o evento se o elemento existir.
  //
  // Isso evita erros caso alguma página não possua
  // determinado botão.
  if (menuDashboard) {
    menuDashboard.addEventListener("click", abrirDashboard);
  }

  // --------------------------------------------------------
  // PRODUTOS
  // --------------------------------------------------------

  if (menuProdutos) {
    menuProdutos.addEventListener("click", abrirProdutos);
  }

  // --------------------------------------------------------
  // CADASTRAR PRODUTO
  // --------------------------------------------------------

  if (menuCadastrar) {
    menuCadastrar.addEventListener("click", abrirCadastroProduto);
  }

  // --------------------------------------------------------
  // VER SITE
  // --------------------------------------------------------

  if (menuVerSite) {
    menuVerSite.addEventListener("click", abrirSite);
  }

  // --------------------------------------------------------
  // SAIR
  // --------------------------------------------------------

  if (menuSair) {
    menuSair.addEventListener("click", sair);
  }
}

// ============================================================
// MENSAGENS DO SISTEMA
// ============================================================

// ------------------------------------------------------------
// MOSTRAR MENSAGEM
// ------------------------------------------------------------

// Centraliza as mensagens simples utilizadas
// pelas páginas administrativas.
//
// Atualmente usamos alert().
//
// Futuramente podemos substituir o alert por
// um sistema visual de mensagens sem precisar
// modificar todas as páginas.
function mostrarMensagem(mensagem) {
  alert(mensagem);
}

// ============================================================
// FORMATAÇÕES
// ============================================================

// ------------------------------------------------------------
// FORMATAR PREÇO
// ------------------------------------------------------------

// Recebe um valor numérico e transforma
// no formato utilizado pela loja.
//
// Exemplo:
//
// 99.9
//
// será exibido como:
//
// R$ 99,90
function formatarPreco(valor) {
  // Converte o valor para Number.
  const numero = Number(valor);

  // Caso o valor não seja um número válido,
  // evita exibir "R$ NaN".
  if (!Number.isFinite(numero)) {
    return "R$ 0,00";
  }

  // Mantém duas casas decimais
  // e troca o ponto decimal por vírgula.
  return `R$ ${numero.toFixed(2).replace(".", ",")}`;
}

// ============================================================
// CONFIRMAÇÕES
// ============================================================

// ------------------------------------------------------------
// CONFIRMAR EXCLUSÃO
// ------------------------------------------------------------

// Mostra uma confirmação antes de excluir um produto.
//
// Retorna:
//
// true  → administrador confirmou
// false → administrador cancelou
//
// A função que realiza a exclusão decide
// o que fazer com o resultado.
function confirmarExclusao() {
  return confirm("Deseja realmente excluir este produto?");
}

// ============================================================
// INICIALIZAÇÃO DA ÁREA ADMINISTRATIVA
// ============================================================

// ------------------------------------------------------------
// INICIAR ADMIN
// ------------------------------------------------------------

// Esta função é executada quando uma página
// administrativa é carregada.
//
// Primeiro verificamos a sessão.
//
// Somente depois que o servidor confirmar
// que o usuário é administrador,
// configuramos o menu.
async function iniciarAdmin() {
  // --------------------------------------------------------
  // VERIFICAR AUTORIZAÇÃO
  // --------------------------------------------------------

  const autorizado = await verificarAdministrador();

  // --------------------------------------------------------
  // CONFIGURAR MENU
  // --------------------------------------------------------

  // O menu só é configurado depois
  // da confirmação do servidor.
  if (autorizado) {
    configurarMenu();
  }
}

// ============================================================
// EXECUÇÃO
// ============================================================

// Inicia automaticamente as funções compartilhadas
// da área administrativa.
iniciarAdmin();
