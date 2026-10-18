const path = require("path");
const jwt = require("jsonwebtoken");

// Garante que o .env já foi lido, independente da ordem dos requires.
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const SEGREDO = process.env.JWT_SECRET || "urbaniza-dev-secret-troque-no-env";
if (!process.env.JWT_SECRET) {
  console.warn("[auth] JWT_SECRET não definido no .env — usando segredo de desenvolvimento.");
}

// tipo: "cidadao" | "gestao"; id: id do usuário; cidadeId: município dele
function gerarToken({ tipo, id, cidadeId }) {
  return jwt.sign({ tipo, id, cidadeId: cidadeId ?? null }, SEGREDO, { expiresIn: "7d" });
}

function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization || "";
  const [esquema, token] = cabecalho.split(" ");

  if (esquema !== "Bearer" || !token) {
    return res.status(401).json({ error: "Faça login para continuar." });
  }

  try {
    req.usuario = jwt.verify(token, SEGREDO);
    next();
  } catch {
    return res.status(401).json({ error: "Sessão expirada. Entre novamente." });
  }
}

function exigirTipo(tipo) {
  return function (req, res, next) {
    if (req.usuario?.tipo !== tipo) {
      return res.status(403).json({ error: "Você não tem permissão para esta ação." });
    }
    next();
  };
}

module.exports = { gerarToken, autenticar, exigirTipo };
