const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");
const config = require("../../config.json");

module.exports = async (interaction) => {
  const data = interaction.client.tempWhitelist[interaction.user.id];
  if (!data) return;

  const embed = new EmbedBuilder()
    .setTitle("📋 Whitelist")
    .setDescription(
      `👤 **Usuário:** ${interaction.user.username}\n` +
      `🎯 **Acertos:** ${data.acertos} / ${data.minimo}`
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`aprovar_${interaction.user.id}`)
      .setLabel("Aprovar")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`recusar_${interaction.user.id}`)
      .setLabel("Recusar")
      .setStyle(ButtonStyle.Danger)
  );

  const channel = interaction.guild.channels.cache.get(
    config.staffWhitelistChannelId
  );

  await channel.send({ embeds: [embed], components: [row] });

  await interaction.channel.delete();
};
