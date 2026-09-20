const express = require("express");
const router = express.Router();

const prisma = require("../prisma/client");

function semSenha(gestao) {
  if (!gestao) return gestao;
  const { senha, ...resto } = gestao;
  return resto;
}

router.get("/", async function (req, res) {
  try {
    const gestores = await prisma.gestao.findMany();
    res.status(200).json(gestores.map(semSenha));
  } catch (error) {
    console.error("Erro ao listar gestão:", error);
    res.status(500).json({ error: "Falha ao listar gestão" });
  }
});

router.post("/", async function (req, res) {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios." });
    }

    const gestao = await prisma.gestao.create({ data: { nome, email, senha } });
    res.status(201).json(semSenha(gestao));
  } catch (error) {
    console.error("Erro ao criar gestor:", error);

    if (error.code === "P2002") {
      return res.status(409).json({ error: "Já existe uma conta com esse e-mail." });
    }

    return res.status(500).json({ error: "Falha ao cadastrar gestor" });
  }
});

module.exports = router;
