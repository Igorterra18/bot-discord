const {
  Client,
  Collection,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("./config.json");

// election manager
const elections = require("./lib/electionsManager");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// =======================
// VALIDAÇÕES INICIAIS
// =======================
if (!process.env.TOKEN) {
  console.error("❌ TOKEN não encontrada na variável de ambiente.");
  process.exit(1);
}
const ID_STAFF = config.staffRoleId;
const ID_CANAL_LOGS = config.logsChannelId;

// =======================
// COLEÇÕES
// =======================
client.commands = new Collection();
client.anuncioTemp = new Map(); // cache temporário de imagens

// =======================
// CARREGAMENTO DE COMANDOS
// =======================
const commandsPath = path.join(__dirname, "commands");
if (fs.existsSync(commandsPath)) {
  const commandFolders = fs.readdirSync(commandsPath);
  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    if (!fs.lstatSync(folderPath).isDirectory()) continue;

    const commandFiles = fs
      .readdirSync(folderPath)
      .filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      try {
        const command = require(filePath);
        if (command && command.data && command.data.name) {
          client.commands.set(command.data.name, command);
        } else {
          console.warn(`⚠️ Comando inválido ou sem nome: ${filePath}`);
        }
      } catch (err) {
        console.error(`❌ Erro ao carregar comando ${filePath}:`, err);
      }
    }
  }
} else {
  console.warn("⚠️ Pasta ./commands não encontrada — nenhum comando foi carregado.");
}

// =======================
// BOT ONLINE
// =======================
client.once(Events.ClientReady, () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);
  // inicializa electionsManager após o bot estar pronto (guild cache disponível)
  try {
    elections.init(client);
  } catch (err) {
    console.error("❌ Falha ao inicializar electionsManager:", err);
  }
});

// Helper: verifica se o bot tem permissões de canal necessárias
function botHasGuildPermissions(guild, permissions) {
  try {
    const me = guild.members.me; // GuildMember do bot
    if (!me) return false;
    return me.permissions.has(permissions);
  } catch {
    return false;
  }
}

// Função auxiliar (reuso)
const tryRunHandler = (handlerPath, interaction) => {
  const full = path.join(__dirname, handlerPath);
  if (!fs.existsSync(full)) {
    console.warn(`⚠️ Handler não encontrado: ${full}`);
    return null;
  }
  try {
    const handler = require(full);
    if (typeof handler === "function") return handler(interaction);
    else {
      console.warn(`⚠️ Handler não é função: ${full}`);
      return null;
    }
  } catch (err) {
    console.error(`❌ Erro carregando handler ${full}:`, err);
    return null;
  }
};

