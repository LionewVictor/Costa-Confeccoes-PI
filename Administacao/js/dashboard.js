// ============================================================
// COSTA CONFECÇÕES
// DASHBOARD ADMINISTRATIVO
// Arquivo: dashboard.js
//
// Este arquivo é responsável por:
//
// • Buscar os dados do Dashboard.
// • Atualizar os indicadores.
// • Renderizar os produtos recentes.
// • Levar o administrador para o cadastro de produtos.
//
// IMPORTANTE:
//
// A autenticação da área administrativa é feita pelo
// arquivo admin.js.
//
// A variável API_URL também é fornecida pelo admin.js.
//
// O fluxo dos dados é:
//
// Dashboard
//     ↓
// dashboard.js
//     ↓
// server.js
//     ↓
// database.js
//     ↓
// SQLite
//
// Este arquivo NÃO acessa o banco diretamente.
// ============================================================

// ============================================================
// ELEMENTOS DA PÁGINA
// ============================================================

// ------------------------------------------------------------
// CARDS DO DASHBOARD
// ------------------------------------------------------------
//
// Estes elementos apresentam os indicadores
// retornados pelo backend.
// ------------------------------------------------------------

const totalProdutos = document.getElementById("total-produtos");

const totalCategorias = document.getElementById("total-categorias");

const totalMarcas = document.getElementById("total-marcas");

const valorMedio = document.getElementById("valor-medio");

// ------------------------------------------------------------
// TABELA DE PRODUTOS
// ------------------------------------------------------------
//
// Recebe os produtos cadastrados recentemente.
// ------------------------------------------------------------

const tabelaProdutos = document.getElementById("tabela-produtos");

// ------------------------------------------------------------
// BOTÃO NOVO PRODUTO
// ------------------------------------------------------------
//
// Leva o administrador para o cadastro de produtos.
// ------------------------------------------------------------

const botaoNovoProduto = document.getElementById("novo-produto");

// ============================================================
// SEGURANÇA DOS DADOS
// ============================================================

// ------------------------------------------------------------
// ESCAPAR HTML
// ------------------------------------------------------------
//
// Os dados dos produtos vêm do banco de dados.
//
// Como alguns desses dados serão colocados dentro
// de HTML utilizando innerHTML, precisamos garantir
// que eles sejam tratados como texto.
//
// Isso evita que um texto cadastrado como:
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
  // por suas respectivas entidades HTML.
  return texto

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");
}

// ============================================================
// CARREGAR DADOS DO DASHBOARD
// ============================================================

// ------------------------------------------------------------
// BUSCAR DADOS NO BACKEND
// ------------------------------------------------------------
//
// Solicita ao server.js:
//
// GET /dashboard
//
// O backend verifica se o usuário é administrador
// e consulta o banco SQLite.
//
// O resultado contém:
//
// • Total de produtos
// • Total de categorias
// • Total de marcas
// • Preço médio
// • Últimos produtos cadastrados
// ------------------------------------------------------------

