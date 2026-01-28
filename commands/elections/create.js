const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const elections = require("../../lib/electionsManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("election")
    .setDescription("Gerenciar eleições")
    .addSubcommand(sub =>
      sub
        .setName("create")
        .setDescription("Criar uma nova eleição")
        .addStringOption(opt => opt.setName("title").setDescription("Título da eleição").setRequired(true))
        .addStringOption(opt => opt.setName("options").setDescription("Opções separadas por | (ex: Sim|Não|Talvez)").setRequired(true))
        .addIntegerOption(opt => opt.setName("duration").setDescription("Duração em minutos (deixe vazio para sem tempo)"))
        .addBooleanOption(opt => opt.setName("anonymous").setDescription("Votação anônima (não mostra contagens em tempo real)").setRequired(false))
    )
    .addSubcommand(sub =>
      sub
        .setName("end")
        .setDescription("Encerrar manualmente uma eleição")
        .addStringOption(opt => opt.setName("id").setDescription("ID da eleição").setRequired(true))
    )
    .addSubcommand(sub =>
      sub
        .setName("results")
        .setDescription("Mostrar resultados de uma eleição")
        .addStringOption(opt => opt.setName("id").setDescription("ID da eleição").setRequired(true))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === "create") {
      const title = interaction.options.getString("title");
      const optionsRaw = interaction.options.getString("options");
      const duration = interaction.options.getInteger("duration");
      const anonymous = interaction.options.getBoolean("anonymous") || false;

      const options = optionsRaw.split("|").map(s => s.trim()).filter(Boolean);
      if (options.length < 2) {
        return interaction.reply({ content: "❌ Forneça ao menos 2 opções separadas por `|`.", ephemeral: true });
      }
      if (options.length > 25) {
        return interaction.reply({ content: "❌ Máximo de 25 opções permitido.", ephemeral: true });
      }

      await interaction.deferReply({ ephemeral: true });

      const election = await elections.createElection({
        guildId: interaction.guildId,
        channelId: interaction.channelId,
        title,
        options,
        durationMinutes: duration,
        anonymous,
        authorId: interaction.user.id
      });

      // montar embed
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(0x2b2d31)
        .setFooter({ text: `Eleição ${election.id}` })
        .setTimestamp(new Date(election.createdAt));

      let description = "";
      options.forEach((opt, i) => {
        description += `**${i + 1}. ${opt}**\n`;
      });
      if (election.endsAt) description += `\nFinaliza em: <t:${Math.floor(new Date(election.endsAt).getTime() / 1000)}:R>`;

      embed.setDescription(description);

      // criar botões (até 25 => quebra em rows)
      const rows = [];
      const perRow = 5;
      for (let i = 0; i < options.length; i += perRow) {
        const slice = options.slice(i, i + perRow);
        const row = new ActionRowBuilder();
        slice.forEach((opt, idx) => {
          const btn = new ButtonBuilder()
            .setCustomId(`vote_${election.id}_${i + idx}`)
            .setLabel(`${i + idx + 1}`)
            .setStyle(ButtonStyle.Primary);
          row.addComponents(btn);
        });
        rows.push(row);
      }

      // adicionar botão de finalizar (apenas staff deverá poder usar)
      const finalRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`finalize_election_${election.id}`).setLabel("Finalizar (Staff)").setStyle(ButtonStyle.Danger)
      );
      rows.push(finalRow);

      const sent = await interaction.channel.send({ embeds: [embed], components: rows }).catch(err => {
        console.error("❌ Erro enviando mensagem de eleição:", err);
        return null;
      });

      if (!sent) {
        return interaction.editReply({ content: "❌ Falha ao criar a eleição (permissões?)." });
      }

      await elections.attachMessage(election.id, sent.id);

      return interaction.editReply({ content: `✅ Eleição criada com sucesso! ID: \`${election.id}\`` });
    }

    if (sub === "end") {
      const id = interaction.options.getString("id");
      // check staff role from config if available
      const config = require("../../config.json");
      const staffRoleId = config.staffRoleId;
      if (staffRoleId && !interaction.member.roles.cache.has(staffRoleId) && !interaction.member.permissions.has("ManageGuild")) {
        return interaction.reply({ content: "❌ Apenas staff ou administrador pode encerrar eleições.", ephemeral: true });
      }

      try {
        await elections.endElection(id);
        return interaction.reply({ content: `✅ Eleição \`${id}\` encerrada (se estava ativa).`, ephemeral: true });
      } catch (err) {
        return interaction.reply({ content: `❌ Erro ao encerrar: ${err.message}`, ephemeral: true });
      }
    }

    if (sub === "results") {
      const id = interaction.options.getString("id");
      const e = elections.getElection(id);
      if (!e) return interaction.reply({ content: "❌ Eleição não encontrada.", ephemeral: true });
      // compute counts
      const counts = e.options.map((_, i) => Object.values(e.votes || {}).filter(v => v === i).length);
      const total = Object.keys(e.votes || {}).length;
      let text = `Total de votos: **${total}**\n\n`;
      e.options.forEach((opt, i) => {
        text += `**${i + 1}. ${opt}** — ${counts[i]} voto(s)\n`;
      });
      return interaction.reply({ embeds: [{ title: `Resultados — ${e.title}`, description: text }], ephemeral: true });
    }
  }
};