// Seleciona todos os checkboxes dos filtros
const checkboxes = document.querySelectorAll(".sidebar input[type='checkbox']");

// Seleciona todos os produtos
const cards = document.querySelectorAll(".card");

// Sempre que algum filtro mudar
checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", filtrarProdutos);
});

function filtrarProdutos() {
  // Guarda os filtros marcados
  const filtros = {
    marca: [],
    tamanho: [],
    genero: [],
    produto: [],
    cor: [],
    material: [],
    modelagem: [],
    preco: [],
  };

  // Percorre todos os checkboxes marcados
  checkboxes.forEach((check) => {
    if (!check.checked) return;

    const categoria = check
      .closest("details")
      .querySelector("summary")
      .textContent.trim()
      .toLowerCase();

    const valor = check.parentElement.textContent.trim();

    switch (categoria) {
      case "marca":
        filtros.marca.push(valor);
        break;

      case "tamanho":
        filtros.tamanho.push(valor);
        break;

      case "gênero":
        filtros.genero.push(valor);
        break;

      case "produto":
        filtros.produto.push(valor);
        break;

      case "cor":
        filtros.cor.push(valor);
        break;

      case "material":
        filtros.material.push(valor);
        break;

      case "modelagem":
        filtros.modelagem.push(valor);
        break;

      case "faixa de preço":
        filtros.preco.push(valor);
        break;
    }
  });

  // Percorre todos os produtos
  cards.forEach((card) => {
    let mostrar = true;

    if (filtros.marca.length && !filtros.marca.includes(card.dataset.marca))
      mostrar = false;

    if (
      filtros.tamanho.length &&
      !filtros.tamanho.includes(card.dataset.tamanho)
    )
      mostrar = false;

    if (filtros.genero.length && !filtros.genero.includes(card.dataset.genero))
      mostrar = false;

    if (
      filtros.produto.length &&
      !filtros.produto.includes(card.dataset.produto)
    )
      mostrar = false;

    if (filtros.cor.length && !filtros.cor.includes(card.dataset.cor))
      mostrar = false;

    if (
      filtros.material.length &&
      !filtros.material.includes(card.dataset.material)
    )
      mostrar = false;

    if (
      filtros.modelagem.length &&
      !filtros.modelagem.includes(card.dataset.modelagem)
    )
      mostrar = false;

    if (filtros.preco.length) {
      const preco = parseFloat(card.dataset.preco);

      let valido = false;

      filtros.preco.forEach((faixa) => {
        if (faixa === "Até R$50" && preco <= 50) valido = true;

        if (faixa === "R$50 - R$100" && preco > 50 && preco <= 100)
          valido = true;

        if (faixa === "R$100 - R$200" && preco > 100 && preco <= 200)
          valido = true;

        if (faixa === "Acima de R$200" && preco > 200) valido = true;
      });

      if (!valido) mostrar = false;
    }

    card.style.display = mostrar ? "block" : "none";
  });
}
