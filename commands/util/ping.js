const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Verifica a latência do bot e da API."),

    async execute(interaction) {
        // Envia uma resposta inicial para calcular a latência
        const sent = await interaction.reply({ 
            content: "Calculando ping...", 
            fetchReply: true, 
            ephemeral: true 
        });

        const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle("🏓 Pong!")
            .addFields(
                { name: "📶 Latência do Bot", value: `\`${botLatency}ms\``, inline: true },
                { name: "🌐 API do Discord", value: `\`${apiLatency}ms\``, inline: true }
            )
            .setTimestamp();

        return await interaction.editReply({ content: null, embeds: [embed] });
    },
};