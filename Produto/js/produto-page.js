// ============================================================
// COSTA CONFECÇÕES
// PÁGINA DO PRODUTO
// Arquivo: produto-page.js
//
// Responsabilidades:
//
// • Identificar o produto pela URL
// • Buscar os dados do produto
// • Exibir nome, preço e descrição
// • Exibir marca, categoria, gênero e material
// • Exibir múltiplas imagens
// • Relacionar imagens às cores
// • Exibir e selecionar cores
// • Exibir e selecionar tamanhos
// • Consultar estoque por variação
// • Adicionar e remover favoritos
// • Carregar avaliações
// • Calcular média
// • Mostrar distribuição das estrelas
// • Mostrar comentários reais
// • Permitir envio de avaliação
//
// O JavaScript não acessa o banco diretamente.
// Todas as informações são obtidas através do server.js.
// ============================================================

// ============================================================
// CONFIGURAÇÃO DA API
// ============================================================

const API_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "http://127.0.0.1:3000"
  : `${window.location.origin}/api`;

// ============================================================
// ELEMENTOS DA PÁGINA
// ============================================================

// ------------------------------------------------------------
// PRODUTO
// ------------------------------------------------------------

const imagemProduto = document.getElementById("imagem-produto");

const nomeProduto = document.getElementById("nome-produto");

const precoProduto = document.getElementById("preco-produto");

const marcaProduto = document.getElementById("marca-produto");

const categoriaProduto = document.getElementById("categoria-produto");

const generoProduto = document.getElementById("genero-produto");

const tamanhoProduto = document.getElementById("tamanho-produto");

const tamanhosProduto = document.getElementById("tamanhos-produto");

const corProduto = document.getElementById("cor-produto");

const materialProduto = document.getElementById("material-produto");

const descricaoProduto = document.getElementById("descricao-produto");

const avaliacaoProduto = document.getElementById("avaliacao-produto");

// ------------------------------------------------------------
// CORES
// ------------------------------------------------------------

const coresProduto = document.getElementById("cores-produto");

// ------------------------------------------------------------
// ESTOQUE
// ------------------------------------------------------------

const estoqueProduto = document.getElementById("estoque-produto");

// ------------------------------------------------------------
// FAVORITOS
// ------------------------------------------------------------

const botaoFavorito = document.getElementById("botao-adicionar-favorito");

const textoFavorito = document.getElementById("texto-favorito");

// ------------------------------------------------------------
// AVALIAÇÕES
// ------------------------------------------------------------

const containerAvaliacoes = document.getElementById("avaliacoes-produto");

// ============================================================
// IDENTIFICAÇÃO DO PRODUTO
// ============================================================
//
// Exemplo:
//
// produto-page.html?id=5
//
// Nesse caso:
//
// idProduto = 5
// ============================================================

const parametros = new URLSearchParams(window.location.search);

const idProduto = Number(parametros.get("id"));

// ============================================================
// ESTADO DA PÁGINA
// ============================================================

// Guarda o produto atualmente aberto.
let produtoAtual = null;

// Indica se o produto está nos favoritos.
let produtoFavoritado = false;

// Guarda todas as imagens do produto.
let imagensProduto = [];

// Guarda as variações de cor, tamanho e estoque.
let variacoesProduto = [];

// Guarda a cor atualmente selecionada.
let corSelecionada = null;

// Guarda o tamanho atualmente selecionado.
let tamanhoSelecionado = null;

// Guarda a imagem atualmente selecionada.
let imagemSelecionada = null;

// Guarda as avaliações do produto.
let avaliacoesProduto = [];

// Guarda resumo recebido da API.
let resumoAvaliacoes = {
  media: 0,
  total: 0,
};

// ============================================================
// FORMATAÇÃO DE PREÇO
// ============================================================

