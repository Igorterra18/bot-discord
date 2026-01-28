const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  PermissionFlagsBits
} = require("discord.js");
const config = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("anuncio")
    .setDescription("Abre o painel de comunicados oficiais da Prefeitura")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addAttachmentOption(option =>
      option
        .setName("imagem")
        .setDescription("Imagem do comunicado (opcional)")
        .setRequired(false)
    ),

  async execute(interaction) {
    // =========================
    // 🔒 VERIFICAÇÃO DE STAFF
    // =========================
    if (!interaction.member.roles.cache.has(config.staffRoleId)) {
      return interaction.reply({
        content: "⚠️ **ACESSO RESTRITO:** Apenas Staff pode emitir comunicados oficiais.",
        ephemeral: true
      });
    }

    // =========================
    // 📸 CAPTURA DA IMAGEM
    // =========================
    const imagem = interaction.options.getAttachment("imagem");

    // Cache temporário (usado no modal)
    interaction.client.anuncioTemp ??= new Map();
    interaction.client.anuncioTemp.set(
      interaction.user.id,
      imagem ? imagem.url : null
    );

    // =========================
    // 🏛️ MODAL DE ANÚNCIO
    // =========================
    const modal = new ModalBuilder()
      .setCustomId("modal_anuncio")
      .setTitle("🏛️ SISTEMA DE COMUNICAÇÃO OFICIAL");

    // TÍTULO
    const tituloInput = new TextInputBuilder()
      .setCustomId("titulo_anuncio")
      .setLabel("TÍTULO DO EDITAL / AVISO")
      .setPlaceholder("Ex: DECRETO Nº 042 - NOVAS REGRAS")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(80)
      .setRequired(true);

    // ASSUNTO
    const assuntoInput = new TextInputBuilder()
      .setCustomId("assunto_anuncio")
      .setLabel("PAUTA OU CATEGORIA")
      .setPlaceholder("Ex: Segurança Pública, Economia...")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(50)
      .setRequired(true);

    // TEXTO
    const textoInput = new TextInputBuilder()
      .setCustomId("texto_anuncio")
      .setLabel("CONTEÚDO DO COMUNICADO")
      .setPlaceholder("Descreva detalhadamente o comunicado oficial...")
      .setStyle(TextInputStyle.Paragraph)
      .setMinLength(10)
      .setRequired(true);

    // =========================
    // 📐 ACTION ROWS
    // =========================
    const row1 = new ActionRowBuilder().addComponents(tituloInput);
    const row2 = new ActionRowBuilder().addComponents(assuntoInput);
    const row3 = new ActionRowBuilder().addComponents(textoInput);

    modal.addComponents(row1, row2, row3);

    // =========================
    // 🚀 MOSTRA O MODAL
    // =========================
    await interaction.showModal(modal);
  }
};
