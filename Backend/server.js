// ============================================================
// COSTA CONFECÇÕES
// BACKEND / API
// Arquivo: server.js
//
// Responsável por:
//
// • Cadastro de usuários
// • Login
// • Sessão do usuário
// • Logout
// • Recuperação de senha
// • Cadastro de produtos
// • Listagem de produtos
// • Busca de produto
// • Edição de produtos
// • Exclusão de produtos
// • Imagens dos produtos
// • Variações de cor, tamanho e estoque
// • Lista de desejos / favoritos
// • Avaliações e comentários
// • Dashboard administrativo
// • Reportar erro
// • Sugerir melhoria
//
// FLUXO DO SISTEMA:
//
// HTML
// ↓
// JavaScript
// ↓
// server.js
// ↓
// database.js
// ↓
// SQLite
//
// O frontend NÃO acessa o banco diretamente.
// Todas as operações passam pela API.
// ============================================================

// ============================================================
// IMPORTAÇÃO DAS BIBLIOTECAS
// ============================================================

// Express cria o servidor e as rotas da API.
const express = require("express");

// CORS permite a comunicação entre frontend e backend.
const cors = require("cors");

// Bcrypt protege as senhas dos usuários.
const bcrypt = require("bcrypt");

// Express Session mantém o usuário autenticado.
const session = require("express-session");

// Crypto gera tokens seguros para recuperação de senha.
const crypto = require("crypto");

// Manipulação de caminhos e arquivos do servidor.
const path = require("path");
const fs = require("fs");

// Multer processa uploads enviados via multipart/form-data.
const multer = require("multer");

// Importa o banco SQLite.
const db = require("./database");

// Nodemailer será utilizado para envio de e-mails.
let nodemailer = null;

// ============================================================
// CONFIGURAÇÃO PRINCIPAL
// ============================================================

// Cria a aplicação Express.
const app = express();

// Porta utilizada pelo servidor.
const PORT = Number(process.env.PORT || 3000);

// ============================================================
// ARMAZENAMENTO DE IMAGENS DOS PRODUTOS
// ============================================================

// Pasta física onde as imagens dos produtos serão armazenadas.
const PASTA_UPLOADS_PRODUTOS = path.join(__dirname, "uploads", "produtos");

// Cria a pasta automaticamente se ela ainda não existir.
fs.mkdirSync(PASTA_UPLOADS_PRODUTOS, { recursive: true });

// Configura o armazenamento dos arquivos enviados pelo administrador.
const armazenamentoImagens = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PASTA_UPLOADS_PRODUTOS);
  },

  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname).toLowerCase();

    const nomeUnico = `produto-${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extensao}`;

    cb(null, nomeUnico);
  },
});

// Permite até 4 imagens de no máximo 5 MB cada.
const uploadImagens = multer({
  storage: armazenamentoImagens,

  limits: {
    files: 4,
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const tiposPermitidos = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!tiposPermitidos.includes(file.mimetype)) {
      return cb(new Error("Selecione somente imagens JPG, PNG ou WEBP."));
    }

    cb(null, true);
  },
});

// URL pública usada para entregar as imagens ao frontend.
// Em produção, PUBLIC_API_URL pode apontar para a URL pública da API. Quando
// a API é publicada no mesmo domínio pelo Vercel, usamos caminhos relativos.
const API_URL_PUBLICA = process.env.PUBLIC_API_URL ||
  (process.env.VERCEL ? "" : `http://127.0.0.1:${PORT}`);

// Converte o nome/caminho de uma imagem em uma URL pública.
function obterUrlImagem(nomeArquivo) {
  if (!nomeArquivo) {
    return null;
  }

  const valor = String(nomeArquivo).trim();

  if (valor.startsWith("http://") || valor.startsWith("https://")) {
    return valor;
  }

  if (valor.startsWith("/uploads/produtos/")) {
    return `${API_URL_PUBLICA}${valor}`;
  }

  // Mantém compatibilidade com caminhos relativos antigos
  // que apontam para imagens já existentes no frontend.
  if (
    valor.startsWith("../") ||
    valor.startsWith("./") ||
    valor.startsWith("/")
  ) {
    return valor;
  }

  // Arquivos novos ficam na pasta de uploads do backend.
  return `${API_URL_PUBLICA}/uploads/produtos/${encodeURIComponent(valor)}`;
}

// Endereço utilizado pelo frontend durante o desenvolvimento.
const FRONTEND_URL = process.env.FRONTEND_URL || "http://127.0.0.1:5500";

// Origens permitidas durante o desenvolvimento.
const FRONTEND_ORIGINS = (
  process.env.FRONTEND_ORIGINS ||
  [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    FRONTEND_URL,
    "https://costa-confeccoes.vercel.app",
  ].join(",")
)
  .split(",")
  .map((origem) => origem.trim())
  .filter(Boolean);

// ============================================================
// CONFIGURAÇÃO DE E-MAIL
// ============================================================

// ------------------------------------------------------------
// E-MAIL DO DONO
// ------------------------------------------------------------
//
// Quando quiser configurar o e-mail que receberá:
//
// • Reportar erro
// • Sugerir melhoria
//
// altere SOMENTE esta variável.
// ------------------------------------------------------------

const EMAIL_DO_DONO = process.env.EMAIL_DO_DONO || "";

// ------------------------------------------------------------
// CONTA DE E-MAIL REMETENTE
// ------------------------------------------------------------
//
// Esta conta será utilizada para enviar os e-mails.
//
// Se estiver utilizando Gmail, recomenda-se utilizar
// uma App Password em vez da senha normal.
// ------------------------------------------------------------

const SMTP_USUARIO = process.env.SMTP_USUARIO || "";

const SMTP_SENHA = process.env.SMTP_SENHA || "";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";

const SMTP_PORT = Number(process.env.SMTP_PORT || 587);

// ============================================================
// NODEMAILER
// ============================================================

// Tenta carregar o Nodemailer.
//
// Caso ele ainda não esteja instalado,
// o restante da API continua funcionando.
try {
  nodemailer = require("nodemailer");
} catch (erro) {
  console.warn(
    "Nodemailer não está instalado. " +
      "As funções de e-mail ficarão indisponíveis.",
  );
}

// ------------------------------------------------------------
// TRANSPORTADOR DE E-MAIL
// ------------------------------------------------------------

// Responsável por enviar as mensagens.
let transportadorEmail = null;

// Cria o transportador somente se o Nodemailer existir.
if (nodemailer) {
  transportadorEmail = nodemailer.createTransport({
    host: SMTP_HOST,

    port: SMTP_PORT,

    secure: false,

    auth: {
      user: SMTP_USUARIO,

      pass: SMTP_SENHA,
    },
  });
}

// ============================================================
// MIDDLEWARES
// ============================================================

// ------------------------------------------------------------
// CORS
// ------------------------------------------------------------
//
// Permite que o navegador envie requisições
// do frontend para o backend.
//
// credentials: true é necessário porque utilizamos
// cookies para controlar a sessão.
// ------------------------------------------------------------

