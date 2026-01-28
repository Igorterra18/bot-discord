const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

// ⚙️ CONFIGURAÇÕES
const CANAL_STAFF_ID = "1464714717326213355";
const MIN_ACERTOS = 7;

module.exports = async interaction => {
  try {
    const guild = interaction.guild;
    const member = interaction.member;

    // 📥 COLETA RESPOSTAS (parte 2)
    const respostas = {};
    for (let i = 6; i <= 10; i++) {
      respostas[`q${i}`] = interaction.fields.getTextInputValue(`q${i}`);
    }

    // ⚠️ EXEMPLO DE CONTAGEM (simples por enquanto)
    // depois podemos fazer gabarito automático
    const totalAcertos = Math.floor(Math.random() * 10); // temporário

    // 🧾 EMBED PARA STAFF
    const embed = new EmbedBuilder()
      .setTitle("📋 Nova Whitelist")
      .setColor(totalAcertos >= MIN_ACERTOS ? 0x2ecc71 : 0xe74c3c)
      .addFields(
        { name: "👤 Player", value: `${member.user.tag}`, inline: true },
        { name: "📊 Resultado", value: `${totalAcertos} / ${MIN_ACERTOS}`, inline: true }
      )
      .setFooter({ text: "Sistema de Whitelist • Brazilian Studio" })
      .setTimestamp();

    // 🔘 BOTÕES STAFF
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`aprovar_${member.id}`)
        .setLabel("✅ Aprovar")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`recusar_${member.id}`)
        .setLabel("❌ Recusar")
        .setStyle(ButtonStyle.Danger)
    );

    // 📤 ENVIA PARA STAFF
    const canalStaff = guild.channels.cache.get(CANAL_STAFF_ID);
    if (canalStaff) {
      await canalStaff.send({
        content: `📌 **Whitelist:** ${member.user.tag}`,
        embeds: [embed],
        components: [row]
      });
    }

    // ✅ RESPOSTA AO PLAYER
    await interaction.reply({
      content: "📨 Sua whitelist foi enviada para a staff.\nAguarde o resultado.",
      flags: 64
    });

  } catch (err) {
    console.error("❌ ERRO MODAL 2:", err);

    if (!interaction.replied) {
      await interaction.reply({
        content: "❌ Ocorreu um erro ao enviar sua whitelist.",
        flags: 64
      });
    }
  }
};