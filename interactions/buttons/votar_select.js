const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data/eleicao.json");

module.exports = async interaction => {
  const userId = interaction.user.id;
  const candidatoId = interaction.values[0];

  const eleicao = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  if (eleicao.votantes.includes(userId)) {
    return interaction.reply({
      content: "🚫 Você já votou!",
      ephemeral: true
    });
  }

  if (!eleicao.candidatos[candidatoId]) {
    return interaction.reply({
      content: "❌ Candidato inválido.",
      ephemeral: true
    });
  }

  // Registra voto
  eleicao.candidatos[candidatoId].votos += 1;
  eleicao.votantes.push(userId);

  fs.writeFileSync(dataPath, JSON.stringify(eleicao, null, 2));

  await interaction.update({
    content: `✅ **VOTO CONFIRMADO!**\n\n🧑‍💼 Candidato escolhido: **${eleicao.candidatos[candidatoId].nome}**`,
    components: []
  });
};
