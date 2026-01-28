const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ticket-setup")
        .setDescription("Envia o painel de suporte para tickets.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // ID do canal onde o botão vai ficar (conforme você passou)
        const canalPainelId = "860751281714626570";

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle("🏛️ CENTRAL DE ATENDIMENTO")
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setDescription(
                "Precisa de suporte, realizar uma denúncia ou tirar dúvidas?\n\n" +
                "**Como funciona?**\n" +
                "1️⃣ Clique no botão abaixo.\n" +
                "2️⃣ Um canal privado será aberto para você.\n" +
                "3️⃣ Aguarde a nossa equipe de staff atendê-lo.\n\n" +
                "*Evite abrir tickets sem necessidade para não ser punido.*"
            )
            .setFooter({ text: "Brazilian Studio • Sistema de Tickets", iconURL: interaction.guild.iconURL() });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("abrir_ticket")
                .setLabel("Abrir Atendimento")
                .setEmoji("📩")
                .setStyle(ButtonStyle.Secondary)
        );

        // Verifica se está no canal certo
        if (interaction.channel.id !== canalPainelId) {
            return interaction.reply({ content: `❌ Este comando deve ser usado no canal <#${canalPainelId}>`, ephemeral: true });
        }

        await interaction.channel.send({ embeds: [embed], components: [row] });
        return interaction.reply({ content: "✅ Painel de tickets instalado com sucesso!", ephemeral: true });
    },
};