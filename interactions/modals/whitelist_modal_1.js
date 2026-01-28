const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = async interaction => {
  try {
    // aqui você pode salvar respostas no banco ou memória
    // interaction.fields.getTextInputValue("q1") etc

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("continuar_whitelist")
        .setLabel("➡️ Continuar Whitelist (Parte 2)")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      content: "✅ Parte 1 enviada com sucesso.\nClique abaixo para continuar a whitelist.",
      components: [row],
      flags: 64 // ephemeral
    });

  } catch (err) {
    console.error("❌ ERRO MODAL 1:", err);
  }
};
