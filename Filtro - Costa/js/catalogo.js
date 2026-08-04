// ===============================
// ELEMENTOS DA PÁGINA
// ===============================

const listaProdutos = document.getElementById("lista-produtos");
const campoPesquisa = document.getElementById("campo-pesquisa");
const ordenacao = document.getElementById("ordenacao");
const contadorProdutos = document.getElementById("contador-produtos");
const botaoLimparFiltros = document.getElementById("limpar-filtros");
const botaoMostrarMais = document.getElementById("mostrar-mais");
const logoHome = document.getElementById("logo-home");
const tituloCatalogo = document.getElementById("titulo-catalogo");
const descricaoCatalogo = document.getElementById("descricao-catalogo");

// Elementos do filtro
const filtrosProduto = document.querySelectorAll('input[name="produto"]');
const filtrosMarca = document.querySelectorAll('input[name="marca"]');
const filtrosTamanho = document.querySelectorAll('input[name="tamanho"]');
const filtrosGenero = document.querySelectorAll('input[name="genero"]');
const filtrosCor = document.querySelectorAll('input[name="cor"]');
const filtrosMaterial = document.querySelectorAll('input[name="material"]');
const filtrosModelagem = document.querySelectorAll('input[name="modelagem"]');
const filtrosPreco = document.querySelectorAll('input[name="preco"]');

// Junta todos os filtros

const todosFiltros = [

    ...filtrosProduto,
    ...filtrosMarca,
    ...filtrosTamanho,
    ...filtrosGenero,
    ...filtrosCor,
    ...filtrosMaterial,
    ...filtrosModelagem,
    ...filtrosPreco
];

// ===============================
// PARÂMETROS DA URL
// ===============================

const parametros = new URLSearchParams(window.location.search);

const pesquisaURL = parametros.get("pesquisa");

const categoriaURL = parametros.get("categoria");

const destaqueURL = parametros.get("destaque");


// ===============================
// BANCO TEMPORÁRIO DE PRODUTOS
// ===============================

    const produtos = [
      {
        id: 1,
        nome: "Boné Cinza",
        marca: "Altomax",
        categoria: "Bonés",
        genero: "Masculino",
        tamanho: "Único",
        cor: "Cinza",
        material: "Algodão",
        modelagem: "Classic",
        preco: 16.99,
        imagem: "CSS/Boné cinza.jpg",
      },

      {
        id: 2,
        nome: "Camisa Branca",
        marca: "Ogochi",
        categoria: "Camisetas",
        genero: "Masculino",
        tamanho: "M",
        cor: "Branco",
        material: "Algodão",
        modelagem: "Slim/Skinny",
        preco: 99.99,
        imagem: "CSS/Camisa Branca.jpg",
      },
    ];

// Produtos que estão sendo exibidos na tela
let produtosExibidos = [...produtos];
let quantidadeProdutos = 12;

// ===============================
// CRIAÇÃO DOS CARDS
// ===============================

// Cria o HTML de um card de produto
function criarCard(produto) {
    return `
        <div class="card" data-id="${produto.id}">

            <img 
            src="${produto.imagem}" 
            alt="${produto.nome}"
            >

            <h3>
                ${produto.nome}
            </h3>

            <p class="preco">
                R$ ${produto.preco.toFixed(2)}
            </p>
        </div>
    `;
}

// ===============================
// RENDERIZAÇÃO DOS PRODUTOS
// ===============================

// Renderiza todos os produtos na tela
 function renderizarProdutos(lista) {
    
    listaProdutos.innerHTML = "";

    if(lista.length ===0){
        listaProdutos.innerHTML = `
        <div class="mensagem-vazia">

        <h3>
            Nenhum produto encontrado.
        </h3>
        
        <p>
            Tente pesquisar outro termo ou remover os filtros.
        </p>
        </div>
        `;

        botaoMostrarMais.style.display = "none";
    return;

    }

    const produtosParaMostrar = lista.slice(0, quantidadeProdutos);

    produtosParaMostrar.forEach(produto => {
        listaProdutos.innerHTML += criarCard(produto);
    }); 

    controlarBotaoMostrarMais(lista);
 }

// ===============================
// ATUALIZAR MENSAGEM CATALOGO
// ==============================