app.use(
  cors({
    origin: function (origin, callback) {
      // Permite requisições sem origin.
      if (!origin) {
        return callback(null, true);
      }

      // Verifica se a origem está autorizada.
      if (FRONTEND_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origem não autorizada pelo CORS."));
    },

    credentials: true,
  }),
);

// ------------------------------------------------------------
// ARQUIVOS ESTÁTICOS
// ------------------------------------------------------------
//
// Torna as imagens salvas em /uploads/produtos acessíveis
// pelo navegador.
// ------------------------------------------------------------

app.use("/uploads/produtos", express.static(PASTA_UPLOADS_PRODUTOS));

// ------------------------------------------------------------
// JSON
// ------------------------------------------------------------
//
// Permite receber informações em JSON.
//
// O limite maior deixa espaço para os dados
// relacionados aos produtos.
// ------------------------------------------------------------

app.use(
  express.json({
    limit: "20mb",
  }),
);

// ------------------------------------------------------------
// FORMULÁRIOS
// ------------------------------------------------------------

app.use(
  express.urlencoded({
    extended: true,

    limit: "20mb",
  }),
);

// ============================================================
// CONFIGURAÇÃO DA SESSÃO
// ============================================================

// ------------------------------------------------------------
// SESSÃO
// ------------------------------------------------------------
//
// A sessão identifica o usuário que está logado.
//
// O navegador recebe um cookie chamado:
//
// connect.sid
//
// O backend utiliza esse cookie para descobrir
// qual usuário está autenticado.
// ------------------------------------------------------------

app.use(
  session({
    secret:
      process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"),

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,

      secure: false,

      maxAge: 1000 * 60 * 60 * 2,

      sameSite: "lax",
    },
  }),
);

// ============================================================
// FUNÇÕES DE AUTENTICAÇÃO
// ============================================================

// ------------------------------------------------------------
// EXIGIR LOGIN
// ------------------------------------------------------------
//
// Impede que usuários não autenticados acessem
// determinadas rotas.
// ------------------------------------------------------------

function exigirLogin(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({
      autenticado: false,

      mensagem: "Você precisa estar logado.",
    });
  }

  next();
}

// ------------------------------------------------------------
// EXIGIR ADMINISTRADOR
// ------------------------------------------------------------
//
// Impede que clientes comuns acessem
// a área administrativa.
// ------------------------------------------------------------

function exigirAdministrador(req, res, next) {
  // Primeiro verifica se existe sessão.
  if (!req.session.usuario) {
    return res.status(401).json({
      autenticado: false,

      mensagem: "Você precisa estar logado.",
    });
  }

  // Depois verifica o tipo da conta.
  if (req.session.usuario.tipo !== "admin") {
    return res.status(403).json({
      mensagem: "Acesso permitido apenas para administradores.",
    });
  }

  next();
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

// ------------------------------------------------------------
// VALIDAR ID
// ------------------------------------------------------------
//
// Converte o ID recebido pela URL em número.
//
// Se o ID for inválido, retorna null.
// ------------------------------------------------------------

function obterId(valor) {
  const id = Number(valor);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

// ------------------------------------------------------------
// BUSCAR PRODUTO
// ------------------------------------------------------------
//
// Procura um produto pelo ID.
// ------------------------------------------------------------

function buscarProdutoPorId(id) {
  return db
    .prepare(
      `
            SELECT *
            FROM produtos
            WHERE id = ?
            `,
    )
    .get(id);
}

// ------------------------------------------------------------
// BUSCAR IMAGENS
// ------------------------------------------------------------
//
// Busca as imagens cadastradas para determinado produto.
// ------------------------------------------------------------

function buscarImagensProduto(produtoId) {
  return db
    .prepare(
      `
            SELECT
                id,
                cor,
                imagem,
                criado_em
            FROM produto_imagens
            WHERE produto_id = ?
            ORDER BY id ASC
            `,
    )
    .all(produtoId);
}

// ------------------------------------------------------------
// BUSCAR VARIAÇÕES
// ------------------------------------------------------------
//
// Busca:
//
// • Cor
// • Tamanho
// • Estoque
//
// de determinado produto.
// ------------------------------------------------------------

function buscarVariacoesProduto(produtoId) {
  return db
    .prepare(
      `
            SELECT
                id,
                cor,
                tamanho,
                estoque,
                criado_em
            FROM produto_variacoes
            WHERE produto_id = ?
            ORDER BY id ASC
            `,
    )
    .all(produtoId);
}

// ------------------------------------------------------------
// MONTAR PRODUTO COMPLETO
// ------------------------------------------------------------
//
// Junta:
//
// • Dados principais
// • Imagens
// • Variações
//
// em um único objeto.
// ------------------------------------------------------------

function montarProdutoCompleto(produto) {
  if (!produto) {
    return null;
  }

  return {
    ...produto,

    imagens: buscarImagensProduto(produto.id),

    variacoes: buscarVariacoesProduto(produto.id),
  };
}

// ------------------------------------------------------------
// ESCAPAR HTML
// ------------------------------------------------------------
//
// Protege os textos enviados pelos usuários
// antes de colocá-los dentro de e-mails.
// ------------------------------------------------------------

function escaparHTML(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ------------------------------------------------------------
// ENVIAR E-MAIL
// ------------------------------------------------------------
//
// Centraliza o envio de e-mails da aplicação.
// ------------------------------------------------------------

async function enviarEmail({ para, assunto, texto, html }) {
  if (!transportadorEmail) {
    throw new Error("Nodemailer não está instalado.");
  }

  if (!SMTP_USUARIO || SMTP_USUARIO.includes("COLOQUE_")) {
    throw new Error("E-mail remetente não configurado.");
  }

  if (!SMTP_SENHA || SMTP_SENHA.includes("COLOQUE_")) {
    throw new Error("Senha do e-mail remetente não configurada.");
  }

  await transportadorEmail.sendMail({
    from: SMTP_USUARIO,

    to: para,

    subject: assunto,

    text: texto,

    html: html || undefined,
  });
}

// ============================================================
// TESTE DA API
// ============================================================

// ------------------------------------------------------------
// ROTA PRINCIPAL
// ------------------------------------------------------------
//
// Permite verificar rapidamente se o servidor está ativo.
// ------------------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    sucesso: true,

    mensagem: "API Costa Confecções funcionando!",
  });
});

// ============================================================
// CADASTRO
// ============================================================

// ------------------------------------------------------------
// CADASTRAR USUÁRIO
// ------------------------------------------------------------

app.post("/cadastro", async (req, res) => {
  const { nome, email, senha } = req.body;

  // Verifica os campos obrigatórios.
  if (!nome || !email || !senha) {
    return res.status(400).json({
      mensagem: "Preencha todos os campos.",
    });
  }

  // Verifica o tamanho do nome.
  if (String(nome).trim().length < 2) {
    return res.status(400).json({
      mensagem: "Informe um nome válido.",
    });
  }

  // Normaliza o e-mail.
  const emailNormalizado = String(email).trim().toLowerCase();

  // Validação simples do e-mail.
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado);

  if (!emailValido) {
    return res.status(400).json({
      mensagem: "Informe um e-mail válido.",
    });
  }

  // Exige no mínimo oito caracteres.
  if (String(senha).length < 8) {
    return res.status(400).json({
      mensagem: "A senha deve possuir pelo menos 8 caracteres.",
    });
  }

  try {
    // Verifica se o e-mail já existe.
    const usuarioExistente = db
      .prepare(
        `
                        SELECT id
                        FROM usuarios
                        WHERE email = ?
                        `,
      )
      .get(emailNormalizado);

    if (usuarioExistente) {
      return res.status(409).json({
        mensagem: "Este e-mail já está cadastrado.",
      });
    }

    // Cria o hash da senha.
    const senhaHash = await bcrypt.hash(senha, 10);

    // Cria a conta como cliente.
    const resultado = db
      .prepare(
        `
                        INSERT INTO usuarios (
                            nome,
                            email,
                            senha,
                            tipo
                        )
                        VALUES (?, ?, ?, 'cliente')
                        `,
      )
      .run(
        String(nome).trim(),

        emailNormalizado,

        senhaHash,
      );

    res.status(201).json({
      sucesso: true,

      mensagem: "Cadastro realizado com sucesso!",

      id: resultado.lastInsertRowid,
    });
  } catch (erro) {
    console.error("Erro no cadastro:", erro);

    res.status(500).json({
      mensagem: "Erro ao realizar cadastro.",
    });
  }
});

