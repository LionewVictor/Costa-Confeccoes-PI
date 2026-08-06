const campoPesquisa = document.querySelector(".pesquisa input");
const sugestoes = document.getElementById("sugestoes");
const perguntas = document.querySelectorAll(".item");

// Mostrar ao clicar no campo
campoPesquisa.addEventListener("focus", () => {
  sugestoes.style.display = "block";
});

// Esconder ao clicar fora
document.addEventListener("click", (e) => {
  if (!e.target.closest(".pesquisa-container")) {
    sugestoes.style.display = "none";
  }
});

// Preencher o campo quando clicar na pergunta
perguntas.forEach((pergunta) => {
  pergunta.addEventListener("click", () => {
    campoPesquisa.value = pergunta.textContent;

    sugestoes.style.display = "none";
  });
});

// TODOS OS CARDS
const cards = document.querySelectorAll(".caixa");

// WHATSAPP
cards[0].addEventListener("click", function () {
  window.open("https://wa.me/5582996160237", "_blank");
});

// INSTAGRAM
cards[3].addEventListener("click", function () {
  window.open(
    "https://www.instagram.com/costaconfeccoes2?igsh=MWd0YjZydmF2YnV5cA==",
    "_blank",
  );
});

// PRODUTOS E TAMANHOS
const produtos = document.getElementById("produtos");

// REPORTAR UM ERRO
const reportar = document.getElementById("reportar");

// CLICAR
produtos.addEventListener("click", function () {
  window.location.href = "produto.html";
});

// CLICAR
reportar.addEventListener("click", function () {
  window.location.href = "reportar.html";
});



/* FOOTER */



// Instagram
const instagram = document.getElementById("insta");

instagram.addEventListener("click", function () {
  window.open(
    "https://www.instagram.com/costaconfeccoes2?igsh=MWd0YjZydmF2YnV5cA==",
    "_blank",
  );
});

// WhatsApp
const whatsapp = document.getElementById("zap");

whatsapp.addEventListener("click", function () {
  window.open("https://wa.me/5582996160237", "_blank");
});

// Sobre
const sobre = document.getElementById("sobre");

// CLICAR SOBRE
sobre.addEventListener("click", function () {
  window.location.href = "sobre.html";
});

// Suporte
const suporte = document.getElementById("suporte");

// CLICAR SUPORTE
suporte.addEventListener("click", function () {
  window.location.href = "central.html";
});

// Sustentabilidade
const sustentabilidade = document.getElementById("sustentabilidade");

// CLICAR SUSTENTABILIDADE
sustentabilidade.addEventListener("click", function () {
  window.location.href = "sustentabilidade.html";
});
