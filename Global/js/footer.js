// ==========================
// FOOTER GLOBAL
// ==========================

// ==========================
// INSTAGRAM
// ==========================

const instagram = document.getElementById("insta");

if (instagram) {
  instagram.addEventListener("click", () => {
    window.open("https://www.instagram.com/costaconfeccoes2", "_blank");
  });
}

// ==========================
// WHATSAPP
// ==========================

const whatsapp = document.getElementById("zap");

if (whatsapp) {
  whatsapp.addEventListener("click", () => {
    window.open("https://wa.me/5582996160237", "_blank");
  });
}

// ==========================
// SOBRE
// ==========================

const sobre = document.getElementById("sobre");

if (sobre) {
  sobre.addEventListener("click", () => {
    window.location.href = "../Central de ajuda/sobre.html";
  });
}

// ==========================
// SUPORTE
// ==========================

const suporte = document.getElementById("suporte");

if (suporte) {
  suporte.addEventListener("click", () => {
    window.location.href = "../Central de ajuda/central.html";
  });
}

// ==========================
// SUSTENTABILIDADE
// ==========================

const sustentabilidade = document.getElementById("sustentabilidade");

if (sustentabilidade) {
  sustentabilidade.addEventListener("click", () => {
    window.location.href = "../Central de ajuda/sustentabilidade.html";
  });
}

// ==========================
// MAPA DO SITE
// ==========================

const mapaSite = document.getElementById("mapa-site");

if (mapaSite) {
  mapaSite.addEventListener("click", () => {
    window.location.href = "/Mapa/mapa-site.html";
  });
}

// ==========================
// CLIQUE E RETIRE
// ==========================

const cliqueRetire = document.getElementById("clique-retire");

if (cliqueRetire) {
  cliqueRetire.addEventListener("click", () => {
    window.location.href = "/Central de ajuda/central.html";
  });
}

// ==========================
// POLÍTICA DE PRIVACIDADE
// ==========================

const politicaPrivacidade = document.getElementById("politica-privacidade");

if (politicaPrivacidade) {
  politicaPrivacidade.addEventListener("click", () => {
    window.location.href = "/Central de ajuda/sobre.html";
  });
}

// ==========================
// TERMOS E CONDIÇÕES
// ==========================

const termosCondicoes = document.getElementById("termos-condicoes");

if (termosCondicoes) {
  termosCondicoes.addEventListener("click", () => {
    window.location.href = "/Central de ajuda/sobre.html";
  });
}
