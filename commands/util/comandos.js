const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    PermissionFlagsBits 
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("comandos")
        .setDescription("Lista completa de todos os comandos do Brazilian Studio."),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setAuthor({ 
                name: "PAINEL DE COMANDOS - BRAZILIAN STUDIO", 
                iconURL: interaction.client.user.displayAvatarURL() 
            })
            .setTitle("🎮 Manual de Funcionalidades do Bot")
            .setDescription(
                "Confira abaixo todos os comandos disponíveis. Os comandos de Staff requerem permissões específicas para serem visualizados e utilizados.\n\n" +
                "---"
            )
            .addFields(
                { 
                    name: "👮 COMANDOS DE STAFF", 
                    value: 
                    "> `/adv` - Aplica uma advertência a um membro.\n" +
                    "> `/advsgeral` - Lista as advertências de todos.\n" +
                    "> `/add` - Adiciona um membro ao ticket atual.\n" +
                    "> `/limpar` - Deleta mensagens em massa do chat.\n" +
                    "> `/revogaradv` - Remove a advertência de um membro.\n" +
                    "> `/anuncio` - Envia um comunicado oficial.\n" +
                    "> `/iniciarwhitelist` - Envia o painel de ingresso.", 
                    inline: false 
                },
                { 
                    name: "👤 COMANDOS DE PLAYER", 
                    value: 
                    "> `/ajuda` - Solicita auxílio da equipe.\n" +
                    "> `/perfil` - Mostra suas informações no servidor.", 
                    inline: true 
                },
                { 
                    name: "⚙️ UTILITÁRIOS", 
                    value: 
                    "> `/comandos` - Exibe esta lista.\n" +
                    "> `/ping` - Verifica a latência do bot.\n" +
                    "> `/regras` - Exibe as diretrizes do servidor.\n" +
                    "> `/ticket-setup` - Configura o painel de suporte.", 
                    inline: true 
                },
                { 
                    name: "🎫 SISTEMA DE TICKET", 
                    value: 
                    "> O sistema funciona via botões. Para iniciar um atendimento, vá ao canal de suporte e clique em **Abrir Ticket**.", 
                    inline: false 
                }
            )
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setFooter({ 
                text: "Brazilian Studio • Tecnologia e Roleplay", 
                iconURL: interaction.guild.iconURL() 
            })
            .setTimestamp();

        try {
            // Enviando publicamente conforme solicitado
            await interaction.channel.send({ embeds: [embed] });

            // Confirmação efêmera para quem executou
            return await interaction.reply({ 
                content: "✅ Lista de comandos enviada com sucesso!", 
                ephemeral: true 
            });

        } catch (error) {
            console.error("Erro ao enviar comando de ajuda:", error);
        }
    }
};