// ============================================================
// COSTA CONFECÇÕES
// ÁREA ADMINISTRATIVA
// Arquivo: editar-produto.js
//
// Responsável por:
//
// • Identificar o produto que será editado.
// • Buscar o produto através da API.
// • Preencher o formulário.
// • Manter os dados atuais quando necessário.
// • Alterar informações do produto.
// • Alterar imagens.
// • Alterar cores.
// • Alterar tamanhos.
// • Alterar estoque.
// • Validar os dados.
// • Enviar as alterações para a API.
//
// IMPORTANTE:
//
// Este arquivo NÃO acessa o SQLite diretamente.
//
// Toda comunicação com o banco acontece através do
// server.js utilizando a API HTTP.
//
// O API_URL é definido pelo admin.js.
// Portanto, NÃO declaramos API_URL novamente aqui.
// ============================================================

// ============================================================
// ELEMENTOS DA PÁGINA
// ============================================================

// ------------------------------------------------------------
// FORMULÁRIO
// ------------------------------------------------------------

// Localiza o formulário responsável pela edição.
const formulario = document.getElementById("form-editar-produto");

// ------------------------------------------------------------
// CAMPOS PRINCIPAIS
// ------------------------------------------------------------

// Nome do produto.
const campoNome = document.getElementById("nome");

// Marca do produto.
const campoMarca = document.getElementById("marca");

// Categoria do produto.
const campoCategoria = document.getElementById("categoria");

// Gênero do produto.
//
// O HTML deverá possuir:
//
// • Masculino
// • Feminino
// • Infantil
// • Unissex
const campoGenero = document.getElementById("genero");

// Preço do produto.
const campoPreco = document.getElementById("preco");

// Tamanho principal.
//
// Mantido para compatibilidade com
// a tabela principal de produtos.
const campoTamanho = document.getElementById("tamanho");

// Cor principal.
//
// Mantido para compatibilidade com
// a tabela principal de produtos.
const campoCor = document.getElementById("cor");

// Material do produto.
const campoMaterial = document.getElementById("material");

// Descrição do produto.
const campoDescricao = document.getElementById("descricao");

// Campo utilizado para selecionar novas imagens.
const campoImagem = document.getElementById("imagem");

// Campo tradicional de estoque.
//
// Pode não existir no HTML final,
// por isso seu uso será opcional.
const campoEstoque = document.getElementById("estoque");

// Botão utilizado para cancelar a edição.
const botaoCancelar = document.getElementById("cancelar");

// ============================================================
// ID DO PRODUTO
// ============================================================

// ------------------------------------------------------------
// OBTER ID ATRAVÉS DA URL
// ------------------------------------------------------------
//
// A página de edição recebe o ID através da URL.
//
// Exemplo:
//
// editar-produto.html?id=15
//
// O admin.js cria essa URL quando o administrador
// clica no botão de edição.
// ------------------------------------------------------------

const parametros = new URLSearchParams(window.location.search);

// Converte o ID para número.
const idProduto = Number(parametros.get("id"));

// ============================================================
// DADOS ATUAIS DO PRODUTO
// ============================================================

// ------------------------------------------------------------
// IMAGEM PRINCIPAL ATUAL
// ------------------------------------------------------------
//
// Guarda a imagem principal que já existe
// no banco.
//
// Caso nenhuma imagem nova seja selecionada,
// ela será mantida.
// ------------------------------------------------------------

let imagemAtual = null;

// ------------------------------------------------------------
// IMAGENS ATUAIS
// ------------------------------------------------------------
//
// Guarda todas as imagens atualmente relacionadas
// ao produto.
//
// O limite do projeto é de quatro imagens.
// ------------------------------------------------------------

let imagensAtuais = [];

// ------------------------------------------------------------
// VARIAÇÕES ATUAIS
// ------------------------------------------------------------
//
// Guarda as combinações atuais de:
//
// • Cor
// • Tamanho
// • Estoque
// ------------------------------------------------------------

let variacoesAtuais = [];

