const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

const API_URL = "https://expressly-noninclusive-bea.ngrok-free.dev";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("saldo")
        .setDescription("Ver seu saldo bancário"),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const { data } = await axios.post(`${API_URL}/discord/saldo`, {
                discordId: interaction.user.id
            });

            const embed = new EmbedBuilder()
                .setColor(0x2ecc71)
                .setTitle("💰 Seu Saldo")
                .addFields(
                    { name: "💵 Carteira", value: `$${data.carteira}`, inline: true },
                    { name: "🏦 Banco", value: `$${data.banco}`, inline: true }
                )
                .setFooter({ text: "Banco RP" })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            await interaction.editReply({
                content: "❌ Não foi possível obter seu saldo. Sua conta está vinculada?",
            });
        }
    }
};
