const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("iniciarwhitelist")
    .setDescription("Envia o painel premium de whitelist")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const cargoPermitido = "1011323891806916619";

    if (!interaction.member.roles.cache.has(cargoPermitido)) {
      return interaction.reply({
        content: "❌ Acesso negado. Apenas membros autorizados podem executar este comando.",
        flags: [MessageFlags.Ephemeral]
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setTitle("🛡️ Sistema de Whitelist")
      .setDescription(
        "Bem-vindo ao nosso sistema de **Whitelist**.\n\n" +
        "Para garantir a melhor experiência em nosso servidor de Roblox, " +
        "precisamos realizar uma breve verificação antes de liberar seu acesso."
      )
      .addFields(
        { name: "✨ Benefícios", value: "• Acesso ao servidor principal\n• Registro de dados salvo\n• Cargos automáticos", inline: true },
        { name: "📝 Requisitos", value: "• Conta Roblox > 30 dias\n• Seguir as diretrizes\n• Respostas claras", inline: true }
      )
      // --- INSIRA O LINK DO SEU BANNER DE WHITELIST ABAIXO ---
      .setImage("https://cdn.discordapp.com/attachments/1251724135650955275/1465134438915510526/bannerwhitelist.png?ex=69780047&is=6976aec7&hm=5844cf383a0b305577dc79a67f214a2dca7994d7a4cdccaf59b2b9c7c1440f3a&")
      // -----------------------------------------------------
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setFooter({ 
        text: `${interaction.guild.name} • Sistema de Whitelist`, 
        iconURL: interaction.guild.iconURL() 
      })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("iniciar_whitelist")
        .setLabel("Começar Whitelist")
        .setEmoji("🚀")
        .setStyle(ButtonStyle.Success)
    );

    try {
      await interaction.reply({ content: "✅ Painel de Whitelist enviado!", flags: [MessageFlags.Ephemeral] });

      await interaction.channel.send({
        embeds: [embed],
        components: [row]
      });

    } catch (error) {
      console.error("❌ Erro ao enviar painel:", error);
    }
  }
};