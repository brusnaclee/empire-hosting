const db = require('../mongoDB');
const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'resume',
	description: 'Start paused music.',
	permissions: '0x0000000000000800',
	options: [],
	voiceChannel: true,
	run: async (client, interaction) => {
		const queue = client.player.getQueue(interaction.guild.id);
		let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id });
		lang = lang?.language || client.language;
		lang = require(`../languages/${lang}.js`);
		try {
			if (!queue)
				return interaction
					.reply({
						content: `${lang.msg63} <a:alert:1116984255755599884>`,
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
			if (!queue.paused)
				return interaction
					.reply({ content: lang.msg132, ephemeral: true })
					.catch((e) => {});
			const success = queue.resume();
			const successEmoji = '<a:Ceklis:1116989553744552007>';
			const failureEmoji = '<a:Cross:1116983956227772476>';
			const embed = new EmbedBuilder()
				.setColor('00FF7D')
				.setThumbnail(queue.songs[0].thumbnail)
				.setTimestamp()
				.setDescription(
					success
						? `**${queue.songs[0].name}**, ${lang.msg72}${successEmoji}`
						: lang.msg71 + failureEmoji
				)
				.setFooter({ text: 'Empire ❤️' });

			return interaction
				.reply({ embeds: [embed] })
				.then(() => {
					setTimeout(async () => {
						await interaction.deleteReply().catch((err) => console.error(err));
					}, 180000); // 180 seconds or 3 minute
				})
				.catch((e) => {});
		} catch (e) {
			const errorNotifer = require('../functions.js');
			errorNotifer(client, interaction, e, lang);
		}
	},
};
