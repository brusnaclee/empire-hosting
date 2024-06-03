const db = require('../mongoDB');
const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'autoplay',
	description: "Turn the queue's autoplay on or off.",
	options: [],
	permissions: '0x0000000000000800',
	run: async (client, interaction) => {
		let lang = await db?.musicbot
			?.findOne({ guildID: interaction?.guild?.id })
			.catch((e) => {});
		lang = lang?.language || client.language;
		lang = require(`../languages/${lang}.js`);
		try {
			const queue = client?.player?.getQueue(interaction?.guild?.id);
			if (!queue || !queue?.playing)
				return interaction
					?.reply({
						content: `${lang.msg5} <a:alert:1116984255755599884>`,
						ephemeral: true,
					})
					.catch((e) => {});

			if (!interaction?.member?.voice?.channelId)
				return interaction
					?.reply({
						content: `${lang.message1} <a:alert:1116984255755599884>`,
						ephemeral: true,
					})
					.then(() => {
						setTimeout(async () => {
							await interaction
								.deleteReply()
								.catch((err) => console.error(err));
						}, 5000); // 5 second
					})
					.catch((e) => {});
			const guild_me = interaction?.guild?.members?.cache?.get(
				client?.user?.id
			);
			if (guild_me?.voice?.channelId) {
				if (
					guild_me?.voice?.channelId !== interaction?.member?.voice?.channelId
				) {
					return interaction
						?.reply({
							content: `${lang.message2} <a:alert:1116984255755599884>`,
							ephemeral: true,
						})
						.then(() => {
							setTimeout(async () => {
								await interaction
									.deleteReply()
									.catch((err) => console.error(err));
							}, 5000); // 5 second
						})
						.catch((e) => {});
				}
			}

			queue?.toggleAutoplay();

			const replyEmbed = new EmbedBuilder()
				.setColor(queue?.autoplay ? '00FF7D' : '#FF0000')
				.setTimestamp()
				.setDescription(
					queue?.autoplay
						? `${lang.msg136} <a:Ceklis:1116989553744552007>`
						: `${lang.msg137} <a:alert:1116984255755599884>`
				)
				.setFooter({ text: `Empire ❤️` });

			interaction?.reply({ embeds: [replyEmbed] }).then(() => {
				setTimeout(async () => {
					await interaction.deleteReply().catch((err) => console.error(err));
				}, 600000); // 600 seconds or 10 minutes
			});
		} catch (e) {
			const errorNotifer = require('../functions.js');
			errorNotifer(client, interaction, e, lang);
		}
	},
};
