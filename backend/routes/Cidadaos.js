const express = require("express");
const router = express.Router();

const prisma = require("../prisma/client");

function semSenha(cidadao) {
  if (!cidadao) return cidadao;
  const { senha, ...resto } = cidadao;
  return resto;
}

router.get("/", async function (req, res) {
  try {
    const cidadaos = await prisma.cidadao.findMany();
    res.status(200).json(cidadaos.map(semSenha));
  } catch (error) {
    console.error("Erro ao listar cidadãos:", error);
    res.status(500).json({ error: "Falha ao listar cidadãos" });
  }
});

router.get("/:id", async function (req, res) {
  try {
    const idCidadao = Number(req.params.id);

    const cidadao = await prisma.cidadao.findUnique({
      where: { idCidadao },
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

router.post("/", async function (req, res) {
  try {
    const { nome, email, senha, telefone } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        error: "Nome, e-mail e senha são obrigatórios.",
      });
    }

    const cidadao = await prisma.cidadao.create({
      data: { nome, email, senha, telefone },
    });

    res.status(201).json(semSenha(cidadao));
  } catch (error) {
    console.error("Erro ao criar cidadão:", error?.message || error);

    if (error.code === "P2002") {
      return res.status(409).json({ error: "Já existe uma conta com esse e-mail." });
    }

    return res.status(500).json({
      error: "Falha ao cadastrar cidadão",
      detail: error?.message || "Erro interno do banco de dados",
    });
  }
});

router.put("/:id", async function (req, res) {
  try {
    const idCidadao = Number(req.params.id);
    const { nome, email, senha, telefone } = req.body;

    const dadosAtualizados = {};
    if (nome !== undefined) dadosAtualizados.nome = nome;
    if (email !== undefined) dadosAtualizados.email = email;
    if (senha) dadosAtualizados.senha = senha;
    if (telefone !== undefined) dadosAtualizados.telefone = telefone;

    const cidadaoAtualizado = await prisma.cidadao.update({
      where: { idCidadao },
      data: dadosAtualizados,
    });

    res.status(200).json(semSenha(cidadaoAtualizado));
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
    const idCidadao = Number(req.params.id);

    await prisma.cidadao.delete({
      where: { idCidadao },
    });

    res.status(200).json({ message: "Cidadão excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir cidadão:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Cidadão não encontrado para excluir" });
    }

    return res.status(500).json({ error: "Falha ao excluir cidadão" });
  }
});

module.exports = router;
