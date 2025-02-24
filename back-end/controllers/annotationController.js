const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Criar anotação
router.post("/annotations", authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  try {
    const annotation = await prisma.annotation.create({
      data: { title, content, userId: req.user.id },
    });
    res.json(annotation);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar anotação" });
  }
});

// Listar anotações
router.get("/annotations", authMiddleware, async (req, res) => {
  const annotations = await prisma.annotation.findMany({ where: { userId: req.user.id } });
  res.json(annotations);
});

// Atualizar anotação
router.put("/annotations/:id", authMiddleware, async (req, res) => {
  // Adicionar verificação se o usuário é o dono da anotação
  
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const annotation = await prisma.annotation.update({
      where: { id: parseInt(id) },
      data: { title, content },
    });
    res.json(annotation);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar anotação" });
  }
});

// Deletar anotação
router.delete("/annotations/:id", authMiddleware, async (req, res) => {
  // Adicionar verificação se o usuário é o dono da anotação

  const { id } = req.params;
  try {
    await prisma.annotation.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Anotação deletada" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar anotação" });
  }
});

module.exports = router;