// ============================================================
// SEGURANÇA DOS DADOS
// ============================================================

// ------------------------------------------------------------
// ESCAPAR HTML
// ------------------------------------------------------------
//
// Protege textos que serão colocados
// dinamicamente no HTML.
//
// Isso impede que informações vindas do banco
// sejam interpretadas como código HTML.
// ------------------------------------------------------------

function escaparHTML(valor) {
  // Se o valor não existir,
  // retornamos uma string vazia.
  if (valor === null || valor === undefined) {
    return "";
  }

  // Converte o valor para texto
  // e protege caracteres especiais.
  return String(valor)
    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");
}

// ============================================================
// CARREGAR PRODUTO
// ============================================================

// ------------------------------------------------------------
// BUSCAR PRODUTO NA API
// ------------------------------------------------------------
//
// Busca o produto pelo ID e preenche
// os campos do formulário.
//
// Endpoint:
//
// GET /produtos/:id
// ------------------------------------------------------------

async function carregarProduto() {
  // --------------------------------------------------------
  // VALIDAR ID
  // --------------------------------------------------------

  // Se não existir um ID válido,
  // não sabemos qual produto deve ser editado.
  if (!Number.isInteger(idProduto) || idProduto <= 0) {
    mostrarMensagem("ID do produto inválido.");

    abrirProdutos();

    return;
  }

  try {
    // ----------------------------------------------------
    // BUSCAR PRODUTO
    // ----------------------------------------------------

    const resposta = await fetch(`${API_URL}/produtos/${idProduto}`, {
      method: "GET",

      credentials: "include",
    });

    // Converte a resposta
    // para objeto JavaScript.
    const produto = await resposta.json();

    // ----------------------------------------------------
    // VERIFICAR RESPOSTA
    // ----------------------------------------------------

    if (!resposta.ok) {
      mostrarMensagem(produto.mensagem || "Erro ao carregar produto.");

      abrirProdutos();

      return;
    }

    // ====================================================
    // PREENCHER FORMULÁRIO
    // ====================================================

    // ----------------------------------------------------
    // NOME
    // ----------------------------------------------------

    if (campoNome) {
      campoNome.value = produto.nome || "";
    }

    // ----------------------------------------------------
    // MARCA
    // ----------------------------------------------------

    if (campoMarca) {
      campoMarca.value = produto.marca || "";
    }

    // ----------------------------------------------------
    // CATEGORIA
    // ----------------------------------------------------

    if (campoCategoria) {
      campoCategoria.value = produto.categoria || "";
    }

    // ----------------------------------------------------
    // GÊNERO
    // ----------------------------------------------------

    // Aceita:
    //
    // Masculino
    // Feminino
    // Infantil
    // Unissex
    if (campoGenero) {
      campoGenero.value = produto.genero || "";
    }

    // ----------------------------------------------------
    // PREÇO
    // ----------------------------------------------------

    if (campoPreco) {
      campoPreco.value = produto.preco ?? "";
    }

    // ----------------------------------------------------
    // TAMANHO
    // ----------------------------------------------------

    if (campoTamanho) {
      campoTamanho.value = produto.tamanho || "";
    }

    // ----------------------------------------------------
    // COR
    // ----------------------------------------------------

    if (campoCor) {
      campoCor.value = produto.cor || "";
    }

    // ----------------------------------------------------
    // MATERIAL
    // ----------------------------------------------------

    if (campoMaterial) {
      campoMaterial.value = produto.material || "";
    }

    // ----------------------------------------------------
    // DESCRIÇÃO
    // ----------------------------------------------------

    if (campoDescricao) {
      campoDescricao.value = produto.descricao || "";
    }

    // ====================================================
    // IMAGENS
    // ====================================================

    // Guarda a imagem principal atual.
    imagemAtual = produto.imagem || null;

    // Guarda todas as imagens retornadas
    // pelo backend.
    imagensAtuais = Array.isArray(produto.imagens) ? produto.imagens : [];

    // ----------------------------------------------------
    // COMPATIBILIDADE COM PRODUTOS ANTIGOS
    // ----------------------------------------------------

    // Caso o produto antigo possua apenas
    // a imagem principal, criamos uma lista
    // com ela.
    if (imagensAtuais.length === 0 && imagemAtual) {
      imagensAtuais = [
        {
          cor: null,

          imagem: imagemAtual,
        },
      ];
    }

    // ====================================================
    // VARIAÇÕES
    // ====================================================

    // Guarda as variações retornadas
    // pelo backend.
    variacoesAtuais = Array.isArray(produto.variacoes) ? produto.variacoes : [];

    // ----------------------------------------------------
    // ESTOQUE DE COMPATIBILIDADE
    // ----------------------------------------------------

    // Caso exista somente uma variação,
    // colocamos seu estoque no campo tradicional.
    if (campoEstoque && variacoesAtuais.length === 1) {
      campoEstoque.value = variacoesAtuais[0].estoque ?? 0;
    }

    // Mostra no console as informações carregadas.
    //
    // Isso facilita a conferência durante
    // o desenvolvimento.
    console.log("Produto carregado para edição:", produto);
  } catch (erro) {
    // ----------------------------------------------------
    // ERRO DE CONEXÃO
    // ----------------------------------------------------

    console.error("Erro ao carregar produto:", erro);

    mostrarMensagem("Erro ao conectar com o servidor.");

    abrirProdutos();
  }
}

