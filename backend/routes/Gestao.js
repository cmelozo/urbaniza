const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

const prisma = require("../prisma/client");

function semSenha(gestao) {
  if (!gestao) return gestao;
  const { senha, ...resto } = gestao;
  return resto;
}

// Cadastro da prefeitura. O código de acesso é o token do município: ele
// identifica a cidade, então a gestão nunca escolhe a cidade manualmente.
router.post("/", async function (req, res) {
  try {
    const { nome, email, senha, codigoAcesso } = req.body;

    if (!nome || !email || !senha || !codigoAcesso) {
      return res.status(400).json({ error: "Nome, e-mail, senha e código de acesso são obrigatórios." });
    }

    const cidade = await prisma.cidade.findUnique({
      where: { token: String(codigoAcesso).trim().toUpperCase() },
    });
    if (!cidade) {
      return res.status(403).json({ error: "Código de acesso inválido. Solicite o código à equipe da Urbaniza+." });
    }

    // O login procura primeiro em Cidadao, então o e-mail não pode existir lá.
    const emailEmUso = await prisma.cidadao.findUnique({ where: { email } });
    if (emailEmUso) {
      return res.status(409).json({ error: "Já existe uma conta com esse e-mail." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const [gestao] = await prisma.$transaction([
      prisma.gestao.create({
        data: { nome, email, senha: senhaHash, Cidade_idCidade: cidade.idCidade },
      }),
      prisma.cidade.update({ where: { idCidade: cidade.idCidade }, data: { cadastrada: true } }),
    ]);

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
