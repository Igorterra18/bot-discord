const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("adv")
        .setDescription("Aplica uma advertência e gerencia os cargos de punição.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => 
            option.setName("usuario")
                .setDescription("O infrator")
                .setRequired(true))
        .addStringOption(option => 
            option.setName("motivo")
                .setDescription("O motivo da advertência")
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getMember("usuario");
        const motivo = interaction.options.getString("motivo");
        
        // IDs configurados por você
        const canalLogId = "1464779907728146657";
        const cargosAdv = [
            "869637866890866698", // ADV 1
            "869638134525210644", // ADV 2
            "869638223826145310"  // ADV 3
        ];

        if (!target) {
            return interaction.reply({ content: "❌ Membro não encontrado.", ephemeral: true });
        }

        let nivelAtual = 0;
        let proximoCargoId = cargosAdv[0];

        // Verifica qual o nível atual de ADV do usuário
        if (target.roles.cache.has(cargosAdv[2])) {
            return interaction.reply({ content: `❌ ${target} já possui o nível máximo de advertências (ADV 3).`, ephemeral: true });
        } else if (target.roles.cache.has(cargosAdv[1])) {
            nivelAtual = 2;
            proximoCargoId = cargosAdv[2];
        } else if (target.roles.cache.has(cargosAdv[0])) {
            nivelAtual = 1;
            proximoCargoId = cargosAdv[1];
        }

        try {
            // Adiciona o novo cargo
            await target.roles.add(proximoCargoId);

            // Embed de Log para o canal de advertências
            const embedLog = new EmbedBuilder()
                .setColor(0xffa500)
                .setTitle("⚠️ NOVA ADVERTÊNCIA APLICADA")
                .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: "👤 Infrator:", value: `${target} (\`${target.id}\`)`, inline: true },
                    { name: "👮 Staff:", value: `${interaction.user}`, inline: true },
                    { name: "📊 Nível:", value: `ADV ${nivelAtual + 1}`, inline: true },
                    { name: "📝 Motivo:", value: `\`\`\`${motivo}\`\`\`` }
                )
                .setFooter({ text: "Sistema de Gestão Disciplinar" })
                .setTimestamp();

            const canalLog = interaction.guild.channels.cache.get(canalLogId);
            if (canalLog) {
                await canalLog.send({ embeds: [embedLog] });
            }

            return await interaction.reply({ content: `✅ Advertência aplicada com sucesso para ${target}! (Nível ${nivelAtual + 1})`, ephemeral: true });

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "❌ Erro ao aplicar cargo. Verifique se meu cargo está acima dos cargos de ADV.", ephemeral: true });
        }
    },
};