// ============================================================
// VALIDAÇÃO
// ============================================================

// ------------------------------------------------------------
// VALIDAR FORMULÁRIO
// ------------------------------------------------------------
//
// Verifica os campos obrigatórios antes
// de enviar as alterações.
// ------------------------------------------------------------

function validarFormulario() {
  // --------------------------------------------------------
  // NOME
  // --------------------------------------------------------

  if (!campoNome || campoNome.value.trim() === "") {
    mostrarMensagem("Informe o nome do produto.");

    if (campoNome) {
      campoNome.focus();
    }

    return false;
  }

  // --------------------------------------------------------
  // MARCA
  // --------------------------------------------------------

  if (!campoMarca || campoMarca.value.trim() === "") {
    mostrarMensagem("Informe a marca.");

    if (campoMarca) {
      campoMarca.focus();
    }

    return false;
  }

  // --------------------------------------------------------
  // CATEGORIA
  // --------------------------------------------------------

  if (campoCategoria && campoCategoria.value.trim() === "") {
    mostrarMensagem("Selecione a categoria do produto.");

    campoCategoria.focus();

    return false;
  }

  // --------------------------------------------------------
  // GÊNERO
  // --------------------------------------------------------

  if (campoGenero && campoGenero.value.trim() === "") {
    mostrarMensagem("Selecione o gênero do produto.");

    campoGenero.focus();

    return false;
  }

  // --------------------------------------------------------
  // PREÇO
  // --------------------------------------------------------

  if (!campoPreco || campoPreco.value === "") {
    mostrarMensagem("Informe o preço.");

    if (campoPreco) {
      campoPreco.focus();
    }

    return false;
  }

  // Converte o preço para número.
  const preco = Number(campoPreco.value);

  // Impede preços inválidos ou negativos.
  if (!Number.isFinite(preco) || preco < 0) {
    mostrarMensagem("Informe um preço válido.");

    campoPreco.focus();

    return false;
  }

  return true;
}

// ============================================================
// IMAGENS
// ============================================================

// ------------------------------------------------------------
// CRIAR LISTA DE IMAGENS
// ------------------------------------------------------------
//
// Existem duas situações:
//
// 1. Nenhuma imagem nova foi escolhida.
//
//    → Mantemos as imagens atuais.
//
// 2. Novas imagens foram escolhidas.
//
//    → As novas imagens passam a ser a lista enviada
//      para atualização.
//
// O limite continua sendo quatro imagens.
// ------------------------------------------------------------

