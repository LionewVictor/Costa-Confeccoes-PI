//Variáveis das checkbox para modicficar as preferencias

const maiorPreco = document.getElementById("checkboxMaiorPreco");
const menorPreco = document.getElementById("checkboxMenorPreco");
const maiorTamanho = document.getElementById("checkboxMaiorTamanho");
const menorTamanho = document.getElementById("checkboxMenorTamanho");

const favoritos = document.getElementById("favoritos");

const produtos = [
    {
        nome: "Camisa polo",
        preco: 99.99,
        tamanho: "M"
    },

    {
         nome: "Boné Costa",
        preco: 49.99,
        tamanho: "M"
    },

    {
        nome: "Camisa de Botão azul e Branca",
        preco: 69.99,
        tamanho: "P"
    }
];


//função para inicializar o navegador,
function renderizarProdutos() {
  let cards = "";

  // Percorre todos os produtos do array
  for (const produto of produtos) {
      // Cria um card e adiciona na variável
      cards += criarCard(produto);
    }
    
    // Caso não exista nenhum produto
    if (produtos.length === 0) {
        cards = "<p>Nenhum Produto foi Adicionado por enquanto.</p>";
    }
    
    // Coloca todos os cards na página
    favoritos.innerHTML = cards;
}

//função para criar os cards
function criarCard(produto){
    return `
    <div class="product-card">
    <div class="product-img-container">
    <img src="https://via.placeholder.com/120x120?text=Produto"
    alt="${produto.nome}"
    class="product-image">
    </div>
    
    <div class="product-info">
    <h3 class="product-name">${produto.nome}</h3>
    <p class="product-price">
    R$ ${produto.preco.toFixed(2).replace(".", ",")}
    </p>
    <p class="product-size">
    Tamanho: ${produto.tamanho}
    </p>
    </div>
    
    <button class="delete-btn">
    Excluir <i class="fa-regular fa-trash-can"></i>
    </button>
    </div>
    `;
}

renderizarProdutos()

