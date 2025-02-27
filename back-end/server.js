const express = require("express");
const cors = require("cors");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require('./middleware/auth');
const authController = require('./controllers/authController'); // Importa o controller de autenticação
const annotationController = require('./controllers/annotationController'); // Importa o controller de anotações
const eventController = require('./controllers/eventController'); // Importa o controller de eventos

const prisma = new PrismaClient();
const app = express();

app.use(cors({
  origin: ["http://localhost:5500", "http://127.0.0.1:5500"], // Permite ambas as origens
  credentials: true
}));
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../front-ent')));

// Usa o controller para rotas de autenticação
app.use('/', authController);

// Usa o controller para rotas de anotações
app.use('/', annotationController);

// Usa o controller para rotas de eventos
app.use('/', eventController);

// Rota para servir o arquivo index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../front-ent', 'index.html'));
});

// Iniciar servidor
app.listen(3000, () => console.log("Servidor rodando na porta 3000"));