// ============================================================
// LOGIN
// ============================================================

// ------------------------------------------------------------
// REALIZAR LOGIN
// ------------------------------------------------------------

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({
      mensagem: "Informe o e-mail e a senha.",
    });
  }

  try {
    const emailNormalizado = String(email).trim().toLowerCase();

    // Busca o usuário.
    const usuario = db
      .prepare(
        `
                        SELECT *
                        FROM usuarios
                        WHERE email = ?
                        `,
      )
      .get(emailNormalizado);

    // Usuário inexistente.
    if (!usuario) {
      return res.status(401).json({
        mensagem: "E-mail ou senha incorretos.",
      });
    }

    // Compara a senha digitada
    // com o hash armazenado.
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({
        mensagem: "E-mail ou senha incorretos.",
      });
    }

    // Cria os dados da sessão.
    req.session.usuario = {
      id: usuario.id,

      nome: usuario.nome,

      email: usuario.email,

      tipo: usuario.tipo,
    };

    // Retorna somente os dados necessários
    // para o frontend.
    res.json({
      sucesso: true,

      mensagem: "Login realizado com sucesso!",

      usuario: {
        id: usuario.id,

        nome: usuario.nome,

        email: usuario.email,

        tipo: usuario.tipo,
      },
    });
  } catch (erro) {
    console.error("Erro no login:", erro);

    res.status(500).json({
      mensagem: "Erro ao realizar login.",
    });
  }
});

// ============================================================
// SESSÃO
// ============================================================

// ------------------------------------------------------------
// CONSULTAR USUÁRIO LOGADO
// ------------------------------------------------------------
//
// Esta rota será utilizada pelo header para descobrir
// se existe um usuário autenticado e qual é seu nome.
// ------------------------------------------------------------

app.get("/sessao", (req, res) => {
  if (!req.session.usuario) {
    return res.status(401).json({
      autenticado: false,

      usuario: null,
    });
  }

  res.json({
    autenticado: true,

    usuario: req.session.usuario,
  });
});

// ============================================================
// LOGOUT
// ============================================================

// ------------------------------------------------------------
// SAIR DA CONTA
// ------------------------------------------------------------

app.post("/logout", exigirLogin, (req, res) => {
  req.session.destroy((erro) => {
    if (erro) {
      console.error("Erro ao sair:", erro);

      return res.status(500).json({
        mensagem: "Erro ao sair da conta.",
      });
    }

    // Remove o cookie da sessão.
    res.clearCookie("connect.sid", {
      httpOnly: true,

      sameSite: "lax",

      secure: false,
    });

    res.json({
      sucesso: true,

      mensagem: "Logout realizado com sucesso.",
    });
  });
});

// ============================================================
// USUÁRIOS
// ============================================================

// ------------------------------------------------------------
// LISTAR USUÁRIOS
// ------------------------------------------------------------
//
// Somente o administrador pode consultar.
// ------------------------------------------------------------

app.get("/usuarios", exigirAdministrador, (req, res) => {
  try {
    const usuarios = db
      .prepare(
        `
                        SELECT
                            id,
                            nome,
                            email,
                            tipo,
                            criado_em
                        FROM usuarios
                        ORDER BY id DESC
                        `,
      )
      .all();

    res.json(usuarios);
  } catch (erro) {
    console.error("Erro ao carregar usuários:", erro);

    res.status(500).json({
      mensagem: "Erro ao carregar usuários.",
    });
  }
});

// ============================================================
// PRODUTOS
// ============================================================

// ------------------------------------------------------------
// CADASTRAR PRODUTO
// ------------------------------------------------------------
//
// O administrador pode cadastrar:
//
// • Produto
// • Imagem principal
// • Até 4 imagens
// • Cor das imagens
// • Variações
// • Tamanhos
// • Estoque
// ------------------------------------------------------------

