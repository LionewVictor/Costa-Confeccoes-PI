// ============================================================
// COSTA CONFECÇÕES
// CATÁLOGO DE PRODUTOS
// Arquivo: catalogo.js
//
// Responsável por:
//
// • Buscar os produtos através da API
// • Exibir os produtos no catálogo
// • Pesquisar produtos
// • Filtrar por categoria
// • Filtrar por marca
// • Filtrar por tamanho
// • Filtrar por gênero
// • Filtrar por cor
// • Filtrar por material
// • Filtrar por faixa de preço
// • Ordenar por preço
// • Controlar o botão "Mostrar mais"
// • Controlar o contador de produtos
// • Ler parâmetros enviados pela URL
// • Abrir a página individual do produto
// ============================================================

// ============================================================
// CONFIGURAÇÃO DA API
// ============================================================

const API_URL = "http://127.0.0.1:3000";

// ============================================================
// ELEMENTOS DA PÁGINA
// ============================================================

const listaProdutos = document.getElementById("lista-produtos");

const campoPesquisa = document.getElementById("campo-pesquisa");

const ordenacao = document.getElementById("ordenacao");

const contadorProdutos = document.getElementById("contador-produtos");

const botaoLimparFiltros = document.getElementById("limpar-filtros");

const botaoMostrarMais = document.getElementById("mostrar-mais");

const tituloCatalogo = document.getElementById("titulo-catalogo");

const descricaoCatalogo = document.getElementById("descricao-catalogo");

// ============================================================
// ELEMENTOS DOS FILTROS
// ============================================================

const filtrosProduto = document.querySelectorAll('input[name="produto"]');

const filtrosMarca = document.querySelectorAll('input[name="marca"]');

const filtrosTamanho = document.querySelectorAll('input[name="tamanho"]');

const filtrosGenero = document.querySelectorAll('input[name="genero"]');

const filtrosCor = document.querySelectorAll('input[name="cor"]');

const filtrosMaterial = document.querySelectorAll('input[name="material"]');

const filtrosPreco = document.querySelectorAll('input[name="preco"]');

// ============================================================
// TODOS OS FILTROS
// ============================================================

const todosFiltros = [
  ...filtrosProduto,

  ...filtrosMarca,

  ...filtrosTamanho,

  ...filtrosGenero,

  ...filtrosCor,

  ...filtrosMaterial,

  ...filtrosPreco,
];

// ============================================================
// PARÂMETROS DA URL
// ============================================================

const parametros = new URLSearchParams(window.location.search);

const pesquisaURL = parametros.get("pesquisa");

const categoriaURL = parametros.get("categoria");

const destaqueURL = parametros.get("destaque");

// ============================================================
// ESTADO DO CATÁLOGO
// ============================================================

let produtos = [];

let produtosExibidos = [];

let quantidadeProdutos = 12;

let catalogoCarregado = false;

// ============================================================
// ESCAPAR HTML
// ============================================================

