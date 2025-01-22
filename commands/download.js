const {
	ApplicationCommandOptionType,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonStyle,
	ButtonBuilder,
} = require('discord.js');
const db = require('../mongoDB');
const fs = require('fs');
const path = require('path');
const ytdl = require('@distube/ytdl-core');
const { google } = require('googleapis');
const youtubeSearch = require('youtube-search-api');
const scdl = require('soundcloud-downloader').default;

const axios = require('axios');
const cookiesPath = path.resolve(__dirname, '..', 'cookies.json');
let cookies;
try {
	const cookiesData = fs.readFileSync(cookiesPath, 'utf8');
	cookies = JSON.parse(cookiesData);
} catch (error) {
	console.error('Error reading cookies.json:', error);
}

const agent = ytdl.createAgent(cookies);

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
		{
			name: 'format',
			description: 'Choose file format (mp3 or mp4).',
			type: ApplicationCommandOptionType.String,
			choices: [
				{ name: 'MP3', value: 'mp3' },
				{ name: 'MP4', value: 'mp4' },
			],
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
			const format = interaction.options.getString('format') || 'mp3'; // Default to mp3

			await interaction.deferReply({
				content: 'loading',
			});
			let songName = '';
			let songURL = '';
			let thumbnailURL = '';

			if (music) {
				if (ytdl.validateURL(music)) {
					songURL = music;
					const videoInfo = await ytdl.getInfo(music, { agent });
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
				songName = song.name;
				const searchResults = await youtubeSearch.GetListByKeyword(
					songName,
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

			const musicUrl = songURL;
			const musicName = songName;

			// Inisialisasi Google Drive
			const auth = new google.auth.GoogleAuth({
				keyFile: 'music-empire-421010-fbb0df18fbd8.json',
				scopes: ['https://www.googleapis.com/auth/drive.file'],
			});
			const drive = google.drive({ version: 'v3', auth });

			// Function untuk mengecek apakah file sudah ada
			function checkFileExists(fileName) {
				try {
					fs.accessSync(fileName, fs.constants.F_OK);
					return true;
				} catch (err) {
					return false;
				}
			}

			// Cek apakah file dengan nama yang diberikan sudah ada
			let musicNames = 'audio';
			let count = 1;
			while (checkFileExists(`./music/${musicNames}.${format}`)) {
				count++;
				musicNames = `audio${count}`;
			}

			// Tentukan path file berdasarkan format
			const filePath = `./music/${musicNames}.${format}`;
			const fileStream = fs.createWriteStream(filePath);

			if (format === 'mp3') {
				// Jika format mp3
				if (ytdl.validateURL(musicUrl)) {
					// Download dari YouTube sebagai mp3
					const initialQuality = 'lowestaudio';
					ytdl(musicUrl, { quality: initialQuality, agent }).pipe(fileStream);
				} else if (scdl.isValidUrl(musicUrl)) {
					// Download dari SoundCloud sebagai mp3
					scdl
						.download(musicUrl, CLIENT_ID)
						.then((stream) => {
							stream.pipe(fileStream);
						})
						.catch((err) => {
							throw new Error('Error downloading from SoundCloud');
						});
				}
			} else if (format === 'mp4') {
				if (ytdl.validateURL(musicUrl)) {
					// Get video info to select the correct format
					const videoInfo = await ytdl.getInfo(musicUrl);

					// Filter available video formats that have both video and audio
					const videoFormats = videoInfo.formats.filter(
						(format) => format.hasVideo && format.hasAudio
					);

					// Log all available formats (debugging purposes)
					console.log('Available Formats:');
					videoFormats.forEach((format, index) => {
						console.log(
							`${index + 1}. Resolution: ${
								format.qualityLabel || 'Unknown'
							}, Bitrate: ${format.bitrate || 'Unknown'}, Codec: ${
								format.codecs
							}`
						);
					});

					// Check if specific itag or highest quality is required
					const iTag = 22; // Example: 720p, can be dynamic or based on user input
					const useItag = true; // Set to `false` to use highest quality selection

					let selectedFormat;
					if (useItag) {
						// Find the specific itag format
						selectedFormat = videoFormats.find(
							(format) => format.itag === iTag
						);
						if (!selectedFormat) {
							console.log(
								`No format found for itag: ${iTag}. Using highest quality instead.`
							);
							// Fallback to highest quality if itag is not found
							selectedFormat = videoFormats.sort((a, b) => {
								const resolutionA = a.height || 0;
								const resolutionB = b.height || 0;
								return resolutionB - resolutionA; // Descending order
							})[0];
						}
					} else {
						// Sort by resolution (highest to lowest) and select the best available
						selectedFormat = videoFormats.sort((a, b) => {
							const resolutionA = a.height || 0;
							const resolutionB = b.height || 0;
							return resolutionB - resolutionA; // Descending order
						})[0];
					}

					if (selectedFormat) {
						// Download the selected mp4 format
						console.log('Downloading Format:', selectedFormat.qualityLabel);
						ytdl(musicUrl, { format: selectedFormat, agent }).pipe(fileStream);
					} else {
						return interaction.editReply({
							content: 'No compatible video format found.',
							ephemeral: true,
						});
					}
				} else {
					return interaction.editReply({
						content: 'Only YouTube URL is supported for mp4 format.',
						ephemeral: true,
					});
				}
			} else {
				return interaction.editReply({
					content: 'Invalid format. Only mp3 and mp4 are supported.',
					ephemeral: true,
				});
			}

			// Setelah selesai download
			fileStream.on('finish', async () => {
				// Upload musik ke Google Drive
				const fileMetadata = {
					name: `${musicName}.${format}`,
					parents: ['1SNF6krdRx8o3xZldDCLnusAPp6uBhD8e'], // Ganti dengan ID folder tujuan Anda
				};

				const media = {
					mimeType: format === 'mp3' ? 'audio/mpeg' : 'video/mp4',
					body: fs.createReadStream(filePath),
				};

				drive.files.create(
					{
						resource: fileMetadata,
						media: media,
						fields: 'id',
					},
					(err, file) => {
						if (err) {
							console.error('Error uploading file to Google Drive:', err);
							fs.unlinkSync(filePath);
							return res
								.status(500)
								.send('Error uploading file to Google Drive.');
						}

						const fileID = file.data.id;
						const fileURL = `https://drive.google.com/file/d/${fileID}/view`;

						const googleDriveLink = fileURL;

						const download = new ButtonBuilder()
							.setLabel('Download Here!!')
							.setURL(googleDriveLink)
							.setStyle(ButtonStyle.Link);

						const Row = new ActionRowBuilder().addComponents(download);

						const embed = new EmbedBuilder()
							.setTitle(`${songName}`)
							.setThumbnail(thumbnailURL)
							.setColor(client.config.embedColor)
							.setDescription(
								`[Download from Google Drive](${googleDriveLink})`
							)
							.setTimestamp()
							.setFooter({ text: `Empire ❤️` });

						interaction
							.editReply({ embeds: [embed], components: [Row] })
							.then(() => {
								console.log(`Link sent successfully. name: ${musicUrl} `);

								setTimeout(async () => {
									await interaction
										.deleteReply()
										.catch((err) => console.error(err));
								}, 300000); // 300 seconds
							})
							.catch((err) => {
								console.error('Error sending embed message:', err);
							});

						fs.unlinkSync(filePath);

						// Schedule file deletion after 5 minutes
						setTimeout(() => {
							drive.files.delete(
								{
									fileId: fileID,
								},
								(err) => {
									if (err) {
										console.error(
											'Error deleting file from Google Drive:',
											err
										);
									} else {
										console.log(
											'File dihapus dari Google Drive setelah 5 menit.'
										);
									}
								}
							);
						}, 5 * 60 * 1000); // 5 minutes in milliseconds
					}
				);
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
