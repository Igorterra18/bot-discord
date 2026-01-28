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

    // Remove cargo aprovado
    if (member.roles.cache.has(CARGO_APROVADO)) {
      await member.roles.remove(CARGO_APROVADO);
    }

    // Adiciona cargo reprovado
    await member.roles.add(CARGO_REPROVADO);

   const { EmbedBuilder } = require("discord.js");

const embed = new EmbedBuilder()
  .setColor(0xff3b3b) // vermelho elegante
  .setAuthor({
    name: "Sistema de Whitelist",
    iconURL: interaction.guild.iconURL({ dynamic: true })
  })
  .setTitle("❌ WHITELIST REPROVADA")
  .setDescription(
    `Após análise da equipe, a whitelist do player abaixo **não atingiu os requisitos mínimos**.\n\n` +
    `📌 Não desanime — você poderá **tentar novamente** quando a whitelist for reaberta.`
  )
  .addFields(
    { name: "👤 Player", value: `<@${interaction.user.id}>`, inline: true },
    { name: "📊 Status", value: "🔴 REPROVADO", inline: true },
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
      content: "❌ Whitelist reprovada.",
      embeds: [],
      components: []
    });

  } catch (err) {
    console.error("❌ ERRO REPROVAR:", err);
    if (!interaction.replied) {
      await interaction.reply({
        content: "❌ Erro ao reprovar o jogador.",
        ephemeral: true
      });
    }
  }
};
