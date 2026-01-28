const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

const API = "https://expressly-noninclusive-bea.ngrok-free.dev";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("vincular")
        .setDescription("Vincular Roblox ao Discord")
        .addStringOption(opt =>
            opt.setName("codigo")
               .setDescription("Código do Roblox")
               .setRequired(true)
        ),

    async execute(interaction) {
        const codigo = interaction.options.getString("codigo");

        try {
            await axios.post(`${API}/discord/vincular`, {
                codigo,
                discordId: interaction.user.id
            });

            await interaction.reply({
                content: "✅ Conta vinculada com sucesso!",
                ephemeral: true
            });

        } catch {
            await interaction.reply({
                content: "❌ Código inválido ou já usado.",
                ephemeral: true
            });
        }
    }
};
