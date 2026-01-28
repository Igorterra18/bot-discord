const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    PermissionFlagsBits, 
    MessageFlags 
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("regras")
        .setDescription("Envia o painel de regras oficial do Brazilian Studio.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const canalTicketId = "860751281714626570";

        const embedRegras = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setAuthor({ 
                name: "───  REGRAS DO BRAZILIAN STUDIO ───", 
                iconURL: interaction.guild.iconURL({ dynamic: true }) 
            })
            .setTitle("📝 MANUAL DE CONDUTA E ROLEPLAY")
            .setDescription(
                "Para manter a nossa comunidade segura e divertida para todos, estabelecemos as seguintes normas. **Leia com atenção!**\n\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                "### ⚖️ 1. CONDUTA GERAL\n" +
                "> • **Respeito acima de tudo:** Ofensas, preconceito, assédio ou discursos de ódio resultarão em banimento imediato.\n" +
                "> • **Toxicidade:** Evite brigas desnecessárias e provocações (flaming).\n\n" +
                "### 💬 2. CHAT E CONTEÚDO\n" +
                "> • **Proibido Spam/Flood:** Não envie mensagens repetitivas ou excesso de emojis.\n" +
                "> • **Sem Conteúdo NSFW:** Proibido qualquer conteúdo adulto, gore ou perturbador.\n" +
                "> • **Links de Terceiros:** Não divulgue outros servidores ou produtos sem permissão prévia.\n\n" +
                "### 🛡️ 3. DIRETRIZES DO DISCORD\n" +
                "> • É obrigatório seguir as [Diretrizes da Comunidade](https://discord.com/guidelines) e os [Termos de Serviço](https://discord.com/terms) do Discord.\n\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            )
            .addFields(
                { 
                    name: "🚨 PUNIÇÕES", 
                    value: "```fix\nWarn ➜ Mute ➜ Kick ➜ Ban\n```", 
                    inline: false 
                },
                { 
                    name: "📌 PRECISA DE AJUDA?", 
                    value: `Caso tenha dúvidas ou queira denunciar algo, abra um ticket em: <#${canalTicketId}>`, 
                    inline: false 
                }
            )
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            // --- INSIRA O LINK DO SEU BANNER ABAIXO ---
            .setImage("https://cdn.discordapp.com/attachments/1251724135650955275/1465136601507168256/image.png?ex=6978024a&is=6976b0ca&hm=cce37e8582c8b680f5889b714f956c0682f40cc7ffcbd86962dadc7f81afee29&") 
            // ------------------------------------------
            .setFooter({ 
                text: `${interaction.guild.name} • A ignorância das regras não justifica sua violação.`, 
                iconURL: interaction.guild.iconURL() 
            })
            .setTimestamp();

        try {
            await interaction.channel.send({ embeds: [embedRegras] });

            return await interaction.reply({ 
                content: "✅ O painel de regras foi publicado com sucesso!", 
                flags: [MessageFlags.Ephemeral] 
            });

        } catch (error) {
            console.error("Erro ao enviar regras:", error);
            if (!interaction.replied) {
                return await interaction.reply({ 
                    content: "❌ Erro ao enviar a embed. Verifique minhas permissões.", 
                    flags: [MessageFlags.Ephemeral] 
                });
            }
        }
    }
};