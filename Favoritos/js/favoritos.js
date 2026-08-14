// ============================================================
// COSTA CONFECÇÕES
// FAVORITOS.JS
// Página de Lista de Desejos / Favoritos
// ============================================================

// ============================================================
// CONFIGURAÇÃO DA API
// ============================================================

// Endereço da API utilizada pelo projeto.
const API_URL = "http://127.0.0.1:3000";

// ============================================================
// ELEMENTOS DA PÁGINA
// ============================================================

// Área onde os produtos favoritos serão exibidos.
const listaFavoritos = document.getElementById("favoritos");

// ============================================================
// FILTROS DE PREÇO
// ============================================================

// Checkbox para ordenar do maior para o menor preço.
const checkboxMaiorPreco = document.querySelector("#checkboxMaiorPreco input");

// Checkbox para ordenar do menor para o maior preço.
const checkboxMenorPreco = document.querySelector("#checkboxMenorPreco input");

// ============================================================
// FILTROS DE TAMANHO
// ============================================================

// Checkbox para ordenar do maior para o menor tamanho.
const checkboxMaiorTamanho = document.querySelector(
  "#checkboxMaiorTamanho input",
);

// Checkbox para ordenar do menor para o maior tamanho.
const checkboxMenorTamanho = document.querySelector(
  "#checkboxMenorTamanho input",
);

// ============================================================
// ESTADO DA PÁGINA
// ============================================================

// Guarda todos os favoritos recebidos da API.
let favoritos = [];

// Guarda os favoritos atualmente exibidos.
let favoritosExibidos = [];

// ============================================================
// ESCAPAR HTML
// ============================================================
//
// Protege informações vindas do banco antes de inseri-las
// diretamente no HTML.
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
// FORMATAR PREÇO
// ============================================================
//
// Converte o valor recebido do backend para moeda brasileira.
// ============================================================