function criarListaImagens() {
  // --------------------------------------------------------
  // CAMPO NÃO EXISTE
  // --------------------------------------------------------

  if (!campoImagem || !campoImagem.files) {
    return [...imagensAtuais];
  }

  // Converte FileList para Array.
  const arquivos = Array.from(campoImagem.files);

  // --------------------------------------------------------
  // NENHUMA NOVA IMAGEM
  // --------------------------------------------------------

  // Mantém as imagens atuais.
  if (arquivos.length === 0) {
    return [...imagensAtuais];
  }

  // --------------------------------------------------------
  // LIMITE
  // --------------------------------------------------------

  if (arquivos.length > 4) {
    mostrarMensagem("Você pode selecionar no máximo 4 imagens.");

    return null;
  }

  // --------------------------------------------------------
  // TIPOS PERMITIDOS
  // --------------------------------------------------------

  const tiposPermitidos = [
    "image/jpeg",

    "image/jpg",

    "image/png",

    "image/webp",
  ];

  // Verifica cada arquivo.
  for (const arquivo of arquivos) {
    if (!tiposPermitidos.includes(arquivo.type)) {
      mostrarMensagem("Selecione somente imagens JPG, PNG ou WEBP.");

      return null;
    }
  }

  // --------------------------------------------------------
  // CRIAR OBJETOS
  // --------------------------------------------------------

  return arquivos.map((arquivo) => {
    return {
      // A cor poderá ser associada
      // pela interface final.
      cor: null,

      // Nome do arquivo.
      imagem: arquivo.name,
    };
  });
}

// ============================================================
// VARIAÇÕES
// ============================================================

// ------------------------------------------------------------
// CRIAR LISTA DE VARIAÇÕES
// ------------------------------------------------------------
//
// Procura blocos:
//
// .variacao-produto
//
// Cada bloco deverá possuir:
//
// .variacao-cor
// .variacao-tamanho
// .variacao-estoque
//
// A combinação representa:
//
// COR + TAMANHO + ESTOQUE
// ------------------------------------------------------------

function criarListaVariacoes() {
  // Procura os blocos de variações.
  const listaVariacoes = document.querySelectorAll(".variacao-produto");

  // ========================================================
  // EXISTEM VÁRIAS VARIAÇÕES
  // ========================================================

  if (listaVariacoes.length > 0) {
    const variacoes = [];

    // Percorre todos os blocos.
    listaVariacoes.forEach((bloco) => {
      // Campo de cor.
      const campoCorVariacao = bloco.querySelector(".variacao-cor");

      // Campo de tamanho.
      const campoTamanhoVariacao = bloco.querySelector(".variacao-tamanho");

      // Campo de estoque.
      const campoEstoqueVariacao = bloco.querySelector(".variacao-estoque");

      // Obtém a cor.
      const cor = campoCorVariacao ? campoCorVariacao.value.trim() : "";

      // Obtém o tamanho.
      const tamanho = campoTamanhoVariacao
        ? campoTamanhoVariacao.value.trim()
        : "";

      // Obtém o estoque.
      const estoque = campoEstoqueVariacao
        ? Number(campoEstoqueVariacao.value || 0)
        : 0;

      // ------------------------------------------------
      // ADICIONAR VARIAÇÃO
      // ------------------------------------------------

      // Só adicionamos uma variação completa.
      if (cor !== "" && tamanho !== "") {
        variacoes.push({
          cor: cor,

          tamanho: tamanho,

          estoque: Math.max(0, estoque),
        });
      }
    });

    return variacoes;
  }

  // ========================================================
  // COMPATIBILIDADE COM FORMULÁRIO ANTIGO
  // ========================================================

  // Caso ainda exista somente um campo
  // de cor e tamanho.
  if (
    campoCor &&
    campoTamanho &&
    campoCor.value.trim() !== "" &&
    campoTamanho.value.trim() !== ""
  ) {
    const estoque = campoEstoque ? Number(campoEstoque.value || 0) : 0;

    return [
      {
        cor: campoCor.value.trim(),

        tamanho: campoTamanho.value.trim(),

        estoque: Math.max(0, estoque),
      },
    ];
  }

  // ========================================================
  // NENHUMA ALTERAÇÃO
  // ========================================================

  // Caso não exista nenhuma nova variação
  // no formulário, mantemos as atuais.
  return [...variacoesAtuais];
}

