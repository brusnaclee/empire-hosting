const {
	ApplicationCommandOptionType,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonStyle,
	ButtonBuilder,
} = require('discord.js');
const db = require('../mongoDB');
const fs = require('fs');
const ytdl = require('@distube/ytdl-core');
const { google } = require('googleapis');
const youtubeSearch = require('youtube-search-api');
const scdl = require('soundcloud-downloader').default;
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg'); // Make sure to install fluent-ffmpeg
const path = require('path');
const CLIENT_ID = 'FVqQoT3N6EFHpKzah6KOfyx1RQHdXIYD';

module.exports = {
	name: 'download',
	description: 'Download music files.',
	permissions: '0x0000000000000800',
	options: [
		{
			name: 'music',
			description: 'Name song or URL (only support YouTube URL).',
			type: ApplicationCommandOptionType.String,
			required: false,
		},
		{
			name: 'format',
			description: 'Choose the format for download (mp3 or mp4).',
			type: ApplicationCommandOptionType.String,
			required: false,
			choices: [
				{
					name: 'MP3',
					value: 'mp3',
				},
				{
					name: 'MP4',
					value: 'mp4',
				},
			],
		},
	],
	run: async (client, interaction, queue, song) => {
		try {
			let lang = await db?.musicbot
				?.findOne({ guildID: interaction.guild.id })
				.catch((e) => {});
			lang = lang?.language || client.language;
			lang = require(`../languages/${lang}.js`);

			const music = interaction.options.getString('music');
			const format = interaction.options.getString('format') || 'mp3'; // Default to mp3 if no format is provided

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
					const searchResults = await youtubeSearch.GetListByKeyword(music, false);
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
								await interaction.deleteReply().catch((err) => console.error(err));
							}, 5000);
						});
				}
				const song = queue.songs[0];
				songName = song.name;
				const searchResults = await youtubeSearch.GetListByKeyword(songName, false);
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

			// File path
			const filePath = `./music/${musicNames}.${format}`;

			if (format === 'mp4') {
				// Download both audio and video streams and merge them into a single MP4 file
				const videoStream = ytdl(musicUrl, { quality: '22' }); // 720p video stream
				const audioStream = ytdl(musicUrl, { quality: 'highestaudio' });

				// Combine the video and audio streams using ffmpeg
				ffmpeg()
					.input(videoStream)
					.input(audioStream)
					.output(filePath)
					.on('end', async () => {
						// Upload the MP4 file to Google Drive
						await uploadToGoogleDrive(filePath, musicName, format, thumbnailURL, songName, interaction);
					})
					.on('error', (err) => {
						console.error('Error while merging audio and video:', err);
						interaction.editReply({
							content: 'There was an error merging the video and audio.',
							ephemeral: true,
						});
					})
					.run();
			} else {
				// For MP3 download (as before)
				const fileStream = fs.createWriteStream(filePath);
				const quality = 'highestaudio'; // For MP3
				ytdl(musicUrl, { quality }).pipe(fileStream);

				fileStream.on('finish', async () => {
					// Upload the MP3 file to Google Drive
					await uploadToGoogleDrive(filePath, musicName, format, thumbnailURL, songName, interaction);
				});
			}
		} catch (e) {
			let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id }).catch((e) => {});
			lang = lang?.language || client.language;
			lang = require(`../languages/${lang}.js`);
			const errorNotifier = require('../functions.js');
			errorNotifier(client, interaction, e, lang);
		}
	},
};

async function uploadToGoogleDrive(filePath, musicName, format, thumbnailURL, songName, interaction) {
	// Inisialisasi Google Drive
	const auth = new google.auth.GoogleAuth({
		keyFile: 'music-empire-421010-fbb0df18fbd8.json',
		scopes: ['https://www.googleapis.com/auth/drive.file'],
	});
	const drive = google.drive({ version: 'v3', auth });

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
				return interaction.editReply('Error uploading file to Google Drive.');
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
				.setColor('#00FF00')
				.setDescription(`[Download from Google Drive](${googleDriveLink})`)
				.setTimestamp()
				.setFooter({ text: `Empire ❤️` });

			interaction
				.editReply({ embeds: [embed], components: [Row] })
				.then(() => {
					console.log(`Link sent successfully for ${musicName}`);
					setTimeout(async () => {
						await interaction.deleteReply().catch((err) => console.error(err));
					}, 300000); // 5 minutes
				})
				.catch((err) => {
					console.error('Error sending embed message:', err);
				});

			fs.unlinkSync(filePath); // Clean up local file

			// Schedule file deletion after 5 minutes
			setTimeout(() => {
				drive.files.delete(
					{
						fileId: fileID,
					},
					(err) => {
						if (err) {
							console.error('Error deleting file from Google Drive:', err);
						} else {
							console.log('File deleted from Google Drive after 5 minutes.');
						}
					}
				);
			}, 5 * 60 * 1000); // 5 minutes in milliseconds
		}
	);
}
