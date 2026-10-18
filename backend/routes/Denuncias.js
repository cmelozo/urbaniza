const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const prisma = require("../prisma/client");
const { autenticar, exigirTipo } = require("../middleware/auth");

const STATUS_VALIDOS = ["Não iniciada", "Em andamento", "Concluída"];
const PRIORIDADES_VALIDAS = ["Baixa", "Média", "Alta"];

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (req, file, cb) => {
    const sufixo = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, sufixo + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith("image/")),
});

// Toda rota daqui exige login.
router.use(autenticar);

// Monta a denúncia como o frontend usa: contagem de curtidas, se EU curti e o autor.
// Cidadão vê só o primeiro nome do autor; a gestão vê o nome completo.
function formatar(denuncia, usuario) {
  const { curtidas, _count, cidadao, gestao, ...resto } = denuncia;
  const ehGestao = usuario.tipo === "gestao";
  return {
    ...resto,
    totalCurtidas: _count.curtidas,
    curtiu: usuario.tipo === "cidadao" ? curtidas.length > 0 : false,
    autor: cidadao ? (ehGestao ? cidadao.nome : cidadao.nome.split(" ")[0]) : null,
    responsavel: gestao?.nome || null,
  };
}

function incluirDetalhes(usuario) {
  return {
    cidadao: { select: { nome: true } },
    gestao: { select: { nome: true } },
    _count: { select: { curtidas: true } },
    // só as curtidas do próprio cidadão, para marcar o coração
    curtidas: usuario.tipo === "cidadao" ? { where: { Cidadao_idCidadao: usuario.id }, select: { idCurtida: true } } : false,
  };
}

// Garante que o usuário tem cidade. Sem isso não há território para filtrar.
function exigirCidade(req, res, next) {
  if (!req.usuario.cidadeId) {
    return res.status(400).json({ error: "Defina a sua cidade no perfil para ver as denúncias." });
  }
  next();
}

// Lista as denúncias da cidade do usuário logado (nunca de outra cidade).
// ?mine=1 → só as que o cidadão registrou | ?status=Em andamento | ?prioridade=Alta
router.get("/", exigirCidade, async function (req, res) {
  try {
    const { mine, status, prioridade } = req.query;

    const where = { Cidade_idCidade: req.usuario.cidadeId };
    if (mine && req.usuario.tipo === "cidadao") where.Cidadao_idCidadao = req.usuario.id;
    if (status && STATUS_VALIDOS.includes(status)) where.status = status;
    if (prioridade && PRIORIDADES_VALIDAS.includes(prioridade)) where.prioridade = prioridade;

    const denuncias = await prisma.denuncia.findMany({
      where,
      orderBy: { data: "desc" },
      include: incluirDetalhes(req.usuario),
    });

    res.status(200).json(denuncias.map((d) => formatar(d, req.usuario)));
  } catch (error) {
    console.error("Erro ao listar denúncias:", error);
    res.status(500).json({ error: "Falha ao listar denúncias" });
  }
});

router.get("/:id", exigirCidade, async function (req, res) {
  try {
    const denuncia = await prisma.denuncia.findFirst({
      where: { idDenuncia: Number(req.params.id), Cidade_idCidade: req.usuario.cidadeId },
      include: incluirDetalhes(req.usuario),
    });

    if (!denuncia) {
      return res.status(404).json({ error: "Denúncia não encontrada" });
    }

    return res.status(200).json(formatar(denuncia, req.usuario));
  } catch (error) {
    console.error("Erro ao buscar denúncia:", error);
    return res.status(500).json({ error: "Falha ao buscar denúncia" });
  }
});

// Cidadão registra denúncia na própria cidade — só se a prefeitura já estiver cadastrada.
router.post("/", exigirTipo("cidadao"), exigirCidade, upload.single("foto"), async function (req, res) {
  try {
    const { descricao, categoria, localizacao } = req.body;

    if (!descricao || !localizacao) {
      return res.status(400).json({ error: "Descrição e localização são obrigatórias." });
    }

    const cidade = await prisma.cidade.findUnique({ where: { idCidade: req.usuario.cidadeId } });
    if (!cidade?.cadastrada) {
      return res.status(422).json({
        error: `A prefeitura de ${cidade?.nome || "sua cidade"} ainda não está cadastrada na Urbaniza+, por isso não pode receber denúncias.`,
      });
    }

    const midia = req.file ? [`/uploads/${req.file.filename}`] : undefined;

    const denuncia = await prisma.denuncia.create({
      data: {
        descricao,
        categoria: categoria || null,
        localizacao,
        midia,
        Cidadao_idCidadao: req.usuario.id,
        Cidade_idCidade: cidade.idCidade,
      },
    });

    res.status(201).json(denuncia);
  } catch (error) {
    console.error("Erro ao criar denúncia:", error?.message || error);
    return res.status(500).json({ error: "Falha ao registrar denúncia" });
  }
});