function formatarPreco(valor) {
  const numero = Number(valor);

  if (Number.isNaN(numero)) {
    return "R$ 0,00";
  }

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// ============================================================
// ESCAPAR HTML
// ============================================================
//
// Evita que textos vindos do banco sejam interpretados
// como HTML.
// ============================================================

function escaparHTML(valor) {
  if (valor === null || valor === undefined) {
    return "";
  }

  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================================
// MENSAGENS
// ============================================================
//
// Utiliza a função global mostrarMensagem()
// caso ela exista.
//
// Caso não exista, utiliza alert().
// ============================================================

function mostrarMensagemProduto(mensagem) {
  if (typeof mostrarMensagem === "function") {
    mostrarMensagem(mensagem);

    return;
  }

  alert(mensagem);
}

// ============================================================
// CAMINHO DA IMAGEM
// ============================================================
//
// O backend agora retorna URLs como:
//
// http://127.0.0.1:3000/uploads/produtos/arquivo.jpg
//
// Quando já for uma URL válida, não alteramos.
// ============================================================

function obterCaminhoImagem(imagem) {
  if (!imagem) {
    return "";
  }

  const caminho = String(imagem).trim();

  // --------------------------------------------------------
  // URL COMPLETA
  // --------------------------------------------------------

  if (caminho.startsWith("http://") || caminho.startsWith("https://")) {
    return caminho;
  }

  // --------------------------------------------------------
  // CAMINHO RELATIVO
  // --------------------------------------------------------

  if (
    caminho.startsWith("/") ||
    caminho.startsWith("../") ||
    caminho.startsWith("./")
  ) {
    return caminho;
  }

  // --------------------------------------------------------
  // COMPATIBILIDADE
  // --------------------------------------------------------
  //
  // Produtos antigos podem possuir apenas o nome
  // da imagem armazenado.
  // --------------------------------------------------------

  return `../Catalogo/CSS/${caminho}`;
}

// ============================================================
// CONTAINER DE MINIATURAS
// ============================================================

function obterContainerMiniaturas() {
  let container = document.getElementById("miniaturas-produto");

  if (container) {
    return container;
  }

  container = document.createElement("div");

  container.id = "miniaturas-produto";

  container.className = "miniaturas";

  if (imagemProduto && imagemProduto.parentElement) {
    imagemProduto.parentElement.appendChild(container);
  }

  return container;
}

// ============================================================
// CONTAINER DE CORES
// ============================================================
//
// O HTML definitivo já possui esse container.
// A função existe apenas para manter compatibilidade.
// ============================================================

function obterContainerCores() {
  if (coresProduto) {
    return coresProduto;
  }

  return null;
}

// ============================================================
// CARREGAR PRODUTO
// ============================================================

async function carregarProduto() {
  // --------------------------------------------------------
  // VALIDAR ID
  // --------------------------------------------------------

  if (!idProduto || !Number.isInteger(idProduto)) {
    mostrarMensagemProduto("ID do produto inválido.");

    return;
  }

  try {
    // ----------------------------------------------------
    // BUSCAR PRODUTO
    // ----------------------------------------------------

    const resposta = await fetch(`${API_URL}/produtos/${idProduto}`);

    const dados = await resposta.json();

    if (!resposta.ok) {
      mostrarMensagemProduto(dados.mensagem || "Erro ao carregar produto.");

      return;
    }

    // Guarda o produto.
    produtoAtual = dados;

    // ----------------------------------------------------
    // PREENCHER DADOS
    // ----------------------------------------------------

    preencherProduto(produtoAtual);

    // ----------------------------------------------------
    // IMAGENS
    // ----------------------------------------------------

    await carregarImagens();

    // ----------------------------------------------------
    // VARIAÇÕES
    // ----------------------------------------------------

    await carregarVariacoes();

    // ----------------------------------------------------
    // FAVORITO
    // ----------------------------------------------------

    await verificarFavorito();

    // ----------------------------------------------------
    // AVALIAÇÕES
    // ----------------------------------------------------

    await carregarAvaliacoes();
  } catch (erro) {
    console.error("Erro ao carregar produto:", erro);

    mostrarMensagemProduto("Erro ao conectar com o servidor.");
  }
}

// ============================================================
// PREENCHER PRODUTO
// ============================================================

function preencherProduto(produto) {
  // --------------------------------------------------------
  // IMAGEM
  // --------------------------------------------------------

  if (imagemProduto) {
    const caminhoImagem = obterCaminhoImagem(produto.imagem);

    if (caminhoImagem) {
      imagemProduto.src = caminhoImagem;
    } else {
      imagemProduto.removeAttribute("src");
    }

    imagemProduto.alt = produto.nome || "Imagem do produto";
  }

  // --------------------------------------------------------
  // NOME
  // --------------------------------------------------------

  if (nomeProduto) {
    nomeProduto.textContent = produto.nome || "Produto";
  }

  // --------------------------------------------------------
  // PREÇO
  // --------------------------------------------------------

  if (precoProduto) {
    precoProduto.textContent = formatarPreco(produto.preco);
  }

  // --------------------------------------------------------
  // MARCA
  // --------------------------------------------------------

  if (marcaProduto) {
    marcaProduto.textContent = produto.marca || "Não informado";
  }

  // --------------------------------------------------------
  // CATEGORIA
  // --------------------------------------------------------

  if (categoriaProduto) {
    categoriaProduto.textContent = produto.categoria || "Não informado";
  }

  // --------------------------------------------------------
  // GÊNERO
  // --------------------------------------------------------

  if (generoProduto) {
    generoProduto.textContent = produto.genero || "Não informado";
  }

  // --------------------------------------------------------
  // MATERIAL
  // --------------------------------------------------------

  if (materialProduto) {
    materialProduto.textContent = produto.material || "Não informado";
  }

  // --------------------------------------------------------
  // COR
  // --------------------------------------------------------

  if (corProduto) {
    corProduto.textContent = produto.cor || "Não informado";
  }

  // --------------------------------------------------------
  // TAMANHO
  // --------------------------------------------------------

  if (tamanhoProduto) {
    tamanhoProduto.textContent = produto.tamanho || "Não informado";
  }

  // --------------------------------------------------------
  // DESCRIÇÃO
  // --------------------------------------------------------

  if (descricaoProduto) {
    descricaoProduto.textContent =
      produto.descricao || "Nenhuma descrição informada.";
  }
}

// ============================================================
// IMAGENS DO PRODUTO
// ============================================================
//
// GET /produtos/:id/imagens
// ============================================================

async function carregarImagens() {
  try {
    const resposta = await fetch(`${API_URL}/produtos/${idProduto}/imagens`);

    // ----------------------------------------------------
    // FALLBACK
    // ----------------------------------------------------

    if (resposta.status === 404) {
      imagensProduto = produtoAtual?.imagem
        ? [
            {
              imagem: produtoAtual.imagem,

              cor: produtoAtual.cor || null,
            },
          ]
        : [];

      renderizarGaleria();

      return;
    }

    const dados = await resposta.json();

    if (!resposta.ok) {
      imagensProduto = [];

      renderizarGaleria();

      return;
    }

    imagensProduto = Array.isArray(dados) ? dados : [];

    // ----------------------------------------------------
    // FALLBACK PARA IMAGEM PRINCIPAL
    // ----------------------------------------------------

    if (imagensProduto.length === 0 && produtoAtual?.imagem) {
      imagensProduto = [
        {
          imagem: produtoAtual.imagem,

          cor: produtoAtual.cor || null,
        },
      ];
    }

    renderizarGaleria();
  } catch (erro) {
    console.error("Erro ao carregar imagens:", erro);

    imagensProduto = produtoAtual?.imagem
      ? [
          {
            imagem: produtoAtual.imagem,

            cor: produtoAtual.cor || null,
          },
        ]
      : [];

    renderizarGaleria();
  }
}

// ============================================================
// GALERIA
// ============================================================

function renderizarGaleria() {
  const container = obterContainerMiniaturas();

  if (!container) {
    return;
  }

  container.innerHTML = "";

  // No máximo 4 imagens.
  const imagens = imagensProduto.slice(0, 4);

  imagens.forEach((item, indice) => {
    const caminho = obterCaminhoImagem(item.imagem);

    if (!caminho) {
      return;
    }

    const miniatura = document.createElement("img");

    miniatura.src = caminho;

    miniatura.alt = `${produtoAtual?.nome || "Produto"} - imagem ${indice + 1}`;

    miniatura.classList.add("miniatura-produto");

    miniatura.loading = "lazy";

    // ---------------------------------------------
    // CLIQUE
    // ---------------------------------------------

    miniatura.addEventListener("click", () => {
      selecionarImagem(item);
    });

    container.appendChild(miniatura);
  });

  // Selecionar automaticamente
  // a primeira imagem.
  if (imagens.length > 0) {
    selecionarImagem(imagens[0]);
  }
}

// ============================================================
// SELECIONAR IMAGEM
// ============================================================

function selecionarImagem(item) {
  if (!item) {
    return;
  }

  const caminho = obterCaminhoImagem(item.imagem);

  if (!caminho || !imagemProduto) {
    return;
  }

  imagemProduto.src = caminho;

  imagemProduto.alt = `${produtoAtual?.nome || "Produto"}${
    item.cor ? ` - ${item.cor}` : ""
  }`;

  imagemSelecionada = item.imagem;

  // --------------------------------------------------------
  // ASSOCIAR IMAGEM À COR
  // --------------------------------------------------------

  if (item.cor) {
    corSelecionada = item.cor;

    atualizarCorSelecionada();
  }
}

// ============================================================
// CARREGAR VARIAÇÕES
// ============================================================
//
// GET /produtos/:id/variacoes
// ============================================================

async function carregarVariacoes() {
  try {
    const resposta = await fetch(`${API_URL}/produtos/${idProduto}/variacoes`);

    // ----------------------------------------------------
    // FALLBACK ANTIGO
    // ----------------------------------------------------

    if (resposta.status === 404) {
      criarVariacaoLegada();

      return;
    }

    const dados = await resposta.json();

    if (!resposta.ok) {
      criarVariacaoLegada();

      return;
    }

    variacoesProduto = Array.isArray(dados) ? dados : [];

    // ----------------------------------------------------
    // SEM VARIAÇÕES
    // ----------------------------------------------------

    if (variacoesProduto.length === 0) {
      criarVariacaoLegada();

      return;
    }

    // ----------------------------------------------------
    // PRIMEIRA COR
    // ----------------------------------------------------

    corSelecionada = variacoesProduto[0].cor || null;

    // Renderiza cores.
    renderizarCores();

    // Renderiza tamanhos.
    renderizarTamanhos();

    // Atualiza estoque.
    atualizarEstoque();
  } catch (erro) {
    console.error("Erro ao carregar variações:", erro);

    criarVariacaoLegada();
  }
}

// ============================================================
// PRODUTOS ANTIGOS
// ============================================================
//
// Produtos criados antes do sistema de variações
// podem possuir cor/tamanho diretamente na tabela.
// ============================================================

function criarVariacaoLegada() {
  variacoesProduto = [];

  if (produtoAtual && (produtoAtual.cor || produtoAtual.tamanho)) {
    variacoesProduto.push({
      cor: produtoAtual.cor || "Única",

      tamanho: produtoAtual.tamanho || "Único",

      estoque: produtoAtual.estoque ?? 0,
    });
  }

  corSelecionada = variacoesProduto.length > 0 ? variacoesProduto[0].cor : null;

  renderizarCores();

  renderizarTamanhos();

  atualizarEstoque();
}

// ============================================================
// RENDERIZAR CORES
// ============================================================

function renderizarCores() {
  const container = obterContainerCores();

  if (!container) {
    return;
  }

  container.innerHTML = "";

  // --------------------------------------------------------
  // OBTER CORES ÚNICAS
  // --------------------------------------------------------

  const cores = [
    ...new Set(
      variacoesProduto.map((variacao) => variacao.cor).filter(Boolean),
    ),
  ];

  // --------------------------------------------------------
  // FALLBACK
  // --------------------------------------------------------

  if (cores.length === 0 && produtoAtual?.cor) {
    cores.push(produtoAtual.cor);
  }

  // --------------------------------------------------------
  // CRIAR BOTÕES
  // --------------------------------------------------------

  cores.forEach((cor) => {
    const botao = document.createElement("button");

    botao.type = "button";

    botao.className = "cor";

    botao.dataset.cor = cor;

    botao.title = cor;

    botao.setAttribute("aria-label", `Selecionar cor ${cor}`);

    aplicarCorVisual(botao, cor);

    if (corSelecionada === cor) {
      botao.classList.add("cor-selecionada");
    }

    botao.addEventListener("click", () => {
      selecionarCor(cor);
    });

    container.appendChild(botao);
  });

  atualizarCorSelecionada();
}

// ============================================================
// CORES VISUAIS
// ============================================================
//
// Traduz nomes comuns de cores para valores CSS.
// ============================================================

function aplicarCorVisual(elemento, nomeCor) {
  const cor = String(nomeCor).trim().toLowerCase();

  const cores = {
    preto: "#000000",

    branco: "#ffffff",

    vermelho: "#d00000",

    azul: "#1f8cff",

    verde: "#198754",

    amarelo: "#ffd43b",

    laranja: "#ff8c00",

    rosa: "#ff69b4",

    roxo: "#800080",

    bege: "#dbcab8",

    marrom: "#7b4b2a",

    cinza: "#808080",

    cinzа: "#808080",
  };

  // --------------------------------------------------------
  // COR CONHECIDA
  // --------------------------------------------------------

  if (cores[cor]) {
    elemento.style.backgroundColor = cores[cor];

    return;
  }

  // --------------------------------------------------------
  // TENTAR CSS DIRETAMENTE
  // --------------------------------------------------------

  elemento.style.backgroundColor = cor;
}

// ============================================================
// SELECIONAR COR
// ============================================================

function selecionarCor(cor) {
  corSelecionada = cor;

  tamanhoSelecionado = null;

  // Atualiza visual.
  atualizarCorSelecionada();

  // Atualiza os tamanhos.
  renderizarTamanhos();

  // Atualiza estoque.
  atualizarEstoque();

  // Troca a imagem para a correspondente à cor.
  selecionarImagemDaCor(cor);
}

// ============================================================
// ATUALIZAR COR SELECIONADA
// ============================================================

function atualizarCorSelecionada() {
  const botoes = document.querySelectorAll("#cores-produto .cor");

  botoes.forEach((botao) => {
    botao.classList.toggle(
      "cor-selecionada",
      botao.dataset.cor === corSelecionada,
    );
  });

  // Atualiza texto.
  if (corProduto) {
    corProduto.textContent = corSelecionada || "Não informado";
  }
}

// ============================================================
// IMAGEM DA COR
// ============================================================

function selecionarImagemDaCor(cor) {
  const imagem = imagensProduto.find((item) => {
    if (!item.cor) {
      return false;
    }

    return (
      String(item.cor).trim().toLowerCase() === String(cor).trim().toLowerCase()
    );
  });

  if (imagem) {
    selecionarImagem(imagem);
  }
}

// ============================================================
// RENDERIZAR TAMANHOS
// ============================================================

function renderizarTamanhos() {
  if (!tamanhosProduto) {
    return;
  }

  tamanhosProduto.innerHTML = "";

  let tamanhos = [];

  // --------------------------------------------------------
  // TAMANHOS DA COR SELECIONADA
  // --------------------------------------------------------

  if (corSelecionada) {
    tamanhos = [
      ...new Set(
        variacoesProduto
          .filter((variacao) => {
            return (
              String(variacao.cor).trim().toLowerCase() ===
              String(corSelecionada).trim().toLowerCase()
            );
          })
          .map((variacao) => variacao.tamanho)
          .filter(Boolean),
      ),
    ];
  }

  // --------------------------------------------------------
  // FALLBACK PARA PRODUTO ANTIGO
  // --------------------------------------------------------

  if (tamanhos.length === 0 && produtoAtual?.tamanho) {
    tamanhos = String(produtoAtual.tamanho)
      .split(",")
      .map((tamanho) => tamanho.trim())
      .filter(Boolean);
  }

  // --------------------------------------------------------
  // SEM TAMANHO
  // --------------------------------------------------------

  if (tamanhos.length === 0) {
    tamanhosProduto.innerHTML = `

            <span>
                Tamanho não informado
            </span>

        `;

    if (tamanhoProduto) {
      tamanhoProduto.textContent = "Não informado";
    }

    return;
  }

  // --------------------------------------------------------
  // CRIAR BOTÕES
  // --------------------------------------------------------

  tamanhos.forEach((tamanho) => {
    const botao = document.createElement("button");

    botao.type = "button";

    botao.textContent = tamanho;

    botao.dataset.tamanho = tamanho;

    botao.classList.add("tamanho");

    botao.setAttribute("aria-label", `Selecionar tamanho ${tamanho}`);

    if (tamanhoSelecionado === tamanho) {
      botao.classList.add("tamanho-selecionado");
    }

    botao.addEventListener("click", () => {
      selecionarTamanho(tamanho);
    });

    tamanhosProduto.appendChild(botao);
  });

  atualizarTamanhos();
}

// ============================================================
// SELECIONAR TAMANHO
// ============================================================

function selecionarTamanho(tamanho) {
  tamanhoSelecionado = tamanho;

  atualizarTamanhos();

  atualizarEstoque();
}

// ============================================================
// ATUALIZAR TAMANHO
// ============================================================

function atualizarTamanhos() {
  const botoes = document.querySelectorAll("#tamanhos-produto button");

  botoes.forEach((botao) => {
    botao.classList.toggle(
      "tamanho-selecionado",
      botao.dataset.tamanho === tamanhoSelecionado,
    );
  });

  if (tamanhoProduto) {
    tamanhoProduto.textContent = tamanhoSelecionado || "Não informado";
  }
}

// ============================================================
// ATUALIZAR ESTOQUE
// ============================================================

function atualizarEstoque() {
  if (!estoqueProduto) {
    return;
  }

  // --------------------------------------------------------
  // SEM COR OU TAMANHO
  // --------------------------------------------------------

  if (!corSelecionada || !tamanhoSelecionado) {
    estoqueProduto.textContent = "Selecione uma cor e um tamanho.";

    return;
  }

  // --------------------------------------------------------
  // PROCURAR VARIAÇÃO
  // --------------------------------------------------------

  const variacao = variacoesProduto.find((item) => {
    return (
      String(item.cor).trim().toLowerCase() ===
        String(corSelecionada).trim().toLowerCase() &&
      String(item.tamanho).trim().toLowerCase() ===
        String(tamanhoSelecionado).trim().toLowerCase()
    );
  });

  // --------------------------------------------------------
  // INDISPONÍVEL
  // --------------------------------------------------------

  if (!variacao) {
    estoqueProduto.textContent = "Produto indisponível para essa combinação.";

    return;
  }

  const estoque = Number(variacao.estoque);

  // --------------------------------------------------------
  // SEM ESTOQUE
  // --------------------------------------------------------

  if (estoque <= 0) {
    estoqueProduto.textContent = "Sem estoque.";

    return;
  }

  // --------------------------------------------------------
  // ESTOQUE DISPONÍVEL
  // --------------------------------------------------------

  estoqueProduto.textContent = `Estoque disponível: ${estoque} unidade${
    estoque === 1 ? "" : "s"
  }.`;
}

// ============================================================
// FAVORITOS
// ============================================================

// ------------------------------------------------------------
// VERIFICAR FAVORITO
// ------------------------------------------------------------
//
// A sessão é enviada através de credentials: include.
// ============================================================

async function verificarFavorito() {
  if (!botaoFavorito) {
    return;
  }

  try {
    const resposta = await fetch(`${API_URL}/favoritos`, {
      method: "GET",

      credentials: "include",
    });

    // Usuário não autenticado.
    if (resposta.status === 401) {
      produtoFavoritado = false;

      atualizarBotaoFavorito();

      return;
    }

    const dados = await resposta.json();

    if (!resposta.ok) {
      produtoFavoritado = false;

      atualizarBotaoFavorito();

      return;
    }

    produtoFavoritado =
      Array.isArray(dados) &&
      dados.some((favorito) => Number(favorito.produto_id) === idProduto);

    atualizarBotaoFavorito();
  } catch (erro) {
    console.error("Erro ao verificar favorito:", erro);

    produtoFavoritado = false;

    atualizarBotaoFavorito();
  }
}

// ============================================================
// ATUALIZAR BOTÃO FAVORITO
// ============================================================

function atualizarBotaoFavorito() {
  if (!botaoFavorito) {
    return;
  }

  const icone = botaoFavorito.querySelector("i");

  if (produtoFavoritado) {
    // Produto favoritado.
    if (icone) {
      icone.className = "fa-solid fa-heart";
    }

    if (textoFavorito) {
      textoFavorito.textContent = "Remover dos Favoritos";
    }
  } else {
    // Produto não favoritado.
    if (icone) {
      icone.className = "fa-regular fa-heart";
    }

    if (textoFavorito) {
      textoFavorito.textContent = "Adicionar aos Favoritos";
    }
  }
}

// ============================================================
// ADICIONAR FAVORITO
// ============================================================

async function adicionarFavorito() {
  try {
    const resposta = await fetch(`${API_URL}/favoritos`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify({
        produtoId: idProduto,
      }),
    });

    const dados = await resposta.json();

    // ----------------------------------------------------
    // NÃO LOGADO
    // ----------------------------------------------------

    if (resposta.status === 401) {
      mostrarMensagemProduto(
        "Você precisa estar logado para adicionar favoritos.",
      );

      return;
    }

    // ----------------------------------------------------
    // ERRO
    // ----------------------------------------------------

    if (!resposta.ok) {
      mostrarMensagemProduto(dados.mensagem || "Erro ao adicionar favorito.");

      return;
    }

    // ----------------------------------------------------
    // SUCESSO
    // ----------------------------------------------------

    produtoFavoritado = true;

    atualizarBotaoFavorito();

    mostrarMensagemProduto("Produto adicionado aos favoritos!");
  } catch (erro) {
    console.error("Erro ao adicionar favorito:", erro);

    mostrarMensagemProduto("Erro ao conectar com o servidor.");
  }
}

// ============================================================
// REMOVER FAVORITO
// ============================================================

async function removerFavorito() {
  try {
    const resposta = await fetch(`${API_URL}/favoritos/${idProduto}`, {
      method: "DELETE",

      credentials: "include",
    });

    const dados = await resposta.json();

    // ----------------------------------------------------
    // NÃO LOGADO
    // ----------------------------------------------------

    if (resposta.status === 401) {
      mostrarMensagemProduto("Você precisa estar logado.");

      return;
    }

    // ----------------------------------------------------
    // ERRO
    // ----------------------------------------------------

    if (!resposta.ok) {
      mostrarMensagemProduto(dados.mensagem || "Erro ao remover favorito.");

      return;
    }

    // ----------------------------------------------------
    // SUCESSO
    // ----------------------------------------------------

    produtoFavoritado = false;

    atualizarBotaoFavorito();

    mostrarMensagemProduto("Produto removido dos favoritos.");
  } catch (erro) {
    console.error("Erro ao remover favorito:", erro);

    mostrarMensagemProduto("Erro ao conectar com o servidor.");
  }
}

// ============================================================
// EVENTO DO BOTÃO FAVORITO
// ============================================================

if (botaoFavorito) {
  botaoFavorito.addEventListener("click", () => {
    if (produtoFavoritado) {
      removerFavorito();
    } else {
      adicionarFavorito();
    }
  });
}

// ============================================================
// AVALIAÇÕES
// ============================================================

// ------------------------------------------------------------
// CARREGAR AVALIAÇÕES
// ------------------------------------------------------------
//
// IMPORTANTE:
//
// A API retorna:
//
// {
//     media,
//     total,
//     avaliacoes
// }
//
// O JS antigo tratava a resposta diretamente como array.
// Aqui corrigimos isso.
// ------------------------------------------------------------

async function carregarAvaliacoes() {
  try {
    const resposta = await fetch(`${API_URL}/produtos/${idProduto}/avaliacoes`);

    const dados = await resposta.json();

    // ----------------------------------------------------
    // ERRO
    // ----------------------------------------------------

    if (!resposta.ok) {
      resumoAvaliacoes = {
        media: 0,
        total: 0,
      };

      avaliacoesProduto = [];

      atualizarAvaliacaoTopo();

      renderizarAvaliacoes();

      return;
    }

    // ----------------------------------------------------
    // RESUMO
    // ----------------------------------------------------

    resumoAvaliacoes = {
      media: Number(dados.media) || 0,

      total: Number(dados.total) || 0,
    };

    // ----------------------------------------------------
    // AVALIAÇÕES
    // ----------------------------------------------------

    avaliacoesProduto = Array.isArray(dados.avaliacoes) ? dados.avaliacoes : [];

    // Atualiza avaliação resumida no topo.
    atualizarAvaliacaoTopo();

    // Renderiza toda a seção.
    renderizarAvaliacoes();
  } catch (erro) {
    console.error("Erro ao carregar avaliações:", erro);

    resumoAvaliacoes = {
      media: 0,
      total: 0,
    };

    avaliacoesProduto = [];

    atualizarAvaliacaoTopo();

    renderizarAvaliacoes();
  }
}

// ============================================================
// ATUALIZAR AVALIAÇÃO NO TOPO
// ============================================================
//
// Atualiza o texto:
//
// ★ 4,8 (120 avaliações)
//
// usando os dados reais do banco.
// ============================================================

function atualizarAvaliacaoTopo() {
  if (!avaliacaoProduto) {
    return;
  }

  const media = Number(resumoAvaliacoes.media) || 0;

  const total = Number(resumoAvaliacoes.total) || 0;

  if (total === 0) {
    avaliacaoProduto.innerHTML = `

            <i class="fa-regular fa-star"></i>

            Nenhuma avaliação

        `;

    return;
  }

  avaliacaoProduto.innerHTML = `

        <i class="fa-solid fa-star"></i>

        ${media.toFixed(1).replace(".", ",")}

        (${total}

        ${total === 1 ? "avaliação" : "avaliações"})

    `;
}

// ============================================================
// MÉDIA DAS AVALIAÇÕES
// ============================================================

function calcularMediaAvaliacoes() {
  // Se o backend já informou uma média,
  // usamos ela como fonte principal.
  if (resumoAvaliacoes && Number.isFinite(Number(resumoAvaliacoes.media))) {
    return Number(resumoAvaliacoes.media);
  }

  // Fallback caso seja necessário calcular manualmente.
  if (avaliacoesProduto.length === 0) {
    return 0;
  }

  const soma = avaliacoesProduto.reduce((total, avaliacao) => {
    return total + Number(avaliacao.nota);
  }, 0);

  return soma / avaliacoesProduto.length;
}

// ============================================================
// CONTAR ESTRELAS
// ============================================================

function contarEstrelas(nota) {
  return avaliacoesProduto.filter(
    (avaliacao) => Number(avaliacao.nota) === Number(nota),
  ).length;
}

// ============================================================
// GERAR ESTRELAS
// ============================================================

function gerarEstrelas(nota) {
  const valor = Math.max(0, Math.min(5, Number(nota) || 0));

  const inteiras = Math.round(valor);

  return "★".repeat(inteiras) + "☆".repeat(5 - inteiras);
}

// ============================================================
// RENDERIZAR AVALIAÇÕES
// ============================================================

function renderizarAvaliacoes() {
  if (!containerAvaliacoes) {
    return;
  }

  const media = calcularMediaAvaliacoes();

  const total = Number(resumoAvaliacoes.total) || avaliacoesProduto.length;

  // --------------------------------------------------------
  // RESUMO
  // --------------------------------------------------------

  let html = `

        <div class="resumo-avaliacoes">

            <div class="media-avaliacoes">

                <h2>
                    Avaliações
                </h2>

                <strong>
                    ${media.toFixed(1).replace(".", ",")}
                </strong>

                <span>
                    ${gerarEstrelas(media)}
                </span>

                <small>

                    ${total}

                    ${total === 1 ? "avaliação" : "avaliações"}

                </small>

            </div>


            <div class="distribuicao-estrelas">

    `;

  // --------------------------------------------------------
  // DISTRIBUIÇÃO DE ESTRELAS
  // --------------------------------------------------------

  for (let nota = 5; nota >= 1; nota--) {
    const quantidade = contarEstrelas(nota);

    const porcentagem = total > 0 ? (quantidade / total) * 100 : 0;

    html += `

            <div class="linha-estrela">

                <span>
                    ${nota} ★
                </span>

                <div class="barra">

                    <span
                        style="width: ${porcentagem}%"
                    ></span>

                </div>

                <span>
                    ${quantidade}
                </span>

            </div>

        `;
  }

  html += `

            </div>

        </div>


        <div
            class="lista-avaliacoes"
            id="lista-avaliacoes"
        >

    `;

  // --------------------------------------------------------
  // SEM AVALIAÇÕES
  // --------------------------------------------------------

  if (avaliacoesProduto.length === 0) {
    html += `

            <p>

                Este produto ainda não possui avaliações.

            </p>

        `;
  } else {
    // ----------------------------------------------------
    // COMENTÁRIOS REAIS
    // ----------------------------------------------------

    avaliacoesProduto.forEach((avaliacao) => {
      const nome = avaliacao.usuario_nome || avaliacao.nome || "Cliente";

      html += `

                    <article class="avaliacao">

                        <div class="cabecalho-avaliacao">

                            <strong>
                                ${escaparHTML(nome)}
                            </strong>

                            <span>
                                ${gerarEstrelas(avaliacao.nota)}
                            </span>

                        </div>


                        <p>

                            ${escaparHTML(
                              avaliacao.comentario || "Nenhum comentário.",
                            )}

                        </p>


                        <small>

                            ${formatarData(avaliacao.criado_em)}

                        </small>

                    </article>

                `;
    });
  }

  html += `

        </div>


        ${criarFormularioAvaliacao()}

    `;

  containerAvaliacoes.innerHTML = html;

  configurarFormularioAvaliacao();
}

// ============================================================
// FORMULÁRIO DE AVALIAÇÃO
// ============================================================

function criarFormularioAvaliacao() {
  return `

        <div class="formulario-avaliacao">

            <h3>
                Avalie este produto
            </h3>


            <form
                id="form-avaliacao"
            >


                <div>

                    <label
                        for="nota-avaliacao"
                    >

                        Nota

                    </label>


                    <select
                        id="nota-avaliacao"
                        required
                    >

                        <option value="">
                            Selecione uma nota
                        </option>

                        <option value="5">
                            5 estrelas
                        </option>

                        <option value="4">
                            4 estrelas
                        </option>

                        <option value="3">
                            3 estrelas
                        </option>

                        <option value="2">
                            2 estrelas
                        </option>

                        <option value="1">
                            1 estrela
                        </option>

                    </select>

                </div>


                <div>

                    <label
                        for="comentario-avaliacao"
                    >

                        Comentário

                    </label>


                    <textarea
                        id="comentario-avaliacao"
                        rows="5"
                        maxlength="1000"
                        placeholder="Conte o que você achou do produto..."
                    ></textarea>

                </div>


                <button
                    type="submit"
                >

                    Enviar avaliação

                </button>


            </form>

        </div>

    `;
}

// ============================================================
// CONFIGURAR FORMULÁRIO
// ============================================================

function configurarFormularioAvaliacao() {
  const formulario = document.getElementById("form-avaliacao");

  if (!formulario) {
    return;
  }

  formulario.addEventListener("submit", enviarAvaliacao);
}

// ============================================================
// ENVIAR AVALIAÇÃO
// ============================================================
//
// POST /produtos/:id/avaliacoes
// ============================================================

async function enviarAvaliacao(event) {
  event.preventDefault();

  const campoNota = document.getElementById("nota-avaliacao");

  const campoComentario = document.getElementById("comentario-avaliacao");

  const nota = Number(campoNota?.value);

  const comentario = campoComentario?.value?.trim() || "";

  // --------------------------------------------------------
  // VALIDAR NOTA
  // --------------------------------------------------------

  if (!nota || nota < 1 || nota > 5) {
    mostrarMensagemProduto("Selecione uma nota entre 1 e 5 estrelas.");

    return;
  }

  try {
    const resposta = await fetch(
      `${API_URL}/produtos/${idProduto}/avaliacoes`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          nota: nota,

          comentario: comentario,
        }),
      },
    );

    const dados = await resposta.json();

    // ----------------------------------------------------
    // NÃO LOGADO
    // ----------------------------------------------------

    if (resposta.status === 401) {
      mostrarMensagemProduto(
        "Você precisa estar logado para avaliar este produto.",
      );

      return;
    }

    // ----------------------------------------------------
    // ERRO
    // ----------------------------------------------------

    if (!resposta.ok) {
      mostrarMensagemProduto(
        dados.mensagem || "Não foi possível enviar sua avaliação.",
      );

      return;
    }

    // ----------------------------------------------------
    // SUCESSO
    // ----------------------------------------------------

    mostrarMensagemProduto("Sua avaliação foi enviada com sucesso!");

    // Atualiza tudo imediatamente.
    await carregarAvaliacoes();
  } catch (erro) {
    console.error("Erro ao enviar avaliação:", erro);

    mostrarMensagemProduto("Erro ao conectar com o servidor.");
  }
}

// ============================================================
// FORMATAR DATA
// ============================================================

function formatarData(data) {
  if (!data) {
    return "";
  }

  const valor = new Date(data);

  if (Number.isNaN(valor.getTime())) {
    return "";
  }

  return valor.toLocaleDateString("pt-BR");
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

async function iniciarProduto() {
  await carregarProduto();
}

// ============================================================
// EXECUÇÃO
// ============================================================
//
// Se o DOM ainda estiver carregando,
// espera o evento.
//
// Caso já esteja carregado,
// executa imediatamente.
// ============================================================

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarProduto);
} else {
  iniciarProduto();
}
