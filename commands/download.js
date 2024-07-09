const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const db = require('../mongoDB');
const ytdl = require('ytdl-core');
const youtubeSearch = require('youtube-search-api');

const axios = require('axios');

module.exports = {
	name: 'download',
	description: 'Download music files.',
	permissions: '0x0000000000000800',
	options: [
		{
			name: 'music',
			description: 'Name song or url (only support youtube url).',
			type: ApplicationCommandOptionType.String,
			required: false,
		},
	],
	run: async (client, interaction, queue, song) => {
		try {
			let lang = await db?.musicbot
				?.findOne({ guildID: interaction.guild.id })
				.catch((e) => {});
			lang = lang?.language || client.language;
			lang = require(`../languages/${lang}.js`);

			const queue = client?.player?.getQueue(interaction?.guildId);
			const music = interaction.options.getString('music');

			await interaction.deferReply({
				content: 'loading',
			});
			let songName = '';
			let songURL = '';
			let thumbnailURL = '';

			if (music) {
				if (ytdl.validateURL(music)) {
					songURL = music;
					const videoInfo = await ytdl.getInfo(music);
					songName = videoInfo.videoDetails.title;
					if (videoInfo.videoDetails.thumbnails.length > 0) {
						thumbnailURL = videoInfo.videoDetails.thumbnails[0].url;
					} else {
						thumbnailURL = client.user.displayAvatarURL({
							dynamic: true,
							size: 1024,
						});
					}
				} else {
					const searchResults = await youtubeSearch.GetListByKeyword(
						music,
						false
					);
					if (searchResults.items.length === 0) {
						return interaction.editReply({
							content: 'No results found for your query.',
							ephemeral: true,
						});
					}
					const firstResult = searchResults.items[0];
					songName = firstResult.title;
					songURL = `https://www.youtube.com/watch?v=${searchResults.items[0].id}`;
					thumbnailURL = firstResult.thumbnail.thumbnails[0].url;
				}
			} else {
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
				songNames = song.name;
				const searchResults = await youtubeSearch.GetListByKeyword(
					songNames,
					false
				);
				if (searchResults.items.length === 0) {
					return interaction.editReply({
						content: 'No results found for your query.',
						ephemeral: true,
					});
				}
				const firstResult = searchResults.items[0];
				songName = firstResult.title;
				songURL = `https://www.youtube.com/watch?v=${searchResults.items[0].id}`;
				thumbnailURL = firstResult.thumbnail.thumbnails[0].url;
			}

			const musicUrl = `https://stormy-ambitious-venom.glitch.me/api/download?musicUrl=${encodeURIComponent(
				songURL
			)}&musicName=${encodeURIComponent(songName)}`;

			axios
				.get(musicUrl)
				.then((response) => {
					const googleDriveLink = response.data.googleDriveLink;

					const embed = new EmbedBuilder()
						.setTitle(`${songName}`)
						.setThumbnail(thumbnailURL)
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
