const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
//const lyricsFinder = require('lyrics-finder');
const axios = require('axios');
const db = require('../mongoDB');

module.exports = {
	name: 'lyrics',
	description: 'Shows the lyrics of the song.',
	permissions: '0x0000000000000800',
	options: [
		{
			name: 'song',
			description:
				'The name of the song for which you want to display the lyrics.',
			type: ApplicationCommandOptionType.String,
			required: false,
		},
		{
			name: 'artists',
			description: 'The artist of the song.',
			type: ApplicationCommandOptionType.String,
			required: false,
		},
	],
	run: async (client, interaction) => {
		try {
			let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id });
			lang = lang?.language || client.language;
			lang = require(`../languages/${lang}.js`);

			const songName = interaction.options.getString('song');
			const artistName = interaction.options.getString('artists');
			const queue = client.player.getQueue(interaction.guild.id);
			await interaction.deferReply({ content: 'loading' });

			let title = '';
			let artist = typeof artistName === 'string' ? artistName : ' ';
			if (songName) {
				// If the song name is provided, use that song
				title = songName;
			} else {
				// If the song name is not provided, use the currently playing song
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
				title = queue.songs[0].name;
			}

			const removeUnwantedWords = (str) => {
				return str
					.replace(
						/\(.*?\)|\[.*?\]|\bofficial\b|\bmusic\b|\bvideo\b|\blive\b|\blyrics\b|\blyric\b|\blirik\b|\bHD\b|\bfull\b|\bnew\b|\bMV\b|\bmv\b|\bcover\b|\bremix\b|['.,":;\/\\|\[\]()]/gi, // Menambahkan unwanted words dan simbol
						''
					)
					.replace(/\bft\.?.*$/i, '')
					.trim();
			};

			title = removeUnwantedWords(title);

			const lyricsResponse = await axios.get(
				'https://geniusempire.vercel.app/api/lyrics',
				{ params: { title: title || ' ', artist: artist || ' ' } }
			);
			const lyrics = lyricsResponse.data.lyrics;
			// Defer reply with ephemeral set to true

			if (lyricsResponse.status === 404) {
				return interaction
					.editReply({
						content: 'Lyrics for this song were not found.',
						ephemeral: true,
					})
					.then(() => {
						setTimeout(async () => {
							await interaction
								.deleteReply()
								.catch((err) => console.error(err));
						}, 20000); // 60 seconds or 1 minutes
					});
			}

			const embed = new EmbedBuilder()
				.setColor(client.config.embedColor)
				.setTitle(title)
				.setDescription(lyrics)
				.setTimestamp()
				.setFooter({ text: 'Empire ❤️' });

			// Edit the reply with ephemeral set to false
			await interaction
				.editReply({ embeds: [embed], ephemeral: false })
				.then(() => {
					setTimeout(async () => {
						await interaction.deleteReply().catch((err) => console.error(err));
					}, 600000); // 600 seconds or 10 minutes
				});
		} catch (error) {
			let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id });
			lang = lang?.language || client.language;
			lang = require(`../languages/${lang}.js`);

			const songName = interaction.options.getString('song');
			const artistName = interaction.options.getString('artists');
			const queue = client.player.getQueue(interaction.guild.id);

			let title = '';
			let artist = typeof artistName === 'string' ? artistName : ' ';
			if (songName) {
				// If the song name is provided, use that song
				title = songName;
			} else {
				// If the song name is not provided, use the currently playing song
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
				title = queue.songs[0].name;
			}

			const removeUnwantedWords = (str) => {
				return str
					.replace(
						/\(.*?\)|\[.*?\]|\bofficial\b|\bmusic\b|\bvideo\b|\blive\b|\blyrics\b|\blyric\b|\blirik\b|\bHD\b|\bfull\b|\bnew\b|\bMV\b|\bmv\b|\bcover\b|\bremix\b|['.,":;\/\\|\[\]()]/gi, // Menambahkan unwanted words dan simbol
						''
					)
					.replace(/\bft\.?.*$/i, '')
					.trim();
			};

			title = removeUnwantedWords(title);

			if (error.code === 10062 || error.status === 404) {
				return interaction
					.editReply({ content: lang.msg4, ephemeral: true })
					.then(() => {
						setTimeout(async () => {
							await interaction
								.deleteReply()
								.catch((err) => console.error(err));
						}, 10000);
					});
			}
			interaction.editReply({
				content:
					'The song is not available in the database, attempting to search with AI. <a:loading1:1149363140186882178>',
				ephemeral: true,
			});

			const url = 'https://gemini-empire.vercel.app/api/chatbot';
			const data = {
				prompt: `
Could you give me full lyric of this song
song name: ${title} ${artist}`,
			};

			const maxRetries = 5;
			let attempts = 0;

			const makeRequest = () => {
				axios
					.post(url, data)
					.then((response) => {
						const result = response.data;
						// Send the recommendation message with buttons
						const embed = new EmbedBuilder()
							.setTitle(`${title}`)
							.setDescription(`${result}`)
							.setColor(client.config.embedColor)
							.setTimestamp();

						interaction
							.editReply({ embeds: [embed], ephemeral: false })
							.then(() => {
								setTimeout(async () => {
									await interaction
										.deleteReply()
										.catch((err) => console.error(err));
								}, 600000); // 600 seconds or 10 minutes
							})
							.catch((e) => {});
					})
					.catch((error) => {
						attempts++;
						if (attempts < maxRetries) {
							makeRequest();
						} else {
							if (error.code === 10062 || error.status === 404) {
								return interaction
									.editReply({ content: lang.msg4, ephemeral: true })
									.then(() => {
										setTimeout(async () => {
											await interaction
												.deleteReply()
												.catch((err) => console.error(err));
										}, 10000);
									});
							}
							interaction
								.editReply({
									content: 'An error occurred while processing the request.',
									ephemeral: true,
								})
								.then(() => {
									setTimeout(async () => {
										await interaction
											.deleteReply()
											.catch((err) => console.error(err));
									}, 10000);
								});
							console.error('Error making the request:', error);
						}
					});
			};

			// Initial call to makeRequest
			makeRequest();
		}
	},
};
