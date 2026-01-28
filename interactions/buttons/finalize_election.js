// Handler para finalizar eleição manualmente (apenas staff)
const elections = require("../../lib/electionsManager");
const config = require("../../config.json");

module.exports = async function (interaction) {
  try {
    // customId: finalize_election_<id>
    const parts = interaction.customId.split("_");
    if (parts.length < 3) return interaction.reply({ content: "ID inválido.", ephemeral: true });

    const id = parts.slice(2).join("_"); // caso id contenha underscores
    const election = elections.getElection(id);
    if (!election) return interaction.reply({ content: "Eleição não encontrada.", ephemeral: true });

    // checar permissões: usar role do config.staffRoleId se disponível
    const staffRoleId = config.staffRoleId;
    if (staffRoleId) {
      if (!interaction.member.roles.cache.has(staffRoleId)) {
        return interaction.reply({ content: "❌ Apenas staff pode finalizar esta eleição.", ephemeral: true });
      }
    } else {
      // fallback: checar ManageGuild
      if (!interaction.member.permissions.has("ManageGuild")) {
        return interaction.reply({ content: "❌ Você não tem permissão para finalizar esta eleição.", ephemeral: true });
      }
    }

    await elections.endElection(id);
    return interaction.reply({ content: `✅ Eleição \`${id}\` finalizada.`, ephemeral: true });
  } catch (err) {
    console.error("❌ Erro no finalize_election handler:", err);
    try { await interaction.reply({ content: "❌ Erro ao finalizar eleição.", ephemeral: true }); } catch {}
  }
};