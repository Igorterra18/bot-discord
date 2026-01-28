const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Bloqueia o canal para apenas fundadores e cofundadores"),

  async execute(interaction) {
    const canal = interaction.channel;

    // 🔧 COLOQUE OS IDS AQUI
    const FUNDADOR_ID = "860378470743277579";
    const COFUNDADOR_ID = "949403787167154266";

    // Permissões do @everyone
    await canal.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: false
    });

    // Permissões do Fundador
    await canal.permissionOverwrites.edit(FUNDADOR_ID, {
      SendMessages: true
    });

    // Permissões do Co-Fundador
    await canal.permissionOverwrites.edit(COFUNDADOR_ID, {
      SendMessages: true
    });

    await interaction.reply({
      content: "🔒 **Canal bloqueado!**\nApenas **Fundadores** e **Co-Fundadores** podem enviar mensagens.",
      ephemeral: false
    });
  }
};
