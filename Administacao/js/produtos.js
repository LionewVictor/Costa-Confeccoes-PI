// ============================================================
// COSTA CONFECÇÕES
// ÁREA ADMINISTRATIVA
// Arquivo: produtos.js
//
// Responsável por:
//
// • Carregar todos os produtos através da API.
// • Exibir os produtos na tabela.
// • Pesquisar produtos.
// • Editar produtos.
// • Excluir produtos.
// • Atualizar a tabela depois das alterações.
//
// IMPORTANTE:
//
// Este arquivo NÃO acessa o SQLite diretamente.
//
// Todas as informações são solicitadas ao server.js
// através da API HTTP.
//
// A autenticação, navegação e funções compartilhadas
// da área administrativa estão no arquivo admin.js.
//
// O API_URL também pertence ao admin.js.
//
// Portanto, NÃO declaramos API_URL novamente aqui.
// ============================================================

// ============================================================
// ELEMENTOS DA PÁGINA
// ============================================================

// ------------------------------------------------------------
// CORPO DA TABELA
// ------------------------------------------------------------
//
// É neste elemento que as linhas dos produtos
// serão inseridas dinamicamente.
// ------------------------------------------------------------

const listaProdutos = document.getElementById("lista-produtos");

// ------------------------------------------------------------
// CAMPO DE PESQUISA
// ------------------------------------------------------------
//
// Campo utilizado para pesquisar produtos.
// ------------------------------------------------------------

const campoPesquisa = document.getElementById("campo-pesquisa");

// ------------------------------------------------------------
// BOTÃO NOVO PRODUTO
// ------------------------------------------------------------
//
// Botão utilizado para abrir a página
// de cadastro de um novo produto.
// ------------------------------------------------------------

const botaoNovoProduto = document.getElementById("novo-produto");

// ============================================================
// ESTADO DA PÁGINA
// ============================================================

// ------------------------------------------------------------
// TODOS OS PRODUTOS
// ------------------------------------------------------------
//
// Guarda todos os produtos recebidos do backend.
//
// Este array funciona como a fonte original dos dados.
//
// Dessa forma, quando o administrador pesquisa,
// conseguimos voltar para todos os produtos
// sem precisar consultar o servidor novamente.
// ------------------------------------------------------------

let produtos = [];

// ------------------------------------------------------------
// PRODUTOS EXIBIDOS
// ------------------------------------------------------------
//
// Guarda somente os produtos que estão aparecendo
// atualmente na tabela.
//
// Quando uma pesquisa é realizada,
// este array recebe somente os resultados encontrados.
// ------------------------------------------------------------

let produtosExibidos = [];

// ============================================================
// SEGURANÇA DOS DADOS
// ============================================================

// ------------------------------------------------------------
// ESCAPAR HTML
// ------------------------------------------------------------
//
// Os dados dos produtos vêm do banco de dados.
//
// Antes de colocar essas informações dentro de
// innerHTML, precisamos transformar caracteres especiais
// em texto.
//
// Isso impede que um conteúdo cadastrado como:
//
// <script>...</script>
//
// seja interpretado pelo navegador como código.
// ------------------------------------------------------------

function escaparHTML(valor) {
  // Se o valor não existir,
  // retornamos uma string vazia.
  if (valor === null || valor === undefined) {
    return "";
  }

  // Converte o valor para texto.
  const texto = String(valor);

  // Substitui caracteres especiais
  // por entidades HTML.
  return texto

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");
}

// ============================================================
// CARREGAR PRODUTOS
// ============================================================

// ------------------------------------------------------------
// BUSCAR PRODUTOS NA API
// ------------------------------------------------------------
//
// Solicita ao server.js:
//
// GET /produtos
//
// O server.js consulta o SQLite e devolve
// os produtos cadastrados.
// ------------------------------------------------------------

