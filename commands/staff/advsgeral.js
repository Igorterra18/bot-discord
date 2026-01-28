const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("advsgeral")
        .setDescription("Exibe a listagem luxuosa de todos os membros advertidos.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        // 1. Ganhar tempo para processar todos os membros do servidor
        await interaction.deferReply({ ephemeral: false });

        const cargosAdv = [
            "869637866890866698", // ADV 1
            "869638134525210644", // ADV 2
            "869638223826145310"  // ADV 3
        ];

        try {
            // 2. Buscar todos os membros do servidor para garantir precisão
            const membros = await interaction.guild.members.fetch();
            const advertidos = membros.filter(m => m.roles.cache.some(r => cargosAdv.includes(r.id)));

            if (advertidos.size === 0) {
                return interaction.editReply({ content: "✨ **Nenhum registro de infração encontrado. O servidor está limpo!**" });
            }

            // 3. Montar a lista formatada
            let listaMembros = "";
            advertidos.forEach(membro => {
                let nivel = 0;
                if (membro.roles.cache.has(cargosAdv[2])) nivel = 3;
                else if (membro.roles.cache.has(cargosAdv[1])) nivel = 2;
                else if (membro.roles.cache.has(cargosAdv[0])) nivel = 1;

                const medalha = nivel === 3 ? "🔴" : nivel === 2 ? "🟠" : "🟡";
                listaMembros += `${medalha} **${membro.user.username}** \`[ADV ${nivel}]\` - <@${membro.id}>\n`;
            });

            // 4. Criar a Embed Premium
            const embedLuxo = new EmbedBuilder()
                .setColor(0x2b2d31) // Cinza Escuro Luxo
                .setAuthor({ 
                    name: `RELATÓRIO DISCIPLINAR - ${interaction.guild.name.toUpperCase()}`, 
                    iconURL: interaction.guild.iconURL({ dynamic: true }) 
                })
                .setTitle("🏛️ LISTAGEM GERAL DE ADVERTÊNCIAS")
                .setDescription(
                    `Abaixo estão listados todos os cidadãos que possuem registros ativos de penalidades disciplinares no servidor.\n\n` +
                    `${listaMembros}`
                )
                .addFields({ 
                    name: "📊 Estatísticas", 
                    value: `Atualmente existem **${advertidos.size}** membros sob monitoramento da corregedoria.`, 
                    inline: false 
                })
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setFooter({ 
                    text: "Administração e Corregedoria • Gestão de Comportamento", 
                    iconURL: interaction.client.user.displayAvatarURL() 
                })
                .setTimestamp();

            return await interaction.editReply({ embeds: [embedLuxo] });

        } catch (error) {
            console.error(error);
            return interaction.editReply({ content: "❌ Ocorreu um erro ao gerar o relatório geral." });
        }
    },
};