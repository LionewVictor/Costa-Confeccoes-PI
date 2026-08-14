// ==========================
// HEADER GLOBAL
// ==========================

// ==========================
// LOGO
// ==========================

const logo = document.getElementById("logo");

if (logo) {
  logo.addEventListener("click", () => {
    window.location.href = "../Home/home.html";
  });
}

// ==========================
// PESQUISA
// ==========================

const campoPesquisaHeader = document.getElementById("campo-pesquisa");

const botaoPesquisaHeader = document.getElementById("botao-pesquisa");

function pesquisarProdutos() {
  if (!campoPesquisaHeader) {
    return;
  }

  const texto = campoPesquisaHeader.value.trim();

  if (texto === "") {
    return;
  }

  window.location.href = `../Catalogo/catalogo.html?pesquisa=${encodeURIComponent(texto)}`;
}

// Clique no botão de pesquisa

if (botaoPesquisaHeader) {
  botaoPesquisaHeader.addEventListener("click", pesquisarProdutos);
}

// Pressionar Enter no campo de pesquisa

if (campoPesquisaHeader) {
  campoPesquisaHeader.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      pesquisarProdutos();
    }
  });
}

// ==========================
// LISTA DE DESEJOS
// ==========================

const botaoFavoritos = document.getElementById("botao-favoritos");

if (botaoFavoritos) {
  botaoFavoritos.addEventListener("click", () => {
    window.location.href = "../Favoritos/favoritos.html";
  });
}

// ==========================
// LOGIN
// ==========================

const botaoLogin = document.getElementById("botao-login");

if (botaoLogin) {
  botaoLogin.addEventListener("click", () => {
    window.location.href = "../Login/login.html";
  });
}
