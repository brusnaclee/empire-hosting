const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "cv",
  description: "Admin command.",
  permissions: "0x0000000000000800",
  run: async (client, interaction) => {
    if (!client.config.ownerID.includes(interaction?.user?.id)) {
      return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true }).catch(e => { });
    }

    const botChannelInfo = [];

    client.guilds.cache.forEach((guild) => {

      const botVoiceChannel = guild.voiceStates.cache.get(client.user.id);

      if (botVoiceChannel) {
        botChannelInfo.push(`${guild.name}: ${botVoiceChannel.channel.name}`);
      }
    });

    const embed = new EmbedBuilder()
      .setTitle("Bot's Voice Channel Info")
      .setColor(client.config.embedColor)
      .setDescription(botChannelInfo.join("\n") || "Bot is not in a voice channel in any server.")
      .setTimestamp()
      .setFooter({ text: `Empire ❤️` });

    try {
      await interaction.deferReply({ ephemeral: false }); // Menunda respon dan mengatur ephemeral menjadi false
      await interaction.editReply({ embeds: [embed], ephemeral: false }); // Mengedit respons dengan embed dan ephemeral false
    } catch (error) {
      const errorNotifier = require("../functions.js");
      errorNotifier(client, interaction, error, lang);
    }
  },
};