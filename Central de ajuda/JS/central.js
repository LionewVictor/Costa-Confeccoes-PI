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

    const destino = pergunta.dataset.destino;

    //produto
    if (destino === "produto.html") {
      window.location.href = "produto.html";
    }

    //WhatsApp
    if (destino === "whatsapp") {
      window.open("https://wa.me/5582996160237", "_blank");
    }

    // Reportar erro
    if (destino === "reportar.html") {
      window.location.href = "reportar.html";
    }
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

// CLICAR
produtos.addEventListener("click", function () {
  window.location.href = "produto.html";
});

// REPORTAR UM ERRO
const reportar = document.getElementById("reportar");

// CLICAR
reportar.addEventListener("click", function () {
  window.location.href = "reportar.html";
});
