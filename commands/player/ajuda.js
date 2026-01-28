const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ajuda")
        .setDescription("📚 Central de Atendimento - Comandos personalizados"),

    async execute(interaction) {
        const memberRoles = interaction.member.roles.cache;

        // IDs dos Cargos fornecidos
        const ID_MEMBRO = "868748423459926037";
        const ID_STAFF = "1011323891806916619";
        const IDS_FUNDACAO = ["949403787167154266", "860378470743277579"];

        // Booleanos de verificação
        const eFundacao = IDS_FUNDACAO.some(id => memberRoles.has(id));
        const eStaff = memberRoles.has(ID_STAFF);
        const eMembro = memberRoles.has(ID_MEMBRO);

        const embedAjuda = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setAuthor({ 
                name: "CENTRAL DE AJUDA - PREFEITURA", 
                iconURL: interaction.guild.iconURL() 
            })
            .setTitle("───  🏛️  PAINEL DE SERVIÇOS  ───")
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: "Sistema de Gestão Pública • © 2024", iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        let descricao = "Bem-vindo à Central de Ajuda Oficial. Abaixo você encontra as funções que seu cargo tem acesso.\n\n";

        // CATEGORIA 1: MEMBRO (Sempre aparece se for pelo menos membro)
        if (eMembro || eStaff || eFundacao) {
            descricao += "👤 **SERVIÇOS AO CIDADÃO**\n" +
                         "> `/perfil` - Veja suas informações de cidadania.\n" +
                         "> `/ajuda` - Abre este protocolo de auxílio.\n\n";
        }

        // CATEGORIA 2: STAFF (Aparece para Staff e Fundadores)
        if (eStaff || eFundacao) {
            descricao += "👮 **COMISSARIADO DA STAFF**\n" +
                         "> `/anuncio` - Emite um edital oficial.\n" +
                         "> `/limpar` - Executa a higienização de mensagens.\n" +
                         "> `/iniciarwhitelist` - Configura o painel inicial.\n"; +
                         "> `/aprovar` / `/reprovar` - Gestão de novos cidadãos.\n\n";
        }

        // CATEGORIA 3: FUNDAÇÃO (Apenas Fundador e Co-Fundador)
        if (eFundacao) {
            descricao += "💰 **TESOURARIA E ALTA GESTÃO**\n" +
                         "> `/setdinheiro` - Ajusta o saldo bancário da cidade.\n" +
                         "> `/setcargo` - Nomeia ou exonera funcionários.\n" 
        }

        // Caso a pessoa não tenha nenhum dos cargos acima (segurança)
        if (!eMembro && !eStaff && !eFundacao) {
            descricao = "⚠️ **ERRO:** Você não possui um cargo de cidadão registrado. Entre em contato com a recepção.";
        }

        embedAjuda.setDescription(descricao);

        // Botões de Link (Premium)
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Grupo Roblox')
                .setURL('https://www.roblox.com/pt/communities/11739238/Brazilian-Studio#!/about')
                .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
                .setLabel('Entrar na Cidade')
                .setURL('https://www.roblox.com/games/5325534269/Niteroi-RP')
                .setStyle(ButtonStyle.Link)
        );

        await interaction.reply({ 
            embeds: [embedAjuda], 
            components: [row], 
            ephemeral: true 
        });
    }
};