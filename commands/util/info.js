const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    MessageFlags 
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Conheça a história e os detalhes do nosso Roleplay."),

    async execute(interaction) {
        const embedInfo = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setAuthor({ 
                name: "BRAZILIAN STUDIO - INFORMAÇÕES OFICIAIS", 
                iconURL: interaction.guild.iconURL({ dynamic: true }) 
            })
            .setTitle("🌆 Nossa História & Inspiração")
            .setDescription(
                "O **Brazilian Studio** não é apenas um servidor, é um projeto construído com dedicação e focado na imersão máxima do Roleplay brasileiro.\n\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                "### 📅 Trajetória\n" +
                "Iniciamos nossa jornada em **2021**. Desde então, evoluímos nossa programação, nossos mapas e nossa comunidade para entregar a melhor experiência no Roblox.\n\n" +
                "### 📍 Ambientação: Niterói\n" +
                "Nosso mapa e nossas diretrizes são baseados na cidade de **Niterói, RJ**. Buscamos trazer o realismo das ruas, a organização das corporações e a vibe única da 'Cidade Sorriso' para dentro do jogo.\n\n" +
                "### 🤝 Nosso Objetivo\n" +
                "Proporcionar um ambiente onde o Roleplay seja levado a sério, com sistemas inovadores e uma Staff presente e justa.\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            )
            .addFields(
                { name: "🕒 Fundado em", value: "Janeiro de 2021", inline: true },
                { name: "🏢 Localização RP", value: "Niterói, RJ", inline: true },
                { name: "👥 Comunidade", value: `${interaction.guild.memberCount} Membros`, inline: true }
            )
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            // --- INSIRA O LINK DO SEU BANNER DE NITERÓI/MAPA ABAIXO ---
            .setImage("COLOQUE_O_LINK_DO_BANNER_AQUI")
            // ---------------------------------------------------------
            .setFooter({ 
                text: "Brazilian Studio • Transformando o RP desde 2021", 
                iconURL: interaction.guild.iconURL() 
            })
            .setTimestamp();

        try {
            // Enviando publicamente para que todos possam ler sobre o projeto
            await interaction.channel.send({ embeds: [embedInfo] });

            return await interaction.reply({ 
                content: "✅ Informações do servidor enviadas com sucesso!", 
                flags: [MessageFlags.Ephemeral] 
            });

        } catch (error) {
            console.error("Erro no comando info:", error);
        }
    }
};