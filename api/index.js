const app = require("../Backend/server");

// As rotas do Express foram escritas sem o prefixo /api. O Vercel entrega
// todas as chamadas para esta função com esse prefixo, então removemos apenas
// essa parte antes de encaminhar a requisição para a aplicação.
module.exports = (req, res) => {
  if (typeof req.url === "string" && req.url.startsWith("/api")) {
    req.url = req.url.slice(4) || "/";
  }

  return app(req, res);
};