async function carregarProdutos() {
  try {
    // ----------------------------------------------------
    // REQUISIÇÃO PARA O BACKEND
    // ----------------------------------------------------

    // Faz uma requisição GET para o servidor.
    //
    // credentials: "include" permite que o navegador
    // envie o cookie da sessão administrativa.
    const resposta = await fetch(`${API_URL}/produtos`, {
      method: "GET",

      credentials: "include",
    });

    // ----------------------------------------------------
    // CONVERTER RESPOSTA
    // ----------------------------------------------------

    // Transforma a resposta JSON
    // em um objeto JavaScript.
    const dados = await resposta.json();

    // ----------------------------------------------------
    // VERIFICAR ERRO
    // ----------------------------------------------------

    // Caso o servidor rejeite a requisição,
    // mostramos a mensagem enviada pela API.
    if (!resposta.ok) {
      mostrarMensagem(dados.mensagem || "Erro ao carregar produtos.");

      return;
    }

    // ----------------------------------------------------
    // ATUALIZAR ESTADO
    // ----------------------------------------------------

    // Garante que o resultado seja realmente
    // tratado como uma lista.
    produtos = Array.isArray(dados) ? dados : [];

    // Inicialmente todos os produtos
    // devem aparecer na tabela.
    produtosExibidos = [...produtos];

    // ----------------------------------------------------
    // RENDERIZAR
    // ----------------------------------------------------

    // Atualiza a tabela com os produtos recebidos.
    renderizarProdutos(produtosExibidos);
  } catch (erro) {
    // ----------------------------------------------------
    // ERRO DE CONEXÃO
    // ----------------------------------------------------

    // Mostra o erro técnico no console
    // para facilitar a identificação do problema.
    console.error("Erro ao carregar produtos:", erro);

    // Mostra uma mensagem amigável.
    mostrarMensagem("Erro ao conectar com o servidor.");
  }
}

// ============================================================
// CRIAÇÃO DAS LINHAS DA TABELA
// ============================================================

// ------------------------------------------------------------
// CRIAR LINHA
// ------------------------------------------------------------
//
// Recebe um produto e transforma seus dados
// em uma linha HTML.
//
// Esta função NÃO consulta o banco.
//
// Ela apenas transforma os dados recebidos
// da API em elementos visuais.
// ------------------------------------------------------------

function criarLinha(produto) {
  // --------------------------------------------------------
  // DADOS DO PRODUTO
  // --------------------------------------------------------

  // Protege o caminho/nome da imagem.
  const imagem = escaparHTML(produto.imagem || "");

  // Protege o nome do produto.
  const nome = escaparHTML(produto.nome || "-");

  // Protege a categoria.
  const categoria = escaparHTML(produto.categoria || "-");

  // Protege a marca.
  const marca = escaparHTML(produto.marca || "-");

  // Protege o ID do produto.
  const id = escaparHTML(produto.id);

  // --------------------------------------------------------
  // HTML DA LINHA
  // --------------------------------------------------------

  // Cria a linha completa da tabela.
  return `
        <tr data-id="${id}">

            <td>

                <img
                    src="${imagem}"
                    alt="${nome}"
                    loading="lazy"
                >

            </td>


            <td>
                ${nome}
            </td>


            <td>
                ${categoria}
            </td>


            <td>
                ${marca}
            </td>


            <td>
                ${formatarPreco(produto.preco ?? 0)}
            </td>


            <td>

                <div class="acoes">

                    <button
                        type="button"
                        class="btn-editar"
                        data-id="${id}"
                        title="Editar produto"
                        aria-label="Editar ${nome}"
                    >

                        <i
                            class="fa-solid fa-pen"
                            aria-hidden="true"
                        ></i>

                    </button>


                    <button
                        type="button"
                        class="btn-excluir"
                        data-id="${id}"
                        title="Excluir produto"
                        aria-label="Excluir ${nome}"
                    >

                        <i
                            class="fa-solid fa-trash"
                            aria-hidden="true"
                        ></i>

                    </button>

                </div>

            </td>

        </tr>
    `;
}

// ============================================================
// RENDERIZAÇÃO DA TABELA
// ============================================================

// ------------------------------------------------------------
// RENDERIZAR PRODUTOS
// ------------------------------------------------------------
//
// Recebe uma lista de produtos e atualiza
// o conteúdo da tabela administrativa.
// ------------------------------------------------------------

function renderizarProdutos(lista) {
  // --------------------------------------------------------
  // VERIFICAR ELEMENTO
  // --------------------------------------------------------

  // Caso a tabela não exista no HTML,
  // não tentamos modificar o DOM.
  if (!listaProdutos) {
    return;
  }

  // --------------------------------------------------------
  // LIMPAR TABELA
  // --------------------------------------------------------

  // Remove as linhas anteriores.
  listaProdutos.innerHTML = "";

  // --------------------------------------------------------
  // VERIFICAR RESULTADOS
  // --------------------------------------------------------

  // Se a lista estiver vazia,
  // mostramos uma mensagem.
  if (!Array.isArray(lista) || lista.length === 0) {
    listaProdutos.innerHTML = `
            <tr>

                <td colspan="6">

                    Nenhum produto encontrado.

                </td>

            </tr>
        `;

    return;
  }

  // --------------------------------------------------------
  // INSERIR PRODUTOS
  // --------------------------------------------------------

  // Cria uma linha para cada produto.
  lista.forEach((produto) => {
    listaProdutos.innerHTML += criarLinha(produto);
  });
}

