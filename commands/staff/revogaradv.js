const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("revogaradv")
        .setDescription("Remove níveis de advertência de um usuário.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => 
            option.setName("usuario")
                .setDescription("O usuário que terá as advertências removidas")
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName("quantidade")
                .setDescription("Quantidade de ADVs a remover (1 a 3)")
                .setMinValue(1)
                .setMaxValue(3)
                .setRequired(true)),

    async execute(interaction) {
        // 1. AVISAR O DISCORD QUE VAMOS DEMORAR (Evita o erro 10062)
        await interaction.deferReply({ ephemeral: true });

        const target = interaction.options.getMember("usuario");
        const quantidade = interaction.options.getInteger("quantidade");
        
        const canalLogId = "1464779907728146657";
        const cargosAdv = [
            "869637866890866698", // ADV 1
            "869638134525210644", // ADV 2
            "869638223826145310"  // ADV 3
        ];

        if (!target) {
            return interaction.editReply({ content: "❌ Membro não encontrado." });
        }

        try {
            let removidos = [];

            // Lógica de remoção
            if (quantidade === 3) {
                for (const id of cargosAdv) {
                    if (target.roles.cache.has(id)) {
                        await target.roles.remove(id);
                        removidos.push(id);
                    }
                }
            } else {
                let removidosAgora = 0;
                // Percorre do ADV mais alto para o mais baixo
                for (let i = cargosAdv.length - 1; i >= 0; i--) {
                    if (target.roles.cache.has(cargosAdv[i]) && removidosAgora < quantidade) {
                        await target.roles.remove(cargosAdv[i]);
                        removidos.push(cargosAdv[i]);
                        removidosAgora++;
                    }
                }
            }

            if (removidos.length === 0) {
                return interaction.editReply({ content: `❌ O usuário ${target} não possui cargos de ADV para remover.` });
            }

            // Log no canal
            const embedLog = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle("✅ ADVERTÊNCIA REVOGADA")
                .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: "👤 Usuário:", value: `${target}`, inline: true },
                    { name: "👮 Revogado por:", value: `${interaction.user}`, inline: true },
                    { name: "📉 Quantidade:", value: `${removidos.length} nível(is)`, inline: true }
                )
                .setTimestamp();

            const canalLog = interaction.guild.channels.cache.get(canalLogId);
            if (canalLog) await canalLog.send({ embeds: [embedLog] });

            // RESPOSTA FINAL (Usa editReply porque já demos defer)
            return await interaction.editReply({ content: `✅ Sucesso! Removido(s) ${removidos.length} cargo(s) de ADV de ${target}.` });

        } catch (error) {
            console.error(error);
            return interaction.editReply({ content: "❌ Erro ao processar. Verifique minha hierarquia de cargos." });
        }
    },
};