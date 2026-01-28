const { EmbedBuilder } = require("discord.js");

const CARGO_APROVADO = "1014883531442372668";
const CARGO_REPROVADO = "1018496767689494558";
const CANAL_RESULTADOS = "1464718137755828235";

module.exports = async (interaction) => {
  try {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const canal = interaction.guild.channels.cache.get(CANAL_RESULTADOS);

    if (!canal) {
      return interaction.reply({
        content: "❌ Canal de resultados não encontrado.",
        ephemeral: true
      });
    }

    // Remove cargo reprovado se existir
    if (member.roles.cache.has(CARGO_REPROVADO)) {
      await member.roles.remove(CARGO_REPROVADO);
    }

    // Adiciona cargo aprovado
    await member.roles.add(CARGO_APROVADO);

    const { EmbedBuilder } = require("discord.js");

    const embed = new EmbedBuilder()
     .setColor(0x00ff88) // verde elegante
     .setAuthor({
     name: "Sistema de Whitelist",
     iconURL: interaction.guild.iconURL({ dynamic: true })
  })
     .setTitle("✅ WHITELIST APROVADA")
     .setDescription(
      `Parabéns! Após análise criteriosa, o player abaixo foi **APROVADO**.\n\n` +
     `📌 Seja bem-vindo(a) ao servidor e **mantenha o RP sério e imersivo**.`
  )
     .addFields(
     { name: "👤 Player", value: `<@${interaction.user.id}>`, inline: true },
     { name: "📊 Status", value: "🟢 APROVADO", inline: true },
     { name: "🕒 Data", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
  )
     .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
     .setFooter({
     text: "Brazilian Studio • RP Sério",
     iconURL: interaction.guild.iconURL({ dynamic: true })
  })
     .setTimestamp();

     // Envia no canal de resultados
     await canal.send({ embeds: [embed] });

     // Atualiza a mensagem original
     await interaction.update({
      content: "✅ Whitelist aprovada com sucesso.",
      embeds: [],
      components: []
    });

  } catch (err) {
    console.error("❌ ERRO APROVAR:", err);
    if (!interaction.replied) {
      await interaction.reply({
        content: "❌ Erro ao aprovar o jogador.",
        ephemeral: true
      });
    }
  }
};