app.post(
  "/produtos",
  exigirAdministrador,
  uploadImagens.array("imagens", 4),
  (req, res) => {
    let {
      nome,
      marca,
      categoria,
      genero,
      tamanho,
      cor,
      material,
      preco,
      descricao,
      imagem,
      imagens,
      variacoes,
    } = req.body;

    // ----------------------------------------------------
    // CONVERTER CAMPOS JSON ENVIADOS POR FormData
    // ----------------------------------------------------

    try {
      if (typeof imagens === "string") {
        imagens = JSON.parse(imagens);
      }
    } catch (erro) {
      imagens = [];
    }

    try {
      if (typeof variacoes === "string") {
        variacoes = JSON.parse(variacoes);
      }
    } catch (erro) {
      variacoes = [];
    }

    // ----------------------------------------------------
    // VALIDAÇÃO
    // ----------------------------------------------------

    if (!nome || preco === undefined || preco === null || preco === "") {
      return res.status(400).json({
        mensagem: "Nome e preço são obrigatórios.",
      });
    }

    const precoNumerico = Number(preco);

    if (!Number.isFinite(precoNumerico) || precoNumerico < 0) {
      return res.status(400).json({
        mensagem: "Informe um preço válido.",
      });
    }

    // ----------------------------------------------------
    // PREPARAR IMAGENS
    // ----------------------------------------------------

    let listaImagens = [];

    // Caso novos arquivos tenham sido enviados pelo FormData,
    // eles são a fonte principal das imagens.
    if (Array.isArray(req.files) && req.files.length > 0) {
      listaImagens = req.files.map((arquivo, indice) => {
        // Mantém a cor associada caso o frontend tenha enviado
        // uma lista de imagens com essa informação.
        const imagemInformada =
          Array.isArray(imagens) && imagens[indice] ? imagens[indice] : null;

        return {
          cor:
            imagemInformada && imagemInformada.cor
              ? String(imagemInformada.cor).trim()
              : null,

          imagem: obterUrlImagem(arquivo.filename),

          // Nome físico é mantido internamente para operações futuras.
          arquivo: arquivo.filename,
        };
      });
    }

    // Compatibilidade com o formato anterior, em que o frontend
    // enviava somente os caminhos/nomes das imagens.
    if (listaImagens.length === 0 && Array.isArray(imagens)) {
      listaImagens = imagens.filter((item) => {
        return item && item.imagem;
      });
    }

    // Compatibilidade com imagem única.
    if (listaImagens.length === 0 && imagem) {
      listaImagens = [
        {
          cor: cor || null,
          imagem: obterUrlImagem(imagem),
        },
      ];
    }

    if (listaImagens.length > 4) {
      return res.status(400).json({
        mensagem: "Um produto pode possuir no máximo 4 imagens.",
      });
    }

    // ----------------------------------------------------
    // PREPARAR VARIAÇÕES
    // ----------------------------------------------------

    const listaVariacoes = Array.isArray(variacoes) ? variacoes : [];

    // ----------------------------------------------------
    // TRANSAÇÃO
    // ----------------------------------------------------

    try {
      const cadastrarProduto = db.transaction(() => {
        // ------------------------------------
        // PRODUTO PRINCIPAL
        // ------------------------------------

        const resultado = db
          .prepare(
            `
              INSERT INTO produtos (
                nome,
                marca,
                categoria,
                genero,
                tamanho,
                cor,
                material,
                preco,
                imagem,
                descricao
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
          )
          .run(
            String(nome).trim(),

            marca ? String(marca).trim() : null,

            categoria || null,

            genero || null,

            tamanho || null,

            cor ? String(cor).trim() : null,

            material ? String(material).trim() : null,

            precoNumerico,

            listaImagens.length > 0 ? listaImagens[0].imagem : null,

            descricao ? String(descricao).trim() : null,
          );

        const produtoId = resultado.lastInsertRowid;

        // ------------------------------------
        // IMAGENS
        // ------------------------------------

        const inserirImagem = db.prepare(
          `
            INSERT INTO produto_imagens (
              produto_id,
              cor,
              imagem
            )
            VALUES (?, ?, ?)
          `,
        );

        for (const item of listaImagens) {
          if (!item || !item.imagem) {
            continue;
          }

          inserirImagem.run(
            produtoId,

            item.cor ? String(item.cor).trim() : null,

            String(item.imagem).trim(),
          );
        }

        // ------------------------------------
        // VARIAÇÕES
        // ------------------------------------

        const inserirVariacao = db.prepare(
          `
            INSERT INTO produto_variacoes (
              produto_id,
              cor,
              tamanho,
              estoque
            )
            VALUES (?, ?, ?, ?)

            ON CONFLICT (
              produto_id,
              cor,
              tamanho
            )

            DO UPDATE SET
              estoque = excluded.estoque
          `,
        );

        for (const variacao of listaVariacoes) {
          if (!variacao || !variacao.cor || !variacao.tamanho) {
            continue;
          }

          const estoque = Number(variacao.estoque);

          inserirVariacao.run(
            produtoId,

            String(variacao.cor).trim(),

            String(variacao.tamanho).trim(),

            Number.isFinite(estoque) ? Math.max(0, Math.floor(estoque)) : 0,
          );
        }

        return produtoId;
      });

      const produtoId = cadastrarProduto();

      res.status(201).json({
        sucesso: true,

        mensagem: "Produto cadastrado com sucesso!",

        id: produtoId,

        imagens: listaImagens.map((item) => ({
          imagem: item.imagem,

          cor: item.cor || null,
        })),
      });
    } catch (erro) {
      // Se o banco falhar depois de salvar arquivos,
      // removemos os arquivos novos para evitar lixo
      // na pasta de uploads.
      if (Array.isArray(req.files)) {
        for (const arquivo of req.files) {
          try {
            const caminho = path.join(PASTA_UPLOADS_PRODUTOS, arquivo.filename);

            if (fs.existsSync(caminho)) {
              fs.unlinkSync(caminho);
            }
          } catch (erroArquivo) {
            console.error("Erro ao remover upload parcial:", erroArquivo);
          }
        }
      }

      console.error("Erro ao cadastrar produto:", erro);

      res.status(500).json({
        mensagem: erro.message || "Erro ao cadastrar produto.",
      });
    }
  },
);

// ------------------------------------------------------------
// LISTAR PRODUTOS
// ------------------------------------------------------------
//
// Esta rota é pública porque a vitrine precisa
// funcionar mesmo para visitantes.
// ------------------------------------------------------------

app.get("/produtos", (req, res) => {
  try {
    const produtos = db
      .prepare(
        `
                        SELECT *
                        FROM produtos
                        ORDER BY id DESC
                        `,
      )
      .all();

    const produtosCompletos = produtos.map((produto) => {
      const completo = montarProdutoCompleto(produto);

      completo.imagem = obterUrlImagem(completo.imagem);

      completo.imagens = completo.imagens.map((item) => ({
        ...item,

        imagem: obterUrlImagem(item.imagem),
      }));

      return completo;
    });

    res.json(produtosCompletos);
  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);

    res.status(500).json({
      mensagem: "Erro ao carregar produtos.",
    });
  }
});

// ------------------------------------------------------------
// CONSULTAR USUÁRIO LOGADO
// ------------------------------------------------------------
//
// Esta rota será utilizada pelo header para descobrir
// se existe um usuário autenticado e qual é seu nome.
// ------------------------------------------------------------

app.get("/sessao", (req, res) => {
  if (!req.session.usuario) {
    return res.status(401).json({
      autenticado: false,

      usuario: null,
    });
  }

  res.json({
    autenticado: true,

    usuario: req.session.usuario,
  });
});

// ============================================================
// LOGOUT
// ============================================================

// ------------------------------------------------------------
// SAIR DA CONTA
// ------------------------------------------------------------

app.post("/logout", exigirLogin, (req, res) => {
  req.session.destroy((erro) => {
    if (erro) {
      console.error("Erro ao sair:", erro);

      return res.status(500).json({
        mensagem: "Erro ao sair da conta.",
      });
    }

    // Remove o cookie da sessão.
    res.clearCookie("connect.sid", {
      httpOnly: true,

      sameSite: "lax",

      secure: false,
    });

    res.json({
      sucesso: true,

      mensagem: "Logout realizado com sucesso.",
    });
  });
});

// ============================================================
// USUÁRIOS
// ============================================================

// ------------------------------------------------------------
// LISTAR USUÁRIOS
// ------------------------------------------------------------
//
// Somente o administrador pode consultar.
// ------------------------------------------------------------

app.get("/usuarios", exigirAdministrador, (req, res) => {
  try {
    const usuarios = db
      .prepare(
        `
                        SELECT
                            id,
                            nome,
                            email,
                            tipo,
                            criado_em
                        FROM usuarios
                        ORDER BY id DESC
                        `,
      )
      .all();

    res.json(usuarios);
  } catch (erro) {
    console.error("Erro ao carregar usuários:", erro);

    res.status(500).json({
      mensagem: "Erro ao carregar usuários.",
    });
  }
});

// ============================================================
// PRODUTOS
// ============================================================

// ------------------------------------------------------------
// CADASTRAR PRODUTO
// ------------------------------------------------------------
//
// O administrador pode cadastrar:
//
// • Produto
// • Imagem principal
// • Até 4 imagens
// • Cor das imagens
// • Variações
// • Tamanhos
// • Estoque
// ------------------------------------------------------------

app.post(
  "/produtos",
  exigirAdministrador,
  uploadImagens.array("imagens", 4),
  (req, res) => {
    let {
      nome,
      marca,
      categoria,
      genero,
      tamanho,
      cor,
      material,
      preco,
      descricao,
      imagem,
      imagens,
      variacoes,
    } = req.body;

    // ----------------------------------------------------
    // CONVERTER CAMPOS JSON ENVIADOS POR FormData
    // ----------------------------------------------------

    try {
      if (typeof imagens === "string") {
        imagens = JSON.parse(imagens);
      }
    } catch (erro) {
      imagens = [];
    }

    try {
      if (typeof variacoes === "string") {
        variacoes = JSON.parse(variacoes);
      }
    } catch (erro) {
      variacoes = [];
    }

    // ----------------------------------------------------
    // VALIDAÇÃO
    // ----------------------------------------------------

    if (!nome || preco === undefined || preco === null || preco === "") {
      return res.status(400).json({
        mensagem: "Nome e preço são obrigatórios.",
      });
    }

    const precoNumerico = Number(preco);

    if (!Number.isFinite(precoNumerico) || precoNumerico < 0) {
      return res.status(400).json({
        mensagem: "Informe um preço válido.",
      });
    }

    // ----------------------------------------------------
    // PREPARAR IMAGENS
    // ----------------------------------------------------

    let listaImagens = [];

    // Caso novos arquivos tenham sido enviados pelo FormData,
    // eles são a fonte principal das imagens.
    if (Array.isArray(req.files) && req.files.length > 0) {
      listaImagens = req.files.map((arquivo, indice) => {
        // Mantém a cor associada caso o frontend tenha enviado
        // uma lista de imagens com essa informação.
        const imagemInformada =
          Array.isArray(imagens) && imagens[indice] ? imagens[indice] : null;

        return {
          cor:
            imagemInformada && imagemInformada.cor
              ? String(imagemInformada.cor).trim()
              : null,

          imagem: obterUrlImagem(arquivo.filename),

          // Nome físico é mantido internamente para operações futuras.
          arquivo: arquivo.filename,
        };
      });
    }

    // Compatibilidade com o formato anterior, em que o frontend
    // enviava somente os caminhos/nomes das imagens.
    if (listaImagens.length === 0 && Array.isArray(imagens)) {
      listaImagens = imagens.filter((item) => {
        return item && item.imagem;
      });
    }

    // Compatibilidade com imagem única.
    if (listaImagens.length === 0 && imagem) {
      listaImagens = [
        {
          cor: cor || null,
          imagem: obterUrlImagem(imagem),
        },
      ];
    }

    if (listaImagens.length > 4) {
      return res.status(400).json({
        mensagem: "Um produto pode possuir no máximo 4 imagens.",
      });
    }

    // ----------------------------------------------------
    // PREPARAR VARIAÇÕES
    // ----------------------------------------------------

    const listaVariacoes = Array.isArray(variacoes) ? variacoes : [];

    // ----------------------------------------------------
    // TRANSAÇÃO
    // ----------------------------------------------------

    try {
      const cadastrarProduto = db.transaction(() => {
        // ------------------------------------
        // PRODUTO PRINCIPAL
        // ------------------------------------

        const resultado = db
          .prepare(
            `
              INSERT INTO produtos (
                nome,
                marca,
                categoria,
                genero,
                tamanho,
                cor,
                material,
                preco,
                imagem,
                descricao
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
          )
          .run(
            String(nome).trim(),

            marca ? String(marca).trim() : null,

            categoria || null,

            genero || null,

            tamanho || null,

            cor ? String(cor).trim() : null,

            material ? String(material).trim() : null,

            precoNumerico,

            listaImagens.length > 0 ? listaImagens[0].imagem : null,

            descricao ? String(descricao).trim() : null,
          );

        const produtoId = resultado.lastInsertRowid;

        // ------------------------------------
        // IMAGENS
        // ------------------------------------

        const inserirImagem = db.prepare(
          `
            INSERT INTO produto_imagens (
              produto_id,
              cor,
              imagem
            )
            VALUES (?, ?, ?)
          `,
        );

        for (const item of listaImagens) {
          if (!item || !item.imagem) {
            continue;
          }

          inserirImagem.run(
            produtoId,

            item.cor ? String(item.cor).trim() : null,

            String(item.imagem).trim(),
          );
        }

        // ------------------------------------
        // VARIAÇÕES
        // ------------------------------------

        const inserirVariacao = db.prepare(
          `
            INSERT INTO produto_variacoes (
              produto_id,
              cor,
              tamanho,
              estoque
            )
            VALUES (?, ?, ?, ?)

            ON CONFLICT (
              produto_id,
              cor,
              tamanho
            )

            DO UPDATE SET
              estoque = excluded.estoque
          `,
        );

        for (const variacao of listaVariacoes) {
          if (!variacao || !variacao.cor || !variacao.tamanho) {
            continue;
          }

          const estoque = Number(variacao.estoque);

          inserirVariacao.run(
            produtoId,

            String(variacao.cor).trim(),

            String(variacao.tamanho).trim(),

            Number.isFinite(estoque) ? Math.max(0, Math.floor(estoque)) : 0,
          );
        }

        return produtoId;
      });

      const produtoId = cadastrarProduto();

      res.status(201).json({
        sucesso: true,

        mensagem: "Produto cadastrado com sucesso!",

        id: produtoId,

        imagens: listaImagens.map((item) => ({
          imagem: item.imagem,

          cor: item.cor || null,
        })),
      });
    } catch (erro) {
      // Se o banco falhar depois de salvar arquivos,
      // removemos os arquivos novos para evitar lixo
      // na pasta de uploads.
      if (Array.isArray(req.files)) {
        for (const arquivo of req.files) {
          try {
            const caminho = path.join(PASTA_UPLOADS_PRODUTOS, arquivo.filename);

            if (fs.existsSync(caminho)) {
              fs.unlinkSync(caminho);
            }
          } catch (erroArquivo) {
            console.error("Erro ao remover upload parcial:", erroArquivo);
          }
        }
      }

      console.error("Erro ao cadastrar produto:", erro);

      res.status(500).json({
        mensagem: erro.message || "Erro ao cadastrar produto.",
      });
    }
  },
);

// ------------------------------------------------------------
// LISTAR PRODUTOS
// ------------------------------------------------------------
//
// Esta rota é pública porque a vitrine precisa
// funcionar mesmo para visitantes.
// ------------------------------------------------------------

app.get("/produtos", (req, res) => {
  try {
    const produtos = db
      .prepare(
        `
                        SELECT *
                        FROM produtos
                        ORDER BY id DESC
                        `,
      )
      .all();

    const produtosCompletos = produtos.map((produto) => {
      const completo = montarProdutoCompleto(produto);

      completo.imagem = obterUrlImagem(completo.imagem);

      completo.imagens = completo.imagens.map((item) => ({
        ...item,

        imagem: obterUrlImagem(item.imagem),
      }));

      return completo;
    });

    res.json(produtosCompletos);
  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);

    res.status(500).json({
      mensagem: "Erro ao carregar produtos.",
    });
  }
});

