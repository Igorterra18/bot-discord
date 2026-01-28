const express = require("express");
const app = express();

app.use(express.json());

// Saldo temporário na memória
const saldos = {};

// ROBLOX -> ENVIA SALDO
app.post("/roblox/saldo", (req, res) => {
  const { userId, carteira, banco } = req.body;

  if (!userId) {
    return res.status(400).json({ erro: "userId ausente" });
  }

  saldos[userId] = {
    carteira: carteira || 0,
    banco: banco || 0
  };

  console.log(`💰 Saldo recebido do Roblox: ${userId}`);
  res.json({ sucesso: true });
});

// DISCORD -> BUSCA SALDO
app.get("/saldo/:userId", (req, res) => {
  const saldo = saldos[req.params.userId];

  if (!saldo) {
    return res.status(404).json({ erro: "Saldo não encontrado" });
  }

  res.json(saldo);
});

app.listen(3000, () => {
  console.log("✅ API de saldo rodando na porta 3000");
});
