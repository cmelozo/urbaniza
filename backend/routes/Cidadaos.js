const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

const prisma = require("../prisma/client");
const { autenticar, exigirTipo, gerarToken } = require("../middleware/auth");

const incluirCidade = { cidade: { select: { idCidade: true, nome: true, uf: true, cadastrada: true } } };

function semSenha(cidadao) {
  if (!cidadao) return cidadao;
  const { senha, ...resto } = cidadao;
  return resto;
}

// Cadastro aberto: o cidadão escolhe a cidade onde mora.
router.post("/", async function (req, res) {
  try {
    const { nome, email, senha, telefone, cidadeId } = req.body;

    if (!nome || !email || !senha || !cidadeId) {
      return res.status(400).json({
        error: "Nome, e-mail, senha e cidade são obrigatórios.",
      });
    }

    const cidade = await prisma.cidade.findUnique({ where: { idCidade: Number(cidadeId) } });
    if (!cidade) {
      return res.status(400).json({ error: "Cidade inválida." });
    }

    const emailEmUso = await prisma.gestao.findUnique({ where: { email } });
    if (emailEmUso) {
      return res.status(409).json({ error: "Já existe uma conta com esse e-mail." });
    }

    const cidadao = await prisma.cidadao.create({
      data: { nome, email, senha: await bcrypt.hash(senha, 10), telefone, Cidade_idCidade: cidade.idCidade },
      include: incluirCidade,
    });

    res.status(201).json(semSenha(cidadao));
  } catch (error) {
    console.error("Erro ao criar cidadão:", error?.message || error);

    if (error.code === "P2002") {
      return res.status(409).json({ error: "Já existe uma conta com esse e-mail." });
    }

    return res.status(500).json({ error: "Falha ao cadastrar cidadão" });
  }
});

// A partir daqui, cada cidadão só mexe na própria conta.
router.use(autenticar, exigirTipo("cidadao"));

router.use("/:id", function (req, res, next) {
  if (Number(req.params.id) !== req.usuario.id) {
    return res.status(403).json({ error: "Você só pode acessar a sua própria conta." });
  }
  next();
});

router.get("/:id", async function (req, res) {
  try {
    const cidadao = await prisma.cidadao.findUnique({
      where: { idCidadao: req.usuario.id },
      include: incluirCidade,
    });

    if (!cidadao) {
      return res.status(404).json({ error: "Cidadão não encontrado" });
    }

    return res.status(200).json(semSenha(cidadao));
  } catch (error) {
    console.error("Erro ao buscar cidadão:", error);
    return res.status(500).json({ error: "Falha ao buscar cidadão" });
  }
});

// Editar perfil. Devolve também um token novo, porque a cidade pode ter mudado
// e ela define quais denúncias o cidadão enxerga.
router.put("/:id", async function (req, res) {
  try {
    const { nome, email, senha, telefone, cidadeId } = req.body;

    const dadosAtualizados = {};
    if (nome !== undefined) {
      if (!String(nome).trim()) return res.status(400).json({ error: "O nome não pode ficar vazio." });
      dadosAtualizados.nome = nome;
    }
    if (email !== undefined) {
      const emailEmUso = await prisma.gestao.findUnique({ where: { email } });
      if (emailEmUso) return res.status(409).json({ error: "Já existe uma conta com esse e-mail." });
      dadosAtualizados.email = email;
    }
    if (senha) dadosAtualizados.senha = await bcrypt.hash(senha, 10);
    if (telefone !== undefined) dadosAtualizados.telefone = telefone;
    if (cidadeId !== undefined) {
      const cidade = await prisma.cidade.findUnique({ where: { idCidade: Number(cidadeId) } });
      if (!cidade) return res.status(400).json({ error: "Cidade inválida." });
      dadosAtualizados.Cidade_idCidade = cidade.idCidade;
    }

    const cidadao = await prisma.cidadao.update({
      where: { idCidadao: req.usuario.id },
      data: dadosAtualizados,
      include: incluirCidade,
    });

    const token = gerarToken({ tipo: "cidadao", id: cidadao.idCidadao, cidadeId: cidadao.Cidade_idCidade });
    res.status(200).json({ usuario: semSenha(cidadao), token });
  } catch (error) {
    console.error("Erro ao atualizar cidadão:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Cidadão não encontrado para atualizar" });
    }
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Já existe uma conta com esse e-mail." });
    }

    return res.status(500).json({ error: "Falha ao atualizar cidadão" });
  }
});

router.delete("/:id", async function (req, res) {
  try {
    await prisma.cidadao.delete({ where: { idCidadao: req.usuario.id } });
    res.status(200).json({ message: "Conta excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir cidadão:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Cidadão não encontrado para excluir" });
    }

    return res.status(500).json({ error: "Falha ao excluir cidadão" });
  }
});

module.exports = router;
