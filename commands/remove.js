const db = require('../mongoDB');
const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'remove',
	description: 'Removes a track from the music queue.',
	permissions: '0x0000000000000800',
	options: [
		{
			name: 'track_order',
			description: 'The order of the track to remove from the queue.',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
	voiceChannel: true,
	run: async (client, interaction) => {
		const queue = client.player.getQueue(interaction.guild.id);
		let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id });
		lang = lang?.language || client.language;
		lang = require(`../languages/${lang}.js`);
		try {
			if (!queue || !queue.playing) {
				return interaction
					.reply({
						content: `${lang.msg5} <a:alert:1116984255755599884>`,
						ephemeral: true,
					})
					.catch((e) => {});
			}

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

			if (!queue.songs[0]) {
				return interaction
					.reply({
						content: `${lang.msg23} <a:alert:1116984255755599884>`,
						ephemeral: true,
					})
					.catch((e) => {});
			}
			const trackOrder = interaction.options.getString('track_order');
			const index = parseInt(trackOrder) - 1;
			if (isNaN(index) || index < 0 || index >= queue.songs.length) {
				return interaction
					.reply({
						content: `${lang.msg23} <a:alert:1116984255755599884>`,
						ephemeral: true,
					})
					.catch((e) => {});
			}
			const removedTrack = queue.songs.splice(index, 1);
			const trackName = removedTrack[0]?.name || 'Unknown Track';
			const embed = new EmbedBuilder()
				.setColor('00FF7D')
				.setTimestamp()
				.setDescription(`${lang.msg142.replace('{trackName}', trackName)}`)
				.setFooter({ text: 'Empire ❤️' });

			return interaction
				.reply({ embeds: [embed] })
				.then(() => {
					setTimeout(async () => {
						await interaction.deleteReply().catch((err) => console.error(err));
					}, 180000); // 180 seconds or 3 minutes
				})
				.catch((e) => {});
		} catch (e) {
			const errorNotifier = require('../functions.js');
			errorNotifier(client, interaction, e, lang);
		}
	},
};
