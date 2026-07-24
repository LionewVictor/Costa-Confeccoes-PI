document.addEventListener("DOMContentLoaded", () => {
  const methodSelect = document.getElementById("methodSelect");
  const phoneGroup = document.getElementById("phoneGroup");
  const emailGroup = document.getElementById("emailGroup");
  const telefoneInput = document.getElementById("telefoneInput");

  const emailInput = document.querySelector('input[type="email"]');
  const loginForm = document.getElementById("loginForm");

  const mensagemElement = document.createElement("p");
  mensagemElement.style.textAlign = "center";
  mensagemElement.style.marginTop = "15px";
  mensagemElement.style.fontWeight = "bold";
  loginForm.appendChild(mensagemElement);

  telefoneInput.addEventListener("input", (event) => {
    
    let valor = event.target.value.replace(/\D/g, "");

    if (valor.length > 11) valor = valor.slice(0, 11);

    if (valor.length > 6) {
      valor = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7)}`;
    } else if (valor.length > 2) {
      valor = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
    } else if (valor.length > 0) {
      valor = `(${valor}`;
    }

    event.target.value = valor;
  });

  methodSelect.addEventListener("change", () => {
    if (methodSelect.value === "whatsapp") {
      phoneGroup.classList.remove("hidden");
      emailGroup.classList.add("hidden");
      emailInput.value = "";
    } else {
      emailGroup.classList.remove("hidden");
      phoneGroup.classList.add("hidden");
      telefoneInput.value = "";
    }
    mensagemElement.innerText = "";
  });

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const metodoSelecionado = methodSelect.value;
    const botaoSubmit = document.getElementById("btn_continuar");
    const payload = {};

    if (metodoSelecionado === "whatsapp") {
      
      const apenasNumeros = telefoneInput.value.replace(/\D/g, "");

      if (!apenasNumeros) {
        exibirMensagem("Por favor, insira seu telefone.", "red");
        return;
      }

    
      if (apenasNumeros.length < 11) {
        exibirMensagem("Telefone incompleto. Digite o DDD + 9 números.", "red");
        return;
      }

      payload.numero = apenasNumeros;
    } else {
      payload.email = emailInput.value.trim();
      if (!payload.email) {
        exibirMensagem("Por favor, insira seu e-mail.", "red");
        return;
      }
    }

    try {
      botaoSubmit.disabled = true;
      exibirMensagem("Enviando código...", "orange");

      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const dados = await response.json();

      if (response.ok) {
        exibirMensagem("Código enviado com sucesso!", "green");
        if (dados.token) {
          localStorage.setItem("token", dados.token);
        }
      } else {
        exibirMensagem(dados.erro || "Falha ao enviar código.", "red");
      }
    } catch (error) {
      exibirMensagem("Erro ao conectar com o servidor.", "red");
    } finally {
      botaoSubmit.disabled = false;
    }
  });

  function exibirMensagem(texto, cor) {
    mensagemElement.style.color = cor;
    mensagemElement.innerText = texto;
  }
});