// =======================
// INTERAÇÕES
// =======================
client.on(Events.InteractionCreate, async interaction => {
  try {
    // =======================
    // 1️⃣ SLASH COMMANDS
    // =======================
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        return await command.execute(interaction);
      } catch (err) {
        console.error("❌ Erro executando comando:", err);
        if (interaction.replied || interaction.deferred) {
          await interaction.editReply({ content: "❌ Ocorreu um erro ao executar o comando." }).catch(() => {});
        } else {
          await interaction.reply({ content: "❌ Ocorreu um erro ao executar o comando.", ephemeral: true }).catch(() => {});
        }
      }
    }

    // =======================
    // 2️⃣ BOTÕES
    // =======================
    if (interaction.isButton()) {
      const cid = interaction.customId || "";

      // ---- Eleição: voto / finalizar ----
      if (cid.startsWith("vote_"))
        return tryRunHandler("./interactions/buttons/vote.js", interaction);

      if (cid.startsWith("finalize_election_"))
        return tryRunHandler("./interactions/buttons/finalize_election.js", interaction);

      // --- WHITELIST ---
      if (cid === "iniciar_whitelist")
        return tryRunHandler("./interactions/buttons/iniciar.js", interaction);

      if (cid === "finalizar_whitelist")
        return tryRunHandler("./interactions/buttons/finalizar.js", interaction);

      if (cid === "continuar_whitelist")
        return tryRunHandler("./interactions/buttons/continuar.js", interaction);

      if (cid.startsWith("aprovar_"))
        return tryRunHandler("./interactions/buttons/aprovar.js", interaction);

      if (cid.startsWith("recusar_"))
        return tryRunHandler("./interactions/buttons/recusar.js", interaction);

      // --- TICKET ---
      if (cid === "abrir_ticket") {
        // Checa se bot tem permissão para criar canais
        if (!botHasGuildPermissions(interaction.guild, PermissionFlagsBits.ManageChannels)) {
          return interaction.reply({ content: "❌ Eu não tenho permissão para criar canais. Peça para um administrador ajustar minhas permissões.", ephemeral: true });
        }

        const ticketName = `ticket-${interaction.user.id}`;
        const ticketExistente = interaction.guild.channels.cache.find(
          c => c.name === ticketName
        );

        if (ticketExistente)
          return interaction.reply({
            content: `❌ Você já tem um ticket aberto em ${ticketExistente}!`,
            ephemeral: true
          });

        await interaction.deferReply({ ephemeral: true }).catch(() => {});

        let canal;
        try {
          canal = await interaction.guild.channels.create({
            name: ticketName,
            type: ChannelType.GuildText,
            permissionOverwrites: [
              { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
              { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
              { id: ID_STAFF, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ],
            reason: `Ticket aberto por ${interaction.user.tag}`
          });
        } catch (err) {
          console.error("❌ Erro criando canal de ticket:", err);
          return interaction.editReply({ content: "❌ Falha ao criar o ticket. Verifique minhas permissões." }).catch(() => {});
        }

        const embedPainel = new EmbedBuilder()
          .setColor(0x2b2d31)
          .setTitle("🛠️ PAINEL DE CONTROLE DO TICKET")
          .setDescription(
            `Olá ${interaction.user}, bem-vindo ao suporte.\n\n` +
            "**Status:** 🟢 Aguardando Staff\n\n" +
            "> 🔒 **Fechar:** Você pode fechar até um Staff assumir.\n" +
            "> 🔔 **Avisar:** Notifica a equipe novamente."
          )
          .setFooter({ text: "Brazilian Studio - Suporte Privado" })
          .setTimestamp();

        const botoes = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("fechar_membro").setLabel("Fechar").setEmoji("🔒").setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId("assumir_ticket").setLabel("Assumir").setEmoji("👮").setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId("avisar_staff_ticket").setLabel("Avisar").setEmoji("🔔").setStyle(ButtonStyle.Primary)
        );

        await canal.send({
          content: `||<@${interaction.user.id}> | <@&${ID_STAFF}>||`,
          embeds: [embedPainel],
          components: [botoes]
        }).catch(err => console.error("❌ Erro enviando mensagem no canal do ticket:", err));

        return interaction.editReply({ content: `✅ Ticket criado: ${canal}` }).catch(() => {});
      }

      if (cid === "assumir_ticket") {
        // valida role do staff
        if (!ID_STAFF || !interaction.member.roles.cache.has(ID_STAFF))
          return interaction.reply({ content: "❌ Apenas Staff pode assumir.", ephemeral: true });

        const embedAssumido = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle("👮 TICKET ASSUMIDO")
          .setDescription(`Atendido por: ${interaction.user}`)
          .setFooter({ text: "Brazilian Studio" });

        const botoesStaff = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("fechar_ticket_staff").setLabel("Encerrar").setEmoji("🔒").setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId("add_membro_ticket").setLabel("Membros").setEmoji("👤").setStyle(ButtonStyle.Secondary)
        );

        await interaction.update({ embeds: [embedAssumido], components: [botoesStaff] }).catch(() => {});
        return interaction.channel.send(`✅ ${interaction.user} assumiu o ticket.`).catch(() => {});
      }

      if (cid === "fechar_membro") {
        if (!interaction.channel || !interaction.channel.name.includes(interaction.user.id))
          return interaction.reply({ content: "❌ Ticket não é seu.", ephemeral: true });

        await interaction.reply("🔒 Fechando ticket em 5 segundos...").catch(() => {});
        return setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
      }

      if (cid === "fechar_ticket_staff") {
        if (!ID_STAFF || !interaction.member.roles.cache.has(ID_STAFF))
          return interaction.reply({ content: "❌ Apenas Staff pode fechar.", ephemeral: true });

        await interaction.reply("🔒 Ticket encerrado.").catch(() => {});
        return setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
      }

      if (cid === "avisar_staff_ticket") {
        await interaction.reply({ content: "🔔 Staff avisada!", ephemeral: true }).catch(() => {});
        return interaction.channel.send(`<@&${ID_STAFF}> suporte solicitado por ${interaction.user}!`).catch(() => {});
      }
    }

    // =======================
    // 3️⃣ SELECT MENUS
    // =======================
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "votar_menu") {
        return tryRunHandler("./interactions/buttons/votar_select.js", interaction);
      }
    }

    // =======================
    // 4️⃣ MODAIS
    // =======================
    if (interaction.isModalSubmit()) {
      if (interaction.customId === "modal_anuncio") {
        const titulo = interaction.fields.getTextInputValue("titulo_anuncio");
        const assunto = interaction.fields.getTextInputValue("assunto_anuncio");
        const texto = interaction.fields.getTextInputValue("texto_anuncio");
        const imagemUrl = client.anuncioTemp.get(interaction.user.id);

        const embed = new EmbedBuilder()
          .setColor(0x2b2d31)
          .setAuthor({ name: "SISTEMA DE COMUNICAÇÃO OFICIAL", iconURL: interaction.guild?.iconURL?.() || null })
          .setTitle(`🏛️ ${titulo}`)
          .setDescription(`**Assunto:** ${assunto}\n\n${texto}`)
          .setFooter({ text: "Brazilian Studio" })
          .setTimestamp();

        if (imagemUrl) embed.setImage(imagemUrl);

        client.anuncioTemp.delete(interaction.user.id);

        await interaction.channel.send({ embeds: [embed] }).catch(err => console.error("❌ Erro ao enviar anúncio:", err));
        return interaction.reply({ content: "✅ Anúncio publicado!", ephemeral: true }).catch(() => {});
      }

      // Whitelist modals
      if (interaction.customId === "whitelist_modal_1") {
        return tryRunHandler("./interactions/modals/whitelist_modal_1.js", interaction);
      }

      if (interaction.customId === "whitelist_modal_2") {
        return tryRunHandler("./interactions/modals/whitelist_modal_2.js", interaction);
      }
    }

  } catch (err) {
    console.error("❌ ERRO NA INTERAÇÃO:", err);
    // Não propagar exceções para evitar crash do processo
  }
});

// =======================
// LOGIN
// =======================
client.login(process.env.TOKEN).catch(err => {
  console.error("❌ Falha ao logar o bot:", err);
  process.exit(1);
});
