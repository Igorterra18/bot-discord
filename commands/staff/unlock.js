const {
  SlashCommandBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Desbloqueia o canal e permite mensagens para todos"),

  async execute(interaction) {
    const canal = interaction.channel;

    // Remove o bloqueio do @everyone
    await canal.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      { SendMessages: null }
    );

    await interaction.reply({
      content: "🔓 **Canal desbloqueado!**\nTodos agora podem enviar mensagens normalmente.",
      ephemeral: false
    });
  }
};