function atualizarCabecalho() {
  const generoSelecionado = Array.from(filtrosGenero).find(
    (filtro) => filtro.checked,
  );

  const produtoSelecionado = Array.from(filtrosProduto).find(
    (filtro) => filtro.checked,
  );

  if (generoSelecionado) {
    switch (generoSelecionado.value) {
      case "Masculino":
        tituloCatalogo.textContent = "MODA MASCULINA";

        descricaoCatalogo.textContent =
          "Experimente a sua melhor versão na Costa Confecções.";
        return;

      case "Feminino":
        tituloCatalogo.textContent = "MODA FEMININA";

        descricaoCatalogo.textContent = "Conheça nossa coleção feminina.";
        return;

      case "Infantil":
        tituloCatalogo.textContent = "MODA INFANTIL";

        descricaoCatalogo.textContent =
          "Conforto e qualidade para os pequenos.";
        return;
    }
  }

  if (produtoSelecionado) {
    tituloCatalogo.textContent = produtoSelecionado.value.toUpperCase();

    descricaoCatalogo.textContent = "Confira nossa seleção de produtos.";
    return;
  }

  if (destaqueURL === "true") {
    tituloCatalogo.textContent = "MAIS POPULARES";

    descricaoCatalogo.textContent = "Confira os produtos mais procurados.";
    return;
  }

  tituloCatalogo.textContent = "CATÁLOGO";
  descricaoCatalogo.textContent = "Explore todos os nossos produtos.";
}

// ===============================
// CONTADOR DE PRODUTOS
// ===============================

function atualizarContador(lista){

    if(lista.length ===0){

        contadorProdutos.textContent =
        "Nenhum produto encontrado.";

        return
    }

    contadorProdutos.textContent =
    `${lista.length} produto(s) encontrado(s)`;
}


// ===============================
// NORMALIZAÇÃO DE TEXTO
// ===============================