// ------------------------------------------------------------
// LISTAR IMAGENS DO PRODUTO
// ------------------------------------------------------------
//
// Utilizado pela página individual do produto.
// ------------------------------------------------------------

app.get("/produtos/:id/imagens", (req, res) => {
  const id = obterId(req.params.id);

  if (!id) {
    return res.status(400).json({
      mensagem: "ID do produto inválido.",
    });
  }

  try {
    const produto = buscarProdutoPorId(id);

    if (!produto) {
      return res.status(404).json({
        mensagem: "Produto não encontrado.",
      });
    }

    const imagens = buscarImagensProduto(id).map((item) => ({
      ...item,

      imagem: obterUrlImagem(item.imagem),
    }));

    // Caso o produto não tenha registros
    // na tabela de imagens, devolvemos
    // a imagem principal como fallback.
    if (imagens.length === 0 && produto.imagem) {
      return res.json([
        {
          id: null,

          produto_id: produto.id,

          cor: produto.cor || null,

          imagem: obterUrlImagem(produto.imagem),
        },
      ]);
    }

    res.json(imagens);
  } catch (erro) {
    console.error("Erro ao buscar imagens do produto:", erro);

    res.status(500).json({
      mensagem: "Erro ao buscar imagens do produto.",
    });
  }
});

// ------------------------------------------------------------
// LISTAR VARIAÇÕES DO PRODUTO
// ------------------------------------------------------------
//
// Retorna cor, tamanho e estoque.
// ------------------------------------------------------------

app.get("/produtos/:id/variacoes", (req, res) => {
  const id = obterId(req.params.id);

  if (!id) {
    return res.status(400).json({
      mensagem: "ID do produto inválido.",
    });
  }

  try {
    const produto = buscarProdutoPorId(id);

    if (!produto) {
      return res.status(404).json({
        mensagem: "Produto não encontrado.",
      });
    }

    const variacoes = buscarVariacoesProduto(id);

    // Compatibilidade com produtos
    // antigos que possuem cor e tamanho
    // diretamente na tabela produtos.
    if (variacoes.length === 0 && (produto.cor || produto.tamanho)) {
      return res.json([
        {
          id: null,

          produto_id: produto.id,

          cor: produto.cor || "Única",

          tamanho: produto.tamanho || "Único",

          estoque: produto.estoque ?? 0,
        },
      ]);
    }

    res.json(variacoes);
  } catch (erro) {
    console.error("Erro ao buscar variações do produto:", erro);

    res.status(500).json({
      mensagem: "Erro ao buscar variações do produto.",
    });
  }
});

// ------------------------------------------------------------
// BUSCAR PRODUTO POR ID
// ------------------------------------------------------------
//
// Utilizado pela página individual do produto.
// ------------------------------------------------------------

