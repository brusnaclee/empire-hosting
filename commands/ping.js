const { EmbedBuilder } = require('discord.js');
const db = require('../mongoDB');
module.exports = {
	name: 'ping',
	description: "It provides information about the bot's response time.",
	permissions: '0x0000000000000800',
	options: [],
	run: async (client, interaction) => {
		let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id });
		lang = lang?.language || client.language;
		lang = require(`../languages/${lang}.js`);

		try {
			// const start = Date.now();
			const msg = await interaction.channel.send({ content: 'Pinging...' });
			// const end = Date.now();
			const embed = new EmbedBuilder()
				.setColor(client.config.embedColor)
				.setTitle(client.user.username + ' - Pong!')
				.setThumbnail(client.user.displayAvatarURL())
				.addFields([
					// { name: lang.msg49, value: `\`${end - start}ms\` 🛰️`, inline: true },
					{
						name: lang.msg50,
						value: `\`${Math.floor(
							msg.createdAt - interaction.createdAt
						)}ms\` 🛰️`,
						inline: true,
					},
					{
						name: lang.msg51,
						value: `\`${Math.round(client.ws.ping)}ms\` 🛰️`,
						inline: true,
					},
				])
				.setTimestamp()
				.setFooter({ text: `Empire ❤️` });
			msg.delete();
			interaction.reply({ embeds: [embed] }).then(() => {
				setTimeout(async () => {
					await interaction.deleteReply().catch((err) => console.error(err));
				}, 60000); // 60 seconds or 1 minutes
			});
		} catch (e) {
			const errorNotifer = require('../functions.js');
			errorNotifer(client, interaction, e, lang);
		}
	},
};
