const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Adiciona um membro ao ticket atual.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('O usuário que você deseja adicionar')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), // Apenas staff

    async execute(interaction) {
        // Verifica se é um canal de ticket (pelo nome que definimos no index)
        if (!interaction.channel.name.startsWith('ticket-')) {
            return interaction.reply({ content: "❌ Este comando só pode ser usado dentro de um ticket.", ephemeral: true });
        }

        const usuario = interaction.options.getUser('usuario');

        try {
            await interaction.channel.permissionOverwrites.create(usuario, {
                ViewChannel: true,
                SendMessages: true,
                AttachFiles: true,
                ReadMessageHistory: true
            });

            await interaction.reply({ content: `✅ ${usuario} foi adicionado ao ticket com sucesso!` });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Ocorreu um erro ao tentar adicionar o usuário.", ephemeral: true });
        }
    },
};