function formatarPreco(preco) {
  const valor = Number(preco);

  if (Number.isNaN(valor)) {
    return "R$ 0,00";
  }

  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// ============================================================
// CONVERTER TAMANHO PARA VALOR COMPARÁVEL
// ============================================================
//
// Como os tamanhos são textos, transformamos cada tamanho
// em um número para permitir a ordenação.
// ============================================================

function valorTamanho(tamanho) {
  if (!tamanho) {
    return 0;
  }

  const tamanhoNormalizado = String(tamanho).trim().toUpperCase();

  const tamanhos = {
    PP: 1,

    P: 2,

    M: 3,

    G: 4,

    GG: 5,

    XGG: 6,

    ÚNICO: 7,

    UNICO: 7,
  };

  return tamanhos[tamanhoNormalizado] || 0;
}

// ============================================================
// OBTER IMAGEM DO FAVORITO
// ============================================================
//
// O backend agora devolve a URL completa da imagem.
//
// Exemplo:
//
// http://127.0.0.1:3000/uploads/produtos/produto-123.jpg
//
// Portanto, não devemos mais acrescentar:
// ../Catalogo/CSS/
// ============================================================

function obterImagemFavorito(produto) {
  // Primeiro tenta a imagem principal.
  if (produto.imagem) {
    return produto.imagem;
  }

  // Caso não tenha imagem principal,
  // tenta buscar a primeira imagem da lista.
  if (Array.isArray(produto.imagens) && produto.imagens.length > 0) {
    const primeiraImagem = produto.imagens.find((item) => item && item.imagem);

    if (primeiraImagem) {
      return primeiraImagem.imagem;
    }
  }

  // Nenhuma imagem encontrada.
  return "";
}

// ============================================================
// CRIAR CARD DO FAVORITO
// ============================================================

function criarCardFavorito(produto) {
  // ID do registro do favorito.
  const favoritoId = produto.favorito_id ?? produto.id;

  // ID real do produto.
  const produtoId = produto.produto_id ?? produto.id;

  // Nome protegido contra HTML.
  const nome = escaparHTML(produto.nome);

  // Obtém a imagem enviada pelo backend.
  const imagem = escaparHTML(obterImagemFavorito(produto));

  // Obtém o tamanho tradicional.
  const tamanho = escaparHTML(produto.tamanho);

  return `
        <article
            class="product-card"
            data-produto-id="${produtoId}"
        >

            <!-- ============================================ -->
            <!-- IMAGEM -->
            <!-- ============================================ -->

            <div class="product-img-container">

                <img
                    class="product-image"
                    src="${imagem}"
                    alt="${nome}"
                    loading="lazy"
                    onerror="this.src='../Global/CSS/Logo - Costa Confeccoes.jpeg'"
                >

            </div>


            <!-- ============================================ -->
            <!-- INFORMAÇÕES -->
            <!-- ============================================ -->

            <div class="product-info">

                <div class="product-name">
                    ${nome}
                </div>


                <div class="product-price">
                    ${formatarPreco(produto.preco)}
                </div>


                <div class="product-size">
                    Tamanho:
                    ${tamanho || "Não informado"}
                </div>

            </div>


            <!-- ============================================ -->
            <!-- BOTÃO REMOVER -->
            <!-- ============================================ -->

            <button
                class="delete-btn"
                type="button"
                data-favorito-id="${favoritoId}"
                data-produto-id="${produtoId}"
                title="Remover dos favoritos"
            >

                <i class="fa-solid fa-trash"></i>

                <span>
                    Remover
                </span>

            </button>

        </article>
    `;
}

// ============================================================
// RENDERIZAR FAVORITOS
// ============================================================
//
// Recebe a lista de produtos e cria os cards na tela.
// ============================================================

function renderizarFavoritos(lista) {
  if (!listaFavoritos) {
    return;
  }

  // Limpa o conteúdo anterior.
  listaFavoritos.innerHTML = "";

  // --------------------------------------------------------
  // NENHUM FAVORITO
  // --------------------------------------------------------

  if (!lista || lista.length === 0) {
    listaFavoritos.innerHTML = `

            <div class="nenhum-favorito">

                <i class="fa-regular fa-heart"></i>

                <h3>
                    Nenhum produto nos favoritos
                </h3>

                <p>
                    Adicione produtos à sua Lista de Desejos
                    para encontrá-los facilmente depois.
                </p>

            </div>

        `;

    return;
  }

  // --------------------------------------------------------
  // CRIAR CARDS
  // --------------------------------------------------------

  lista.forEach((produto) => {
    listaFavoritos.insertAdjacentHTML("beforeend", criarCardFavorito(produto));
  });
}

// ============================================================
// BUSCAR FAVORITOS NA API
// ============================================================
//
// Busca os produtos favoritos do usuário atualmente logado.
//
// IMPORTANTE:
//
// credentials: "include"
//
// envia o cookie da sessão junto da requisição.
// ============================================================

async function carregarFavoritos() {
  try {
    // ----------------------------------------------------
    // MENSAGEM DE CARREGAMENTO
    // ----------------------------------------------------

    if (listaFavoritos) {
      listaFavoritos.innerHTML = `

                <div class="nenhum-favorito">

                    <p>
                        Carregando favoritos...
                    </p>

                </div>

            `;
    }

    // ----------------------------------------------------
    // REQUISIÇÃO
    // ----------------------------------------------------

    const resposta = await fetch(`${API_URL}/favoritos`, {
      method: "GET",

      // Envia o cookie da sessão.
      credentials: "include",
    });

    // ----------------------------------------------------
    // USUÁRIO NÃO LOGADO
    // ----------------------------------------------------

    if (resposta.status === 401) {
      listaFavoritos.innerHTML = `

                <div class="nenhum-favorito">

                    <i class="fa-regular fa-circle-user"></i>

                    <h3>
                        Faça login para ver seus favoritos
                    </h3>

                    <p>
                        Entre na sua conta para acessar
                        sua Lista de Desejos.
                    </p>

                </div>

            `;

      return;
    }

    // ----------------------------------------------------
    // OUTROS ERROS
    // ----------------------------------------------------

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar os favoritos.");
    }

    // ----------------------------------------------------
    // CONVERTER RESPOSTA
    // ----------------------------------------------------

    favoritos = await resposta.json();

    // Garante que o resultado seja um array.
    if (!Array.isArray(favoritos)) {
      favoritos = [];
    }

    // Inicialmente todos os favoritos são exibidos.
    favoritosExibidos = [...favoritos];

    // Renderiza os favoritos.
    renderizarFavoritos(favoritosExibidos);
  } catch (erro) {
    console.error("Erro ao carregar favoritos:", erro);

    // ----------------------------------------------------
    // ERRO VISUAL
    // ----------------------------------------------------

    if (listaFavoritos) {
      listaFavoritos.innerHTML = `

                <div class="nenhum-favorito">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <h3>
                        Não foi possível carregar os favoritos
                    </h3>

                    <p>
                        Verifique se o servidor da Costa Confecções
                        está funcionando e tente novamente.
                    </p>

                </div>

            `;
    }
  }
}

