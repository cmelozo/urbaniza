const express = require("express");
const router = express.Router();

const prisma = require("../prisma/client");

router.post("/", async function (req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }

    const cidadao = await prisma.cidadao.findUnique({ where: { email } });
    if (cidadao) {
      if (cidadao.senha !== senha) {
        return res.status(401).json({ error: "Senha incorreta." });
      }
      const { senha: _s, ...dados } = cidadao;
      return res.status(200).json({ tipo: "cidadao", usuario: dados });
    }

    const gestao = await prisma.gestao.findUnique({ where: { email } });
    if (gestao) {
      if (gestao.senha !== senha) {
        return res.status(401).json({ error: "Senha incorreta." });
      }
      const { senha: _s, ...dados } = gestao;
      return res.status(200).json({ tipo: "gestao", usuario: dados });
    }

    return res.status(404).json({ error: "Não existe conta com esse e-mail." });
  } catch (error) {
    console.error("Erro ao autenticar:", error);
    return res.status(500).json({ error: "Falha ao autenticar" });
  }
});

module.exports = router;
