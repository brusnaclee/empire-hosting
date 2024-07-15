const config = require("../config.js");
const db = require("../mongoDB");
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "invite",
  description: "Invite bot to your server.",
  options: [],
  permissions: "0x0000000000000800",
  run: async (client, interaction) => {
    try {
      let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id }).catch(e => { })
      lang = lang?.language || client.language
      lang = require(`../languages/${lang}.js`);

      const embed = new EmbedBuilder()
        .setTitle('<a:Statisticreverse:1117043433022947438> Invite Bot <a:Statistic:1117010987040645220>')
        .setThumbnail(interaction.guild.iconURL({ size: 2048, dynamic: true }))
        .setDescription(`**
• Owner: \`brusnaclee#1526\`
• Developer: \`brusnaclee#1526\`
• Invite Empire bot 1: [Empire 1](${config.botInvite})
• Invite Empire bot 2: [Empire 2](https://discord.com/oauth2/authorize?client_id=1119304375140102184&permissions=414585318465&scope=bot+applications.commands)
• Website bot: [Click](${config.supportServer}) **`)
        .setColor(client.config.embedColor)
        .setTimestamp()
        .setFooter({ text: `Empire ❤️` });

      return interaction.reply({ embeds: [embed] }).catch(err => { });

    } catch (e) {
      const errorNotifier = require("../functions.js");
      errorNotifier(client, interaction, e, lang);
    }
  },
};
