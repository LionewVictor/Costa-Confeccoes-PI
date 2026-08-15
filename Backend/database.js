// ============================================================
// COSTA CONFECÇÕES
// BANCO DE DADOS
// Arquivo: database.js
//
// Este arquivo é responsável por:
//
// • Criar e conectar ao banco SQLite.
// • Criar a tabela de usuários.
// • Criar a tabela de produtos.
// • Criar a tabela de favoritos.
// • Criar a tabela de imagens dos produtos.
// • Criar a tabela de variações dos produtos.
// • Criar a tabela de avaliações e comentários.
// • Criar a tabela de tokens de redefinição de senha.
// • Criar índices para melhorar o desempenho das consultas.
//
// O banco utilizado pelo projeto é:
//
// SQLite + better-sqlite3
//
// IMPORTANTE:
//
// Este arquivo é carregado pelo server.js.
//
// Portanto, todas as tabelas utilizadas pelas rotas da API
// precisam existir aqui.
// ============================================================

// ============================================================
// IMPORTAÇÃO DAS BIBLIOTECAS
// ============================================================

// Importa a biblioteca utilizada para trabalhar
// com o banco de dados SQLite.
const Database = require("better-sqlite3");

// Importa o módulo responsável por trabalhar
// com arquivos e pastas do computador.
const fs = require("fs");

// Importa o módulo responsável por montar caminhos
// de maneira compatível com o sistema operacional.
const path = require("path");

// ============================================================
// LOCALIZAÇÃO DO BANCO
// ============================================================

// Descobre a pasta onde este arquivo database.js está localizado.
const pastaProjeto = __dirname;

// Define o caminho da pasta onde o banco será armazenado.
const caminhoBanco = process.env.SQLITE_PATH
  ? path.resolve(process.env.SQLITE_PATH)
  : path.join(pastaProjeto, "banco", "costa.db");

// Define a pasta do arquivo SQLite. Em ambientes locais usamos a pasta
// "banco" do projeto; em ambientes serverless, use SQLITE_PATH (por exemplo,
// /tmp/costa.db), pois o sistema de arquivos publicado é somente leitura.
const pastaBanco = path.dirname(caminhoBanco);

// ============================================================
// CRIAÇÃO DA PASTA DO BANCO
// ============================================================

// Verifica se a pasta "banco" ainda não existe.
if (!fs.existsSync(pastaBanco)) {
  // Cria a pasta automaticamente.
  //
  // Isso evita que o programa apresente erro
  // quando o projeto for executado em um computador
  // onde a pasta ainda não foi criada.
  fs.mkdirSync(pastaBanco, {
    recursive: true,
  });
}

// ============================================================
// CONEXÃO COM O SQLITE
// ============================================================

// Abre o arquivo costa.db.
//
// Caso o arquivo ainda não exista,
// o better-sqlite3 criará automaticamente.
const db = new Database(caminhoBanco);

// ============================================================
// CONFIGURAÇÕES DO SQLITE
// ============================================================

// Ativa o controle de chaves estrangeiras.
//
// Isso faz com que o SQLite respeite os relacionamentos
// existentes entre as tabelas.
db.pragma("foreign_keys = ON");

// Ativa o modo WAL.
//
// O WAL melhora o comportamento do SQLite quando
// existem operações de leitura e escrita acontecendo.
db.pragma("journal_mode = WAL");

// ============================================================
// TABELA DE USUÁRIOS
// ============================================================

// Esta tabela armazena todas as contas do sistema.
//
// Existem dois tipos principais:
//
// • cliente
// • admin
//
// A senha armazenada aqui deve ser sempre um HASH,
// e nunca a senha original.
db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        nome TEXT NOT NULL,

        email TEXT NOT NULL UNIQUE,

        senha TEXT NOT NULL,

        tipo TEXT NOT NULL DEFAULT 'cliente',

        criado_em DATETIME
            DEFAULT CURRENT_TIMESTAMP

    )
`);

// ============================================================
// ATUALIZAÇÃO DA TABELA DE USUÁRIOS
// ============================================================

// Esta parte serve para bancos antigos.
//
// Caso futuramente uma coluna seja adicionada
// à tabela usuarios, poderemos fazer a atualização
// sem precisar apagar o banco inteiro.
//
// Atualmente não existe nenhuma alteração adicional
// necessária nesta tabela.
//
// A estrutura principal já está completa para o projeto.

// ============================================================
// TABELA DE PRODUTOS
// ============================================================

// Esta é a tabela principal dos produtos.
//
// Cada registro representa um produto.
//
// As informações de:
//
// • cores
// • tamanhos
// • estoque
// • imagens
//
// possuem tabelas próprias.
//
// Isso permite que um mesmo produto tenha
// diversas combinações.
db.exec(`
    CREATE TABLE IF NOT EXISTS produtos (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        nome TEXT NOT NULL,

        marca TEXT,

        categoria TEXT,

        genero TEXT,

        tamanho TEXT,

        cor TEXT,

        material TEXT,

        preco REAL NOT NULL,

        imagem TEXT,

        descricao TEXT,

        criado_em DATETIME
            DEFAULT CURRENT_TIMESTAMP

    )
