const { EmbedBuilder, Events } = require("discord.js");
const path = require("path");
const fs = require("fs");
const config = require("../config.json");

// electionsManager será inicializado na primeira interação se não estiver já inicializado
const elections = require("../lib/electionsManager");
let electionsInitialized = false;

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    try {
      // Inicializa manager se necessário (fallback)
      if (!electionsInitialized) {
        try {
          elections.init(interaction.client);
          electionsInitialized = true;
        } catch (err) {
          // não fatal — apenas log
          console.warn("⚠️ Não foi possível inicializar electionsManager no evento (fallback):", err);
        }
      }

      // =========================
      // 1) BOTÕES (votos / finalizar)
      // =========================
      if (interaction.isButton()) {
        const id = interaction.customId || "";

        // Roteia para handler de voto (vote_<electionId>_<optionIndex>)
        if (id.startsWith("vote_")) {
          const voteHandlerPath = path.join(__dirname, "..", "interactions", "buttons", "vote.js");
          if (fs.existsSync(voteHandlerPath)) {
            try {
              return require(voteHandlerPath)(interaction);
            } catch (err) {
              console.error("❌ Erro no handler vote:", err);
              return interaction.reply({ content: "❌ Erro ao processar voto.", ephemeral: true }).catch(() => {});
            }
          } else {
            return interaction.reply({ content: "❌ Sistema de votação não configurado.", ephemeral: true }).catch(() => {});
          }
        }

        // Finalizar eleição manualmente (finalize_election_<id>)
        if (id.startsWith("finalize_election_")) {
          const finalizeHandlerPath = path.join(__dirname, "..", "interactions", "buttons", "finalize_election.js");
          if (fs.existsSync(finalizeHandlerPath)) {
            try {
              return require(finalizeHandlerPath)(interaction);
            } catch (err) {
              console.error("❌ Erro no handler finalize_election:", err);
              return interaction.reply({ content: "❌ Erro ao finalizar eleição.", ephemeral: true }).catch(() => {});
            }
          } else {
            return interaction.reply({ content: "❌ Sistema de finalização de eleição não configurado.", ephemeral: true }).catch(() => {});
          }
        }

        // Aqui podem vir outros botões do seu bot (ticket, whitelist, etc.)
        // Se quiser, posso ajudar a mesclar todos os botões que você tinha antes.
      }

      // =========================
      // 2) MODAL: anuncio (mantive seu código)
      // =========================
      if (interaction.isModalSubmit() && interaction.customId === "modal_anuncio") {
        const titulo = interaction.fields.getTextInputValue("titulo_anuncio");
        const assunto = interaction.fields.getTextInputValue("assunto_anuncio");
        const texto = interaction.fields.getTextInputValue("texto_anuncio");

        const imagemUrl = interaction.client.anuncioTemp?.get(interaction.user.id) || null;

        const embed = new EmbedBuilder()
          .setTitle(`🏛️ ${titulo}`)
          .setDescription(texto)
          .addFields({
            name: "📌 Categoria",
            value: assunto
          })
          .setColor(0x2f3136)
          .setTimestamp()
          .setFooter({
            text: "Prefeitura Municipal"
          });

        if (imagemUrl) embed.setImage(imagemUrl);

        // Limpa cache
        try { interaction.client.anuncioTemp.delete(interaction.user.id); } catch {}

        // Envia resposta (não é ephemeral aqui para que apareça no canal)
        try {
          return await interaction.reply({ embeds: [embed] });
        } catch (err) {
          console.error("❌ Erro ao enviar anúncio:", err);
          return interaction.reply({ content: "❌ Não foi possível publicar o anúncio.", ephemeral: true }).catch(() => {});
        }
      }

      // =========================
      // 3) Outros tipos de interação (comandos, selects, etc.)
      // =========================
      // Seu sistema modular de comandos deve tratar comandos de chatInput em outro local
      // Se você quiser, eu adiciono aqui também o roteamento para comandos já carregados.
    } catch (err) {
      console.error("❌ ERRO no InteractionCreate:", err);
      // Não lançar para não crashar o bot
    }
  }
};