// ============================================================
// NORMALIZAÇÃO DE TEXTO
// ============================================================

// ------------------------------------------------------------
// NORMALIZAR TEXTO
// ------------------------------------------------------------
//
// Deixa os textos em um formato padronizado
// para facilitar a pesquisa.
//
// Exemplo:
//
// "Camisa Branca"
// "camisa branca"
// "CAMISA BRANCA"
//
// serão tratados de maneira equivalente.
//
// Também removemos acentos.
//
// Exemplo:
//
// "Camisão"
// poderá ser pesquisado como:
//
// "camisao"
// ------------------------------------------------------------

function normalizarTexto(texto) {
  return (
    String(texto || "")
      // Converte para letras minúsculas.
      .toLowerCase()

      // Separa letras dos acentos.
      .normalize("NFD")

      // Remove os acentos.
      .replace(/[\u0300-\u036f]/g, "")

      // Remove espaços extras no início
      // e no final.
      .trim()
  );
}

// ============================================================
// PESQUISA
// ============================================================

// ------------------------------------------------------------
// PESQUISAR PRODUTOS
// ------------------------------------------------------------
//
// A pesquisa verifica:
//
// • Nome
// • Categoria
// • Marca
// • Gênero
// • Material
//
// A pesquisa acontece sobre o array já carregado.
//
// Assim não fazemos uma requisição ao servidor
// a cada caractere digitado.
// ------------------------------------------------------------

function pesquisarProdutos() {
  // --------------------------------------------------------
  // VERIFICAR CAMPO
  // --------------------------------------------------------

  // Caso o campo de pesquisa não exista,
  // não executamos a pesquisa.
  if (!campoPesquisa) {
    return;
  }

  // --------------------------------------------------------
  // OBTER TEXTO
  // --------------------------------------------------------

  // Pega o que o administrador digitou
  // e normaliza o texto.
  const texto = normalizarTexto(campoPesquisa.value);

  // --------------------------------------------------------
  // PESQUISA VAZIA
  // --------------------------------------------------------

  // Se o campo estiver vazio,
  // mostramos todos os produtos novamente.
  if (texto === "") {
    produtosExibidos = [...produtos];

    renderizarProdutos(produtosExibidos);

    return;
  }

  // --------------------------------------------------------
  // FILTRAR PRODUTOS
  // --------------------------------------------------------

  produtosExibidos = produtos.filter((produto) => {
    // Normaliza o nome.
    const nome = normalizarTexto(produto.nome);

    // Normaliza a categoria.
    const categoria = normalizarTexto(produto.categoria);

    // Normaliza a marca.
    const marca = normalizarTexto(produto.marca);

    // Normaliza o gênero.
    const genero = normalizarTexto(produto.genero);

    // Normaliza o material.
    const material = normalizarTexto(produto.material);

    // O produto será exibido
    // quando pelo menos um dos campos
    // possuir o texto pesquisado.
    return (
      nome.includes(texto) ||
      categoria.includes(texto) ||
      marca.includes(texto) ||
      genero.includes(texto) ||
      material.includes(texto)
    );
  });

  // --------------------------------------------------------
  // ATUALIZAR TABELA
  // --------------------------------------------------------

  renderizarProdutos(produtosExibidos);
}

// ============================================================
// EDITAR PRODUTO
// ============================================================

// ------------------------------------------------------------
// ABRIR PÁGINA DE EDIÇÃO
// ------------------------------------------------------------
//
// Recebe o ID do produto selecionado.
//
// A função abrirEditarProduto()
// pertence ao admin.js.
//
// Ela monta a URL:
//
// editar-produto.html?id=ID
// ------------------------------------------------------------

function editarProduto(id) {
  // Verifica se o ID foi informado.
  if (!id) {
    mostrarMensagem("Produto inválido.");

    return;
  }

  // Utiliza a função compartilhada
  // do admin.js.
  abrirEditarProduto(id);
}

// ============================================================
// EXCLUIR PRODUTO
// ============================================================

// ------------------------------------------------------------
// EXCLUIR PRODUTO ATRAVÉS DA API
// ------------------------------------------------------------
//
// Remove o produto do banco de dados.
//
// Antes da exclusão, o administrador precisa
// confirmar a operação.
// ------------------------------------------------------------