`);

// ============================================================
// MIGRAÇÃO DA TABELA DE PRODUTOS
// ============================================================

// O projeto começou com uma estrutura menor.
//
// Caso o banco tenha sido criado antes da existência
// da coluna descricao, tentamos adicioná-la.
//
// Se ela já existir, simplesmente continuamos.
try {
  db.exec(`
        ALTER TABLE produtos
        ADD COLUMN descricao TEXT
    `);

  console.log("Coluna descricao adicionada à tabela produtos.");
} catch (erro) {
  // O SQLite informa "duplicate column name"
  // quando a coluna já existe.
  //
  // Nesse caso não existe nenhum problema.
  if (!erro.message.includes("duplicate column name")) {
    console.error("Erro ao atualizar tabela produtos:", erro);
  }
}

// ============================================================
// TABELA DE FAVORITOS
// ============================================================

// Esta tabela relaciona:
//
// usuário + produto
//
// Dessa forma cada usuário possui sua própria
// Lista de Desejos.
//
// Exemplo:
//
// usuário 5
// produto 12
//
// significa que o produto 12 está nos favoritos
// do usuário 5.
db.exec(`
    CREATE TABLE IF NOT EXISTS favoritos (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        usuario_id INTEGER NOT NULL,

        produto_id INTEGER NOT NULL,

        criado_em DATETIME
            DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (
            usuario_id
        )
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

        FOREIGN KEY (
            produto_id
        )
        REFERENCES produtos(id)
        ON DELETE CASCADE,

        UNIQUE (
            usuario_id,
            produto_id
        )

    )
`);

// ============================================================
// TABELA DE IMAGENS DOS PRODUTOS
// ============================================================

// Um produto pode possuir várias imagens.
//
// Cada imagem pode estar relacionada a uma cor.
//
// Exemplo:
//
// Produto: Camisa Polo
//
// Amarelo -> imagem-amarela.jpg
// Azul    -> imagem-azul.jpg
// Verde   -> imagem-verde.jpg
//
// O limite de 4 imagens é controlado pelo server.js.
db.exec(`
    CREATE TABLE IF NOT EXISTS produto_imagens (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        produto_id INTEGER NOT NULL,

        cor TEXT,

        imagem TEXT NOT NULL,

        criado_em DATETIME
            DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (
            produto_id
        )
        REFERENCES produtos(id)
        ON DELETE CASCADE

    )
`);

// ============================================================
// TABELA DE VARIAÇÕES DOS PRODUTOS
// ============================================================

// Esta tabela controla o estoque de cada combinação:
//
// • Cor
// • Tamanho
//
// Exemplo:
//
// Camisa Polo
//
// Amarelo + P = 5
// Amarelo + M = 8
// Amarelo + G = 3
//
// Azul + P = 2
// Azul + M = 7
// Azul + G = 4
//
// Assim não precisamos criar um novo produto
// para cada tamanho ou cor.
db.exec(`
    CREATE TABLE IF NOT EXISTS produto_variacoes (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        produto_id INTEGER NOT NULL,

        cor TEXT NOT NULL,

        tamanho TEXT NOT NULL,

        estoque INTEGER NOT NULL DEFAULT 0,

        criado_em DATETIME
            DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (
            produto_id
        )
        REFERENCES produtos(id)
        ON DELETE CASCADE,

        UNIQUE (
            produto_id,
            cor,
            tamanho
        )

    )
`);

// ============================================================
// TABELA DE AVALIAÇÕES E COMENTÁRIOS
// ============================================================

// Armazena as avaliações feitas pelos clientes.
//
// Cada avaliação possui:
//
// • usuário
// • produto
// • nota
// • comentário
// • data
//
// A combinação:
//
// usuario_id + produto_id
//
// é única.
//
// Isso significa que o mesmo usuário possui
// somente uma avaliação por produto.
//
// Caso ele avalie novamente,
// o server.js atualiza a avaliação existente.
db.exec(`
    CREATE TABLE IF NOT EXISTS avaliacoes (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        usuario_id INTEGER NOT NULL,

        produto_id INTEGER NOT NULL,

        nota INTEGER NOT NULL,

        comentario TEXT,

        criado_em DATETIME
            DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (
            usuario_id
        )
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

        FOREIGN KEY (
            produto_id
        )
        REFERENCES produtos(id)
        ON DELETE CASCADE,

        UNIQUE (
            usuario_id,
            produto_id
        ),

        CHECK (
            nota >= 1
            AND
            nota <= 5
        )

    )
