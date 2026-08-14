// ============================================================
// COSTA CONFECÇÕES
// ÁREA ADMINISTRATIVA
// Arquivo: cadastrar-produto.js
//
// Responsável por:
//
// • Validar o formulário.
// • Reunir os dados do produto.
// • Selecionar e validar imagens.
// • Enviar os arquivos reais para o servidor.
// • Preparar as variações de cor, tamanho e estoque.
// • Enviar o produto para a API.
// • Limpar o formulário após o cadastro.
// • Retornar para a página de produtos.
//
// IMPORTANTE:
//
// Este arquivo NÃO acessa o SQLite diretamente.
//
// O JavaScript envia os dados para o server.js
// através da API.
//
// O admin.js deve ser carregado antes deste arquivo,
// pois fornece:
//
// • API_URL
// • mostrarMensagem()
// • abrirProdutos()
// ============================================================

// ============================================================
// ELEMENTOS DA PÁGINA
// ============================================================

// ------------------------------------------------------------
// FORMULÁRIO
// ------------------------------------------------------------

// Localiza o formulário principal.
const formulario = document.getElementById("form-produto");

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
const campoGenero = document.getElementById("genero");

// Preço do produto.
const campoPreco = document.getElementById("preco");

// Tamanho tradicional do produto.
const campoTamanho = document.getElementById("tamanho");

// Cor tradicional do produto.
const campoCor = document.getElementById("cor");

// Material do produto.
const campoMaterial = document.getElementById("material");

// Estoque tradicional.
const campoEstoque = document.getElementById("estoque");

// Descrição do produto.
const campoDescricao = document.getElementById("descricao");

// ------------------------------------------------------------
// IMAGENS
// ------------------------------------------------------------

// Campo responsável pela seleção das imagens.
const campoImagem = document.getElementById("imagem");

// ============================================================
// VALIDAÇÃO DO FORMULÁRIO
// ============================================================

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

  const preco = Number(campoPreco.value);

  if (!Number.isFinite(preco) || preco < 0) {
    mostrarMensagem("Informe um preço válido.");

    campoPreco.focus();

    return false;
  }

  return true;
}

// ============================================================
// PREPARAR IMAGENS
// ============================================================
//
// Aqui está uma das principais mudanças.
//
// O arquivo antigo enviava somente:
//
// arquivo.name
//
// Agora enviamos o arquivo físico através do FormData.
//
// O server.js recebe os arquivos através de:
//
// uploadImagens.array("imagens", 4)
// ============================================================

function obterArquivosSelecionados() {
  if (!campoImagem || !campoImagem.files) {
    return [];
  }

  const arquivos = Array.from(campoImagem.files);

  // --------------------------------------------------------
  // LIMITE
  // --------------------------------------------------------

  if (arquivos.length > 4) {
    mostrarMensagem("Você pode selecionar no máximo 4 imagens.");

    return null;
  }

  // --------------------------------------------------------
  // FORMATOS PERMITIDOS
  // --------------------------------------------------------

  const tiposPermitidos = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  // --------------------------------------------------------
  // VALIDAR TIPO E TAMANHO
  // --------------------------------------------------------

  for (const arquivo of arquivos) {
    // Verifica o formato.
    if (!tiposPermitidos.includes(arquivo.type)) {
      mostrarMensagem("Selecione somente imagens JPG, PNG ou WEBP.");

      return null;
    }

    // Limite de 5 MB.
    const tamanhoMaximo = 5 * 1024 * 1024;

    if (arquivo.size > tamanhoMaximo) {
      mostrarMensagem(
        `A imagem "${arquivo.name}" ultrapassa o limite de 5 MB.`,
      );

      return null;
    }
  }

  return arquivos;
}

// ============================================================
// PREPARAR VARIAÇÕES
// ============================================================
//
// A variação representa:
//
// COR + TAMANHO + ESTOQUE
//
// Exemplo:
//
// Preto + M + 10
// Preto + G + 8
// Azul + M + 5
// ============================================================

