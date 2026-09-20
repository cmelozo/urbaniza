const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const prisma = require("../prisma/client");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (req, file, cb) => {
    const sufixo = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, sufixo + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.get("/", async function (req, res) {
  try {
    const { cidadaoId, status } = req.query;

    const where = {};
    if (cidadaoId) where.Cidadao_idCidadao = Number(cidadaoId);
    if (status) where.status = status;

    const denuncias = await prisma.denuncia.findMany({
      where,
      orderBy: { data: "desc" },
      include: { cidadao: { select: { nome: true } }, gestao: { select: { nome: true } } },
    });

    res.status(200).json(denuncias);
  } catch (error) {
    console.error("Erro ao listar denúncias:", error);
    res.status(500).json({ error: "Falha ao listar denúncias" });
  }
});

router.get("/:id", async function (req, res) {
  try {
    const idDenuncia = Number(req.params.id);

    const denuncia = await prisma.denuncia.findUnique({
      where: { idDenuncia },
      include: { cidadao: { select: { nome: true } }, gestao: { select: { nome: true } } },
    });

    if (!denuncia) {
      return res.status(404).json({ error: "Denúncia não encontrada" });
    }

    return res.status(200).json(denuncia);
  } catch (error) {
    console.error("Erro ao buscar denúncia:", error);
    return res.status(500).json({ error: "Falha ao buscar denúncia" });
  }
});

router.post("/", upload.single("foto"), async function (req, res) {
  try {
    const { descricao, categoria, localizacao, cidadaoId, prioridade } = req.body;

    if (!descricao || !localizacao || !cidadaoId) {
      return res.status(400).json({
        error: "Descrição, localização e cidadão são obrigatórios.",
      });
    }

    const midia = req.file ? [`/uploads/${req.file.filename}`] : undefined;

    const denuncia = await prisma.denuncia.create({
      data: {
        descricao,
        categoria: categoria || null,
        localizacao,
        prioridade: prioridade || null,
        midia,
        Cidadao_idCidadao: Number(cidadaoId),
      },
    });

    res.status(201).json(denuncia);
  } catch (error) {
    console.error("Erro ao criar denúncia:", error?.message || error);

    return res.status(500).json({
      error: "Falha ao registrar denúncia",
      detail: error?.message || "Erro interno do banco de dados",
    });
  }
});

router.put("/:id", async function (req, res) {
  try {
    const idDenuncia = Number(req.params.id);
    const { descricao, categoria, localizacao, status, prioridade, gestaoId } = req.body;

    const dadosAtualizados = {};
    if (descricao !== undefined) dadosAtualizados.descricao = descricao;
    if (categoria !== undefined) dadosAtualizados.categoria = categoria;
    if (localizacao !== undefined) dadosAtualizados.localizacao = localizacao;
    if (status !== undefined) dadosAtualizados.status = status;
    if (prioridade !== undefined) dadosAtualizados.prioridade = prioridade;
    if (gestaoId !== undefined) dadosAtualizados.Gestao_idGestao = Number(gestaoId);

    const denunciaAtualizada = await prisma.denuncia.update({
      where: { idDenuncia },
      data: dadosAtualizados,
    });

    res.status(200).json(denunciaAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar denúncia:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Denúncia não encontrada para atualizar" });
    }

    return res.status(500).json({ error: "Falha ao atualizar denúncia" });
  }
});

router.delete("/:id", async function (req, res) {
  try {
    const idDenuncia = Number(req.params.id);

    await prisma.denuncia.delete({
      where: { idDenuncia },
    });

    res.status(200).json({ message: "Denúncia excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir denúncia:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Denúncia não encontrada para excluir" });
    }

    return res.status(500).json({ error: "Falha ao excluir denúncia" });
  }
});

module.exports = router;
