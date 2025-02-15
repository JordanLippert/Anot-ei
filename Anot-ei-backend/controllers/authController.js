const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");
const { body, validationResult } = require("express-validator");

const prisma = new PrismaClient();
const router = express.Router();

const JWT_SECRET = "seu_segredo";

//cadastro do usuário
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
        res.json({ message: "Usuário registrado com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao cadastrar usuário" });
    }
});

//login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Usuário não encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Senha incorreta" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

//recuperação de Senha
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

//resetar Senha
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

module.exports = router;