app.get("/produtos/:id", (req, res) => {
  const id = obterId(req.params.id);

  if (!id) {
    return res.status(400).json({
      mensagem: "ID do produto inválido.",
    });
  }

  try {
    const produto = buscarProdutoPorId(id);

    if (!produto) {
      return res.status(404).json({
        mensagem: "Produto não encontrado.",
      });
    }

    const produtoCompleto = montarProdutoCompleto(produto);

    produtoCompleto.imagem = obterUrlImagem(produtoCompleto.imagem);

    produtoCompleto.imagens = produtoCompleto.imagens.map((item) => ({
      ...item,

      imagem: obterUrlImagem(item.imagem),
    }));

    res.json(produtoCompleto);
  } catch (erro) {
    console.error("Erro ao buscar produto:", erro);

    res.status(500).json({
      mensagem: "Erro ao buscar produto.",
    });
  }
});

// ------------------------------------------------------------
// EDITAR PRODUTO
// ------------------------------------------------------------
//
// Permite alterar:
//
// • Dados principais
// • Imagens
// • Variações
// ------------------------------------------------------------

app.put("/produtos/:id", exigirAdministrador, (req, res) => {
  const id = obterId(req.params.id);

  if (!id) {
    return res.status(400).json({
      mensagem: "ID do produto inválido.",
    });
  }

  const {
    nome,
    marca,
    categoria,
    genero,
    tamanho,
    cor,
    material,
    preco,
    descricao,
    imagem,
    imagens,
    variacoes,
  } = req.body;

  // ----------------------------------------------------
  // VALIDAÇÃO
  // ----------------------------------------------------

  if (!nome || preco === undefined || preco === null || preco === "") {
    return res.status(400).json({
      mensagem: "Nome e preço são obrigatórios.",
    });
  }

  const precoNumerico = Number(preco);

  if (!Number.isFinite(precoNumerico) || precoNumerico < 0) {
    return res.status(400).json({
      mensagem: "Informe um preço válido.",
    });
  }

  try {
    // Busca o produto atual.
    const produto = buscarProdutoPorId(id);

    if (!produto) {
      return res.status(404).json({
        mensagem: "Produto não encontrado.",
      });
    }

    // ------------------------------------------------
    // TRANSAÇÃO DE ATUALIZAÇÃO
    // ------------------------------------------------

    const atualizarProduto = db.transaction(() => {
      // ------------------------------------
      // DEFINIR IMAGEM PRINCIPAL
      // ------------------------------------

      let imagemPrincipal = produto.imagem;

      // Mantém a imagem atual caso
      // nenhuma nova tenha sido enviada.
      if (imagem !== undefined) {
        imagemPrincipal = imagem;
      }

      // Se foi enviada uma lista de
      // imagens, a primeira será a principal.
      if (
        Array.isArray(imagens) &&
        imagens.length > 0 &&
        imagens[0] &&
        imagens[0].imagem
      ) {
        imagemPrincipal = imagens[0].imagem;
      }

      // ------------------------------------
      // ATUALIZAR DADOS DO PRODUTO
      // ------------------------------------

      db.prepare(
        `
                                UPDATE produtos
                                SET
                                    nome = ?,
                                    marca = ?,
                                    categoria = ?,
                                    genero = ?,
                                    tamanho = ?,
                                    cor = ?,
                                    material = ?,
                                    preco = ?,
                                    descricao = ?,
                                    imagem = ?
                                WHERE id = ?
                                `,
      ).run(
        String(nome).trim(),

        marca ? String(marca).trim() : null,

        categoria || null,

        genero || null,

        tamanho || null,

        cor ? String(cor).trim() : null,

        material ? String(material).trim() : null,

        precoNumerico,

        descricao ? String(descricao).trim() : null,

        imagemPrincipal,

        id,
      );

      // ------------------------------------
      // ATUALIZAR IMAGENS
      // ------------------------------------

      if (Array.isArray(imagens)) {
        if (imagens.length > 4) {
          throw new Error("Um produto pode possuir no máximo 4 imagens.");
        }

        // Remove as imagens antigas.
        db.prepare(
          `
                                    DELETE FROM produto_imagens
                                    WHERE produto_id = ?
                                    `,
        ).run(id);

        // Prepara a inserção
        // das novas imagens.
        const inserirImagem = db.prepare(
          `
                                    INSERT INTO produto_imagens (
                                        produto_id,
                                        cor,
                                        imagem
                                    )
                                    VALUES (?, ?, ?)
                                    `,
        );

        // Percorre as novas imagens.
        for (const item of imagens) {
          if (!item || !item.imagem) {
            continue;
          }

          inserirImagem.run(
            id,

            item.cor ? String(item.cor).trim() : null,

            String(item.imagem).trim(),
          );
        }
      }

      // ------------------------------------
      // ATUALIZAR VARIAÇÕES
      // ------------------------------------

      if (Array.isArray(variacoes)) {
        // Remove as variações antigas.
        db.prepare(
          `
                                    DELETE FROM produto_variacoes
                                    WHERE produto_id = ?
                                    `,
        ).run(id);

        // Prepara a inserção das novas.
        const inserirVariacao = db.prepare(
          `
                                    INSERT INTO produto_variacoes (
                                        produto_id,
                                        cor,
                                        tamanho,
                                        estoque
                                    )
                                    VALUES (?, ?, ?, ?)
                                    `,
        );

        // Percorre todas as variações.
        for (const variacao of variacoes) {
          if (!variacao || !variacao.cor || !variacao.tamanho) {
            continue;
          }

          const estoque = Number(variacao.estoque);

          inserirVariacao.run(
            id,

            String(variacao.cor).trim(),

            String(variacao.tamanho).trim(),

            Number.isFinite(estoque) ? Math.max(0, Math.floor(estoque)) : 0,
          );
        }
      }
    });

    // Executa a transação.
    atualizarProduto();

    res.json({
      sucesso: true,

      mensagem: "Produto atualizado com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao atualizar produto:", erro);

    res.status(500).json({
      mensagem: erro.message || "Erro ao atualizar produto.",
    });
  }
});

// ------------------------------------------------------------
// EXCLUIR PRODUTO
// ------------------------------------------------------------
//
// Como o database.js possui ON DELETE CASCADE,
// as imagens, variações, favoritos e avaliações
// relacionadas também serão removidas.
// ------------------------------------------------------------

app.delete("/produtos/:id", exigirAdministrador, (req, res) => {
  const id = obterId(req.params.id);

  if (!id) {
    return res.status(400).json({
      mensagem: "ID do produto inválido.",
    });
  }

  try {
    const resultado = db
      .prepare(
        `
                        DELETE FROM produtos
                        WHERE id = ?
                        `,
      )
      .run(id);

    if (resultado.changes === 0) {
      return res.status(404).json({
        mensagem: "Produto não encontrado.",
      });
    }

    res.json({
      sucesso: true,

      mensagem: "Produto excluído com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao excluir produto:", erro);

    res.status(500).json({
      mensagem: "Erro ao excluir produto.",
    });
  }
});

// ============================================================
// AVALIAÇÕES E COMENTÁRIOS
// ============================================================

// ------------------------------------------------------------
// LISTAR AVALIAÇÕES DE UM PRODUTO
// ------------------------------------------------------------
//
// Rota:
//
// GET /produtos/:id/avaliacoes
//
// Não precisa exigir login porque qualquer visitante
// pode visualizar as avaliações.
// ------------------------------------------------------------

app.get("/produtos/:id/avaliacoes", (req, res) => {
  // Obtém o ID do produto.
  const produtoId = obterId(req.params.id);

  // Verifica se o ID é válido.
  if (!produtoId) {
    return res.status(400).json({
      mensagem: "ID do produto inválido.",
    });
  }

  try {
    // ------------------------------------------------------
    // VERIFICAR SE O PRODUTO EXISTE
    // ------------------------------------------------------

    const produto = buscarProdutoPorId(produtoId);

    if (!produto) {
      return res.status(404).json({
        mensagem: "Produto não encontrado.",
      });
    }

    // ------------------------------------------------------
    // BUSCAR AVALIAÇÕES
    // ------------------------------------------------------

    const avaliacoes = db
      .prepare(
        `
            SELECT

              avaliacoes.id,

              avaliacoes.nota,

              avaliacoes.comentario,

              avaliacoes.criado_em,

              usuarios.id
                AS usuario_id,

              usuarios.nome
                AS usuario_nome

            FROM avaliacoes

            INNER JOIN usuarios

              ON usuarios.id =
                 avaliacoes.usuario_id

            WHERE avaliacoes.produto_id = ?

            ORDER BY
              avaliacoes.criado_em DESC
          `,
      )
      .all(produtoId);

    // ------------------------------------------------------
    // CALCULAR RESUMO
    // ------------------------------------------------------

    const resumo = db
      .prepare(
        `
            SELECT

              COUNT(*) AS total,

              AVG(nota) AS media

            FROM avaliacoes

            WHERE produto_id = ?
          `,
      )
      .get(produtoId);

    // ------------------------------------------------------
    // RETORNAR DADOS
    // ------------------------------------------------------

    res.json({
      media: Number(resumo.media || 0),

      total: Number(resumo.total || 0),

      avaliacoes: avaliacoes,
    });
  } catch (erro) {
    console.error("Erro ao carregar avaliações:", erro);

    res.status(500).json({
      mensagem: "Erro ao carregar avaliações.",
    });
  }
});

// ------------------------------------------------------------
// ENVIAR / ATUALIZAR AVALIAÇÃO
// ------------------------------------------------------------
//
// Rota:
//
// POST /produtos/:id/avaliacoes
//
// Somente usuários logados podem avaliar.
// ------------------------------------------------------------

app.post("/produtos/:id/avaliacoes", exigirLogin, (req, res) => {
  const produtoId = obterId(req.params.id);

  const { nota, comentario } = req.body;

  // --------------------------------------------------------
  // VALIDAR ID
  // --------------------------------------------------------

  if (!produtoId) {
    return res.status(400).json({
      mensagem: "ID do produto inválido.",
    });
  }

  // --------------------------------------------------------
  // VALIDAR NOTA
  // --------------------------------------------------------

  const notaNumerica = Number(nota);

  if (!Number.isInteger(notaNumerica) || notaNumerica < 1 || notaNumerica > 5) {
    return res.status(400).json({
      mensagem: "A nota deve estar entre 1 e 5.",
    });
  }

  try {
    // ------------------------------------------------------
    // VERIFICAR PRODUTO
    // ------------------------------------------------------

    const produto = buscarProdutoPorId(produtoId);

    if (!produto) {
      return res.status(404).json({
        mensagem: "Produto não encontrado.",
      });
    }

    // ------------------------------------------------------
    // USUÁRIO LOGADO
    // ------------------------------------------------------

    const usuarioId = req.session.usuario.id;

    // ------------------------------------------------------
    // SALVAR / ATUALIZAR AVALIAÇÃO
    // ------------------------------------------------------
    //
    // Como a tabela possui UNIQUE:
    //
    // usuario_id + produto_id
    //
    // o mesmo usuário não criará uma segunda avaliação.
    //
    // Em vez disso, a avaliação existente será atualizada.
    // ------------------------------------------------------

    db.prepare(
      `
          INSERT INTO avaliacoes (
            usuario_id,
            produto_id,
            nota,
            comentario
          )

          VALUES (
            ?, ?, ?, ?
          )

          ON CONFLICT (
            usuario_id,
            produto_id
          )

          DO UPDATE SET

            nota =
              excluded.nota,

            comentario =
              excluded.comentario,

            criado_em =
              CURRENT_TIMESTAMP
        `,
    ).run(
      usuarioId,

      produtoId,

      notaNumerica,

      comentario ? String(comentario).trim() : null,
    );

    // ------------------------------------------------------
    // RESPOSTA
    // ------------------------------------------------------

    res.status(201).json({
      sucesso: true,

      mensagem: "Avaliação salva com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao salvar avaliação:", erro);

    res.status(500).json({
      mensagem: "Erro ao salvar avaliação.",
    });
  }
});

// ============================================================
// DASHBOARD ADMINISTRATIVO
// ============================================================

// ------------------------------------------------------------
// BUSCAR DADOS DO DASHBOARD
// ------------------------------------------------------------

app.get("/dashboard", exigirAdministrador, (req, res) => {
  try {
    // -----------------------------------------------
    // TOTAL DE PRODUTOS
    // -----------------------------------------------

    const totalProdutos = db
      .prepare(
        `
                        SELECT COUNT(*) AS total
                        FROM produtos
                        `,
      )
      .get();

    // -----------------------------------------------
    // TOTAL DE CATEGORIAS
    // -----------------------------------------------

    const totalCategorias = db
      .prepare(
        `
                        SELECT COUNT(
                            DISTINCT categoria
                        ) AS total
                        FROM produtos
                        WHERE categoria IS NOT NULL
                        AND categoria != ''
                        `,
      )
      .get();

    // -----------------------------------------------
    // TOTAL DE MARCAS
    // -----------------------------------------------

    const totalMarcas = db
      .prepare(
        `
                        SELECT COUNT(
                            DISTINCT marca
                        ) AS total
                        FROM produtos
                        WHERE marca IS NOT NULL
                        AND marca != ''
                        `,
      )
      .get();

    // -----------------------------------------------
    // PREÇO MÉDIO
    // -----------------------------------------------

    const valorMedio = db
      .prepare(
        `
                        SELECT AVG(preco) AS media
                        FROM produtos
                        `,
      )
      .get();

    // -----------------------------------------------
    // ÚLTIMOS PRODUTOS
    // -----------------------------------------------

    const ultimosProdutos = db
      .prepare(
        `
                        SELECT
                            id,
                            nome,
                            categoria,
                            marca,
                            preco,
                            imagem
                        FROM produtos
                        ORDER BY id DESC
                        LIMIT 5
                        `,
      )
      .all();

    res.json({
      totalProdutos: totalProdutos.total,

      totalCategorias: totalCategorias.total,

      totalMarcas: totalMarcas.total,

      valorMedio: valorMedio.media || 0,

      ultimosProdutos,
    });
  } catch (erro) {
    console.error("Erro no dashboard:", erro);

    res.status(500).json({
      mensagem: "Erro ao carregar dados do dashboard.",
    });
  }
});

// ============================================================
// FAVORITOS / LISTA DE DESEJOS
// ============================================================

// ------------------------------------------------------------
// ADICIONAR FAVORITO
// ------------------------------------------------------------

app.post("/favoritos", exigirLogin, (req, res) => {
  const usuarioId = req.session.usuario.id;

  const produtoId = obterId(req.body.produtoId);

  if (!produtoId) {
    return res.status(400).json({
      mensagem: "Produto inválido.",
    });
  }

  try {
    // Verifica se o produto existe.
    const produto = buscarProdutoPorId(produtoId);

    if (!produto) {
      return res.status(404).json({
        mensagem: "Produto não encontrado.",
      });
    }

    // Salva o favorito.
    db.prepare(
      `
                    INSERT INTO favoritos (
                        usuario_id,
                        produto_id
                    )
                    VALUES (?, ?)
                    `,
    ).run(
      usuarioId,

      produtoId,
    );

    res.status(201).json({
      sucesso: true,

      favorito: true,

      mensagem: "Produto adicionado aos favoritos.",
    });
  } catch (erro) {
    // Impede favoritos duplicados.
    if (erro.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        favorito: true,

        mensagem: "Este produto já está nos favoritos.",
      });
    }

    console.error("Erro ao adicionar favorito:", erro);

    res.status(500).json({
      mensagem: "Erro ao adicionar favorito.",
    });
  }
});

// ------------------------------------------------------------
// LISTAR FAVORITOS
// ------------------------------------------------------------

app.get("/favoritos", exigirLogin, (req, res) => {
  const usuarioId = req.session.usuario.id;

  try {
    const favoritos = db
      .prepare(
        `
                        SELECT

                            favoritos.id
                                AS favorito_id,

                            favoritos.criado_em
                                AS favorito_criado_em,

                            produtos.id
                                AS produto_id,

                            produtos.nome,

                            produtos.marca,

                            produtos.categoria,

                            produtos.genero,

                            produtos.tamanho,

                            produtos.cor,

                            produtos.material,

                            produtos.preco,

                            produtos.imagem,

                            produtos.descricao

                        FROM favoritos

                        INNER JOIN produtos

                            ON produtos.id =
                               favoritos.produto_id

                        WHERE favoritos.usuario_id = ?

                        ORDER BY
                            favoritos.criado_em DESC
                        `,
      )
      .all(usuarioId);

    // Adiciona imagens e variações
    // a cada favorito.
    const resultado = favoritos.map((favorito) => {
      return {
        ...favorito,

        imagem: obterUrlImagem(favorito.imagem),

        imagens: buscarImagensProduto(favorito.produto_id).map((item) => ({
          ...item,

          imagem: obterUrlImagem(item.imagem),
        })),

        variacoes: buscarVariacoesProduto(favorito.produto_id),
      };
    });

    res.json(resultado);
  } catch (erro) {
    console.error("Erro ao carregar favoritos:", erro);

    res.status(500).json({
      mensagem: "Erro ao carregar favoritos.",
    });
  }
});

// ------------------------------------------------------------
// REMOVER FAVORITO
// ------------------------------------------------------------

app.delete("/favoritos/:produtoId", exigirLogin, (req, res) => {
  const usuarioId = req.session.usuario.id;

  const produtoId = obterId(req.params.produtoId);

  if (!produtoId) {
    return res.status(400).json({
      mensagem: "Produto inválido.",
    });
  }

  try {
    const resultado = db
      .prepare(
        `
                        DELETE FROM favoritos
                        WHERE usuario_id = ?
                        AND produto_id = ?
                        `,
      )
      .run(
        usuarioId,

        produtoId,
      );

    if (resultado.changes === 0) {
      return res.status(404).json({
        mensagem: "Favorito não encontrado.",
      });
    }

    res.json({
      sucesso: true,

      favorito: false,

      mensagem: "Produto removido dos favoritos.",
    });
  } catch (erro) {
    console.error("Erro ao remover favorito:", erro);

    res.status(500).json({
      mensagem: "Erro ao remover favorito.",
    });
  }
});

// ------------------------------------------------------------
// VERIFICAR FAVORITO
// ------------------------------------------------------------

app.get("/favoritos/:produtoId", exigirLogin, (req, res) => {
  const usuarioId = req.session.usuario.id;

  const produtoId = obterId(req.params.produtoId);

  if (!produtoId) {
    return res.status(400).json({
      mensagem: "Produto inválido.",
    });
  }

  try {
    const favorito = db
      .prepare(
        `
                        SELECT id
                        FROM favoritos
                        WHERE usuario_id = ?
                        AND produto_id = ?
                        `,
      )
      .get(
        usuarioId,

        produtoId,
      );

    res.json({
      favorito: Boolean(favorito),
    });
  } catch (erro) {
    console.error("Erro ao verificar favorito:", erro);

    res.status(500).json({
      mensagem: "Erro ao verificar favorito.",
    });
  }
});

// ============================================================
// REPORTAR ERRO / SUGERIR MELHORIA
// ============================================================

// ------------------------------------------------------------
// RECEBER FORMULÁRIO
// ------------------------------------------------------------
//
// Tipos permitidos:
//
// • Reportar erro
// • Sugerir melhoria
//
// O conteúdo será enviado para o e-mail do proprietário.
// ------------------------------------------------------------

app.post("/reportar", async (req, res) => {
  const { nome, email, tipo, mensagem } = req.body;

  // Verifica os campos.
  if (!nome || !email || !tipo || !mensagem) {
    return res.status(400).json({
      mensagem: "Preencha todos os campos.",
    });
  }

  // Tipos permitidos.
  const tiposPermitidos = ["Reportar erro", "Sugerir melhoria"];

  if (!tiposPermitidos.includes(tipo)) {
    return res.status(400).json({
      mensagem: "Tipo de relatório inválido.",
    });
  }

  // Verifica se o e-mail do dono
  // foi configurado.
  if (EMAIL_DO_DONO.includes("COLOQUE_")) {
    return res.status(500).json({
      mensagem:
        "O e-mail do proprietário ainda não foi configurado no servidor.",
    });
  }

  try {
    const assunto = `[Costa Confecções] ${tipo}`;

    // ------------------------------------------------
    // TEXTO DO E-MAIL
    // ------------------------------------------------

    const texto = `
Novo registro recebido pelo site.

Tipo:
${tipo}

Nome:
${nome}

E-mail:
${email}

Mensagem:
${mensagem}
`;

    // ------------------------------------------------
    // HTML DO E-MAIL
    // ------------------------------------------------

    const html = `
                <h2>
                    Costa Confecções
                </h2>

                <p>
                    <strong>Tipo:</strong>
                    ${escaparHTML(tipo)}
                </p>

                <p>
                    <strong>Nome:</strong>
                    ${escaparHTML(nome)}
                </p>

                <p>
                    <strong>E-mail:</strong>
                    ${escaparHTML(email)}
                </p>

                <p>
                    <strong>Mensagem:</strong>
                </p>

                <p>
                    ${escaparHTML(mensagem).replace(/\n/g, "<br>")}
                </p>
            `;

    // Envia para o proprietário.
    await enviarEmail({
      para: EMAIL_DO_DONO,

      assunto,

      texto,

      html,
    });

    res.json({
      sucesso: true,

      mensagem: "Mensagem enviada com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao enviar reporte:", erro);

    res.status(500).json({
      mensagem: "Não foi possível enviar a mensagem.",
    });
  }
});

// ============================================================
// TRATAMENTO GLOBAL DE ERROS
// ============================================================

// ------------------------------------------------------------
// CASO ALGUM ERRO NÃO SEJA TRATADO POR UMA ROTA,
// ELE CHEGARÁ AQUI.
// ------------------------------------------------------------

app.use((erro, req, res, next) => {
  console.error("Erro não tratado:", erro);

  if (erro instanceof multer.MulterError) {
    if (erro.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        mensagem: "Cada imagem pode ter no máximo 5 MB.",
      });
    }

    if (erro.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        mensagem: "Um produto pode possuir no máximo 4 imagens.",
      });
    }

    return res.status(400).json({
      mensagem: erro.message || "Erro ao enviar as imagens.",
    });
  }

  if (erro && erro.message === "Selecione somente imagens JPG, PNG ou WEBP.") {
    return res.status(400).json({
      mensagem: erro.message,
    });
  }

  res.status(500).json({
    mensagem: "Ocorreu um erro interno no servidor.",
  });
});

// ============================================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================================

// ------------------------------------------------------------
// INICIAR SERVIDOR
// ------------------------------------------------------------
//
// O Express começa a aceitar requisições na porta 3000.
// ------------------------------------------------------------

// O Vercel importa a aplicação como uma função serverless. O servidor local
// continua funcionando quando este arquivo é executado diretamente.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log("============================================");

    console.log("COSTA CONFECÇÕES - API");

    console.log(`Servidor rodando em http://127.0.0.1:${PORT}`);

    console.log("============================================");
  });
}

module.exports = app;
