// Handler para botões de voto
const elections = require("../../lib/electionsManager");

module.exports = async function (interaction) {
  try {
    // customId: vote_<electionId>_<optionIndex>
    const parts = interaction.customId.split("_");
    if (parts.length < 3) return interaction.reply({ content: "ID inválido.", ephemeral: true });

    const electionId = parts[1];
    const optionIndex = Number(parts[2]);

    const election = elections.getElection(electionId);
    if (!election) return interaction.reply({ content: "Eleição não encontrada.", ephemeral: true });
    if (!election.active) return interaction.reply({ content: "Eleição já foi finalizada.", ephemeral: true });

    try {
      await elections.addVote(electionId, interaction.user.id, optionIndex);
      return interaction.reply({ content: `✅ Seu voto para **${election.options[optionIndex]}** foi registrado.`, ephemeral: true });
    } catch (err) {
      return interaction.reply({ content: `❌ Não foi possível votar: ${err.message}`, ephemeral: true });
    }
  } catch (err) {
    console.error("❌ Erro no handler vote:", err);
    try { await interaction.reply({ content: "❌ Erro ao processar voto.", ephemeral: true }); } catch {}
  }
};