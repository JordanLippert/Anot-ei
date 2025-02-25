const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require('./middleware/auth');
const authController = require('./controllers/authController'); // Importa o controller de autenticação
const annotationController = require('./controllers/annotationController'); // Importa o controller de anotações
const eventController = require('./controllers/eventController'); // Importa o controller de eventos

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// Usa o controller para rotas de autenticação
app.use(authController);

// Usa o controller para rotas de anotações
app.use(annotationController);

// Usa o controller para rotas de eventos
app.use(eventController);

// Iniciar servidor
app.listen(3000, () => console.log("Servidor rodando na porta 3000"));