// ============================================================
// VALIDAR VARIAÇÕES
// ============================================================

// ------------------------------------------------------------
// VERIFICAR DUPLICIDADES
// ------------------------------------------------------------
//
// Não podemos possuir:
//
// Azul + M
// Azul + M
//
// duas vezes.
//
// O banco também possui uma restrição UNIQUE
// para impedir essa duplicidade.
// ------------------------------------------------------------

function validarVariacoes(variacoes) {
  if (!Array.isArray(variacoes)) {
    return true;
  }

  const combinacoes = new Set();

  for (const variacao of variacoes) {
    const cor = String(variacao.cor || "")
      .trim()
      .toLowerCase();

    const tamanho = String(variacao.tamanho || "")
      .trim()
      .toLowerCase();

    if (!cor || !tamanho) {
      continue;
    }

    const chave = `${cor}::${tamanho}`;

    // Verifica se a combinação já existe.
    if (combinacoes.has(chave)) {
      mostrarMensagem(
        `A combinação "${variacao.cor} + ${variacao.tamanho}" foi cadastrada mais de uma vez.`,
      );

      return false;
    }

    combinacoes.add(chave);
  }

  return true;
}

// ============================================================
// ASSOCIAR IMAGENS ÀS CORES
// ============================================================

// ------------------------------------------------------------
// ASSOCIAR IMAGENS
// ------------------------------------------------------------
//
// Permite relacionar uma imagem a uma determinada cor.
//
// Exemplo:
//
// data-imagem-cor="Azul"
//
// Dessa forma o catálogo poderá descobrir
// quais imagens devem ser exibidas quando
// o cliente selecionar uma determinada cor.
// ------------------------------------------------------------

function associarImagensAsCores(imagens) {
  if (!Array.isArray(imagens) || imagens.length === 0) {
    return imagens;
  }

  // Procura elementos que possuam
  // data-imagem-cor.
  const elementos = document.querySelectorAll("[data-imagem-cor]");

  if (elementos.length === 0) {
    return imagens;
  }

  // Relaciona cada imagem encontrada
  // à respectiva cor.
  elementos.forEach((elemento, indice) => {
    const cor = elemento.dataset.imagemCor;

    if (imagens[indice] && cor) {
      imagens[indice].cor = cor.trim();
    }
  });

  return imagens;
}

// ============================================================
// CRIAR DADOS ATUALIZADOS
// ============================================================

// ------------------------------------------------------------
// MONTAR OBJETO FINAL
// ------------------------------------------------------------
//
// Reúne todas as informações atualizadas
// antes de enviá-las ao server.js.
// ------------------------------------------------------------

function criarProdutoAtualizado() {
  // --------------------------------------------------------
  // IMAGENS
  // --------------------------------------------------------

  let imagens = criarListaImagens();

  // Se houve erro nas imagens,
  // interrompemos.
  if (imagens === null) {
    return null;
  }

  // Relaciona imagens às cores.
  imagens = associarImagensAsCores(imagens);

  // --------------------------------------------------------
  // VARIAÇÕES
  // --------------------------------------------------------

  const variacoes = criarListaVariacoes();

  // Verifica duplicidades.
  if (!validarVariacoes(variacoes)) {
    return null;
  }

  // --------------------------------------------------------
  // IMAGEM PRINCIPAL
  // --------------------------------------------------------

  // Por padrão, mantém a imagem atual.
  let imagemPrincipal = imagemAtual;

  // Se houver uma nova lista de imagens,
  // a primeira será a principal.
  if (imagens.length > 0) {
    const primeiraImagem = imagens[0];

    if (primeiraImagem && primeiraImagem.imagem) {
      imagemPrincipal = primeiraImagem.imagem;
    }
  }

  // ========================================================
  // OBJETO FINAL
  // ========================================================

  return {
    // ----------------------------------------------------
    // INFORMAÇÕES PRINCIPAIS
    // ----------------------------------------------------

    nome: campoNome ? campoNome.value.trim() : "",

    marca: campoMarca ? campoMarca.value.trim() : "",

    categoria: campoCategoria ? campoCategoria.value : "",

    genero: campoGenero ? campoGenero.value : "",

    preco: campoPreco ? Number(campoPreco.value) : 0,

    material: campoMaterial ? campoMaterial.value.trim() : "",

    descricao: campoDescricao ? campoDescricao.value.trim() : "",

    // ----------------------------------------------------
    // CAMPOS TRADICIONAIS
    // ----------------------------------------------------

    tamanho: campoTamanho ? campoTamanho.value.trim() : "",

    cor: campoCor ? campoCor.value.trim() : "",

    // ----------------------------------------------------
    // IMAGEM PRINCIPAL
    // ----------------------------------------------------

    imagem: imagemPrincipal,

    // ----------------------------------------------------
    // TODAS AS IMAGENS
    // ----------------------------------------------------

    imagens: imagens,

    // ----------------------------------------------------
    // VARIAÇÕES
    // ----------------------------------------------------

    variacoes: variacoes,
  };
}