async function excluirProduto(id) {
  // --------------------------------------------------------
  // VALIDAR ID
  // --------------------------------------------------------

  if (!id) {
    mostrarMensagem("Produto inválido.");

    return;
  }

  // --------------------------------------------------------
  // CONFIRMAÇÃO
  // --------------------------------------------------------

  // Utiliza a função do admin.js.
  const confirmou = confirmarExclusao();

  // Se o administrador cancelar,
  // interrompemos a operação.
  if (!confirmou) {
    return;
  }

  try {
    // ----------------------------------------------------
    // DELETE NA API
    // ----------------------------------------------------

    // Envia uma requisição DELETE
    // para o produto selecionado.
    const resposta = await fetch(`${API_URL}/produtos/${id}`, {
      method: "DELETE",

      credentials: "include",
    });

    // ----------------------------------------------------
    // CONVERTER RESPOSTA
    // ----------------------------------------------------

    const dados = await resposta.json();

    // ----------------------------------------------------
    // VERIFICAR ERRO
    // ----------------------------------------------------

    if (!resposta.ok) {
      mostrarMensagem(dados.mensagem || "Erro ao excluir produto.");

      return;
    }

    // ----------------------------------------------------
    // SUCESSO
    // ----------------------------------------------------

    mostrarMensagem(dados.mensagem || "Produto excluído com sucesso.");

    // ----------------------------------------------------
    // ATUALIZAR LISTA
    // ----------------------------------------------------

    // Busca novamente os produtos no servidor.
    //
    // Isso garante que a tabela seja atualizada
    // imediatamente após a exclusão.
    await carregarProdutos();
  } catch (erro) {
    // ----------------------------------------------------
    // ERRO DE CONEXÃO
    // ----------------------------------------------------

    console.error("Erro ao excluir produto:", erro);

    mostrarMensagem("Erro ao conectar com o servidor.");
  }
}

// ============================================================
// EVENTOS DA TABELA
// ============================================================

// ------------------------------------------------------------
// DELEGAÇÃO DE EVENTOS
// ------------------------------------------------------------
//
// Os botões Editar e Excluir são criados
// dinamicamente dentro da tabela.
//
// Por isso não colocamos um evento individual
// em cada botão.
//
// Colocamos um único evento no corpo da tabela.
//
// Dessa forma os botões continuam funcionando
// mesmo depois de uma pesquisa ou atualização.
// ------------------------------------------------------------

if (listaProdutos) {
  listaProdutos.addEventListener("click", function (event) {
    // ------------------------------------------------
    // BOTÃO EDITAR
    // ------------------------------------------------

    // Procura o botão de edição mais próximo
    // do elemento que recebeu o clique.
    const editar = event.target.closest(".btn-editar");

    // ------------------------------------------------
    // BOTÃO EXCLUIR
    // ------------------------------------------------

    // Procura o botão de exclusão mais próximo.
    const excluir = event.target.closest(".btn-excluir");

    // ------------------------------------------------
    // EDITAR
    // ------------------------------------------------

    if (editar) {
      editarProduto(editar.dataset.id);

      return;
    }

    // ------------------------------------------------
    // EXCLUIR
    // ------------------------------------------------

    if (excluir) {
      excluirProduto(excluir.dataset.id);
    }
  });
}

// ============================================================
// EVENTOS DA PÁGINA
// ============================================================

// ------------------------------------------------------------
// CAMPO DE PESQUISA
// ------------------------------------------------------------
//
// Sempre que o administrador digitar,
// a pesquisa será executada automaticamente.
// ------------------------------------------------------------

if (campoPesquisa) {
  campoPesquisa.addEventListener("input", pesquisarProdutos);
}

// ------------------------------------------------------------
// BOTÃO NOVO PRODUTO
// ------------------------------------------------------------
//
// Abre a página de cadastro.
// ------------------------------------------------------------

if (botaoNovoProduto) {
  botaoNovoProduto.addEventListener("click", abrirCadastroProduto);
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

// ------------------------------------------------------------
// INICIAR PÁGINA
// ------------------------------------------------------------
//
// Busca os produtos assim que a página
// administrativa é aberta.
// ------------------------------------------------------------

function iniciarProdutos() {
  carregarProdutos();
}

// ============================================================
// EXECUÇÃO
// ============================================================

// Inicia a página.
iniciarProdutos();
