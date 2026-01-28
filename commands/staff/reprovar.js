const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");

const filePath = path.join(__dirname, "../../data/whitelist.json");

function loadData() {
  return JSON.parse(fs.readFileSync(filePath));
}

function saveData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reprovar")
    .setDescription("Reprovar whitelist de um jogador")
    .addUserOption(opt =>
      opt.setName("usuario").setDescription("Usuário").setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(config.staffRoleId)) {
      return interaction.reply({ content: "❌ Apenas staff.", ephemeral: true });
    }

    const data = loadData();
    const user = interaction.options.getUser("usuario");

    if (!data[user.id]) {
      return interaction.reply({
        content: "❌ Este usuário não solicitou whitelist.",
        ephemeral: true
      });
    }

    data[user.id].status = "reprovado";
    saveData(data);

    interaction.reply(`❌ ${user.username} foi **REPROVADO** na whitelist.`);
  }
};
