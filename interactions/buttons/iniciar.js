const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require('discord.js');

module.exports = async (interaction) => {
  try {

    // =========================
    // MODAL 1 (Perguntas 1–5)
    // =========================
    const modal1 = new ModalBuilder()
      .setCustomId('whitelist_modal_1')
      .setTitle('Whitelist RP • Parte 1/2');

    const q1 = new TextInputBuilder()
      .setCustomId('q1')
      .setLabel('1️⃣ O que é RP e qual seu objetivo?')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const q2 = new TextInputBuilder()
      .setCustomId('q2')
      .setLabel('2️⃣ O que significa PowerGaming?')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const q3 = new TextInputBuilder()
      .setCustomId('q3')
      .setLabel('3️⃣ O que é MetaGaming?')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const q4 = new TextInputBuilder()
      .setCustomId('q4')
      .setLabel('4️⃣ O que você faria ao presenciar um bug?')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const q5 = new TextInputBuilder()
      .setCustomId('q5')
      .setLabel('5️⃣ O que é Anti-RP?')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal1.addComponents(
      new ActionRowBuilder().addComponents(q1),
      new ActionRowBuilder().addComponents(q2),
      new ActionRowBuilder().addComponents(q3),
      new ActionRowBuilder().addComponents(q4),
      new ActionRowBuilder().addComponents(q5),
    );

    await interaction.showModal(modal1);

  } catch (err) {
    console.error('❌ ERRO NA INTERAÇÃO (MODAL 1):', err);
  }
};
