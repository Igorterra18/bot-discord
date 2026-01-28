const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require("discord.js");

module.exports = async interaction => {

  const modal = new ModalBuilder()
    .setCustomId("whitelist_modal_2")
    .setTitle("Whitelist • Parte 2");

  const perguntas = [
    ["q6", "O que é Fear RP?", TextInputStyle.Short],
    ["q7", "O que é Combat Log?", TextInputStyle.Short],
    ["q8", "O que é Anti-RP?", TextInputStyle.Short],
    ["q9", "O que é Safe Zone?", TextInputStyle.Short],
    ["q10", "Quebra de RP: como agir?", TextInputStyle.Paragraph]
  ];

  for (const [id, label, style] of perguntas) {
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId(id)
          .setLabel(label) // 👈 ISSO É A PERGUNTA VISÍVEL
          .setStyle(style)
          .setRequired(true)
      )
    );
  }

  // 🚨 PRIMEIRA RESPOSTA = MODAL
  await interaction.showModal(modal);
};
