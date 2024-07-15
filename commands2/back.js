const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const db = require('../mongoDB');

module.exports = {
	name: 'back',
	description: 'Plays the previous track.',
	permissions: '0x0000000000000800',
	options: [],
	voiceChannel: true,
	run: async (client, interaction) => {
		let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id });
		lang = lang?.language || client.language;
		lang = require(`../languages/${lang}.js`);

		try {
			const queue = client.player.getQueue(interaction.guild.id);
			if (!queue || !queue.playing)
				return interaction
					.reply({
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

			try {
				let song = await queue.previous();
				const embed = new EmbedBuilder()
					.setColor('00FF7D')
					.setThumbnail(song.thumbnail)
					.setTimestamp()
					.setDescription(
						`${lang.msg18.replace(
							'{queue.previousTracks[1].title}',
							song.name
						)} <a:Ceklis:1116989553744552007>`
					)
					.setFooter({ text: `Empire ❤️` });
				interaction
					.reply({ embeds: [embed] })
					.then(() => {
						setTimeout(async () => {
							await interaction
								.deleteReply()
								.catch((err) => console.error(err));
						}, 300000); // 300 seconds or 5 minute
					})
					.catch((e) => {});
			} catch (e) {
				return interaction
					.reply({
						content: `${lang.msg17} <a:Cross:1116983956227772476>`,
						ephemeral: true,
					})
					.catch((e) => {});
			}
		} catch (e) {
			const errorNotifer = require('../functions.js');
			errorNotifer(client, interaction, e, lang);
		}
	},
};