async function carregarDashboard() {
  try {
    // ----------------------------------------------------
    // REQUISIÇÃO PARA A API
    // ----------------------------------------------------

    // Faz uma requisição GET para o backend.
    //
    // credentials: "include" permite que o navegador
    // envie o cookie da sessão administrativa.
    const resposta = await fetch(`${API_URL}/dashboard`, {
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

    // Se o servidor retornar erro,
    // mostramos a mensagem enviada pela API.
    if (!resposta.ok) {
      mostrarMensagem(dados.mensagem || "Erro ao carregar dashboard.");

      return;
    }

    // ====================================================
    // ATUALIZAR INDICADORES
    // ====================================================

    // ----------------------------------------------------
    // TOTAL DE PRODUTOS
    // ----------------------------------------------------

    // Mostra a quantidade total de produtos.
    if (totalProdutos) {
      totalProdutos.textContent = dados.totalProdutos ?? 0;
    }

    // ----------------------------------------------------
    // TOTAL DE CATEGORIAS
    // ----------------------------------------------------

    // Mostra a quantidade de categorias diferentes.
    if (totalCategorias) {
      totalCategorias.textContent = dados.totalCategorias ?? 0;
    }

    // ----------------------------------------------------
    // TOTAL DE MARCAS
    // ----------------------------------------------------

    // Mostra a quantidade de marcas diferentes.
    if (totalMarcas) {
      totalMarcas.textContent = dados.totalMarcas ?? 0;
    }

    // ----------------------------------------------------
    // PREÇO MÉDIO
    // ----------------------------------------------------

    // Mostra o preço médio dos produtos.
    //
    // A função formatarPreco()
    // está disponível no admin.js.
    if (valorMedio) {
      valorMedio.textContent = formatarPreco(dados.valorMedio ?? 0);
    }

    // ====================================================
    // ATUALIZAR TABELA
    // ====================================================

    // Envia os produtos retornados
    // para a função responsável pela tabela.
    renderizarTabela(
      Array.isArray(dados.ultimosProdutos) ? dados.ultimosProdutos : [],
    );
  } catch (erro) {
    // ----------------------------------------------------
    // ERRO DE CONEXÃO
    // ----------------------------------------------------

    // Mostra o erro técnico no console
    // para facilitar a identificação do problema.
    console.error("Erro ao carregar dashboard:", erro);

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
// em uma linha da tabela.
//
// Esta função NÃO consulta o banco.
//
// Ela somente trabalha com os dados
// que já foram recebidos pela API.
// ------------------------------------------------------------

function criarLinha(produto) {
  // --------------------------------------------------------
  // PREPARAR DADOS
  // --------------------------------------------------------

  // Define uma imagem vazia caso
  // o produto não possua imagem.
  const imagem = produto.imagem || "";

  // Escapa o nome para impedir
  // interpretação indevida como HTML.
  const nome = escaparHTML(produto.nome || "-");

  // Escapa a categoria.
  const categoria = escaparHTML(produto.categoria || "-");

  // Escapa a marca.
  const marca = escaparHTML(produto.marca || "-");

  // Escapa o endereço da imagem.
  const imagemSegura = escaparHTML(imagem);

  // --------------------------------------------------------
  // CRIAR HTML
  // --------------------------------------------------------

  // Retorna uma linha completa da tabela.
  return `
        <tr>

            <td>

                <img
                    src="${imagemSegura}"
                    alt="${nome}"
                    width="60"
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
// o conteúdo da tabela do Dashboard.
// ------------------------------------------------------------

function renderizarTabela(produtos) {
  // --------------------------------------------------------
  // VERIFICAR ELEMENTO
  // --------------------------------------------------------

  // Caso o elemento da tabela não exista,
  // não tentamos alterar o HTML.
  if (!tabelaProdutos) {
    return;
  }

  // --------------------------------------------------------
  // LIMPAR TABELA
  // --------------------------------------------------------

  // Remove o conteúdo anterior.
  tabelaProdutos.innerHTML = "";

  // --------------------------------------------------------
  // VERIFICAR LISTA
  // --------------------------------------------------------

  // Se a lista não existir ou estiver vazia,
  // mostramos uma mensagem.
  if (!Array.isArray(produtos) || produtos.length === 0) {
    tabelaProdutos.innerHTML = `
            <tr>

                <td colspan="5">

                    Nenhum produto cadastrado.

                </td>

            </tr>
        `;

    return;
  }

  // --------------------------------------------------------
  // ADICIONAR PRODUTOS
  // --------------------------------------------------------

  // Percorre cada produto recebido
  // pelo backend.
  produtos.forEach((produto) => {
    // Cria a linha correspondente
    // e adiciona à tabela.
    tabelaProdutos.innerHTML += criarLinha(produto);
  });
}

// ============================================================
// EVENTOS
// ============================================================

// ------------------------------------------------------------
// BOTÃO NOVO PRODUTO
// ------------------------------------------------------------

// Verifica se o botão existe antes
// de adicionar o evento.
//
// Isso evita erros caso o HTML seja alterado.
if (botaoNovoProduto) {
  botaoNovoProduto.addEventListener("click", abrirCadastroProduto);
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

// ------------------------------------------------------------
// INICIAR DASHBOARD
// ------------------------------------------------------------
//
// Reúne as ações necessárias para carregar
// o Dashboard quando a página é aberta.
// ------------------------------------------------------------

function iniciarDashboard() {
  // Busca os dados no backend.
  carregarDashboard();
}

// ============================================================
// EXECUÇÃO
// ============================================================

// Inicia o Dashboard.
iniciarDashboard();
