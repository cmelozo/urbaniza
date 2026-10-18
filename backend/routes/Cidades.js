const express = require("express");
const router = express.Router();

const prisma = require("../prisma/client");

// Lista pública usada no cadastro do cidadão. Nunca expõe o token da prefeitura.
router.get("/", async function (req, res) {
  try {
    const cidades = await prisma.cidade.findMany({
      orderBy: { nome: "asc" },
      select: { idCidade: true, nome: true, uf: true, cadastrada: true },
    });
    res.status(200).json(cidades);
  } catch (error) {
    console.error("Erro ao listar cidades:", error);
    res.status(500).json({ error: "Falha ao listar cidades" });
  }
});

module.exports = router;
