const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("perfil")
    .setDescription("🪪 Visualiza sua Carteira de Identidade e saldo bancário."),

  async execute(interaction) {
    const { user, member, guild } = interaction;

    // Simulação de saldo (Aqui você integraria com seu banco de dados futuramente)
    // Se você já tiver o sistema de setdinheiro, buscaria o valor salvo aqui.
    const saldoFake = "R$ 5.000,00"; 

    const embedPerfil = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setAuthor({ 
        name: `REGISTRO GERAL de: ${user.username.toUpperCase()}`, 
        iconURL: guild.iconURL() 
      })
      .setTitle("───  🏛️  IDENTIDADE GOVERNAMENTAL  ───")
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
      .setDescription(
        `🏛️ **Estado:** Rio de Janeiro (RP)\n` +
        `👤 **Nome Social:** ${member.displayName}\n` +
        `🆔 **Registro (ID):** \`${user.id}\`\n` +
        `📅 **Cidadão desde:** <t:${Math.floor(member.joinedTimestamp / 1000)}:D>\n\n` +
        `───  💰  **FINANCEIRO** ───\n` +
        `👛 **Saldo em Carteira:** \`${saldoFake}\`\n` +
        `💳 **Status da Conta:** Ativa\n\n` +
        `───  👮  **OCUPAÇÃO** ───\n` +
        `💼 **Cargo Atual:** ${member.roles.highest}`
      )
      .addFields({ 
        name: "📜 Certificação", 
        value: "Este documento comprova a residência e legalidade do cidadão perante a Prefeitura.",
        inline: false 
      })
      .setFooter({ 
        text: `Consultado por: ${user.tag}`, 
        iconURL: user.displayAvatarURL() 
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embedPerfil] });
  }
};