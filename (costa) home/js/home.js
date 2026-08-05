// ===============================
// ELEMENTOS DA PÁGINA
// ===============================

// Pesquisa
const campoPesquisa = document.getElementById("campo-pesquisa");
const botaoPesquisa = document.getElementById("botao-pesquisa");

// Header
const botaoFavoritos = document.getElementById("botao-favoritos");
const botaoLogin = document.getElementById("botao-login");

// Categorias
const categoriaMasculino = document.getElementById("categoria-masculino");
const categoriaFeminino = document.getElementById("categoria-feminino");

// Banners
const bannerPrincipal = document.getElementById("banner-principal");
const bannerDestaques = document.getElementById("banner-destaques");
const bannerFiltro = document.getElementById("banner-filtro");

// ===============================
// PESQUISA
// ===============================

function pesquisarProdutos() {
  const texto = campoPesquisa.value.trim();

  if (texto === "") {
    return;
  }

  window.location.href = `LOCAL_CATALOGO?pesquisa=${encodeURIComponent(texto)}`;
}

// ===============================
// CATEGORIAS
// ===============================

function abrirCategoria(categoria) {
  window.location.href = `LOCAL_CATALOGO?categoria=${encodeURIComponent(categoria)}`;
}

// ===============================
// BANNERS
// ===============================

function abrirCatalogo(parametros = "") {
  window.location.href = `LOCAL_CATALOGO${parametros}`;
}

// ===============================
// LOGIN
// ===============================

function abrirLogin() {
  console.log("Abrir tela de login");

  // Futuramente:
  // window.location.href = "login.html";
}

// ===============================
// FAVORITOS
// ===============================

function abrirFavoritos() {
  console.log("Abrir lista de desejos");

  // Futuramente:

  // Usuário logado:
  // window.location.href = "favoritos.html";

  // Usuário não logado:
  // window.location.href = "login.html";
}

// ===============================
// EVENTOS
// ===============================

botaoPesquisa.addEventListener("click", pesquisarProdutos);

campoPesquisa.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    pesquisarProdutos();
  }
});

categoriaMasculino.addEventListener("click", function () {
  abrirCategoria("Masculino");
});

categoriaFeminino.addEventListener("click", function () {
  abrirCategoria("Feminino");
});

categoriaMasculino.addEventListener("click", () => {
  abrirCatalogo("?categoria=Masculino");
});

categoriaFeminino.addEventListener("click", () => {
  abrirCatalogo("?categoria=Feminino");
});

bannerPrincipal.addEventListener("click", () => {
  abrirCatalogo();
});

bannerFiltro.addEventListener("click", () => {
  abrirCatalogo();
});

bannerDestaques.addEventListener("click", () => {
  abrirCatalogo("?destaque=true");
});

// ===============================
// INICIALIZAÇÃO
// ===============================

function iniciarHome() {
  console.log("Home iniciada.");
}

iniciarHome();
