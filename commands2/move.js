const db = require('../mongoDB.js');
const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'move',
	description: 'Moves a track in the music queue to a new position.',
	permissions: '0x0000000000000800',
	options: [
		{
			name: 'from',
			description: 'The order of the track to move from.',
			type: ApplicationCommandOptionType.Integer,
			required: true,
		},
		{
			name: 'to',
			description: 'The order where the track will be moved to.',
			type: ApplicationCommandOptionType.Integer,
			required: true,
		},
	],
	voiceChannel: true,
	run: async (client, interaction) => {
		const queue = client.player.getQueue(interaction.guild.id);
		let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id });
		lang = lang?.language || client.language;
		lang = require(`../languages/${lang}.js`);

		await interaction.deferReply({
			content: 'loading',
		});

		try {
			if (!queue || !queue.playing) {
				return interaction
					.editReply({
						content: `${lang.msg5} <a:alert:1116984255755599884>`,
						ephemeral: true,
					})
					.then(() => {
						setTimeout(async () => {
							await interaction
								.deleteReply()
								.catch((err) => console.error(err));
						}, 5000);
					});
			}

			const fromOrder = interaction.options.getInteger('from');
			const toOrder = interaction.options.getInteger('to');

			if (
				fromOrder <= 0 ||
				fromOrder > queue.songs.length ||
				toOrder <= 0 ||
				toOrder > queue.songs.length
			) {
				return interaction
					.editReply({
						content: `${lang.msg23} <a:alert:1116984255755599884>`,
						ephemeral: true,
					})
					.then(() => {
						setTimeout(async () => {
							await interaction
								.deleteReply()
								.catch((err) => console.error(err));
						}, 5000);
					});
			}

			const fromIndex = fromOrder - 1;
			const toIndex = toOrder - 1;

			const [removedTrack] = queue.songs.splice(fromIndex, 1);
			queue.songs.splice(toIndex, 0, removedTrack);

			const embed = new EmbedBuilder()
				.setColor('00FF7D')
				.setTimestamp()
				.setDescription(
					`${lang.msg149
						.replace('{trackName}', removedTrack.name)
						.replace('{fromOrder}', fromOrder)
						.replace('{toOrder}', toOrder)} <a:Ceklis:1116989553744552007>`
				)
				.setFooter({ text: 'Empire ❤️' });

			return interaction.editReply({ embeds: [embed] }).then(() => {
				setTimeout(async () => {
					await interaction.deleteReply().catch((err) => console.error(err));
				}, 180000); // 180 seconds or 3 minutes
			});
		} catch (e) {
			const errorNotifier = require('../functions.js');
			errorNotifier(client, interaction, e, lang);
		}
	},
};
