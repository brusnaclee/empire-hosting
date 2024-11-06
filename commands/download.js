const {
	ApplicationCommandOptionType,
	EmbedBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
} = require('discord.js');
const db = require('../mongoDB');
const fs = require('fs');
const ytdl = require('@distube/ytdl-core');
const { google } = require('googleapis');
const youtubeSearch = require('youtube-search-api');
const scdl = require('soundcloud-downloader').default;

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
			const musicUrl = songURL;
			const musicName = songName;

			// Inisialisasi Google Drive
			const auth = new google.auth.GoogleAuth({
				keyFile: 'music-empire-421010-fbb0df18fbd8.json',
				scopes: ['https://www.googleapis.com/auth/drive.file'],
			});
			const drive = google.drive({ version: 'v3', auth });

			// SoundCloud Client ID
			const CLIENT_ID = 'yLfooVZK5emWPvRLZQlSuGTO8pof6z4t';

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
			while (checkFileExists(`./music/${musicNames}.mp3`)) {
				count++;
				musicNames = `audio${count}`;
			}

			// Download musik dari URL yang diberikan
			const filePath = `./music/${musicNames}.mp3`;
			const fileStream = fs.createWriteStream(filePath);

			if (ytdl.validateURL(musicUrl)) {
				// Jika URL adalah YouTube
				const initialQuality = 'lowestaudio';
				ytdl(musicUrl, { quality: initialQuality }).pipe(fileStream);
			} else if (scdl.isValidUrl(musicUrl)) {
				// Jika URL adalah SoundCloud
				scdl
					.download(musicUrl, CLIENT_ID)
					.then((stream) => {
						stream.pipe(fileStream);
					})
					.catch((err) => {
						throw new Error('Error downloading from SoundCloud');
					});
			} else {
				return interaction
					.editReply({
						content: 'URL Invalid. Only YouTube and SoundCloud are supported.',
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
			}

			fileStream.on('finish', async () => {
				// Upload musik ke Google Drive
				const fileMetadata = {
					name: `${musicName}.mp3`,
					parents: ['1SNF6krdRx8o3xZldDCLnusAPp6uBhD8e'], // Ganti dengan ID folder tujuan Anda
				};

				const media = {
					mimeType: 'audio/mpeg',
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
