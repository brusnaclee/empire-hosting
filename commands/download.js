const { EmbedBuilder } = require('discord.js');
const db = require('../mongoDB');

const axios = require('axios');

module.exports = {
	name: 'download',
	description: 'Download music files.',
	options: [],
	permissions: '0x0000000000000800',
	run: async (client, interaction, queue, song) => {
		try {
			let lang = await db?.musicbot
				?.findOne({ guildID: interaction.guild.id })
				.catch((e) => {});
			lang = lang?.language || client.language;
			lang = require(`../languages/${lang}.js`);

			const queue = client?.player?.getQueue(interaction?.guildId);

			await interaction.deferReply({
				content: 'loading',
			});

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
						}, 5000); // 60 seconds or 1 minutes
					});
			}

			const song = queue.songs[0];
			const songName = song.name;
			const songURL = song.url;

			const musicUrl = `https://stormy-ambitious-venom.glitch.me/api/download?musicUrl=${encodeURIComponent(
				songURL
			)}&musicName=${encodeURIComponent(songName)}`;

			axios
				.get(musicUrl)
				.then((response) => {
					const googleDriveLink = response.data.googleDriveLink;

					const embed = new EmbedBuilder()
						.setTitle(`${songName}`)
						.setThumbnail(song.thumbnail)
						.setColor(client.config.embedColor)
						.setDescription(`[Download from Google Drive](${googleDriveLink})`)
						.setTimestamp()
						.setFooter({ text: `Empire ❤️` });

					return interaction
						.editReply({ embeds: [embed] })
						.then(() => {
							console.log('Link sent successfully.');

							setTimeout(async () => {
								await interaction
									.deleteReply()
									.catch((err) => console.error(err));
							}, 300000); // 300 seconds
						})
						.catch((err) => {
							console.error('Error sending embed message:', err);
						});
				})
				.catch((error) => {
					console.error('Error fetching download link:', error);
					return interaction
						.editReply({
							content: 'Error fetching download link.',
							ephemeral: true,
						})
						.then(() => {
							setTimeout(async () => {
								await interaction
									.deleteReply()
									.catch((err) => console.error(err));
							}, 5000); // 5 seconds
						})
						.catch((err) => {
							console.error('Error sending error message:', err);
						});
				});
		} catch (e) {
			let lang = await db?.musicbot
				?.findOne({ guildID: interaction.guild.id })
				.catch((e) => {});
			lang = lang?.language || client.language;
			lang = require(`../languages/${lang}.js`);
			const errorNotifier = require('../functions.js');
			errorNotifier(client, interaction, e, lang);
		}
	},
};
