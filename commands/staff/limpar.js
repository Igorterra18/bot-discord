const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("limpar")
    .setDescription("Executa a higienização de mensagens do canal (Prefeitura)")
    .addIntegerOption(option =>
      option
        .setName("quantidade")
        .setDescription("Número de mensagens (1-100)")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const quantidade = interaction.options.getInteger("quantidade");

    try {
      // O 'true' serve para filtrar mensagens com mais de 14 dias (limitação do Discord)
      const messages = await interaction.channel.bulkDelete(quantidade, true);

      const embedSucesso = new EmbedBuilder()
        .setColor(0x2b2d31) // Mantendo o cinza escuro premium
        .setAuthor({ 
            name: "DEPARTAMENTO de LIMPEZA URBANA", 
            iconURL: interaction.guild.iconURL() 
        })
        .setTitle("───  🧹  **LIMPEZA CONCLUÍDA** ───")
        .setDescription(
          `O canal passou por um processo de higienização oficial.\n\n` +
          `**Protocolo:** \`#${Math.floor(Math.random() * 9000) + 1000}\`\n` +
          `**Mensagens removidas:** \`${messages.size}\` unidades\n` +
          `**Agente responsável:** ${interaction.user}\n`
        )
        .setFooter({ text: "Este relatório será arquivado (removido) em 5 segundos." })
        .setTimestamp();

      const reply = await interaction.reply({ embeds: [embedSucesso], fetchReply: true });
      
      // Remove a mensagem do bot após 5 segundos para manter o canal limpo
      setTimeout(() => {
        interaction.deleteReply().catch(() => null);
      }, 5000);

    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "❌ **ERRO OPERACIONAL:** Não foi possível limpar mensagens mais antigas que 14 dias ou não tenho permissões suficientes.",
        ephemeral: true
      });
    }
  }
};