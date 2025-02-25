const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Criar evento
router.post("/events", authMiddleware, async (req, res) => {
  const { title, start, end, allDay, color } = req.body;
  try {
    const event = await prisma.event.create({
      data: { title, start: new Date(start), end: end ? new Date(end) : null, allDay, color, userId: req.user.id },
    });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar evento" });
  }
});

// Listar eventos
router.get("/events", authMiddleware, async (req, res) => {
  const events = await prisma.event.findMany({ where: { userId: req.user.id } });
  res.json(events);
});

// Atualizar evento
router.put("/events/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, start, end, allDay, color } = req.body;
  try {
    const event = await prisma.event.findUnique({ where: { id: parseInt(id) } });
    if (!event || event.userId !== req.user.id) {
      return res.status(403).json({ error: "Acesso negado" });
    }
    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: { title, start: new Date(start), end: end ? new Date(end) : null, allDay, color },
    });
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar evento" });
  }
});

// Deletar evento
router.delete("/events/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const event = await prisma.event.findUnique({ where: { id: parseInt(id) } });
    if (!event || event.userId !== req.user.id) {
      return res.status(403).json({ error: "Acesso negado" });
    }
    await prisma.event.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Evento deletado" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar evento" });
  }
});

module.exports = router;