// ============================================================
// REMOVER FAVORITO
// ============================================================
//
// Remove um produto da Lista de Desejos.
// ============================================================

async function removerFavorito(favoritoId, produtoId) {
  try {
    // A API utiliza o ID do produto.
    const id = produtoId ?? favoritoId;

    // ----------------------------------------------------
    // REQUISIÇÃO
    // ----------------------------------------------------

    const resposta = await fetch(
      `${API_URL}/favoritos/${encodeURIComponent(id)}`,
      {
        method: "DELETE",

        // Envia o cookie da sessão.
        credentials: "include",
      },
    );

    // ----------------------------------------------------
    // VERIFICAR SESSÃO
    // ----------------------------------------------------

    if (resposta.status === 401) {
      alert("Sua sessão expirou. Faça login novamente.");

      return;
    }

    // ----------------------------------------------------
    // VERIFICAR ERRO
    // ----------------------------------------------------

    if (!resposta.ok) {
      throw new Error("Não foi possível remover o produto dos favoritos.");
    }

    // ----------------------------------------------------
    // REMOVER DO ESTADO LOCAL
    // ----------------------------------------------------

    favoritos = favoritos.filter((produto) => {
      const idProduto = produto.produto_id ?? produto.id;

      return Number(idProduto) !== Number(id);
    });

    // ----------------------------------------------------
    // ATUALIZAR TELA
    // ----------------------------------------------------

    aplicarFiltros();
  } catch (erro) {
    console.error("Erro ao remover favorito:", erro);

    alert("Não foi possível remover o produto dos favoritos.");
  }
}

// ============================================================
// ORDENAR POR PREÇO
// ============================================================

function ordenarPorPreco(lista, ordem) {
  return [...lista].sort((a, b) => {
    const precoA = Number(a.preco) || 0;

    const precoB = Number(b.preco) || 0;

    if (ordem === "maior") {
      return precoB - precoA;
    }

    return precoA - precoB;
  });
}

// ============================================================
// ORDENAR POR TAMANHO
// ============================================================

function ordenarPorTamanho(lista, ordem) {
  return [...lista].sort((a, b) => {
    const tamanhoA = valorTamanho(a.tamanho);

    const tamanhoB = valorTamanho(b.tamanho);

    if (ordem === "maior") {
      return tamanhoB - tamanhoA;
    }

    return tamanhoA - tamanhoB;
  });
}

// ============================================================
// APLICAR FILTROS
// ============================================================
//
// Aplica os filtros ativos na lista de favoritos.
// ============================================================

function aplicarFiltros() {
  let lista = [...favoritos];

  // --------------------------------------------------------
  // PREÇO
  // --------------------------------------------------------

  if (checkboxMaiorPreco && checkboxMaiorPreco.checked) {
    lista = ordenarPorPreco(lista, "maior");
  } else if (checkboxMenorPreco && checkboxMenorPreco.checked) {
    lista = ordenarPorPreco(lista, "menor");
  }

  // --------------------------------------------------------
  // TAMANHO
  // --------------------------------------------------------

  if (checkboxMaiorTamanho && checkboxMaiorTamanho.checked) {
    lista = ordenarPorTamanho(lista, "maior");
  } else if (checkboxMenorTamanho && checkboxMenorTamanho.checked) {
    lista = ordenarPorTamanho(lista, "menor");
  }

  // Atualiza o estado.
  favoritosExibidos = lista;

  // Renderiza novamente.
  renderizarFavoritos(favoritosExibidos);
}