function escaparHTML(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================================
// NORMALIZAR TEXTO
// ============================================================

function normalizarTexto(texto) {
  return String(texto ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ============================================================
// FORMATAR PREÇO
// ============================================================

function formatarPreco(valor) {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return "R$ 0,00";
  }

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// ============================================================
// OBTER IMAGEM DO PRODUTO
// ============================================================

function obterImagemProduto(produto) {
  // Primeiro tenta a imagem principal.
  if (produto && produto.imagem) {
    return produto.imagem;
  }

  // Caso não exista imagem principal,
  // tenta a primeira imagem cadastrada.
  if (produto && Array.isArray(produto.imagens) && produto.imagens.length > 0) {
    const primeiraImagem = produto.imagens.find((item) => item && item.imagem);

    if (primeiraImagem) {
      return primeiraImagem.imagem;
    }
  }

  return "";
}

// ============================================================
// CRIAR CARD
// ============================================================
//
// O card possui uma área de imagem com tamanho fixo.
//
// Não colocamos onerror diretamente no HTML,
// porque isso pode causar problemas com aspas e
// quebrar o HTML gerado pelo JavaScript.
//
// O tratamento do erro da imagem é feito depois,
// através de configurarErrosDeImagem().
// ============================================================

function criarCard(produto) {
  const imagem = obterImagemProduto(produto);

  return `

        <article
            class="card"
            data-id="${Number(produto.id)}"
        >

            <div class="card-imagem">

                ${
                  imagem
                    ? `
                        <img
                            src="${escaparHTML(imagem)}"
                            alt="${escaparHTML(produto.nome)}"
                            loading="lazy"
                            class="imagem-produto"
                        >
                    `
                    : `
                        <div class="imagem-indisponivel">

                            <i class="fa-regular fa-image"></i>

                            <span>
                                Imagem indisponível
                            </span>

                        </div>
                    `
                }

            </div>


            <h3>
                ${escaparHTML(produto.nome)}
            </h3>


            <p class="preco">
                ${formatarPreco(produto.preco)}
            </p>

        </article>

    `;
}

// ============================================================
// CONFIGURAR ERROS DE IMAGEM
// ============================================================
//
// Depois que os cards são colocados na página,
// encontramos todas as imagens e adicionamos o evento
// de erro.
//
// Assim, se uma imagem não existir:
//
// imagem quebrada
//       ↓
// remove a imagem
//       ↓
// mostra "Imagem indisponível"
//
// A logo da Costa NÃO é usada como fallback.
// ============================================================

function configurarErrosDeImagem() {
  const imagens = document.querySelectorAll(".imagem-produto");

  imagens.forEach((imagem) => {
    imagem.addEventListener(
      "error",
      () => {
        const container = imagem.closest(".card-imagem");

        if (!container) {
          return;
        }

        container.innerHTML = `

                        <div class="imagem-indisponivel">

                            <i class="fa-regular fa-image"></i>

                            <span>
                                Imagem indisponível
                            </span>

                        </div>

                    `;
      },
      {
        once: true,
      },
    );
  });
}

// ============================================================
// MENSAGEM DE ERRO
// ============================================================

function mostrarErroCatalogo(mensagem) {
  if (!listaProdutos) {
    return;
  }

  listaProdutos.innerHTML = `

        <div class="mensagem-vazia">

            <h3>
                Não foi possível carregar os produtos.
            </h3>

            <p>
                ${escaparHTML(mensagem)}
            </p>

        </div>

    `;

  if (botaoMostrarMais) {
    botaoMostrarMais.style.display = "none";
  }

  if (contadorProdutos) {
    contadorProdutos.textContent = "Erro ao carregar produtos.";
  }
}

// ============================================================
// CARREGAR PRODUTOS DA API
// ============================================================

async function carregarProdutos() {
  try {
    const resposta = await fetch(`${API_URL}/produtos`);

    if (!resposta.ok) {
      throw new Error(`Servidor respondeu com status ${resposta.status}.`);
    }

    const dados = await resposta.json();

    if (!Array.isArray(dados)) {
      throw new Error("A API não retornou uma lista de produtos.");
    }

    produtos = dados;

    produtosExibidos = [...produtos];

    catalogoCarregado = true;

    atualizarCatalogo();
  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);

    mostrarErroCatalogo(
      "Verifique se o servidor da Costa Confecções está funcionando.",
    );
  }
}

// ============================================================
// RENDERIZAR PRODUTOS
// ============================================================

function renderizarProdutos(lista) {
  if (!listaProdutos) {
    return;
  }

  listaProdutos.innerHTML = "";

  // --------------------------------------------------------
  // NENHUM PRODUTO
  // --------------------------------------------------------

  if (lista.length === 0) {
    listaProdutos.innerHTML = `

            <div class="mensagem-vazia">

                <h3>
                    Nenhum produto encontrado.
                </h3>

                <p>
                    Tente pesquisar outro termo
                    ou remover os filtros.
                </p>

            </div>

        `;

    if (botaoMostrarMais) {
      botaoMostrarMais.style.display = "none";
    }

    return;
  }

  // --------------------------------------------------------
  // LIMITAR QUANTIDADE
  // --------------------------------------------------------

  const produtosParaMostrar = lista.slice(0, quantidadeProdutos);

  // --------------------------------------------------------
  // CRIAR CARDS
  // --------------------------------------------------------

  produtosParaMostrar.forEach((produto) => {
    listaProdutos.insertAdjacentHTML("beforeend", criarCard(produto));
  });

  // Configura os erros das imagens
  // depois que os elementos foram criados.
  configurarErrosDeImagem();

  // Controla o botão mostrar mais.
  controlarBotaoMostrarMais(lista);
}

// ============================================================
// CONTROLE DO BOTÃO "MOSTRAR MAIS"
// ============================================================

function controlarBotaoMostrarMais(lista) {
  if (!botaoMostrarMais) {
    return;
  }

  if (quantidadeProdutos >= lista.length) {
    botaoMostrarMais.style.display = "none";
  } else {
    botaoMostrarMais.style.display = "block";
  }
}

// ============================================================
// ATUALIZAR CONTADOR
// ============================================================

function atualizarContador(lista) {
  if (!contadorProdutos) {
    return;
  }

  if (lista.length === 0) {
    contadorProdutos.textContent = "Nenhum produto encontrado.";

    return;
  }

  const quantidade = lista.length;

  contadorProdutos.textContent = `${quantidade} ${
    quantidade === 1 ? "produto" : "produtos"
  } encontrado${quantidade === 1 ? "" : "s"}`;
}

// ============================================================
// PESQUISA
// ============================================================

function aplicarPesquisa(lista) {
  if (!campoPesquisa) {
    return lista;
  }

  const texto = normalizarTexto(campoPesquisa.value.trim());

  if (!texto) {
    return lista;
  }

  return lista.filter((produto) => {
    return (
      normalizarTexto(produto.nome).includes(texto) ||
      normalizarTexto(produto.marca).includes(texto) ||
      normalizarTexto(produto.categoria).includes(texto) ||
      normalizarTexto(produto.genero).includes(texto) ||
      normalizarTexto(produto.material).includes(texto) ||
      normalizarTexto(produto.cor).includes(texto)
    );
  });
}

// ============================================================
// FILTRO POR CATEGORIA
// ============================================================

function aplicarFiltroCategoria(lista) {
  const selecionados = Array.from(filtrosProduto)
    .filter((filtro) => filtro.checked)
    .map((filtro) => filtro.value);

  if (selecionados.length === 0) {
    return lista;
  }

  return lista.filter((produto) => {
    return selecionados.some((valor) => {
      return normalizarTexto(produto.categoria) === normalizarTexto(valor);
    });
  });
}

// ============================================================
// FILTRO POR MARCA
// ============================================================

function aplicarFiltroMarca(lista) {
  const selecionados = Array.from(filtrosMarca)
    .filter((filtro) => filtro.checked)
    .map((filtro) => filtro.value);

  if (selecionados.length === 0) {
    return lista;
  }

  return lista.filter((produto) => {
    return selecionados.some((valor) => {
      return normalizarTexto(produto.marca) === normalizarTexto(valor);
    });
  });
}

// ============================================================
// FILTRO POR TAMANHO
// ============================================================

function aplicarFiltroTamanho(lista) {
  const selecionados = Array.from(filtrosTamanho)
    .filter((filtro) => filtro.checked)
    .map((filtro) => filtro.value);

  if (selecionados.length === 0) {
    return lista;
  }

  return lista.filter((produto) => {
    // Produto com variações.
    if (Array.isArray(produto.variacoes)) {
      return produto.variacoes.some((variacao) => {
        return selecionados.some((tamanho) => {
          return normalizarTexto(variacao.tamanho) === normalizarTexto(tamanho);
        });
      });
    }

    // Produto antigo.
    return selecionados.some((tamanho) => {
      return normalizarTexto(produto.tamanho) === normalizarTexto(tamanho);
    });
  });
}

// ============================================================
// FILTRO POR GÊNERO
// ============================================================

function aplicarFiltroGenero(lista) {
  const selecionados = Array.from(filtrosGenero)
    .filter((filtro) => filtro.checked)
    .map((filtro) => filtro.value);

  if (selecionados.length === 0) {
    return lista;
  }

  return lista.filter((produto) => {
    return selecionados.some((valor) => {
      return normalizarTexto(produto.genero) === normalizarTexto(valor);
    });
  });
}

// ============================================================
// FILTRO POR COR
// ============================================================

function aplicarFiltroCor(lista) {
  const selecionados = Array.from(filtrosCor)
    .filter((filtro) => filtro.checked)
    .map((filtro) => filtro.value);

  if (selecionados.length === 0) {
    return lista;
  }

  return lista.filter((produto) => {
    // Produto com variações.
    if (Array.isArray(produto.variacoes)) {
      return produto.variacoes.some((variacao) => {
        return selecionados.some((cor) => {
          return normalizarTexto(variacao.cor) === normalizarTexto(cor);
        });
      });
    }

    // Produto antigo.
    return selecionados.some((cor) => {
      return normalizarTexto(produto.cor) === normalizarTexto(cor);
    });
  });
}

// ============================================================
// FILTRO POR MATERIAL
// ============================================================

function aplicarFiltroMaterial(lista) {
  const selecionados = Array.from(filtrosMaterial)
    .filter((filtro) => filtro.checked)
    .map((filtro) => filtro.value);

  if (selecionados.length === 0) {
    return lista;
  }

  return lista.filter((produto) => {
    return selecionados.some((valor) => {
      return normalizarTexto(produto.material) === normalizarTexto(valor);
    });
  });
}

// ============================================================
// FILTRO POR PREÇO
// ============================================================

function aplicarFiltroPreco(lista) {
  const selecionados = Array.from(filtrosPreco)
    .filter((filtro) => filtro.checked)
    .map((filtro) => filtro.value);

  if (selecionados.length === 0) {
    return lista;
  }

  return lista.filter((produto) => {
    const preco = Number(produto.preco);

    if (!Number.isFinite(preco)) {
      return false;
    }

    return selecionados.some((faixa) => {
      switch (faixa) {
        case "0-50":
          return preco <= 50;

        case "50-100":
          return preco > 50 && preco <= 100;

        case "100-200":
          return preco > 100 && preco <= 200;

        case "200+":
          return preco > 200;

        default:
          return false;
      }
    });
  });
}

// ============================================================
// APLICAR TODOS OS FILTROS
// ============================================================

function aplicarFiltros(lista) {
  lista = aplicarFiltroCategoria(lista);

  lista = aplicarFiltroMarca(lista);

  lista = aplicarFiltroTamanho(lista);

  lista = aplicarFiltroGenero(lista);

  lista = aplicarFiltroCor(lista);

  lista = aplicarFiltroMaterial(lista);

  lista = aplicarFiltroPreco(lista);

  return lista;
}

// ============================================================
// ORDENAÇÃO
// ============================================================

function ordenarProdutos(lista) {
  if (!ordenacao) {
    return lista;
  }

  const tipoOrdenacao = ordenacao.value;

  switch (tipoOrdenacao) {
    case "popularidade":
      return [...lista];

    case "menor-preco":
      return [...lista].sort((a, b) => Number(a.preco) - Number(b.preco));

    case "maior-preco":
      return [...lista].sort((a, b) => Number(b.preco) - Number(a.preco));

    default:
      return lista;
  }
}

// ============================================================
// ATUALIZAR CABEÇALHO
// ============================================================

function atualizarCabecalho() {
  if (!tituloCatalogo || !descricaoCatalogo) {
    return;
  }

  const generoSelecionado = Array.from(filtrosGenero).find(
    (filtro) => filtro.checked,
  );

  const produtoSelecionado = Array.from(filtrosProduto).find(
    (filtro) => filtro.checked,
  );

  // --------------------------------------------------------
  // GÊNERO
  // --------------------------------------------------------

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

  // --------------------------------------------------------
  // CATEGORIA
  // --------------------------------------------------------

  if (produtoSelecionado) {
    tituloCatalogo.textContent = String(produtoSelecionado.value).toUpperCase();

    descricaoCatalogo.textContent = "Confira nossa seleção de produtos.";

    return;
  }

  // --------------------------------------------------------
  // DESTAQUES
  // --------------------------------------------------------

  if (destaqueURL === "true") {
    tituloCatalogo.textContent = "MAIS POPULARES";

    descricaoCatalogo.textContent = "Confira os produtos mais procurados.";

    return;
  }

  // --------------------------------------------------------
  // PADRÃO
  // --------------------------------------------------------

  tituloCatalogo.textContent = "CATÁLOGO";

  descricaoCatalogo.textContent = "Explore todos os nossos produtos.";
}

// ============================================================
// ATUALIZAR CATÁLOGO
// ============================================================

function atualizarCatalogo() {
  // Sempre volta aos primeiros 12.
  quantidadeProdutos = 12;

  // Começa com todos os produtos.
  let listaFiltrada = [...produtos];

  // Pesquisa.
  listaFiltrada = aplicarPesquisa(listaFiltrada);

  // Filtros.
  listaFiltrada = aplicarFiltros(listaFiltrada);

  // Ordenação.
  listaFiltrada = ordenarProdutos(listaFiltrada);

  // Salva o resultado.
  produtosExibidos = listaFiltrada;

  // Mostra os cards.
  renderizarProdutos(produtosExibidos);

  // Atualiza contador.
  atualizarContador(produtosExibidos);

  // Atualiza cabeçalho.
  atualizarCabecalho();
}

// ============================================================
// LIMPAR FILTROS
// ============================================================

function limparFiltros() {
  // Limpa pesquisa.
  if (campoPesquisa) {
    campoPesquisa.value = "";
  }

  // Desmarca filtros.
  todosFiltros.forEach((filtro) => {
    filtro.checked = false;
  });

  // Volta à ordenação padrão.
  if (ordenacao) {
    ordenacao.value = "popularidade";
  }

  // Recalcula.
  atualizarCatalogo();
}

// ============================================================
// PARÂMETROS DA URL
// ============================================================

function aplicarParametrosURL() {
  // --------------------------------------------------------
  // PESQUISA
  // --------------------------------------------------------

  if (pesquisaURL && campoPesquisa) {
    campoPesquisa.value = pesquisaURL;
  }

  // --------------------------------------------------------
  // CATEGORIA / GÊNERO
  // --------------------------------------------------------

  if (categoriaURL) {
    let encontrouGenero = false;

    filtrosGenero.forEach((filtro) => {
      if (normalizarTexto(filtro.value) === normalizarTexto(categoriaURL)) {
        filtro.checked = true;

        encontrouGenero = true;
      }
    });

    // Se não encontrou gênero,
    // tenta encontrar categoria.
    if (!encontrouGenero) {
      filtrosProduto.forEach((filtro) => {
        if (normalizarTexto(filtro.value) === normalizarTexto(categoriaURL)) {
          filtro.checked = true;
        }
      });
    }
  }

  // --------------------------------------------------------
  // DESTAQUES
  // --------------------------------------------------------

  if (destaqueURL === "true" && ordenacao) {
    ordenacao.value = "popularidade";
  }
}

// ============================================================
// EVENTO DE PESQUISA
// ============================================================

if (campoPesquisa) {
  campoPesquisa.addEventListener("input", () => {
    if (!catalogoCarregado) {
      return;
    }

    atualizarCatalogo();
  });
}

// ============================================================
// EVENTO DE ORDENAÇÃO
// ============================================================

if (ordenacao) {
  ordenacao.addEventListener("change", () => {
    if (!catalogoCarregado) {
      return;
    }

    atualizarCatalogo();
  });
}

// ============================================================
// EVENTOS DOS FILTROS
// ============================================================

todosFiltros.forEach((filtro) => {
  filtro.addEventListener("change", () => {
    if (!catalogoCarregado) {
      return;
    }

    atualizarCatalogo();
  });
});

// ============================================================
// EVENTO LIMPAR FILTROS
// ============================================================

if (botaoLimparFiltros) {
  botaoLimparFiltros.addEventListener("click", limparFiltros);
}

// ============================================================
// EVENTO MOSTRAR MAIS
// ============================================================

if (botaoMostrarMais) {
  botaoMostrarMais.addEventListener("click", () => {
    quantidadeProdutos += 12;

    renderizarProdutos(produtosExibidos);

    atualizarContador(produtosExibidos);
  });
}

// ============================================================
// CLIQUE NOS CARDS
// ============================================================

if (listaProdutos) {
  listaProdutos.addEventListener("click", (event) => {
    const card = event.target.closest(".card");

    if (!card) {
      return;
    }

    const idProduto = Number(card.dataset.id);

    if (!Number.isInteger(idProduto) || idProduto <= 0) {
      console.error("ID de produto inválido.");

      return;
    }

    // Página correta do produto.
    window.location.href = `../Produto/produto-page.html?id=${idProduto}`;
  });
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

async function iniciarCatalogo() {
  // Aplica parâmetros da URL.
  aplicarParametrosURL();

  // Carrega produtos.
  await carregarProdutos();
}

// ============================================================
// INICIAR
// ============================================================

iniciarCatalogo();