// ============================================================
// ATUALIZAR PRODUTO
// ============================================================

// ------------------------------------------------------------
// ENVIAR ALTERAÇÕES PARA A API
// ------------------------------------------------------------
//
// Endpoint:
//
// PUT /produtos/:id
//
// O server.js será responsável por atualizar
// os registros correspondentes no SQLite.
// ------------------------------------------------------------

async function atualizarProduto(event) {
  // Impede o envio tradicional do formulário.
  event.preventDefault();

  // --------------------------------------------------------
  // VALIDAR
  // --------------------------------------------------------

  if (!validarFormulario()) {
    return;
  }

  // --------------------------------------------------------
  // PREPARAR DADOS
  // --------------------------------------------------------

  const produto = criarProdutoAtualizado();

  if (!produto) {
    return;
  }

  try {
    // ----------------------------------------------------
    // ENVIAR PARA O BACKEND
    // ----------------------------------------------------

    const resposta = await fetch(`${API_URL}/produtos/${idProduto}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify(produto),
    });

    // ----------------------------------------------------
    // RESPOSTA
    // ----------------------------------------------------

    const dados = await resposta.json();

    // ----------------------------------------------------
    // ERRO
    // ----------------------------------------------------

    if (!resposta.ok) {
      mostrarMensagem(dados.mensagem || "Erro ao atualizar produto.");

      return;
    }

    // ----------------------------------------------------
    // SUCESSO
    // ----------------------------------------------------

    mostrarMensagem("Produto atualizado com sucesso!");

    // ----------------------------------------------------
    // VOLTAR PARA PRODUTOS
    // ----------------------------------------------------

    setTimeout(() => {
      abrirProdutos();
    }, 500);
  } catch (erro) {
    // ----------------------------------------------------
    // ERRO DE CONEXÃO
    // ----------------------------------------------------

    console.error("Erro ao atualizar produto:", erro);

    mostrarMensagem("Erro ao conectar com o servidor.");
  }
}

// ============================================================
// EVENTOS
// ============================================================

// ------------------------------------------------------------
// SALVAR ALTERAÇÕES
// ------------------------------------------------------------

if (formulario) {
  formulario.addEventListener("submit", atualizarProduto);
}

// ------------------------------------------------------------
// CANCELAR
// ------------------------------------------------------------
//
// Retorna para a lista de produtos
// sem salvar alterações.
// ------------------------------------------------------------

if (botaoCancelar) {
  botaoCancelar.addEventListener("click", abrirProdutos);
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

// ------------------------------------------------------------
// INICIAR EDIÇÃO
// ------------------------------------------------------------
//
// Busca o produto assim que a página
// de edição é aberta.
// ------------------------------------------------------------

function iniciarEdicao() {
  carregarProduto();
}

// ============================================================
// EXECUÇÃO
// ============================================================

// Inicia a página.
iniciarEdicao();
