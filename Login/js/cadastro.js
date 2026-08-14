// ============================================================
// CADASTRO DE USUÁRIO
// Costa Confecções
// ============================================================

// Espera todo o HTML da página ser carregado antes de executar
// o JavaScript.
document.addEventListener("DOMContentLoaded", () => {
  // ========================================================
  // ELEMENTOS DA PÁGINA
  // ========================================================

  // Formulário de cadastro
  const registerForm = document.getElementById("registerForm");

  // Botões de login social
  const googleButton = document.getElementById("googlebutton");
  const facebookButton = document.getElementById("facebookbutton");

  // Botão voltar, caso exista na página
  const btnVoltar = document.getElementById("btnVoltar");

  // ========================================================
  // URL DA API
  // ========================================================

  // Endereço do servidor responsável pelo cadastro/login.
  //
  // IMPORTANTE:
  // Enquanto o projeto estiver sendo executado localmente,
  // a API deve estar funcionando nessa porta.
  const API_URL = "http://localhost:3000";

  // ========================================================
  // CADASTRO
  // ========================================================

  // Verifica se o formulário existe na página.
  if (registerForm) {
    // Evento executado quando o usuário envia o formulário.
    registerForm.addEventListener("submit", async (e) => {
      // Impede o formulário de recarregar a página.
      e.preventDefault();

      // ====================================================
      // CAPTURA DOS DADOS
      // ====================================================

      // Nome informado pelo usuário.
      const nome = document.getElementById("nome").value.trim();

      // E-mail informado pelo usuário.
      //
      // O trim() remove espaços desnecessários.
      // O toLowerCase() transforma o e-mail em letras minúsculas.
      const email = document.getElementById("email").value.trim().toLowerCase();

      // Senha informada.
      const senha = document.getElementById("senha").value;

      // Confirmação da senha.
      const confirmarSenha = document.getElementById("confirmarSenha").value;

      // ====================================================
      // VALIDAÇÃO DOS CAMPOS
      // ====================================================

      // Verifica se algum campo obrigatório está vazio.
      if (!nome || !email || !senha || !confirmarSenha) {
        alert("Preencha todos os campos.");

        return;
      }

      // ====================================================
      // VALIDAÇÃO DA SENHA
      // ====================================================

      // A senha precisa possuir pelo menos 8 caracteres.
      if (senha.length < 8) {
        alert("A senha deve possuir pelo menos 8 caracteres.");

        return;
      }

      // ====================================================
      // CONFIRMAÇÃO DA SENHA
      // ====================================================

      // Verifica se as duas senhas são iguais.
      if (senha !== confirmarSenha) {
        alert("As senhas não coincidem.");

        return;
      }

      // ====================================================
      // ENVIO PARA A API
      // ====================================================

      try {
        // Envia os dados do usuário para o servidor.
        const resposta = await fetch(`${API_URL}/cadastro`, {
          // Método utilizado para criar o cadastro.
          method: "POST",

          // Informa que estamos enviando JSON.
          headers: {
            "Content-Type": "application/json",
          },

          // Converte os dados do formulário para JSON.
          body: JSON.stringify({
            nome,
            email,
            senha,
          }),
        });

        // ====================================================
        // RESPOSTA DO SERVIDOR
        // ====================================================

        // Converte a resposta da API para objeto JavaScript.
        const dados = await resposta.json();

        // Verifica se o servidor retornou algum erro.
        if (!resposta.ok) {
          alert(dados.mensagem || "Não foi possível realizar o cadastro.");

          return;
        }

        // ====================================================
        // CADASTRO REALIZADO
        // ====================================================

        alert("Cadastro realizado com sucesso!");

        // Depois do cadastro, envia o usuário para o login.
        window.location.href = "login.html";
      } catch (erro) {
        // Exibe o erro no console para facilitar a identificação
        // de problemas durante o desenvolvimento.
        console.error("Erro no cadastro:", erro);

        // Mensagem exibida para o usuário.
        alert("Erro ao conectar com o servidor.");
      }
    });
  }

  // ============================================================
  // LOGIN COM GOOGLE
  // ============================================================

  // Verifica se o botão existe antes de adicionar o evento.
  if (googleButton) {
    googleButton.addEventListener("click", () => {
      // IMPORTANTE:
      // "GOOGLE_ID" ainda é apenas um placeholder.
      // Ele deverá ser substituído pela URL/rota real da
      // autenticação Google quando ela estiver configurada.

      window.open("GOOGLE_ID", "_blank");
    });
  }

  // ============================================================
  // LOGIN COM FACEBOOK
  // ============================================================

  if (facebookButton) {
    facebookButton.addEventListener("click", () => {
      // IMPORTANTE:
      // "FACEBOOK_ID" também é apenas um placeholder.
      // Deve ser substituído pela autenticação real do Facebook.

      window.open("FACEBOOK_ID", "_blank");
    });
  }

  // ============================================================
  // BOTÃO VOLTAR
  // ============================================================

  // Caso a página possua um botão com id="btnVoltar",
  // ele retornará para a página anterior.
  if (btnVoltar) {
    btnVoltar.addEventListener("click", () => {
      history.back();
    });
  }
});