function normalizarTexto(texto) {

    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// ===============================
// PESQUISA DE PRODUTOS
// ===============================

function aplicarPesquisa(lista) {

    const texto = normalizarTexto(campoPesquisa.value);

    if (!texto) {
        return lista;
    }

    return lista.filter(produto => {
        return (
            normalizarTexto(produto.nome).includes(texto) ||
            normalizarTexto(produto.marca).includes(texto) ||
            normalizarTexto(produto.categoria).includes(texto) ||
            normalizarTexto(produto.genero).includes(texto) ||
            normalizarTexto(produto.material).includes(texto)
        );
    });
}

// ===============================
// FILTROS
// ===============================

function aplicarFiltros(lista) {

    // Filtro Produto
    const produtosSelecionados = Array.from(filtrosProduto)
        .filter(filtro => filtro.checked)
        .map(filtro => filtro.value);

    if (produtosSelecionados.length > 0) {

        lista = lista.filter(produto => {
            return produtosSelecionados.includes(produto.categoria);
        });
    }

    // Filtro Marca
    const marcasSelecionadas = Array.from(filtrosMarca)
        .filter(filtro => filtro.checked)
        .map(filtro => filtro.value);

    if (marcasSelecionadas.length > 0) {

        lista = lista.filter(produto => {
            return marcasSelecionadas.includes(produto.marca);
        });
    }

    // Filtro Tamanho
    const tamanhosSelecionados = Array.from(filtrosTamanho)
        .filter(filtro => filtro.checked)
        .map(filtro => filtro.value);

    if (tamanhosSelecionados.length > 0) {

        lista = lista.filter(produto => {
            return tamanhosSelecionados.includes(produto.tamanho);
        });
    }

    // Filtro Gênero
    const generosSelecionados = Array.from(filtrosGenero)
        .filter(filtro => filtro.checked)
        .map(filtro => filtro.value);

    if (generosSelecionados.length > 0) {

        lista = lista.filter(produto => {
            return generosSelecionados.includes(produto.genero);
        });
    }

    // Filtro Cor
    const coresSelecionadas = Array.from(filtrosCor)
        .filter(filtro => filtro.checked)
        .map(filtro => filtro.value);

    if (coresSelecionadas.length > 0) {

        lista = lista.filter(produto => {
            return coresSelecionadas.includes(produto.cor);
        });
    }

    // Filtro Material
    const materiaisSelecionados = Array.from(filtrosMaterial)
        .filter(filtro => filtro.checked)
        .map(filtro => filtro.value);

    if (materiaisSelecionados.length > 0) {

        lista = lista.filter(produto => {
            return materiaisSelecionados.includes(produto.material);
        });
    }

    // Filtro Modelagem
    const modelagensSelecionadas = Array.from(filtrosModelagem)
        .filter(filtro => filtro.checked)
        .map(filtro => filtro.value);

    if (modelagensSelecionadas.length > 0) {

        lista = lista.filter(produto => {
            return modelagensSelecionadas.includes(produto.modelagem);
        });
    }

    // Filtro Preço
    const precosSelecionados = Array.from(filtrosPreco)
        .filter(filtro => filtro.checked)
        .map(filtro => filtro.value);

    if (precosSelecionados.length > 0) {

        lista = lista.filter(produto => {
            return precosSelecionados.some(faixa => {

                if (faixa === "0-50") {
                    return produto.preco <= 50;
                }

                if (faixa === "50-100") {
                    return produto.preco > 50 && produto.preco <= 100;
                }

                if (faixa === "100-200") {
                    return produto.preco > 100 && produto.preco <= 200;
                }

                if (faixa === "200+") {
                    return produto.preco > 200;
                }
            });
        });
    }
    return lista;
}

// ===============================
// LIMPAR FILTROS
// ===============================

function limparFiltros(){

    // Limpa o campo de pesquisa
    campoPesquisa.value = "";

    // Desmarca todos os filtros
    todosFiltros.forEach(filtro =>{

        filtro.checked = false;
    });

    ordenacao.value = "popularidade";

    atualizarCatalogo();
}

// ===============================
// ORDENAÇÂO
// ===============================
function ordenarProdutos(lista){

 const tipoOrdenacao = ordenacao.value;

    switch (tipoOrdenacao) {

        case "popularidade":
            return lista;

        case "menor-preco":
           return[...lista].sort((a,b) => {
                return a.preco - b.preco;
            });

        case "maior-preco":
            return [...lista].sort((a,b) => {
                return b.preco - a.preco;
            });

            default:
                return lista;

}
}
// ===============================
// ATUALIZAÇÃO DO CATÁLOGO
// ===============================

function atualizarCatalogo(){

     quantidadeProdutos = 12;

    let listaFiltrada = [...produtos];

    listaFiltrada = aplicarPesquisa(listaFiltrada);

    listaFiltrada = aplicarFiltros(listaFiltrada);

    listaFiltrada = ordenarProdutos(listaFiltrada);

    produtosExibidos = listaFiltrada;

    renderizarProdutos(produtosExibidos);

    atualizarContador(produtosExibidos);

    atualizarCabecalho();
}

// ===============================
// BOTÃO MOSTRAR MAIS
// ===============================

function controlarBotaoMostrarMais(lista){

    if(quantidadeProdutos >= lista.length){
        botaoMostrarMais.style.display = "none"; 
    }else{
        botaoMostrarMais.style.display = "block";
    }
}

// ===============================
// EVENTOS
// ===============================

campoPesquisa.addEventListener("input", atualizarCatalogo);

ordenacao.addEventListener("change", atualizarCatalogo);

todosFiltros.forEach(filtro => {
    filtro.addEventListener("change", atualizarCatalogo);
});

botaoLimparFiltros.addEventListener("click", limparFiltros);

botaoMostrarMais.addEventListener("click", function(){
    quantidadeProdutos += 12;
    renderizarProdutos(produtosExibidos);
    atualizarContador(produtosExibidos);
});

logoHome.addEventListener("click", function () {
  window.location.href = "LOCAL_DA_HOME";
});

// ===============================
// CLIQUE NO CARD
// ===============================


listaProdutos.addEventListener("click", function(event){

    const card = event.target.closest(".card");

    if(!card){
        return;
    }

    const idProduto = card.dataset.id;

    window.location.href = `produto.html?id=${idProduto}`;
});

// ===============================
// INICIALIZAÇÃO
// ===============================

function iniciarCatalogo() {

    if(pesquisaURL){
        campoPesquisa.value = pesquisaURL;
    }
    
    if(categoriaURL){
        filtrosGenero.forEach(filtro =>{

            if(filtro.value === categoriaURL){
                filtro.checked = true;
            }
        });
    }

     if(destaqueURL === "true") {
        ordenacao.value = "popularidade";
     }

     atualizarCatalogo();
}

iniciarCatalogo();