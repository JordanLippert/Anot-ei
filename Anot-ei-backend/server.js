const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// Criar evento
app.post("/events", async (req, res) => {
  const { title, start, end, allDay } = req.body;
  try {
    const event = await prisma.event.create({
      data: { title, start: new Date(start), end: end ? new Date(end) : null, allDay },
    });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar evento" });
  }
});

// Listar eventos
app.get("/events", async (req, res) => {
  const events = await prisma.event.findMany();
  res.json(events);
});

// Atualizar evento
app.put("/events/:id", async (req, res) => {
  const { id } = req.params;
  const { title, start, end, allDay } = req.body;
  try {
    const event = await prisma.event.update({
      where: { id },
      data: { title, start: new Date(start), end: end ? new Date(end) : null, allDay },
    });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar evento" });
  }
});

// Deletar evento
app.delete("/events/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.event.delete({ where: { id } });
    res.json({ message: "Evento deletado" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar evento" });
  }
});

// Iniciar servidor
app.listen(3000, () => console.log("Servidor rodando na porta 3000"));