// ============================================================
// CONTROLAR FILTROS DE PREÇO
// ============================================================
//
// Permite apenas um filtro de preço por vez.
// ============================================================

function configurarFiltrosPreco() {
  // --------------------------------------------------------
  // MAIOR PREÇO
  // --------------------------------------------------------

  if (checkboxMaiorPreco) {
    checkboxMaiorPreco.addEventListener("change", () => {
      if (checkboxMaiorPreco.checked && checkboxMenorPreco) {
        checkboxMenorPreco.checked = false;
      }

      aplicarFiltros();
    });
  }

  // --------------------------------------------------------
  // MENOR PREÇO
  // --------------------------------------------------------

  if (checkboxMenorPreco) {
    checkboxMenorPreco.addEventListener("change", () => {
      if (checkboxMenorPreco.checked && checkboxMaiorPreco) {
        checkboxMaiorPreco.checked = false;
      }

      aplicarFiltros();
    });
  }
}

// ============================================================
// CONTROLAR FILTROS DE TAMANHO
// ============================================================
//
// Permite apenas um filtro de tamanho por vez.
// ============================================================

function configurarFiltrosTamanho() {
  // --------------------------------------------------------
  // MAIOR TAMANHO
  // --------------------------------------------------------

  if (checkboxMaiorTamanho) {
    checkboxMaiorTamanho.addEventListener("change", () => {
      if (checkboxMaiorTamanho.checked && checkboxMenorTamanho) {
        checkboxMenorTamanho.checked = false;
      }

      aplicarFiltros();
    });
  }

  // --------------------------------------------------------
  // MENOR TAMANHO
  // --------------------------------------------------------

  if (checkboxMenorTamanho) {
    checkboxMenorTamanho.addEventListener("change", () => {
      if (checkboxMenorTamanho.checked && checkboxMaiorTamanho) {
        checkboxMaiorTamanho.checked = false;
      }

      aplicarFiltros();
    });
  }
}

// ============================================================
// CLIQUES NOS PRODUTOS
// ============================================================
//
// Os cards são criados dinamicamente.
// Por isso usamos delegação de eventos.
// ============================================================

function configurarEventosLista() {
  if (!listaFavoritos) {
    return;
  }

  listaFavoritos.addEventListener("click", async (event) => {
    // =================================================
    // BOTÃO REMOVER
    // =================================================

    const botaoRemover = event.target.closest(".delete-btn");

    if (botaoRemover) {
      const favoritoId = botaoRemover.dataset.favoritoId;

      const produtoId = botaoRemover.dataset.produtoId;

      const confirmar = confirm("Deseja remover este produto dos favoritos?");

      if (!confirmar) {
        return;
      }

      await removerFavorito(favoritoId, produtoId);

      return;
    }

    // =================================================
    // ABRIR PRODUTO
    // =================================================

    const card = event.target.closest(".product-card");

    if (!card) {
      return;
    }

    // Não abre o produto quando
    // o usuário clicou em um botão.
    if (event.target.closest("button")) {
      return;
    }

    const botao = card.querySelector(".delete-btn");

    if (!botao) {
      return;
    }

    const produtoId = botao.dataset.produtoId;

    if (!produtoId) {
      return;
    }

    // -------------------------------------------------
    // PÁGINA DO PRODUTO
    // -------------------------------------------------
    //
    // Arquivo existente:
    //
    // Produto/produto-page.html
    //
    // Como favoritos está em outra pasta,
    // utilizamos ../Produto/.
    // -------------------------------------------------

    window.location.href = `../Produto/produto-page.html?id=${encodeURIComponent(produtoId)}`;
  });
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

function iniciarFavoritos() {
  // Configura filtros de preço.
  configurarFiltrosPreco();

  // Configura filtros de tamanho.
  configurarFiltrosTamanho();

  // Configura os cliques dos cards.
  configurarEventosLista();

  // Busca favoritos na API.
  carregarFavoritos();
}

// ============================================================
// EXECUTAR PÁGINA
// ============================================================

iniciarFavoritos();