// Prefeitura ajusta status e emergência (prioridade) das denúncias do próprio território.
router.put("/:id", exigirTipo("gestao"), exigirCidade, async function (req, res) {
  try {
    const { status, prioridade } = req.body;

    if (status !== undefined && !STATUS_VALIDOS.includes(status)) {
      return res.status(400).json({ error: `Status inválido. Use: ${STATUS_VALIDOS.join(", ")}.` });
    }
    if (prioridade !== undefined && !PRIORIDADES_VALIDAS.includes(prioridade)) {
      return res.status(400).json({ error: `Prioridade inválida. Use: ${PRIORIDADES_VALIDAS.join(", ")}.` });
    }

    const existente = await prisma.denuncia.findFirst({
      where: { idDenuncia: Number(req.params.id), Cidade_idCidade: req.usuario.cidadeId },
      select: { idDenuncia: true },
    });
    // 404 também para denúncia de outra cidade: não revela que ela existe.
    if (!existente) {
      return res.status(404).json({ error: "Denúncia não encontrada" });
    }

    const dadosAtualizados = { Gestao_idGestao: req.usuario.id };
    if (status !== undefined) dadosAtualizados.status = status;
    if (prioridade !== undefined) dadosAtualizados.prioridade = prioridade;

    const atualizada = await prisma.denuncia.update({
      where: { idDenuncia: existente.idDenuncia },
      data: dadosAtualizados,
      include: incluirDetalhes(req.usuario),
    });

    res.status(200).json(formatar(atualizada, req.usuario));
  } catch (error) {
    console.error("Erro ao atualizar denúncia:", error);
    return res.status(500).json({ error: "Falha ao atualizar denúncia" });
  }
});

// Curtir / descurtir (alterna). Só denúncias da mesma cidade do cidadão.
router.post("/:id/curtir", exigirTipo("cidadao"), exigirCidade, async function (req, res) {
  try {
    const idDenuncia = Number(req.params.id);

    const denuncia = await prisma.denuncia.findFirst({
      where: { idDenuncia, Cidade_idCidade: req.usuario.cidadeId },
      select: { idDenuncia: true },
    });
    if (!denuncia) {
      return res.status(404).json({ error: "Denúncia não encontrada" });
    }

    const chave = { Cidadao_idCidadao: req.usuario.id, Denuncia_idDenuncia: idDenuncia };
    const existente = await prisma.curtida.findUnique({
      where: { Cidadao_idCidadao_Denuncia_idDenuncia: chave },
    });

    if (existente) {
      await prisma.curtida.delete({ where: { idCurtida: existente.idCurtida } });
    } else {
      await prisma.curtida.create({ data: chave });
    }

    const totalCurtidas = await prisma.curtida.count({ where: { Denuncia_idDenuncia: idDenuncia } });
    res.status(200).json({ curtiu: !existente, totalCurtidas });
  } catch (error) {
    // duas curtidas simultâneas do mesmo usuário: a segunda bate no índice único
    if (error.code === "P2002" || error.code === "P2025") {
      return res.status(409).json({ error: "Tente novamente." });
    }
    console.error("Erro ao curtir denúncia:", error);
    return res.status(500).json({ error: "Falha ao curtir denúncia" });
  }
});

// O cidadão pode apagar apenas as próprias denúncias.
router.delete("/:id", exigirTipo("cidadao"), async function (req, res) {
  try {
    const resultado = await prisma.denuncia.deleteMany({
      where: { idDenuncia: Number(req.params.id), Cidadao_idCidadao: req.usuario.id },
    });

    if (resultado.count === 0) {
      return res.status(404).json({ error: "Denúncia não encontrada para excluir" });
    }

    res.status(200).json({ message: "Denúncia excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir denúncia:", error);
    return res.status(500).json({ error: "Falha ao excluir denúncia" });
  }
});

module.exports = router;