function criarListaVariacoes() {
  // --------------------------------------------------------
  // PROCURAR VARIAÇÕES DINÂMICAS
  // --------------------------------------------------------

  const blocos = document.querySelectorAll(".variacao-produto");

  // --------------------------------------------------------
  // CASO EXISTAM BLOCOS DINÂMICOS
  // --------------------------------------------------------

  if (blocos.length > 0) {
    const variacoes = [];

    blocos.forEach((bloco) => {
      const campoCorVariacao = bloco.querySelector(".variacao-cor");

      const campoTamanhoVariacao = bloco.querySelector(".variacao-tamanho");

      const campoEstoqueVariacao = bloco.querySelector(".variacao-estoque");

      const cor = campoCorVariacao ? campoCorVariacao.value.trim() : "";

      const tamanho = campoTamanhoVariacao
        ? campoTamanhoVariacao.value.trim()
        : "";

      const estoque = campoEstoqueVariacao
        ? Number(campoEstoqueVariacao.value || 0)
        : 0;

      if (cor !== "" && tamanho !== "") {
        variacoes.push({
          cor: cor,

          tamanho: tamanho,

          estoque: Number.isFinite(estoque)
            ? Math.max(0, Math.floor(estoque))
            : 0,
        });
      }
    });

    return variacoes;
  }

  // ========================================================
  // COMPATIBILIDADE COM O FORMULÁRIO ATUAL
  // ========================================================

  const cor = campoCor ? campoCor.value.trim() : "";

  const tamanho = campoTamanho ? campoTamanho.value.trim() : "";

  // Sem cor ou tamanho,
  // não criamos uma variação.
  if (cor === "" || tamanho === "") {
    return [];
  }

  const estoque = campoEstoque ? Number(campoEstoque.value || 0) : 0;

  return [
    {
      cor: cor,

      tamanho: tamanho,

      estoque: Number.isFinite(estoque) ? Math.max(0, Math.floor(estoque)) : 0,
    },
  ];
}

// ============================================================
// VALIDAR VARIAÇÕES
// ============================================================
//
// Impede:
//
// Preto + M
// Preto + M
//
// duas vezes.
//
// O banco possui uma restrição UNIQUE
// para produto + cor + tamanho.
// ============================================================

