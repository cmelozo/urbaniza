const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

const prisma = require("../prisma/client");
const { gerarToken } = require("../middleware/auth");

const incluirCidade = { cidade: { select: { idCidade: true, nome: true, uf: true, cadastrada: true } } };

// Contas antigas guardam a senha em texto puro. Aceita uma última vez e já converte para hash.
async function conferirSenha(senhaDigitada, senhaSalva, atualizarHash) {
  if (senhaSalva.startsWith("$2")) {
    return bcrypt.compare(senhaDigitada, senhaSalva);
  }
  if (senhaDigitada === senhaSalva) {
    await atualizarHash(await bcrypt.hash(senhaDigitada, 10));
    return true;
  }
  return false;
}

router.post("/", async function (req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }

    const cidadao = await prisma.cidadao.findUnique({ where: { email }, include: incluirCidade });
    if (cidadao) {
      const ok = await conferirSenha(senha, cidadao.senha, (hash) =>
        prisma.cidadao.update({ where: { idCidadao: cidadao.idCidadao }, data: { senha: hash } })
      );
      if (!ok) return res.status(401).json({ error: "Senha incorreta." });

      const { senha: _s, ...dados } = cidadao;
      const token = gerarToken({ tipo: "cidadao", id: cidadao.idCidadao, cidadeId: cidadao.Cidade_idCidade });
      return res.status(200).json({ tipo: "cidadao", usuario: dados, token });
    }

    const gestao = await prisma.gestao.findUnique({ where: { email }, include: incluirCidade });
    if (gestao) {
      const ok = await conferirSenha(senha, gestao.senha, (hash) =>
        prisma.gestao.update({ where: { idGestao: gestao.idGestao }, data: { senha: hash } })
      );
      if (!ok) return res.status(401).json({ error: "Senha incorreta." });

      const { senha: _s, ...dados } = gestao;
      const token = gerarToken({ tipo: "gestao", id: gestao.idGestao, cidadeId: gestao.Cidade_idCidade });
      return res.status(200).json({ tipo: "gestao", usuario: dados, token });
    }

    return res.status(404).json({ error: "Não existe conta com esse e-mail." });
  } catch (error) {
    console.error("Erro ao autenticar:", error);
    return res.status(500).json({ error: "Falha ao autenticar" });
  }
});

module.exports = router;
