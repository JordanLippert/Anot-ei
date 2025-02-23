const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require('./middleware/auth');
const authController = require('./controllers/authController'); // Importa o controller de autenticação
const annotationController = require('./controllers/annotationController'); // Importa o controller de anotações

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// Usa o controller para rotas de autenticação
app.use('/auth', authController);

// Usa o controller para rotas de anotações
app.use('/api', annotationController);

// Criar evento
app.post("/events", authMiddleware, async (req, res) => {
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
app.get("/events", authMiddleware, async (req, res) => {
  const events = await prisma.event.findMany({ where: { userId: req.user.id } });
  res.json(events);
});

// Atualizar evento
app.put("/events/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, start, end, allDay, color } = req.body; 
  try {
    const event = await prisma.event.update({
      where: { id: parseInt(id) },
      data: { title, start: new Date(start), end: end ? new Date(end) : null, allDay, color }, 
    });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar evento" });
  }
});

// Deletar evento
app.delete("/events/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.event.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Evento deletado" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar evento" });
  }
});

// Iniciar servidor
app.listen(3000, () => console.log("Servidor rodando na porta 3000"));