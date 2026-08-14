// ============================================================
// COSTA CONFECÇÕES
// REDEFINIÇÃO DE SENHA
// ============================================================
//
// Este arquivo controla as duas etapas da recuperação:
//
// 1. Usuário informa o e-mail
// 2. Servidor envia o link de recuperação
//
// Depois:
//
// 3. Usuário acessa o link recebido por e-mail
// 4. Usuário informa a nova senha
// 5. Servidor altera a senha
// ============================================================

// ============================================================
// CONFIGURAÇÃO DA API
// ============================================================

// Endereço do backend da Costa Confecções.
const API_URL = "http://localhost:3000";

// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // --------------------------------------------------------
  // ELEMENTOS DA PRIMEIRA ETAPA
  // --------------------------------------------------------

  const etapaEmail = document.getElementById("etapa-email");

  const formEmail = document.getElementById("form-email");

  const mensagemEmail = document.getElementById("mensagem-email");

  const email = document.getElementById("email");

  // --------------------------------------------------------
  // ELEMENTOS DA SEGUNDA ETAPA
  // --------------------------------------------------------

  const etapaSenha = document.getElementById("etapa-senha");

  const formSenha = document.getElementById("form-senha");

  const mensagemSenha = document.getElementById("mensagem-senha");

  const novaSenha = document.getElementById("novaSenha");

  const confirmarSenha = document.getElementById("confirmarSenha");

  // ========================================================
  // PEGAR TOKEN DA URL
  // ========================================================

  /*
        Quando o usuário clicar no link recebido por e-mail,
        o servidor enviará algo parecido com:

        redefinir-senha.html?token=abc123...

        Aqui pegamos esse token.
    */

  const parametros = new URLSearchParams(window.location.search);

  const token = parametros.get("token");

  // ========================================================
  // DEFINIR QUAL ETAPA SERÁ MOSTRADA
  // ========================================================

  /*
        Se existe token:

        significa que o usuário já recebeu o e-mail
        e está acessando o link para criar uma nova senha.

        Caso contrário:

        mostramos o formulário para informar o e-mail.
    */

  if (token) {
    etapaEmail.style.display = "none";

    etapaSenha.style.display = "block";
  } else {
    etapaEmail.style.display = "block";

    etapaSenha.style.display = "none";
  }

  // ========================================================
  // FUNÇÃO PARA MOSTRAR MENSAGEM
  // ========================================================

  /*
        Essa função evita repetir código.

        tipo pode ser:

        "sucesso"

        ou

        "erro"
    */

  function mostrarMensagem(elemento, texto, tipo) {
    elemento.textContent = texto;

    elemento.className = "mensagem " + tipo;
  }

  // ========================================================
  // SOLICITAR LINK DE RECUPERAÇÃO
  // ========================================================

  if (formEmail) {
    formEmail.addEventListener("submit", async (evento) => {
      // Impede o formulário de recarregar a página.
      evento.preventDefault();

      // Pega o e-mail digitado.
      const emailDigitado = email.value.trim().toLowerCase();

      // ------------------------------------------------
      // VALIDAÇÃO
      // ------------------------------------------------

      if (!emailDigitado) {
        mostrarMensagem(mensagemEmail, "Informe seu e-mail.", "erro");

        return;
      }

      // ------------------------------------------------
      // DESABILITA O BOTÃO DURANTE A REQUISIÇÃO
      // ------------------------------------------------

      const botao = formEmail.querySelector(".btn-principal");

      botao.disabled = true;

      botao.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

      try {
        // ------------------------------------------------
        // ENVIA O E-MAIL PARA O BACKEND
        // ------------------------------------------------

        const resposta = await fetch(`${API_URL}/redefinir-senha`, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            email: emailDigitado,
          }),
        });

        // Converte a resposta para JSON.
        const dados = await resposta.json();

        // ------------------------------------------------
        // ERRO RETORNADO PELO SERVIDOR
        // ------------------------------------------------

        if (!resposta.ok) {
          mostrarMensagem(
            mensagemEmail,
            dados.mensagem || "Não foi possível solicitar a redefinição.",
            "erro",
          );

          return;
        }

        // ------------------------------------------------
        // SUCESSO
        // ------------------------------------------------

        mostrarMensagem(
          mensagemEmail,
          dados.mensagem ||
            "Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.",
          "sucesso",
        );

        // Limpa o campo.
        email.value = "";
      } catch (erro) {
        // ------------------------------------------------
        // ERRO DE CONEXÃO
        // ------------------------------------------------

        console.error("Erro ao solicitar redefinição:", erro);

        mostrarMensagem(
          mensagemEmail,
          "Não foi possível conectar ao servidor.",
          "erro",
        );
      } finally {
        // ------------------------------------------------
        // RESTAURA O BOTÃO
        // ------------------------------------------------

        botao.disabled = false;

        botao.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar link';
      }
    });
  }

  // ========================================================
  // REDEFINIR A SENHA
  // ========================================================

  if (formSenha) {
    formSenha.addEventListener("submit", async (evento) => {
      // Impede o recarregamento da página.
      evento.preventDefault();

      // ------------------------------------------------
      // VERIFICAÇÃO DO TOKEN
      // ------------------------------------------------

      if (!token) {
        mostrarMensagem(
          mensagemSenha,
          "Token de redefinição não encontrado.",
          "erro",
        );

        return;
      }

      // ------------------------------------------------
      // PEGAR SENHAS
      // ------------------------------------------------

      const senha = novaSenha.value;

      const confirmacao = confirmarSenha.value;

      // ------------------------------------------------
      // VALIDAR TAMANHO
      // ------------------------------------------------

      if (senha.length < 8) {
        mostrarMensagem(
          mensagemSenha,
          "A senha deve possuir pelo menos 8 caracteres.",
          "erro",
        );

        return;
      }

      // ------------------------------------------------
      // VALIDAR CONFIRMAÇÃO
      // ------------------------------------------------

      if (senha !== confirmacao) {
        mostrarMensagem(mensagemSenha, "As senhas não coincidem.", "erro");

        return;
      }

      // ------------------------------------------------
      // DESABILITAR BOTÃO
      // ------------------------------------------------

      const botao = formSenha.querySelector(".btn-principal");

      botao.disabled = true;

      botao.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

      try {
        // ------------------------------------------------
        // ENVIA A NOVA SENHA PARA O BACKEND
        // ------------------------------------------------

        const resposta = await fetch(`${API_URL}/redefinir-senha/confirmar`, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            token: token,

            novaSenha: senha,
          }),
        });

        // Converte a resposta.
        const dados = await resposta.json();

        // ------------------------------------------------
        // TRATA ERROS
        // ------------------------------------------------

        if (!resposta.ok) {
          mostrarMensagem(
            mensagemSenha,
            dados.mensagem || "Não foi possível redefinir sua senha.",
            "erro",
          );

          return;
        }

        // ------------------------------------------------
        // SUCESSO
        // ------------------------------------------------

        mostrarMensagem(
          mensagemSenha,
          "Senha redefinida com sucesso! Você será redirecionado para o login.",
          "sucesso",
        );

        // Limpa os campos.
        novaSenha.value = "";

        confirmarSenha.value = "";

        // ------------------------------------------------
        // REDIRECIONAR PARA LOGIN
        // ------------------------------------------------

        setTimeout(() => {
          window.location.href = "login.html";
        }, 2500);
      } catch (erro) {
        // ------------------------------------------------
        // ERRO DE CONEXÃO
        // ------------------------------------------------

        console.error("Erro ao redefinir senha:", erro);

        mostrarMensagem(
          mensagemSenha,
          "Não foi possível conectar ao servidor.",
          "erro",
        );
      } finally {
        // ------------------------------------------------
        // RESTAURA O BOTÃO
        // ------------------------------------------------

        botao.disabled = false;

        botao.innerHTML = '<i class="fa-solid fa-key"></i> Redefinir senha';
      }
    });
  }

  // ========================================================
  // MOSTRAR / ESCONDER NOVA SENHA
  // ========================================================

  const botaoMostrarNovaSenha = document.getElementById("mostrar-nova-senha");

  if (botaoMostrarNovaSenha) {
    botaoMostrarNovaSenha.addEventListener("click", () => {
      alternarSenha(novaSenha, botaoMostrarNovaSenha);
    });
  }

  // ========================================================
  // MOSTRAR / ESCONDER CONFIRMAÇÃO
  // ========================================================

  const botaoMostrarConfirmarSenha = document.getElementById(
    "mostrar-confirmar-senha",
  );

  if (botaoMostrarConfirmarSenha) {
    botaoMostrarConfirmarSenha.addEventListener("click", () => {
      alternarSenha(confirmarSenha, botaoMostrarConfirmarSenha);
    });
  }

  // ========================================================
  // FUNÇÃO PARA MOSTRAR / ESCONDER SENHA
  // ========================================================

  function alternarSenha(campo, botao) {
    // Verifica o tipo atual do campo.
    const senhaOculta = campo.type === "password";

    // Alterna entre password e text.
    campo.type = senhaOculta ? "text" : "password";

    // Pega o ícone.
    const icone = botao.querySelector("i");

    // Troca o ícone.
    if (senhaOculta) {
      icone.classList.remove("fa-eye");

      icone.classList.add("fa-eye-slash");
    } else {
      icone.classList.remove("fa-eye-slash");

      icone.classList.add("fa-eye");
    }
  }
});
