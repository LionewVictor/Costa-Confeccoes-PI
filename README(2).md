# Costa Confecções

Sistema web desenvolvido para a **Costa Confecções**, com o objetivo de oferecer uma vitrine digital de produtos, catálogo com filtros e área administrativa para gerenciamento dos produtos.

## Sobre o projeto

O Costa Confecções foi desenvolvido como um projeto de aplicação web durante o curso de Programador Web.

A aplicação possui uma área pública para os clientes consultarem os produtos e uma área administrativa destinada ao gerenciamento do catálogo.

O projeto utiliza uma arquitetura separando o **frontend**, responsável pela interface e interação com o usuário, do **backend**, responsável pela API, autenticação e comunicação com o banco de dados.

---

## Objetivos

- Criar uma vitrine digital para a Costa Confecções.
- Facilitar a visualização e pesquisa dos produtos.
- Permitir filtros por características dos produtos.
- Disponibilizar uma página individual para cada produto.
- Permitir cadastro e autenticação de usuários.
- Disponibilizar uma área administrativa.
- Permitir o cadastro, edição e exclusão de produtos.
- Armazenar os dados utilizando SQLite.
- Organizar o projeto de forma modular para facilitar manutenção e evolução.

---

## Funcionalidades

### Catálogo

- Exibição dos produtos cadastrados.
- Cards individuais para os produtos.
- Nome, marca, categoria e preço.
- Imagens dos produtos.
- Página de detalhes do produto.
- Pesquisa de produtos.
- Ordenação por mais populares, menor preço e maior preço.
- Filtros por marca, tamanho, gênero, produto/categoria, cor, material e faixa de preço.
- Botão para limpar os filtros.
- Mensagem quando nenhum produto é encontrado.

### Favoritos

- Adição de produtos aos favoritos.
- Visualização da lista de produtos favoritos.

### Usuários

- Cadastro de usuários.
- Login.
- Redefinição de senha.
- Controle de sessão.
- Diferenciação entre usuário cliente e administrador.

### Área administrativa

- Dashboard administrativo.
- Visualização de informações dos produtos.
- Cadastro de produtos.
- Edição de produtos.
- Exclusão de produtos.
- Cadastro de imagens.
- Controle de variações de produtos.
- Controle de estoque por variação.

### Produtos

Cada produto pode possuir informações como:

- Nome;
- Marca;
- Categoria;
- Gênero;
- Tamanho;
- Cor;
- Material;
- Preço;
- Descrição;
- Imagens;
- Variações;
- Estoque.

---

## Tecnologias utilizadas

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express

### Banco de dados

- SQLite
- better-sqlite3

### Bibliotecas

- bcrypt — hash de senhas
- cors — controle de acesso entre origens
- express-session — gerenciamento de sessões
- multer — processamento de uploads
- nodemailer — envio de e-mails

---

## Estrutura do projeto

```text
Costa-Confeccoes-PI-main/
│
├── Administracao/
│   ├── api/
│   ├── CSS/
│   ├── js/
│   └── *.html
│
├── Backend/
│   ├── banco/
│   │   └── costa.db
│   ├── uploads/
│   ├── database.js
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── Catalogo/
│   ├── CSS/
│   ├── js/
│   └── catalogo.html
│
├── Central de ajuda/
│   ├── CSS/
│   ├── JS/
│   └── *.html
│
├── Favoritos/
│   ├── CSS/
│   ├── js/
│   └── favoritos.html
│
├── Global/
│   ├── CSS/
│   ├── js/
│   └── imagens
│
├── Home/
│   ├── CSS/
│   ├── js/
│   └── home.html
│
├── Login/
│   ├── CSS/
│   ├── js/
│   └── *.html
│
├── Mapa/
│   ├── CSS/
│   ├── js/
│   └── mapa-site.html
│
├── Produto/
│   ├── CSS/
│   ├── js/
│   └── produto-page.html
│
├── api/
│   └── index.js
│
├── package.json
├── package-lock.json
├── vercel.json
└── .gitignore
```

---

## Instalação

### Pré-requisitos

- Node.js
- npm

### 1. Clone o repositório

```bash
git clone URL_DO_REPOSITORIO
cd Costa-Confeccoes-PI-main
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Inicie o backend

Na raiz do projeto:

```bash
npm start
```

O servidor local utiliza a porta configurada no projeto, normalmente:

```text
http://127.0.0.1:3000
```

Também é possível executar o backend diretamente pela pasta `Backend`:

```bash
node server.js
```

---

## API

O backend disponibiliza endpoints para comunicação entre o frontend e o banco de dados.

Entre os recursos utilizados estão:

```text
GET     /produtos
GET     /produtos/:id
POST    /produtos
PUT     /produtos/:id
DELETE  /produtos/:id
```

Também existem rotas relacionadas a:

- autenticação;
- sessão do usuário;
- cadastro;
- favoritos;
- dashboard administrativo;
- uploads;
- variações de produtos.

> Os endpoints podem variar conforme a versão atual do backend.

---

## Banco de dados

O sistema utiliza **SQLite** para armazenamento das informações.

O banco possui estruturas relacionadas a:

- usuários;
- produtos;
- avaliações;
- favoritos;
- imagens dos produtos;
- variações dos produtos;
- tokens de redefinição de senha.

O frontend não acessa o SQLite diretamente.

Fluxo principal:

```text
Frontend
   ↓
JavaScript
   ↓
API Express
   ↓
database.js
   ↓
SQLite
```

---

## Segurança

O projeto possui mecanismos para:

- armazenamento protegido de senhas através de hash;
- controle de sessões;
- diferenciação de tipos de usuários;
- proteção de rotas administrativas;
- validação de dados;
- controle de CORS;
- tratamento de uploads;
- proteção dos dados inseridos no HTML.

**Não coloque senhas ou credenciais reais no repositório.**

---

## Testes realizados

Durante o desenvolvimento foram realizados testes de:

### Frontend

- carregamento das páginas;
- navegação entre páginas;
- pesquisa de produtos;
- filtros;
- ordenação;
- exibição dos cards;
- carregamento das imagens;
- página individual do produto;
- favoritos;
- login;
- cadastro.

### Backend

- inicialização do servidor;
- conexão com o banco;
- consulta de produtos;
- cadastro de produtos;
- edição de produtos;
- exclusão de produtos;
- autenticação;
- gerenciamento de sessão;
- comunicação entre frontend e API.

### Banco de dados

- criação e leitura das tabelas;
- inserção de produtos;
- consulta de usuários;
- consulta de produtos;
- armazenamento de imagens e variações;
- atualização dos registros.

---

## Publicação

O projeto possui configuração para utilização com **Vercel**, utilizando uma função serverless para disponibilizar a API.

A publicação depende da configuração do ambiente e das variáveis utilizadas pelo projeto.

---

## Equipe

Projeto desenvolvido durante o curso de **Programador Web**, com participação da equipe responsável pelo desenvolvimento da aplicação Costa Confecções.

---

## Status do projeto

**Em desenvolvimento.**

O projeto possui as principais funcionalidades de catálogo, usuários e administração implementadas, podendo receber melhorias, correções e novas funcionalidades.

---

## Licença

Este projeto foi desenvolvido para fins acadêmicos e para atendimento ao projeto da Costa Confecções.

O uso, distribuição ou alteração do sistema deve respeitar os direitos e acordos definidos pela equipe responsável pelo projeto.
