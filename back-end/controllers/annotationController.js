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
    res.status(201).json(annotation);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar anotação" });
  }
});

// Listar anotações
router.get("/annotations", authMiddleware, async (req, res) => {
  try {
    const annotations = await prisma.annotation.findMany({
      where: { userId: req.user.id },
    });
    res.json(annotations);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar anotações" });
  }
});

// Atualizar anotação
router.put("/annotations/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const annotation = await prisma.annotation.findUnique({ where: { id: parseInt(id) } });
    if (annotation.userId !== req.user.id) {
      return res.status(403).json({ error: "Acesso negado" });
    }
    const updatedAnnotation = await prisma.annotation.update({
      where: { id: parseInt(id) },
      data: { title, content },
    });
    res.json(updatedAnnotation);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar anotação" });
  }
});

// Deletar anotação
router.delete("/annotations/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const annotation = await prisma.annotation.findUnique({ where: { id: parseInt(id) } });
    if (annotation.userId !== req.user.id) {
      return res.status(403).json({ error: "Acesso negado" });
    }
    await prisma.annotation.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Anotação deletada" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar anotação" });
  }
});

// Adicionar anotações de exemplo
async function addExampleAnnotations() {
  await prisma.annotation.createMany({
    data: [
      { title: "Anotação 1", content: "Conteúdo da anotação 1", userId: 1 },
      { title: "Anotação 2", content: "Conteúdo da anotação 2", userId: 1 },
      { title: "Anotação 3", content: "Conteúdo da anotação 3", userId: 1 },
    ],
  });
}

addExampleAnnotations().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});

module.exports = router;