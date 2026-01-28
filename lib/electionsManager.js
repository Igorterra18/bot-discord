const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const FILE_PATH = path.join(DATA_DIR, "elections.json");

let clientInstance = null;
let elections = {}; // map id -> election
let timers = new Map();

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, JSON.stringify({}), "utf8");
}

function loadFromDisk() {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(FILE_PATH, "utf8");
    const obj = JSON.parse(raw || "{}");
    elections = obj || {};
  } catch (err) {
    console.error("❌ Falha ao carregar eleições:", err);
    elections = {};
  }
}

function saveToDisk() {
  try {
    ensureDataDir();
    fs.writeFileSync(FILE_PATH, JSON.stringify(elections, null, 2), "utf8");
  } catch (err) {
    console.error("❌ Falha ao salvar eleições:", err);
  }
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function scheduleEnd(election) {
  if (!election || !election.active || !election.endsAt) return;
  const ms = new Date(election.endsAt).getTime() - Date.now();
  if (ms <= 0) {
    // end immediately
    return endElection(election.id).catch(err => console.error(err));
  }
  if (timers.has(election.id)) clearTimeout(timers.get(election.id));
  const t = setTimeout(() => {
    endElection(election.id).catch(err => console.error(err));
  }, ms);
  timers.set(election.id, t);
}

async function updateMessageCounts(election) {
  // If election is anonymous we avoid showing per-user info, but still show counts if public
  try {
    const guild = clientInstance.guilds.cache.get(election.guildId);
    if (!guild) return;
    const channel = guild.channels.cache.get(election.channelId);
    if (!channel) return;
    const msg = await channel.messages.fetch(election.messageId).catch(() => null);
    if (!msg) return;
    const { EmbedBuilder } = require("discord.js");
    const embed = new EmbedBuilder()
      .setTitle(election.title)
      .setColor(0x2b2d31)
      .setFooter({ text: `Eleição ${election.id}` })
      .setTimestamp(new Date(election.createdAt));

    const totalVotes = Object.keys(election.votes || {}).length;
    let description = `Total de votos: **${totalVotes}**\n\n`;
    election.options.forEach((opt, i) => {
      const count = Object.values(election.votes || {}).filter(v => v === i).length;
      description += `**${i + 1}. ${opt}** — ${count} voto(s)\n`;
    });

    if (election.endsAt) {
      description += `\nFinaliza em: <t:${Math.floor(new Date(election.endsAt).getTime() / 1000)}:R>`;
    }

    embed.setDescription(description);

    await msg.edit({ embeds: [embed] }).catch(() => {});
  } catch (err) {
    console.error("❌ Erro atualizando mensagem da eleição:", err);
  }
}

async function endElection(id) {
  const election = elections[id];
  if (!election || !election.active) return;
  election.active = false;
  saveToDisk();
  if (timers.has(id)) {
    clearTimeout(timers.get(id));
    timers.delete(id);
  }

  // compute results
  const counts = election.options.map((_, i) =>
    Object.values(election.votes || {}).filter(v => v === i).length
  );
  const max = Math.max(...counts);
  const winners = counts
    .map((c, i) => ({ i, c }))
    .filter(x => x.c === max)
    .map(x => x.i);

  // post results in the same channel
  try {
    const guild = clientInstance.guilds.cache.get(election.guildId);
    if (!guild) return;
    const channel = guild.channels.cache.get(election.channelId);
    if (!channel) return;

    const { EmbedBuilder } = require("discord.js");
    const embed = new EmbedBuilder()
      .setTitle(`📊 Resultado da eleição: ${election.title}`)
      .setColor(0x2b2d31)
      .setTimestamp();

    let description = "";
    const totalVotes = Object.keys(election.votes || {}).length;
    description += `Total de votos: **${totalVotes}**\n\n`;
    election.options.forEach((opt, i) => {
      description += `**${i + 1}. ${opt}** — ${counts[i]} voto(s)\n`;
    });

    if (winners.length === 0) description += `\nNenhum voto registrado.`;
    else {
      description += `\nVencedor(es): ${winners.map(i => `**${election.options[i]}**`).join(", ")}`;
    }

    embed.setDescription(description);

    await channel.send({ embeds: [embed] }).catch(() => {});
    // update original message to mark as finished
    const msg = await channel.messages.fetch(election.messageId).catch(() => null);
    if (msg) {
      const finishedEmbed = new EmbedBuilder()
        .setTitle(`${election.title} — (Finalizada)`)
        .setColor(0x808080)
        .setDescription(description)
        .setTimestamp();
      await msg.edit({ embeds: [finishedEmbed], components: [] }).catch(() => {});
    }
  } catch (err) {
    console.error("❌ Erro postando resultados:", err);
  }
}

module.exports = {
  init(client) {
    clientInstance = client;
    loadFromDisk();
    // re-schedule active elections
    for (const id of Object.keys(elections)) {
      const e = elections[id];
      if (e.active && e.endsAt) scheduleEnd(e);
    }
    console.log("✅ electionsManager iniciado. Eleições carregadas:", Object.keys(elections).length);
  },

  createElection: async function ({ guildId, channelId, title, options, durationMinutes = null, anonymous = false, authorId = null }) {
    const id = makeId();
    const now = new Date();
    let endsAt = null;
    if (durationMinutes && Number(durationMinutes) > 0) {
      endsAt = new Date(Date.now() + Number(durationMinutes) * 60000).toISOString();
    }
    const election = {
      id,
      guildId,
      channelId,
      messageId: null,
      title,
      options: options.slice(0, 25), // limitar por segurança
      votes: {}, // userId => optionIndex
      createdAt: now.toISOString(),
      endsAt,
      active: true,
      anonymous: !!anonymous,
      authorId
    };
    elections[id] = election;
    saveToDisk();
    if (endsAt) scheduleEnd(election);
    return election;
  },

  async attachMessage(id, messageId) {
    if (!elections[id]) return;
    elections[id].messageId = messageId;
    saveToDisk();
  },

  async addVote(id, userId, optionIndex) {
    const election = elections[id];
    if (!election) throw new Error("Eleição não encontrada");
    if (!election.active) throw new Error("Eleição finalizada");
    if (optionIndex < 0 || optionIndex >= election.options.length) throw new Error("Opção inválida");

    // register or change vote
    election.votes[userId] = Number(optionIndex);
    saveToDisk();

    // update message counts if public
    if (!election.anonymous) updateMessageCounts(election);
    return true;
  },

  async removeVote(id, userId) {
    const election = elections[id];
    if (!election) throw new Error("Eleição não encontrada");
    if (election.votes && election.votes[userId] !== undefined) {
      delete election.votes[userId];
      saveToDisk();
      if (!election.anonymous) updateMessageCounts(election);
      return true;
    }
    return false;
  },

  getElection(id) {
    return elections[id] || null;
  },

  endElection,

  listActive(guildId = null) {
    return Object.values(elections).filter(e => e.active && (!guildId || e.guildId === guildId));
  }
};