`);

// ============================================================
// TABELA DE TOKENS DE REDEFINIÇÃO DE SENHA
// ============================================================

// Armazena os tokens temporários utilizados
// para recuperação de senha.
//
// Fluxo:
//
// 1. Usuário informa o e-mail.
// 2. O servidor gera um token.
// 3. O token é salvo aqui.
// 4. O token é enviado por e-mail.
// 5. Usuário acessa o link.
// 6. Define uma nova senha.
// 7. O token é excluído.
//
// Cada token possui uma data de expiração.
db.exec(`
    CREATE TABLE IF NOT EXISTS tokens_redefinicao (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        usuario_id INTEGER NOT NULL,

        token TEXT NOT NULL UNIQUE,

        expira_em DATETIME NOT NULL,

        criado_em DATETIME
            DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (
            usuario_id
        )
        REFERENCES usuarios(id)
        ON DELETE CASCADE

    )
`);

// ============================================================
// ÍNDICES DO BANCO
// ============================================================

// Índices ajudam o SQLite a encontrar registros
// mais rapidamente.
//
// Eles são especialmente úteis nas páginas:
//
// • Favoritos
// • Produto
// • Avaliações
// • Administração

// ------------------------------------------------------------
// ÍNDICE DOS FAVORITOS POR USUÁRIO
// ------------------------------------------------------------

// Facilita a busca de todos os favoritos
// pertencentes a um usuário.
db.exec(`
    CREATE INDEX IF NOT EXISTS
    idx_favoritos_usuario
    ON favoritos(usuario_id)
`);

// ------------------------------------------------------------
// ÍNDICE DOS FAVORITOS POR PRODUTO
// ------------------------------------------------------------

// Facilita operações relacionadas
// a um determinado produto.
db.exec(`
    CREATE INDEX IF NOT EXISTS
    idx_favoritos_produto
    ON favoritos(produto_id)
`);

// ------------------------------------------------------------
// ÍNDICE DAS IMAGENS POR PRODUTO
// ------------------------------------------------------------

// Facilita a busca das imagens
// de um produto específico.
db.exec(`
    CREATE INDEX IF NOT EXISTS
    idx_imagens_produto
    ON produto_imagens(produto_id)
`);

// ------------------------------------------------------------
// ÍNDICE DAS VARIAÇÕES POR PRODUTO
// ------------------------------------------------------------

// Facilita a busca das variações
// de um produto específico.
db.exec(`
    CREATE INDEX IF NOT EXISTS
    idx_variacoes_produto
    ON produto_variacoes(produto_id)
`);

// ------------------------------------------------------------
// ÍNDICE DAS AVALIAÇÕES POR PRODUTO
// ------------------------------------------------------------

// Facilita a busca dos comentários
// e avaliações de um produto.
db.exec(`
    CREATE INDEX IF NOT EXISTS
    idx_avaliacoes_produto
    ON avaliacoes(produto_id)
`);

// ------------------------------------------------------------
// ÍNDICE DOS TOKENS POR USUÁRIO
// ------------------------------------------------------------

// Facilita a exclusão e consulta
// dos tokens de um determinado usuário.
db.exec(`
    CREATE INDEX IF NOT EXISTS
    idx_tokens_usuario
    ON tokens_redefinicao(usuario_id)
`);

// ============================================================
// LIMPEZA DE TOKENS EXPIRADOS
// ============================================================

// Remove tokens de recuperação que já passaram
// da data de validade.
//
// Isso evita acumular tokens antigos no banco.
db.prepare(
  `
    DELETE FROM tokens_redefinicao
    WHERE expira_em <= datetime('now')
`,
).run();

// ============================================================
// FINALIZAÇÃO DA CONEXÃO
// ============================================================

// Esta mensagem aparece no terminal quando
// o banco foi carregado corretamente.
console.log("Banco de dados conectado.");

// ============================================================
// EXPORTAÇÃO
// ============================================================

// Exporta a conexão com o SQLite.
//
// O server.js importa este objeto e utiliza
// suas funções para executar consultas.
module.exports = db;
