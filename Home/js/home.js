// ===============================
// ELEMENTOS DA PÁGINA
// ===============================

// Categorias
const categoriaMasculino = document.getElementById("categoria-masculino");
const categoriaFeminino = document.getElementById("categoria-feminino");

// Banners
const bannerPrincipal = document.getElementById("banner-principal");
const bannerDestaques = document.getElementById("banner-destaques");
const bannerFiltro = document.getElementById("banner-filtro");


// ===============================
// CATEGORIAS
// ===============================

function abrirCategoria(categoria) {
  window.location.href = `../Catalogo/catalogo.html?categoria=${encodeURIComponent(categoria)}`;
}

// ===============================
// BANNERS
// ===============================

function abrirCatalogo(parametros = "") {
  window.location.href = `../Catalogo/catalogo.html${parametros}`;
}

// ===============================
// EVENTOS
// ===============================


categoriaMasculino.addEventListener("click", function () {
  abrirCategoria("Masculino");
});

categoriaFeminino.addEventListener("click", function () {
  abrirCategoria("Feminino");
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
