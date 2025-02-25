const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { body, validationResult } = require("express-validator");

const prisma = new PrismaClient();
const router = express.Router();

const JWT_SECRET = "seu_segredo";

// Cadastro do usuário
router.post("/register", [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "2d" });
        res.cookie('token', token, { httpOnly: true });
        res.json({ message: "Usuário registrado com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao cadastrar usuário" });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Usuário não encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Senha incorreta" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d" });
    res.cookie('token', token, { httpOnly: true });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// Recuperação de Senha
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const resetToken = Math.random().toString(36).substr(2, 8);
    await prisma.user.update({
        where: { email },
        data: { token: resetToken },
    });

    // Configuração do Nodemailer
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: "seuemail@gmail.com", pass: "suasenha" },
    });

    await transporter.sendMail({
        from: "seuemail@gmail.com",
        to: email,
        subject: "Recuperação de Senha",
        text: `Use este código para redefinir sua senha: ${resetToken}`,
    });

    res.json({ message: "Código de recuperação enviado para o e-mail." });
});

// Resetar Senha
router.post("/reset-password", async (req, res) => {
    const { email, token, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.token !== token) return res.status(400).json({ error: "Token inválido" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { email },
        data: { password: hashedPassword, token: null },
    });

    res.json({ message: "Senha redefinida com sucesso!" });
});

// Atualizar perfil do usuário
router.put("/update-profile", authMiddleware, async (req, res) => {
    const { name, email, password } = req.body;
    const userId = req.user.id; // Supondo que você tenha middleware de autenticação que adiciona o ID do usuário ao req

    try {
        const data = {};
        if (name) data.name = name;
        if (email) data.email = email;
        if (password) data.password = await bcrypt.hash(password, 10);

        const user = await prisma.user.update({
            where: { id: userId },
            data
        });

        res.json({ message: "Perfil atualizado com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar perfil" });
    }
});

// Deletar conta do usuário
router.delete("/delete-account", authMiddleware, async (req, res) => {
    const userId = req.user.id; // Supondo que você tenha middleware de autenticação que adiciona o ID do usuário ao req

    try {
        await prisma.user.delete({ where: { id: userId } });
        res.json({ message: "Conta deletada com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar conta" });
    }
});

module.exports = router;