function validarVariacoes(variacoes) {
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
// PREPARAR METADADOS DAS IMAGENS
// ============================================================
//
// Os arquivos reais são enviados em:
//
// "imagens"
//
// E estes metadados também são enviados:
//
// [
//
//     {
//         cor: null
//     }
//
// ]
//
// O server.js usa o índice para relacionar
// cada arquivo com seu respectivo metadado.
// ============================================================

function criarMetadadosImagens(quantidade) {
  const imagens = [];

  for (let i = 0; i < quantidade; i++) {
    imagens.push({
      cor: null,
    });
  }

  return imagens;
}

// ============================================================
// CRIAR FORM DATA
// ============================================================
//
// Diferentemente do código antigo,
// agora NÃO utilizamos:
//
// JSON.stringify()
//
// para as imagens.
//
// Utilizamos FormData porque ele permite
// enviar arquivos reais ao backend.
// ============================================================

function criarFormData() {
  const arquivos = obterArquivosSelecionados();

  if (arquivos === null) {
    return null;
  }

  // --------------------------------------------------------
  // VARIAÇÕES
  // --------------------------------------------------------

  const variacoes = criarListaVariacoes();

  if (!validarVariacoes(variacoes)) {
    return null;
  }

  // --------------------------------------------------------
  // CRIAR FORMDATA
  // --------------------------------------------------------

  const formData = new FormData();

  // --------------------------------------------------------
  // DADOS PRINCIPAIS
  // --------------------------------------------------------

  formData.append("nome", campoNome.value.trim());

  formData.append("marca", campoMarca.value.trim());

  formData.append("categoria", campoCategoria ? campoCategoria.value : "");

  formData.append("genero", campoGenero ? campoGenero.value : "");

  formData.append("preco", campoPreco.value);

  formData.append("tamanho", campoTamanho ? campoTamanho.value.trim() : "");

  formData.append("cor", campoCor ? campoCor.value.trim() : "");

  formData.append("material", campoMaterial ? campoMaterial.value.trim() : "");

  formData.append(
    "descricao",
    campoDescricao ? campoDescricao.value.trim() : "",
  );

  // --------------------------------------------------------
  // VARIAÇÕES
  // --------------------------------------------------------

  formData.append("variacoes", JSON.stringify(variacoes));

  // --------------------------------------------------------
  // METADADOS DAS IMAGENS
  // --------------------------------------------------------
  //
  // IMPORTANTE:
  //
  // O server.js recebe:
  //
  // req.files → arquivos reais
  //
  // req.body.imagens → JSON com metadados
  //
  // --------------------------------------------------------

  const metadadosImagens = criarMetadadosImagens(arquivos.length);

  formData.append("imagens", JSON.stringify(metadadosImagens));

  // --------------------------------------------------------
  // ARQUIVOS REAIS
  // --------------------------------------------------------
  //
  // Todos os arquivos usam o mesmo campo:
  //
  // imagens
  //
  // Isso corresponde ao:
  //
  // uploadImagens.array("imagens", 4)
  //
  // do server.js.
  // --------------------------------------------------------

  arquivos.forEach((arquivo) => {
    formData.append("imagens", arquivo);
  });

  return formData;
}

// ============================================================
// SALVAR PRODUTO
// ============================================================

async function salvarProduto(event) {
  // Impede o comportamento
  // tradicional do formulário.
  event.preventDefault();

  // --------------------------------------------------------
  // VALIDAR
  // --------------------------------------------------------

  if (!validarFormulario()) {
    return;
  }

  // --------------------------------------------------------
  // FORM DATA
  // --------------------------------------------------------

  const formData = criarFormData();

  if (!formData) {
    return;
  }

  try {
    // ====================================================
    // ENVIAR PARA API
    // ====================================================

    const resposta = await fetch(`${API_URL}/produtos`, {
      method: "POST",

      // IMPORTANTE:
      //
      // NÃO colocamos:
      //
      // "Content-Type":
      // "application/json"
      //
      // O navegador define automaticamente
      // o multipart/form-data do FormData.

      credentials: "include",

      body: formData,
    });

    // ----------------------------------------------------
    // TENTAR LER A RESPOSTA
    // ----------------------------------------------------

    let dados = {};

    try {
      dados = await resposta.json();
    } catch (erro) {
      dados = {};
    }

    // ----------------------------------------------------
    // ERRO
    // ----------------------------------------------------

    if (!resposta.ok) {
      mostrarMensagem(dados.mensagem || "Erro ao cadastrar produto.");

      return;
    }

    // ====================================================
    // SUCESSO
    // ====================================================

    mostrarMensagem("Produto cadastrado com sucesso!");

    // Limpa o formulário.
    formulario.reset();

    // ----------------------------------------------------
    // VOLTAR PARA PRODUTOS
    // ----------------------------------------------------

    setTimeout(() => {
      abrirProdutos();
    }, 500);
  } catch (erro) {
    console.error("Erro ao cadastrar produto:", erro);

    mostrarMensagem("Erro ao conectar com o servidor.");
  }
}

// ============================================================
// PRÉ-VISUALIZAÇÃO DAS IMAGENS
// ============================================================
//
// Mostra ao administrador quais imagens
// foram selecionadas antes do envio.
//
// Essa parte é apenas visual.
// O upload real continua sendo feito pelo
// FormData.
// ============================================================

function criarPreVisualizacaoImagens() {
  if (!campoImagem) {
    return;
  }

  // Procura um container existente.
  let container = document.getElementById("preview-imagens");

  // Caso não exista,
  // criamos automaticamente.
  if (!container) {
    container = document.createElement("div");

    container.id = "preview-imagens";

    container.className = "preview-imagens";

    campoImagem.parentElement.appendChild(container);
  }

  // Limpa as imagens anteriores.
  container.innerHTML = "";

  const arquivos = Array.from(campoImagem.files || []);

  // --------------------------------------------------------
  // SEM IMAGEM
  // --------------------------------------------------------

  if (arquivos.length === 0) {
    return;
  }

  // --------------------------------------------------------
  // CRIAR PREVIEWS
  // --------------------------------------------------------

  arquivos.forEach((arquivo, indice) => {
    const leitor = new FileReader();

    leitor.onload = (evento) => {
      const wrapper = document.createElement("div");

      wrapper.className = "preview-imagem";

      const imagem = document.createElement("img");

      imagem.src = evento.target.result;

      imagem.alt = `Imagem ${indice + 1}`;

      wrapper.appendChild(imagem);

      container.appendChild(wrapper);
    };

    leitor.readAsDataURL(arquivo);
  });
}

// ============================================================
// EVENTOS
// ============================================================

// ------------------------------------------------------------
// ENVIO DO FORMULÁRIO
// ------------------------------------------------------------

if (formulario) {
  formulario.addEventListener("submit", salvarProduto);
}

// ------------------------------------------------------------
// SELEÇÃO DE IMAGENS
// ------------------------------------------------------------
//
// Atualiza a pré-visualização imediatamente
// após o administrador selecionar as imagens.
// ------------------------------------------------------------

if (campoImagem) {
  campoImagem.addEventListener("change", () => {
    criarPreVisualizacaoImagens();
  });
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

function iniciarCadastro() {
  console.log("Cadastro de produto iniciado.");
}

iniciarCadastro();
